import irengine.utils as utils
import irengine.config
import irengine.secrets
import tweepy
from elasticsearch import Elasticsearch

config = irengine.config.Config().load_config().get_config()

es = Elasticsearch(config["elasticsearch_hosts"])

auth = tweepy.OAuthHandler(irengine.secrets.consumer_key,
            irengine.secrets.consumer_secret)
auth.set_access_token(irengine.secrets.access_token,
            irengine.secrets.access_secret)

api = tweepy.API(auth)

# index creation
for index in config['elasticsearch_indices']:
    if not es.indices.exists(index['name']):
        print("Creating index", index['name'])
        es.indices.create(index['name'], body=index['body'])

for user in config['users']:
    username = user['name']
    count = user['count']

    rescount = es.count(index=config['elasticsearch_usertweets_index'],
        body={"query":{"match":{"user.screen_name":user['name']}}})

    num = rescount['count']

    if num < user['count']:
        print('Getting tweets for', user['name'])
        
        for tweet in utils.getTweetsFromUser(api, username, count=count):
            res = es.index(index=config['elasticsearch_usertweets_index'],
                id=tweet.id_str,body=tweet._json)