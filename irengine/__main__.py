import irengine.utils as utils
import irengine.config
import irengine.secrets
import tweepy
from elasticsearch import Elasticsearch
import click


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


def get_user_tweets(api, es, config):
    for user in config['users']:
        username = user['name']
        count = user['count']

        rescount = es.count(
            index=config['elasticsearch_indices']['usertweets']['name'],
            body={"query": {"match": {"user.screen_name": user['name']}}})

        num = rescount['count']

        if num < user['count']:
            print('Getting tweets for', user['name'])

            for tweet in utils.getTweetsFromUser(api, username, count=count):
                res = es.index(
                    index=config['elasticsearch_indices']['usertweets']['name'],
                    id=tweet.id_str, body=tweet._json)


def get_users_profile(es, config, force=False):
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
            body={'query': {'match': {'user.screen_name': username}}}
        )

        hits = res['hits']['hits']

        body = {
            # data extracted from tweets
            'full_text': [r['_source']['full_text'] for r in hits],
            'hashtags': [[h['text']
                    for h in r['_source']['entities']['hashtags']]
                    for r in hits if r['_source']['entities']['hashtags']],
            # basic user data
            'location': hits[0]['_source']['user']['location'],
            'description': hits[0]['_source']['user']['description'],
            'screen_name': username,
            'name': hits[0]['_source']['user']['name']
        }

        print("Creating profile for user", username)

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

    auth = tweepy.OAuthHandler(irengine.secrets.consumer_key,
                               irengine.secrets.consumer_secret)
    auth.set_access_token(irengine.secrets.access_token,
                          irengine.secrets.access_secret)

    api = tweepy.API(auth)

    create_indices(es, config)

    get_user_tweets(api, es, config)

    time.sleep(1)

    get_users_profile(es, config, force=force_profile)


if __name__ == '__main__':
    main()
