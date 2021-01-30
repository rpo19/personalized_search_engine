FROM python

WORKDIR /usr/src/app

COPY requirements.txt ./
RUN pip install -r requirements.txt

COPY . irengine

ENTRYPOINT [ "python", "-m", "irengine", "-c", "irconfig/docker" ]