#!/bin/bash
#set -x

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

[[ -z "${SERVER_IMAGE_REPOSITORY}" ]] && { SERVER_IMAGE_REPOSITORY="quay.io/redhatdemo/demo4-web-game-server:latest"; }
[[ -z "${GIT_REPOSITORY}" ]] && { GIT_REPOSITORY="git@github.com:rhdemo/2019-demo4-web-game.git"; }
[[ -z "${GIT_BRANCH}" ]] && { GIT_BRANCH="master"; }

echo "Building ${SERVER_IMAGE_REPOSITORY} from ${GIT_REPOSITORY} on ${GIT_BRANCH}"

s2i build ${GIT_REPOSITORY} --ref ${GIT_BRANCH} --context-dir /server docker.io/centos/nodejs-10-centos7:latest ${SERVER_IMAGE_REPOSITORY}