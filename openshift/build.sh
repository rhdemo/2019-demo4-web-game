#!/bin/bash
#set -x

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

${DIR}/build.backend.sh
${DIR}/build.frontend.sh
