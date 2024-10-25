#!/bin/bash
docker build -t local/build-amd64 -f Dockerfile.build ../.
docker build -t local/anythingllm-collector -f Dockerfile.build-collector ../.
docker build -t local/anythingllm-frontend -f Dockerfile.build-frontend ../.
docker build -t local/anythingllm-backend -f Dockerfile.build-backend ../.
docker build -t local/anyzearch -f Dockerfile.build-anyzearch ../.
echo "finished build"

