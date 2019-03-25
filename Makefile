ENV_FILE := .env
include ${ENV_FILE}
export $(shell sed 's/=.*//' ${ENV_FILE})

# NOTE: the actual commands here have to be indented by TABs
build:
	./openshift/build.sh

push:
	./openshift/push.sh

deploy:
	./openshift/deploy.sh

undeploy:
	./openshift/undeploy.sh

