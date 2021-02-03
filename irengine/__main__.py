import irengine.utils as utils
import irengine.config
import tweepy
from elasticsearch import Elasticsearch
import click
import time
import itertools
from collections import Counter
import sys
import os

def create_indices(es, config):
    for index in config['elasticsearch_indices'].values():
        if not es.indices.exists(index['name']):
            print("Creating index", index['name'])
            if 'body' in index:
                es.indices.create(index['name'], body=index['body'])
            elif 'file' in index:
                with open(index['file'], 'r') as fh:
                    body = fh.read()
                    es.indices.create(index['name'], body=body)


def get_retrievalbase_tweets(api, es, config):
    for account in config['retrievalbase']:
        username = account['name']
        count = account['count']

        rescount = es.count(
            index=config['elasticsearch_indices']['retrievalbase']['name'],
            body={"query": {"match": {"user.screen_name": account['name']}}})

        num = rescount['count']

        if num < count:
            print('Getting tweets for retrievalbase from', account['name'])
            i = 0
            for tweet in utils.getTweetsFromUser(api, username, count=count):
                res = es.index(
                    index=config['elasticsearch_indices']['retrievalbase']['name'],
                    id=tweet.id_str, body=tweet._json)
                if i % int(count/100) == 0:
                    print(f"\r{i}/{count}", end="", flush=True)
                i+=1
            print(f"\r{count}/{count}")


def get_user_tweets(api, es, config):
    for user in config['users']:
        username = user['name']
        count = user['count']

        rescount = es.count(
            index=config['elasticsearch_indices']['usertweets']['name'],
            body={"query": {"match": {"user.screen_name": user['name']}}})

        num = rescount['count']

        if num < count:
            print('Getting tweets for', user['name'])

            for tweet in utils.getTweetsFromUser(api, username, count=count):
                res = es.index(
                    index=config['elasticsearch_indices']['usertweets']['name'],
                    id=tweet.id_str, body=tweet._json)


def get_users_profile(es, config, force=False):

    users_data = {}

    # single user analysis
    for user in config['users']:
        username = user['name']

        # do nothing if already exists
        if es.exists(
            index=config['elasticsearch_indices']['users']['name'],
            id=username
        ) and not force:
            return

        res = es.search(
            index=config['elasticsearch_indices']['usertweets']['name'],
            body={
                'size': 5000,
                'query': {
                    'match': {
                        'user.screen_name': username
                    }
                }
            }
        )

        hits = res['hits']['hits']

        full_texts = [r['_source']['full_text'] for r in hits]

        hashtags = [[h['text']
                     for h in r['_source']['entities']['hashtags']]
                    for r in hits if r['_source']['entities']['hashtags']]

        text_tokens, emoji_tokens = utils.preprocess_text(' '.join(full_texts))

        top_words = utils.top_words(text_tokens, 30)
        top_emoji = utils.top_words(emoji_tokens, 10)
        top_hashtags = utils.top_words(utils.flat_list(hashtags), 10)
        
        data = {
            'top_words': top_words,
            'top_hashtags': top_hashtags,
            'text_tokens': text_tokens,
            'hashtags': hashtags,
            # basic user data
            'location': hits[0]['_source']['user']['location'],
            'description': hits[0]['_source']['user']['description'],
            'profile_image_url': hits[0]['_source']['user']['profile_image_url_https'],
            'screen_name': username,
            'name': hits[0]['_source']['user']['name'],
            # basic usage data
            'full_texts': full_texts,
            # 'hashtags':hashtags
            'emoji': top_emoji#utils.get_emoji(full_texts)
        }

        users_data[username] = data

    # intra users analysis
    corpus = [' '.join(v['text_tokens']) for v in users_data.values()]
    tfidf_vectorizer = None

    hashtags_corpus = [' '.join(utils.flat_list(v['hashtags']))
                       for v in users_data.values()]
    tfidf_hashtags_vectorizer = None

    for user in config['users']:
        username = user['name']

        docs_tot = len(config['users'])

        users_data[username]['top_tfidf'], tfidf_vectorizer = utils.top_tfidf(
            ' '.join(users_data[username]['text_tokens']),
            corpus,
            n=30,
            vectorizer=tfidf_vectorizer)

        users_data[username]['top_tfidf_hashtags'], tfidf_hashtags_vectorizer = utils.top_tfidf(
            ' '.join(utils.flat_list(users_data[username]['hashtags'])),
            hashtags_corpus,
            n=10,
            vectorizer=tfidf_hashtags_vectorizer)

    for user in config['users']:
        username = user['name']

        print("Creating profile for user", username)

        # list of values to put in the user profile
        to_keep = [
            # basic
            'location',
            'description',
            'screen_name',
            'name',
            'profile_image_url',
            #
            # 'top_words',
            # 'top_hashtags',
            'top_tfidf',
            'top_tfidf_hashtags',
            # 'text_tokens'
            # 'full_texts',
            # 'hashtags',
            'emoji'
        ]

        body = {k: v for k,
                v in users_data[username].items() if k in to_keep}

        res_i = es.index(
            index=config['elasticsearch_indices']['users']['name'],
            id=username, body=body)


@click.command()
@click.option('-c', '--config-path', default='irconfig/local', help='Config path')
@click.option('-p', '--force-profile', is_flag=True, default=False,
              help='Force user profile creation. Overwrite if already exists.')
@click.option('-n', '--no-tweets', is_flag=True, default=False,
              help='Skip Tweets download.')
@click.option('-t', '--elasticseatch-wait-time', default=20,
              help='Wait time for Elasticsearch to correctly start in seconds.')
@click.option('--import-usertweets', help='ElasticDump json file containing usertweets')
@click.option('--import-retrievalbase', help='ElasticDump json file containing retrievalbase')
def main(config_path, force_profile, no_tweets, elasticseatch_wait_time,
    import_usertweets, import_retrievalbase):
    """
    IRengine

    Python application which gets tweets from Twitter, ingest them into
    elasticsearch and creates users profiles.
    """

    config = irengine.config.Config().load_config(path=config_path).get_config()

    es = Elasticsearch(config["elasticsearch_hosts"])

    # wait for elasticsearch
    i = 0
    print("Waiting for Elasticsearch...")
    while not es.ping() and i < elasticseatch_wait_time:
        time.sleep(1)
        i += 1
    if i >= elasticseatch_wait_time:
        print("Cannot reach Elasticsearch.")
        sys.exit(2)

    es.cluster.health(wait_for_status='yellow', request_timeout=5)

    if 'twitter' in config:
        auth = tweepy.OAuthHandler(config['twitter']['consumer_key'],
                                config['twitter']['consumer_secret'])
        auth.set_access_token(config['twitter']['access_token'],
                            config['twitter']['access_secret'])

        api = tweepy.API(auth)
    else:
        no_tweets = True

    create_indices(es, config)

    if import_retrievalbase or import_usertweets:
        if import_usertweets:
            print("Importing usertweets...")
            cmd = f"""{config['elasticdump_binary']} \
                --input={import_usertweets} \
                --output={config['elasticsearch_hosts'][0]}/{config['elasticsearch_indices']['usertweets']['name']} \
                --type=data"""
            if os.system(cmd) != 0:
                print("Something went wrong while importing usertweets!")

        if import_retrievalbase:
            print("Importing retrievalbase...")
            cmd = f"""{config['elasticdump_binary']} \
                --input={import_retrievalbase} \
                --output={config['elasticsearch_hosts'][0]}/{config['elasticsearch_indices']['retrievalbase']['name']} \
                --type=data"""
            if os.system(cmd) != 0:
                print("Something went wrong while importing retrievalbase!")

    elif not no_tweets:
        get_user_tweets(api, es, config)
        get_retrievalbase_tweets(api, es, config)

    # give a second to elasticsearch for indexing
    time.sleep(1)

    get_users_profile(es, config, force=force_profile)

    print("All done.")


if __name__ == '__main__':
    main()
