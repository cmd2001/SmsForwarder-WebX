FROM node:22

ADD ./package.json /app/package.json
WORKDIR /app
RUN yarn install

ADD . /app
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL
RUN yarn build

CMD ["yarn", "serve", "-s", "build"]