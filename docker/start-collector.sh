#!/bin/bash
docker rm -f anythingllm &&  docker run -itd --name anythingllm local/anythingllm-collector && docker exec -it -u root  anythingllm /bin/bash
