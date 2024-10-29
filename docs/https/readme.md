## Turn on HTTPS

### Generate Self-signed certificates
Below command would generate three crt files, 
- anyzearch.local.crt
- anyzearch.local.key
- anyzearch.local.pfx
```
cd ~
sudo chmod u+x makeca.sh
sudo ./makeca.sh
```

### copy ssh cert and keys to anyzearch execution directory
```
cp -f anyzearch.local.crt $ANYZEARCH_HOME/.
cp -f anyzearch.local.key $ANYZEARCH_HOME/.
cp -f anyzearch.local.pfx $ANYZEARCH_HOME/.
```


### Edit .env configuation files
go to anyzearch execution directory
```
cd $ANYZEARCH_HOME
vi ./.env
```
Append below three lines at the end of the .env configuration file
```
ENABLE_HTTPS='true'
HTTPS_CERT_PATH='/etc/ssl/certs/anyzearch.local.crt'
HTTPS_KEY_PATH='/etc/ssl/certs/anyzearch.local.key'
```

### start the container with ssl cert mounting
edit start-demo.sh file
```
vi ./start-demo.sh
```
add below ssh volume mount
```
-v $HOME/anyzearch/run/ca-certificates.crt:/etc/ssl/certs/ca-certificates.crt \
-v $HOME/anyzearch/run/anyzearch.local.crt:/etc/ssl/certs/anyzearch.local.crt \
-v $HOME/anyzearch/run/anyzearch.local.key:/etc/ssl/certs/anyzearch.local.key \
```
or just run start-demo-https.sh
```
./start-demo-https.sh
```


