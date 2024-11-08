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
-v ${STORAGE_LOCATION}:/app/server/storage \
-v $HOME/anyzearch/run/.env:/app/server/.env \
-v $HOME/anyzearch/run/.env-fe:/app/frontend/.env \
-v $HOME/anyzearch/run/docker-entrypoint.sh:/usr/local/bin/docker-entrypoint.sh \
-v $HOME/anyzearch/run/apt.conf:/etc/apt/apt.conf \
-v $HOME/anyzearch/run/dot.yarnrc:/app/.yarnrc \
-v $HOME/anyzearch/run/dot.npmrc:/app/.npmrc \
-v /etc/ssl/certs/ca-certificates.crt:/etc/ssl/certs/ca-certificates.crt \
-e STORAGE_DIR="/app/server/storage" \
-e HTTP_PROXY="http://host.docker.internal:3128" \
-e HTTPS_PROXY="http://host.docker.internal:3128" \
-e NO_PROXY="127.0.0.*,*.huawei.com,localhost,10.123.40.58,10.123.40.137,ukrd.harbor,192.168.175.141" \
-e http_proxy="http://host.docker.internal:3128" \
-e https_proxy="http://host.docker.internal:3128" \
-e no_proxy="127.0.0.*,*.huawei.com,localhost,10.123.40.58,10.123.40.137,ukrd.harbor,192.168.175.141" \
-e NODE_EXTRA_CA_CERTS="/etc/ssl/certs/ca-certificates.crt" \
-e NODE_OPTIONS="--use-openssl-ca" \
-e CURL_CA_BUNDLE="/etc/ssl/certs/ca-certificates.crt" \
-e REQUESTS_CA_BUNDLE="/etc/ssl/certs/ca-certificates.crt" \
local/anyzearch:latest


docker logs anyzearch -f
