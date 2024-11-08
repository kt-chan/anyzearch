if [ $(docker ps -a | grep -c anyzearch) -ne 0 ]; then
    docker rm -f anyzearch
fi
export STORAGE_LOCATION=$HOME/anyzearch/data/anyzearch && \
mkdir -p $STORAGE_LOCATION && \
touch "$HOME/anyzearch/run/.env" && \
docker run -d -p 443:3001 \
--name=anyzearch \
--add-host=host.docker.internal:host-gateway \
--cap-add SYS_ADMIN \
--add-host=host.docker.internal:host-gateway \
-v ${STORAGE_LOCATION}:/app/server/storage \
-v $HOME/anyzearch/run/sources.list:/etc/apt/sources.list \
-v $HOME/anyzearch/run/.env:/app/server/.env \
-v $HOME/anyzearch/run/.env-fe:/app/frontend/.env \
-v $HOME/anyzearch/run/docker-entrypoint.sh:/usr/local/bin/docker-entrypoint.sh \
-v $HOME/anyzearch/run/anyzearch.local.crt:/etc/ssl/certs/anyzearch.local.crt \
-v $HOME/anyzearch/run/anyzearch.local.key:/etc/ssl/certs/anyzearch.local.key \
-e STORAGE_DIR="/app/server/storage" \
-e PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=false \
-e CHROME_PATH="/usr/bin/google-chrome-stable" \
-e PUPPETEER_EXECUTABLE_PATH="/usr/bin/google-chrome-stable" \
ktchanhk/anyzearch:0.0.1

#docker logs anyzearch -f
