#!/bin/bash


PORT=8081 \
GESTURE_API_URL=http://0.0.0.0:8084 \
KAFKA_BROKER_LIST_HOST=0.0.0.0 \
KAFKA_BROKER_LIST_PORT=9092 \
DATAGRID_HOTROD_SERVICE_HOST=0.0.0.0 \
DATAGRID_HOTROD_SERVICE_PORT=11222 \
npm run dev