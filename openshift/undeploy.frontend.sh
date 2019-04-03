#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

[[ -z "${UI_IMAGE_REPOSITORY}" ]] && { UI_IMAGE_REPOSITORY="quay.io/redhatdemo/demo4-web-game-nginx:latest"; }

oc project web-game-demo
echo "Deploying ${UI_IMAGE_REPOSITORY}"

oc process -f ${DIR}/demo4-web-game-ui.yml | oc delete -f -
