#!/bin/bash

docker run -dti --name container$1 -p $1:3000 bullyserver
#docker run -dti --name container$1 -e PORT=3001 -p $1:3001 bullyserver
#docker run --rm -it --name container$1 \
#-v $PWD:/home/app -w /home/app \
#-e "PORT=3000" -p $1:3000 bullyserver

#docker run --rm -it --name container$1 \
#-v $PWD:/home/app -w /home/app \
#-e "PORT=3000" -p 8080:3000