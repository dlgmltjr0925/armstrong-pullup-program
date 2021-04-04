#!/bin/bash

rm -rf node_modules
yarn && yarn build
tar -cf armstrong.tar .next .gitignore next.config.js package.json tsconfig.json yarn.lock
docker build . -f dockers/Dockerfile.arm64v8 -t dlgmltjr0925/armstrong-pullup/arm64v8:latest
