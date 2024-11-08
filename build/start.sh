#!/bin/bash
cd ~/build/server/
npx prisma generate --schema=./prisma/schema.prisma
npx prisma migrate deploy --schema=./prisma/schema.prisma

pkill node

# unset proxy
unset http_proxy
unset https_proxy
npm config delete proxy
npm config delete https-proxy
yarn config delete proxy
yarn config delete https-proxy


cd ~/build/
npm run-script prod:server > ~/build/log.server 2>&1 &
echo "node server is started at port 3001, check log at tail -f ~/build/log.server ."

cd ~/build/
npm run-script prod:collector > ~/build/log.collector 2>&1 &
echo "node collector is started at port 8888, check log at tail -f ~/build/log.collector ."

