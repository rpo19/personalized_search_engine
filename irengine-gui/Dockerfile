FROM node as build

WORKDIR /app

COPY ./package.json /app/package.json
COPY ./package-lock.json /app/package-lock.json

RUN yarn install

COPY . .

COPY ./src/Config-docker.js ./src/Config.js

RUN yarn build


FROM nginx

COPY ./nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/build /usr/share/nginx/html

