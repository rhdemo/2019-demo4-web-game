#!/bin/bash
#set -x

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

source "${DIR}/../.secrets"

[[ -z "${IMAGE_REPOSITORY}" ]] && { IMAGE_REPOSITORY="quay.io/redhatdemo/demo4-web-game-nginx:latest"; }

oc process -f ${DIR}/deployment.yml \
  -p IMAGE_REPOSITORY=${IMAGE_REPOSITORY} \
  | oc create -f -