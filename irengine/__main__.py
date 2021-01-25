import irengine.utils
import irengine.config

## check indexes

# es = Elasticsearch(["host1", "host2"], maxsize=25)

config = irengine.config.Config().load_config().get_config()

print(config["example"])