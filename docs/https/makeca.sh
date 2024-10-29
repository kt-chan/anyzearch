#!/bin/bash
cd $HOME
rm -rf ./anyzearch.local*

openssl req -x509 -newkey rsa:4096 -sha256 -days 3650 \
  -nodes -keyout anyzearch.local.key -out anyzearch.local.crt -subj "/CN=anyzearch.local" \
  -config ./openssl.cnf

openssl pkcs12 -export -out anyzearch.local.pfx -inkey  anyzearch.local.key -in anyzearch.local.crt 
sudo chown demo:demo ./anyzearch.local*
