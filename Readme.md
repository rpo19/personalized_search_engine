# Intro
This is a project for the master course Information Retrieval from Università di Milano Bicocca.

The goal of this project is to define a search engine that enables user profiling and allows
users to perform both standard searches as well as advanced and personalized ones.

This Readme aims to help during the project setup. For a more in depth description of the project look at:
- the report: [InformationRetrieval2021.pdf](InformationRetrieval2021.pdf)
- and the presentation: [Information_Retrieval_Presentazione.pptx](Information_Retrieval_Presentazione.pptx)

# IRengine

The `data.zip` contains a built of the frontend UI and the elasticsearch index
dumps `usertweets.json` and `retrievalbase.json`.

## Components

### IRengine

Python application which gets tweets from Twitter (or from a dump), ingest them into
elasticsearch and creates users profiles.

### IRengine GUI

React user interface for querying elasticsearch.

### Elasticsearch

### Kibana

Used for development.

## Configuration

Configuration is inside `irconfig`.
```
irconfig/
├── default.yaml            # default shared config
├── docker
│   └── docker.yaml         # docker specific config
├── local
│   └── local.yaml          # local specific config
├── secrets-sample.txt      # secrets sample
├── secrets.yaml            # secrets config
├── mappings                # elasticsearch index mappings
│   ├── tweets.json           # for retrievalbase and usertweets
│   └── users.json            # for users
├── synonym
│   └── wn_s.pl             # WordNet synonyms
├── retrievalbase.json      # retrievalbase dump (not required)
└── usertweets.json         # usertweets dump (not required)
```

By default `irconfig/local`; the docker container loads `irconfig/docker`.

### Twitter API

Put your twitter API credentials into `irconfig/secrets.yaml`.
Take a look at the sample `irconfig/secrets-sample.txt`.

Otherwise you could import tweets from a previously created **dump**. (See IRengine section)

## Setup

### Linux

Regardless of whether you're using docker or not.

For elasticsearch to start you need to increase kernel's `vm.max_map_count`
default value:
```
sysctl -w vm.max_map_count=262144      # temporary: not reboot persistent
# or create a file for making it reboot persistent: e.g.
echo 'vm.max_map_count=262144' | sudo tee /etc/sysctl.d/99-elasticsearch.conf
```

### With Docker and Compose

You need Docker (https://docs.docker.com/get-docker/) and Compose
(https://docs.docker.com/compose/install/).

- Configure: copy `env-sample.txt` to `.env`, check whether its content fits
  your needs.

- Run the project with
  ```
  docker-compose up -d
  ```
  from the project root.

- Open http://localhost:8080/.

- At the first start could happen that irengine fails before elasticsearch
  starts. To restart irengine run
  ```
  docker-compose restart irengine
  ```

#### Run IRengine manually
In case you need to run IRengine with custom arguments (e.g. to force users'
profiles recreation):
```
docker-compose run --rm -T irengine --help
```

### Without docker

#### Elasticsearch

- Install Elasticsearch 7 following the official documentation at
  https://www.elastic.co/guide/en/elasticsearch/reference/current/install-elasticsearch.html.

- Put synonyms file in `elasticsearch/config` folder; get it from
  `irconfig/synonym/wn_s.pl`.

- Start Elasticsearch.

#### IRengine

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
    cd irengine
    pip install -r requirements.txt
    cd ..
    ```

- Run it with the virtualenv activated.

  ```
  python -m irengine --help     # see the help

    Usage: __main__.py [OPTIONS]

    IRengine

    Python application which gets tweets from Twitter, ingest them into
    elasticsearch and creates users profiles.

    Options:
      -c, --config-path TEXT          Config path
      -p, --force-profile             Force user profile creation. Overwrite if
                                      already exists.

      -n, --no-tweets                 Skip Tweets download.
      -t, --elasticseatch-wait-time INTEGER
                                      Wait time for Elasticsearch to correctly
                                      start in seconds.

      --import-usertweets TEXT        ElasticDump json file containing usertweets
      --import-retrievalbase TEXT     ElasticDump json file containing
                                      retrievalbase

      --help                          Show this message and exit.
  ```

### Get tweets from Twitter

Just set Twitter api credentials as seen in "Configuration/Twitter API" section;
then simply run:
```
python -m irengine            # to get tweets and ingest them into elastic
```

### Get tweets from a dump

Alternatively import tweets from a previously created **dump**:

- Excract the files from `data.zip`, then:

**Using Docker**:

- Put the two files `usertweets.json` and `retrievalbase.json` inside irconfig
  folder
- then run:
  ```
  docker-compose run -T --rm irengine --import-usertweets irconfig/usertweets.json --import-retrievalbase irconfig/retrievalbase.json
  ```

**Without Docker**:

- install `elasticdump` (See
  https://github.com/elasticsearch-dump/elasticsearch-dump)

- Ensure `elasticdump` is available in the path or that `elasticdump_binary` in `default.yaml` contains the correct path of the elasticdump binary.

- Locate the dump files `usertweets.json` and `retrievalbase.json`

- then run
  ```
  python -m irengine --import-usertweets /path/to/usertweets.json --import-retrievalbase /path/to/retrievalbase.json
  ```

#### IRengine GUI

##### Development setup

You need Node.js (https://nodejs.org/it/) and a package manager such as npm
(https://www.npmjs.com/get-npm) or yarn
(https://classic.yarnpkg.com/en/docs/install/#debian-stable).

Then (choose just one from yarn or npm)
```
cd irengine-gui

# installing required packages
npm install
# or
yarn install

# starting development server
npm start
# or
yarn start
```

About elasticsearch url and index names, they're set inside
`irengine-gui/src/Config.js` while the docker container uses instead
`irengine-gui/src/Config-docker.js`

Get a build:
```
npm run build
# or
yarn run build
```
and then you should see this folder `irengine-gui/build`.

##### Pre-built

Once you have a pre-built version extracted e.g. into a `build` folder:
```
cd build
# serve the folder with a simple http server of your choice e.g.
python -m http.server
```

##### CORS

Elasticsearch will probably refuse calls from your browser unless you correctly
configure `http.cors` to match IRengine GUI's url.

You need to set:
```
http.cors.enabled: true
http.cors.allow-origin: /https?:\/\/localhost(:[0-9]+)?/
```
in `elasticsearch.yml` and the restart elasticsearch to apply it.

In case you're using docker the GUI service in docker-compose is already able to
call elasticsearch, but in case you need to access elasticsearch from a
development server you can put the correct configuration inside docker-compose
`.env` file.

## Credits

#### WordNet

George A. Miller (1995). WordNet: A Lexical Database for English.
Communications of the ACM Vol. 38, No. 11: 39-41.

Christiane Fellbaum (1998, ed.) WordNet: An Electronic Lexical Database. Cambridge, MA: MIT Press.