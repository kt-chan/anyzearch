#!/bin/bash
rm -rf ./dist
yarn build && yarn cache clean
rm -rf ~/anythingllm/data/public
cp -rf ./dist ~/anythingllm/data/public
chown demo:demo -R ~/anythingllm/data/public
