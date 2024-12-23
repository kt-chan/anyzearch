#!/bin/bash
unset http_proxy
unset https_proxy
npm config delete proxy
npm config delete https-proxy
yarn config delete proxy
yarn config delete https-proxy

# Set the NODE_ENV environment variable
export NODE_ENV=development

cd ~/build/
echo "installing dependencies ..."
npm run-script build-linux

echo "copying files to server ..."
rm -rf ./server/public
cp -R ./frontend/dist ./server/public

