#!/usr/bin/env bash
set -x

[[ -z "${SERVER_IMAGE_REPOSITORY}" ]] && { SERVER_IMAGE_REPOSITORY="quay.io/redhatdemo/demo4-web-game-server:latest"; }

echo "Pushing ${SERVER_IMAGE_REPOSITORY}"
docker push ${SERVER_IMAGE_REPOSITORY}


[[ -z "${UI_IMAGE_REPOSITORY}" ]] && { UI_IMAGE_REPOSITORY="quay.io/redhatdemo/demo4-web-game-nginx:latest"; }

echo "Pushing ${UI_IMAGE_REPOSITORY}"
docker push ${UI_IMAGE_REPOSITORY}



