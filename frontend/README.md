# Preact Starter

This starter was created by [José Quintana](git.io/joseluisq)

## Usage

### Prerequisites
Install Node.js 8 or higher. This will make `npm` and `node` available on your system. Now run `npm install -g yarn`. You're good to go now.

### Development

Clone the repository and install the dependencies:

```sh
git clone --depth 1 git@github.com:rhdemo/2019-demo4-web-game.git
cd frontend
yarn install
```

Verify the `.env.development` file is pointing to a correct address for the websocket server. Now start the server using:

```
yarn start
```

Now navigate to http://localhost:1234/index.html, http://localhost:1234/index.html, or http://localhost:1234/admin.html depending on the service you need to view.

### Forcing States

In `container.tsx` you can manipulate the `switch` statement to force certain
screens to appear by copying the case value, e.g `ConfigGameMode.Paused` and
pasting it like so `switch(ConfigGameMode.Paused)`.

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
