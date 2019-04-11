ENV_FILE := .env
include ${ENV_FILE}
export $(shell sed 's/=.*//' ${ENV_FILE})

# NOTE: the actual commands here have to be indented by TABs
build-backend:
	./openshift/build.backend.sh

build-frontend:
	./openshift/build.frontend.sh

build:
	./openshift/build.backend.sh && ./openshift/build.frontend.sh


push-backend:
	./openshift/push.backend.sh

push-frontend:
	./openshift/push.frontend.sh

push:
	./openshift/push.backend.sh && ./openshift/push.frontend.sh


deploy-backend:
	./openshift/deploy.backend.sh

deploy-frontend:
	./openshift/deploy.frontend.sh

deploy:
	./openshift/deploy.backend.sh && ./openshift/deploy.frontend.sh


undeploy-backend:
	./openshift/undeploy.backend.sh

undeploy-frontend:
	./openshift/undeploy.frontend.sh

undeploy:
	./openshift/undeploy.backend.sh && ./openshift/undeploy.frontend.sh


