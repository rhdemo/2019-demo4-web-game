#!/bin/bash
#set -x

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

[[ -f "${DIR}/../.secrets" ]] && source "${DIR}/../.secrets"

SECRET_NAME=demo4-scm-key
SECRET=$(oc get secret ${SECRET_NAME} 2>/dev/null)

if [[ -z "$SECRET" ]]
then
  echo "${SECRET_NAME} missing.  Creating..."
  [[ -z "${SCM_SSH_KEY_PATH}" ]] && { SCM_SSH_KEY_PATH="${HOME}/.ssh/id_rsa"; }
  oc create secret generic ${SECRET_NAME} --from-file=ssh-privatekey=${SCM_SSH_KEY_PATH} --type=kubernetes.io/ssh-auth
else
  echo "${SECRET_NAME} found"
fi

oc process -f ${DIR}/application.yml | oc create -f -