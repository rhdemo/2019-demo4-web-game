#!/bin/bash
#set -x

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

[[ -f "${DIR}/../.secrets" ]] && source "${DIR}/../.secrets"

[[ -z "${IMAGE_REPOSITORY}" ]] && { IMAGE_REPOSITORY="quay.io/redhatdemo/demo4-web-game-nginx:latest"; }

echo "Building ${IMAGE_REPOSITORY}"

cd ${DIR}/../
yarn
yarn build
s2i build ./dist centos/nginx-112-centos7 ${IMAGE_REPOSITORY}
docker push ${IMAGE_REPOSITORY}



