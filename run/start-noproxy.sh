if [ $(docker ps -a | grep -c anyzearch) -ne 0 ]; then
    docker rm -f anyzearch
fi
export STORAGE_LOCATION=/data/anythingllm && \
mkdir -p $STORAGE_LOCATION && \
touch "$HOME/anyzearch/run/.env" && \
docker run -d -p 80:3001 \
--name=anyzearch \
--add-host=host.docker.internal:host-gateway \
--cap-add SYS_ADMIN \
--add-host=host.docker.internal:host-gateway \
-v ${STORAGE_LOCATION}:/app/server/storage \
-v $HOME/anyzearch/run/.env:/app/server/.env \
-v $HOME/anyzearch/run/.env-fe:/app/frontend/.env \
-v $HOME/anyzearch/run/docker-entrypoint.sh:/usr/local/bin/docker-entrypoint.sh \
-e STORAGE_DIR="/app/server/storage" \
-e NODE_EXTRA_CA_CERTS="/etc/ssl/certs/ca-certificates.crt" \
-e NODE_OPTIONS="--use-openssl-ca" \
-e CURL_CA_BUNDLE="/etc/ssl/certs/ca-certificates.crt" \
-e REQUESTS_CA_BUNDLE="/etc/ssl/certs/ca-certificates.crt" \
-e PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=false \
-e CHROME_PATH="/usr/bin/google-chrome-stable" \
-e PUPPETEER_EXECUTABLE_PATH="/usr/bin/google-chrome-stable" \
local/anyzearch:latest


docker logs anyzearch -f