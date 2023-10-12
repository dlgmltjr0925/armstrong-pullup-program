#!/bin/bash

# rm -rf node_modules
# yarn && yarn build
# tar -cf armstrong.tar .next .env public next.config.js package.json tsconfig.json yarn.lock
docker build . -f dockers/Dockerfile.arm64v8 -t dlgmltjr0925/armstrong-pullup-program:arm64v8-latest
