#!/usr/bin/env bash

declare -a Images=("hive-node:v2.3.14")
declare -a Containers=("hive-node" "assist-mongo")

function stop () {
    for container in ${Containers[@]}
    do
        container_id=$(docker container ls -a | grep ${container} | awk '{print $1}')
        if [ -n "$container_id" ]
        then
            docker container rm -f ${container_id}
        fi
    done
}

function start () {
    stop
    docker-compose -f docker/docker-compose.yml up --remove-orphans --force-recreate -d 
}

function cleanup () {
    stop
    for image in ${Images[@]}
    do
        docker image rm -f tuumtech/${image}
    done
    sudo rm -rf ${HOME}/.assist-data
}

case "$1" in
    start)
        start
        ;;
    stop)
        stop
        ;;
    cleanup)
        cleanup
        ;;
    *)
    echo "Usage: setup.sh {start|stop|cleanup}"
    exit 1
esac