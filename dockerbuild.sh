#!/bin/bash
# set the var to be the container
CONTAINER=prgminer
FLAGS='-d -p 3008:3008 -p 4001:4001 --restart unless-stopped'
MYMAX=0
# stop the containers
for n in $(docker images $CONTAINER --format "{{.Tag}}")
do
    for m in $(docker ps -aqf ancestor=$CONTAINER:$n)
    do
        docker stop $m
        docker rm $m
    done
done
# remove all but the oldest image
for n in $(docker images $CONTAINER --format "{{.Tag}}")
do
    if [ $n -gt $MYMAX ];
    then
        MYMAX=$n
    fi
done

for n in $(docker images $CONTAINER --format "{{.Tag}}")
do
    if [ $n -lt $MYMAX ];
    then
        docker image rm $CONTAINER:$n
    fi
done

# Clean up any previous build artifacts
echo "Cleaning up previous build artifacts..."
rm -rf .next

# build the new image
IMAGETAG=$CONTAINER:$(date +%Y%m%d%H%M%S)
echo "Building image: $IMAGETAG"
docker build -t $IMAGETAG .

# start the new image
echo "Starting container with image: $IMAGETAG"
docker run $FLAGS $IMAGETAG

echo "Deployment completed successfully."