#!/bin/bash

export STORAGE_LOCATION=$HOME/anyzearch/data/
mkdir -p $STORAGE_LOCATION
sudo chown 1000:1000 -R $STORAGE_LOCATION  
sudo chown 1000:1000 ./.env ./.env-fe


