# IRengine

## Components

### IRengine

Python application which gets tweets from Twitter, ingest them into
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
└── secrets.yaml            # secrets config
```

By default `irconfig/local`; the docker container loads `irconfig/docker`.

### Twitter API

Put your twitter API credentials into `irconfig/secrets.yaml`.
Take a look at the sample `irconfig/secrets-sample.txt`

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
  
- Start Elasticsearch

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
    pip install -r requirements.yml
    cd ..
    ```

- Run it with the virtualenv activated.

  ```
  python -m irengine --help     # see the help
  # TODO mostrare help qui


  python -m irengine            # to get tweets and ingest them into elastic
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

TODO fornire un pacchetto precompilato.

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