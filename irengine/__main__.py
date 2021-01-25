import irengine.utils
import irengine.config
from elasticsearch import Elasticsearch

## check indexes

config = irengine.config.Config().load_config().get_config()

es = Elasticsearch(config["elasticsearch_hosts"])

# index creation
for index in config["elasticsearch_indices"]:
    if not es.indices.exists(index['name']):
        print("Creating index", index['name'])
        es.indices.create(index['name'], body=index['body'])