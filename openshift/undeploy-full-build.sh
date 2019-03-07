#!/bin/bash
#set -x

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

SECRET_NAME=demo4-scm-key

oc process -f ${DIR}/application.yml | oc delete -f -

oc delete secret ${SECRET_NAME}
