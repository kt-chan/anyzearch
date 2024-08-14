#!/bin/bash
unset http_proxy
unset https_proxy
npm config delete proxy
npm config delete https-proxy
yarn config delete proxy
yarn config delete https-proxy

./build-baseamd64.sh
./build-collector.sh
./build-frontend.sh
./build-backend.sh
./build-anyzearch.sh

echo "finished build"

