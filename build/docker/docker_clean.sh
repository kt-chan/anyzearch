#!/bin/bash

docker builder prune -f
docker rmi $(docker images -f "dangling=true" -q)
