FROM node:16-alpine as deps

USER node
ENV NPM_CONFIG_LOGLEVEL warn

ENV CI 1
ENV NODE_ENV development

WORKDIR /home/node
COPY --chown=node:node ./package.json ./package-lock.json ./

RUN npm install

FROM node:16-alpine as builder

USER node

ENV CI 1
ENV NODE_ENV production
ENV NPM_CONFIG_LOGLEVEL warn

WORKDIR /home/node

COPY --chown=node:node ./ ./
COPY --chown=node:node --from=deps /home/node/node_modules ./node_modules

RUN npm run build && npm install --production --ignore-scripts --prefer-offline

# production stage
FROM node:16-alpine as prod

ENV CI 1
ENV NODE_ENV production
ENV PORT 3000

RUN mkdir /data && chown node:node /data

USER node
WORKDIR /home/node

ARG APP_VERSION

ENV SQLITE_PATH /data/database.sqlite
ENV APP_ENVIRONMENT production

COPY --chown=node:node --from=builder /home/node/dist ./
COPY --chown=node:node --from=builder /home/node/node_modules ./node_modules
COPY --chown=node:node --from=builder /home/node/package.json ./package.json

CMD npm run start:prod

VOLUME /data
EXPOSE 3000
