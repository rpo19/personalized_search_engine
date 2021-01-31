FROM node as build

WORKDIR /app

COPY . .

RUN yarn install

COPY ./src/Config-docker.js ./src/Config.js

RUN yarn build

FROM nginx

COPY ./nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/build /usr/share/nginx/html

