#!/bin/bash

PREDICTION_URL=http://adcd8d7be55de11e9947402e6167af94-1891507013.us-east-1.elb.amazonaws.com/model/predict

if [[ -z "${MINISHIFT_IP}" ]]
then
    echo "No minishift instance."
    CONSOLE_HOST=console-datagrid-demo.apps.dev.openshift.redhatkeynote.com
    echo "Using ${CONSOLE_HOST}"
else
    CONSOLE_HOST=console-datagrid-demo.${MINISHIFT_IP}.nip.io
    echo "Using minishift instance at ${MINISHIFT_IP}"
    echo "Using ${CONSOLE_HOST}"
fi

PORT=8081 \
PREDICTION_URL=$PREDICTION_URL \
TRAINING_URL=http://0.0.0.0:8084/training \
KAFKA_BROKER_LIST_HOST=0.0.0.0 \
KAFKA_BROKER_LIST_PORT=9092 \
DATAGRID_HOST=0.0.0.0 \
DATAGRID_HOTROD_PORT=11222 \
DATAGRID_CONSOLE_HOST=${CONSOLE_HOST} \
DATAGRID_CONSOLE_PORT=80 \
DATAGRID_CONSOLE_REST_PORT=8080 \
npm run dev
