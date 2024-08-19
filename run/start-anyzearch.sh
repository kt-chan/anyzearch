if [ $(docker ps -a | grep -c anyzearch) -ne 0 ]; then
    docker rm -f anyzearch
fi

# Reset environment
sudo ./env.sh

export STORAGE_LOCATION=$HOME/anyzearch/data/ && \
docker run -d -p 3001:3001 \
--name=anyzearch \
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
ktchanhk/anyzearch:0.0.1

docker logs anyzearch -f
