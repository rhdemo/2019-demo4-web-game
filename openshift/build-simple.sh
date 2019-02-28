#!/bin/bash
set -x

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

source "${DIR}/../.secrets"

cd ${DIR}/../
yarn build
s2i build ./dist centos/nginx-112-centos7 ${IMAGE_REPO}
docker push ${IMAGE_REPO}

