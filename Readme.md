# IRengine

## Setup

### Twitter API

Put your twitter API credentials into `irengine/secrets.py`.
Take a look at the sample `irengine/secrets-sample.py`

### Docker compose

Once you have docker-compose installed just run:
```
docker-compose up -d
```

### Without docker

#### Elasticsearch

- Install Elasticsearch 7 following the official documentation at
  https://www.elastic.co/guide/en/elasticsearch/reference/current/install-elasticsearch.html.
  
- Start Elasticsearch

#### Python setup

- Install Python following https://www.python.org/

- Create a virtualenv and activate it (suggested)

    ```
    # Linux
    python -m venv venv
    source venv/bin/activate

    # Windows
    python.exe -m venv venv
    .\venv\Scripts\activate
    ```

- Install requirements
    ```
    pip install -r requirements.yml
    ```

#### Run the project

Remember to activate the virtualenv.

```
python -m irengine
```

