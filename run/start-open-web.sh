if [ $(docker ps -a | grep -c ollama-webui) -ne 0 ]; then
    docker rm -f ollama-webui
fi

docker run -d -p 3000:8080 --add-host=host.docker.internal:host-gateway -v ollama-webui:/app/backend/data --name ollama-webui --restart always ghcr.io/open-webui/open-webui:main
