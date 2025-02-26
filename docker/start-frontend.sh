#!/bin/bash
docker rm -f anythingllm &&  docker run -it --name anythingllm --entrypoint /bin/bash local/anythingllm-frontend 

