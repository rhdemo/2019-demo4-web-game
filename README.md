# Preact Starter

This starter was created by [José Quintana](git.io/joseluisq)

## Usage

### Development

Clone the repository and install the dependencies:

```sh
git clone --depth 1 git@github.com:rhdemo/2019-demo4-web-game.git
yarn install
```

Verify the `.env.development` file is pointing to a correct IP address for the websocket server. Now start the server using:

```
yarn start
```

Now navigate to http://localhost:1234/index.html, http://localhost:1234/index.html, or http://localhost:1234/admin.html depending on the service you need to view.

### Production

To create a production build of the assets run:

```
yarn build
```

Pushing a new image can be done using the scripts. Make sure you're logged into quay.io and have access to our org first, then run:

```
./openshift/build-local.sh
```

You can then trigger a rollout on the cluster for the webapp.
