FROM python

WORKDIR /usr/src/app

COPY requirements.txt ./
RUN pip install -r requirements.txt && \
    python -c 'import nltk;nltk.download("stopwords");'

COPY node_setup.sh ./
RUN bash node_setup.sh && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

RUN npm install elasticdump -g

COPY . irengine

ENTRYPOINT [ "python", "-m", "irengine", "-c", "irconfig/docker" ]