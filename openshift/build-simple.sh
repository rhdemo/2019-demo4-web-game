#!/bin/bash
#set -x

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

source "${DIR}/../.secrets"

if [[ -z "${IMAGE_REPOSITORY}" ]]
then
    echo ".secrets file with IMAGE_REPOSITORY is required"
else
    echo "Building ${IMAGE_REPOSITORY}"

    cd ${DIR}/../
    yarn build
    s2i build ./dist centos/nginx-112-centos7 ${IMAGE_REPOSITORY}
    docker push ${IMAGE_REPOSITORY}
fi




