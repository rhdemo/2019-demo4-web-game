#!/bin/bash
#set -x

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

[[ -z "${UI_IMAGE_REPOSITORY}" ]] && { UI_IMAGE_REPOSITORY="quay.io/redhatdemo/demo4-web-game-nginx:latest"; }

echo "Building ${UI_IMAGE_REPOSITORY}"

cd ${DIR}/../frontend
rm -rf dist .cache tmp
yarn install
yarn build

# The no-source-maps flag in the parcel CLI is not working so delete them
rm dist/*.map

# Remove bundle report
rm dist/report.html

s2i build ./dist centos/nginx-112-centos7 ${UI_IMAGE_REPOSITORY}
