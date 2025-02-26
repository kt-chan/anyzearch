#!/bin/bash

# Set the NODE_ENV environment variable
export NODE_ENV=development

# cd into build dirtory 
# cd ~/build/
echo "installing dependencies ..."
npm run-script build-linux

echo "copying files to server ..."
rm -rf ./server/public
cp -R ./frontend/dist ./server/public

