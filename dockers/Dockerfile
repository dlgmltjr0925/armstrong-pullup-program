FROM node:lts-alpine

RUN mkdir -p /armstrong/data
ADD armstrong.tar /armstrong

WORKDIR /armstrong

VOLUME /armstrong/data
EXPOSE 3000

ENTRYPOINT ["/bin/sh", "-c", "yarn --production && yarn start"]
