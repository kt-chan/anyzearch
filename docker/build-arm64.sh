#!/bin/bash

# export PFX_PASSWORD="UpdateYourPassword!" ## Please Update your Password for ssl private keys protection
source .env
docker build -t local/build-arm64 -f Dockerfile.build-arm64 ../.
docker build -t local/anythingllm-collector -f Dockerfile.build-collector-arm64 ../.
docker build -t local/anythingllm-frontend -f Dockerfile.build-frontend-arm64 ../.
docker build -t local/anythingllm-backend -f Dockerfile.build-backend-arm64 ../.
docker build -t local/anyzearch -f Dockerfile.build-anyzearch-arm64 ../.
echo "finished build"

