#!/usr/bin/env bash
#set -x

[[ -z "${SERVER_IMAGE_REPOSITORY}" ]] && { SERVER_IMAGE_REPOSITORY="quay.io/redhatdemo/demo4-web-game-server:latest"; }

echo "Pushing ${SERVER_IMAGE_REPOSITORY}"
docker push ${SERVER_IMAGE_REPOSITORY}
