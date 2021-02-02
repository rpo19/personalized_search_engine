#!/bin/bash

PATH=$PATH:./node_modules/elasticdump/bin:./irengine-gui/node_modules/elasticdump/bin

ELASTIC_URL=${ELASTIC_URL:-"http://localhost:9200"}
RETRIEVALBASE_INDEX=${RETRIEVALBASE_INDEX:-"retrievalbase"}
USERTWEETS_INDEX=${USERTWEETS_INDEX:-"usertweets"}
BASEDIR=${BASEDIR:-"/tmp/create_data_zip"}

mkdir -p ${BASEDIR}

## elasticdump

echo "Getting dump from retrievalbase..."
elasticdump --input ${ELASTIC_URL}/${RETRIEVALBASE_INDEX} \
    --output=${BASEDIR}/retrievalbase.json \
    --type=data

echo "Getting dump from usertweets..."
elasticdump --input ${ELASTIC_URL}/${USERTWEETS_INDEX} \
    --output=${BASEDIR}/usertweets.json \
    --type=data

# build GUI
cd irengine-gui
npm run build

cp -r build ${BASEDIR}/gui_build

# zip
cd ${BASEDIR}
zip -r data.zip gui_build usertweets.json retrievalbase.json

# clean basedir
echo "All done in ${BASEDIR}"

