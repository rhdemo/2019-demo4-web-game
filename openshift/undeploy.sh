#!/usr/bin/env bash
#set -x

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

${DIR}/undeploy.backend.sh
${DIR}/undeploy.frontend.sh

