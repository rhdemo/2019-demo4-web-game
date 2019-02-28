#!/bin/bash
#set -x

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

source "${DIR}/../.secrets"

oc process -f ${DIR}/simple.yml \
  -p IMAGE_REPOSITORY=${IMAGE_REPOSITORY} \
  | oc create -f -