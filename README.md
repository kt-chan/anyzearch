cd ./build/docker

sudo chmod u+x ./*.sh

./build.sh

// update ./run/.env.sample 刷新 ./run/.env.sample 参数
// copy ./run/.env.smaple to ./.env 然后复制 ./run/.env.smaple 到 ./.env
cp -f ./run/.env.smaple ./.env

./run/start-noproxy.sh
