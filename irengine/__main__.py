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
            es.indices.create(index['name'], body=index['body'])

def get_user_tweets(es, config):
    for user in config['users']:
        username = user['name']
        count = user['count']

        rescount = es.count(
            index=config['elasticsearch_indices']['usertweets']['name'],
            body={"query":{"match":{"user.screen_name":user['name']}}})

        num = rescount['count']

        if num < user['count']:
            print('Getting tweets for', user['name'])

            for tweet in utils.getTweetsFromUser(api, username, count=count):
                res = es.index(
                    index=config['elasticsearch_indices']['usertweets']['name'],
                    id=tweet.id_str,body=tweet._json)



@click.command()
@click.option('-c', '--config-path', default='irconfig/local', help='Config path')
def main(config_path):
    config = irengine.config.Config().load_config(path=config_path).get_config()

    es = Elasticsearch(config["elasticsearch_hosts"])

    auth = tweepy.OAuthHandler(irengine.secrets.consumer_key,
                irengine.secrets.consumer_secret)
    auth.set_access_token(irengine.secrets.access_token,
                irengine.secrets.access_secret)

    api = tweepy.API(auth)

    create_indices(es, config)

    get_user_tweets(es, config)


    

if __name__ == '__main__':
    main()