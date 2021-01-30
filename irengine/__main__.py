import irengine.utils as utils
import irengine.config
import tweepy
from elasticsearch import Elasticsearch
import click
import time
from nltk.tokenize import TweetTokenizer
import emoji
import itertools
from collections import Counter


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

            for tweet in utils.getTweetsFromUser(api, username, count=count):
                res = es.index(
                    index=config['elasticsearch_indices']['retrievalbase']['name'],
                    id=tweet.id_str, body=tweet._json)


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


def flat_list(l):
    return [item for sublist in l for item in sublist]


def common_tokens(tokens):
    sentences = (list(itertools.chain(tokens)))
    flat_sentences = flat_list(sentences)
    counts = Counter(flat_sentences)

    return counts


def get_emoji(full_texts, n=10):
    list_emoji = []
    tweetTokenizer = TweetTokenizer()

    for text in full_texts:
        tokens_clean = []
        for word in tweetTokenizer.tokenize(text):
            if word in emoji.UNICODE_EMOJI['en']:
                tokens_clean.append(word.lower())
        list_emoji.append(tokens_clean)
    counts = common_tokens(list_emoji)
    return [k for k, v in counts.most_common(n)]


def get_users_profile(es, config, force=False):

    # res = es.search(
    #     index=config['elasticsearch_indices']['usertweets']['name'],
    #     body={
    #         'size': 1000,
    #         'query': {
    #             'match_all': {}
    #             }
    #         }
    #     )

    # hits = res['hits']['hits']

    # corpus = [r['_source']['full_text'] for r in hits]
    # hashtags_corpus = [[h['text']
    #                  for h in r['_source']['entities']['hashtags']]
    #                 for r in hits if r['_source']['entities']['hashtags']]

    # corpus_processed = utils.preprocess_text(' '.join(corpus))

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
                'size': 1000,
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

        text_tokens = utils.preprocess_text(' '.join(full_texts))

        top_words = utils.top_words(text_tokens, 30)

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
            'emoji': get_emoji(full_texts)
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
            'top_words',
            'top_hashtags',
            'top_tfidf',
            'top_tfidf_hashtags',
            # 'text_tokens'
            'full_texts',
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
def main(config_path, force_profile):
    config = irengine.config.Config().load_config(path=config_path).get_config()

    es = Elasticsearch(config["elasticsearch_hosts"])

    auth = tweepy.OAuthHandler(config['twitter']['consumer_key'],
                               config['twitter']['consumer_secret'])
    auth.set_access_token(config['twitter']['access_token'],
                          config['twitter']['access_secret'])

    api = tweepy.API(auth)

    create_indices(es, config)

    get_user_tweets(api, es, config)

    get_retrievalbase_tweets(api, es, config)

    time.sleep(1)

    get_users_profile(es, config, force=force_profile)

    print("All done.")


if __name__ == '__main__':
    main()
