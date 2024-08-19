if [ $(docker ps -a | grep -c ollama) -ne 0 ]; then
    docker rm -f ollama
fi

docker run -d -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama

