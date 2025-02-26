#!/bin/bash
cd ~/build/frontend/
yarn build
cp -R ./dist ../server/public

cd ~/build
./start.sh
