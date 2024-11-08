if [ $(docker ps -a | grep -c anyzearch) -ne 0 ]; then
    docker rm -f anyzearch
fi
export STORAGE_LOCATION=$HOME/anyzearch/data && \
mkdir -p $STORAGE_LOCATION && \
touch "$HOME/anyzearch/run/.env" && \
docker run -d -p 443:3001 \
--name=anyzearch \
--add-host=host.docker.internal:host-gateway \
--cap-add SYS_ADMIN \
-v ${STORAGE_LOCATION}:/app/server/storage \
-v $HOME/anyzearch/run/sources.list:/etc/apt/sources.list \
-v $HOME/anyzearch/run/.env:/app/server/.env \
-v $HOME/anyzearch/run/.env-fe:/app/frontend/.env \
-v $HOME/anyzearch/run/docker-entrypoint.sh:/usr/local/bin/docker-entrypoint.sh \
-v $HOME/anyzearch/run/certs/adfs.anyzearch.crt:/etc/ssl/certs/adfs.anyzearch.crt \
-v /etc/hosts:/etc/hosts \
-e STORAGE_DIR="/app/server/storage" \
-e NODE_EXTRA_CA_CERTS="/etc/ssl/certs/ca-certificates.crt" \
-e NODE_OPTIONS="--use-openssl-ca" \
-e CURL_CA_BUNDLE="/etc/ssl/certs/ca-certificates.crt" \
-e REQUESTS_CA_BUNDLE="/etc/ssl/certs/ca-certificates.crt" \
-e SAML_ADFS_CERT='/etc/ssl/certs/adfs.anyzearch.crt' \
-e PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=false \
-e CHROME_PATH="/usr/bin/google-chrome-stable" \
-e PUPPETEER_EXECUTABLE_PATH="/usr/bin/google-chrome-stable" \
local/anyzearch:latest
#ktchanhk/anyzearch:0.0.1

docker logs anyzearch -f
