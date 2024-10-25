#!/bin/bash
unset http_proxy
unset https_proxy
npm config delete proxy 
npm config delete https-proxy 
yarn config delete proxy 
yarn config delete https-proxy 

sudo rm -rf /etc/systemd/system/docker.service.d/http-proxy.conf
sudo systemctl daemon-reload
sudo systemctl restart docker
