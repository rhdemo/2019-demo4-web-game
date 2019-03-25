#!/bin/bash
#set -x

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

[[ -z "${SERVER_IMAGE_REPOSITORY}" ]] && { SERVER_IMAGE_REPOSITORY="quay.io/redhatdemo/demo4-web-game-nginx:latest"; }

oc project
echo "Deploying ${SERVER_IMAGE_REPOSITORY}"

oc process -f ${DIR}/demo4-web-game-server.yml | oc delete -f -


[[ -z "${UI_IMAGE_REPOSITORY}" ]] && { UI_IMAGE_REPOSITORY="quay.io/redhatdemo/demo4-web-game-nginx:latest"; }

oc project
echo "Deploying ${UI_IMAGE_REPOSITORY}"

oc process -f ${DIR}/demo4-web-game-ui.yml | oc delete -f -