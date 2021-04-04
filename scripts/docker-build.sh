#!/bin/bash

rm -rf node_modules
yarn && yarn build
tar -cf armstrong.tar .next .gitignore next.config.js package.json tsconfig.json yarn.lock
docker build . -f dockers/Dockerfile -t dlgmltjr0925/armstrong-pullup-program:latest
