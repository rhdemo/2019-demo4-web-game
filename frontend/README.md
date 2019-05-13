# Summit 2019 Demo 4 Mobile Game

Project based on a template by [José Quintana](git.io/joseluisq)

## Usage

### Prerequisites
Install Node.js 8 or higher. This will make `npm` and `node` available on your 
system. Now run `npm install -g yarn@1.13`. You're good to go now. Other yarn
versions might also work, but 1.13 was used during development and is
known to work.

### Development & Running the App

Clone the repository and install the dependencies:

```sh
git clone git@github.com:rhdemo/2019-demo4-web-game.git
cd frontend
yarn install
```

Verify the `.env.development` file is pointing to a correct address for the websocket server. This is the address of the `server` component in this repository.

Use the following command to build and serve the application files:

```
yarn start
```

Now navigate to http://localhost:1234/index.html, 
http://localhost:1234/training.html, or http://localhost:1234/admin.html
depending on the service you need to view.

If you make code changes the server will automatically detect them, make a new 
build, and refresh the browser.

### Motion API Explainer

This application relies on the Device Motion and Device Orientation APIs
available in modern browsers. These APIs have a few caveats that you must be 
aware of to understand how to run this application:

* Operate by registering a listener for the `devicemotion` and
`deviceorientation` events in browser.
* Supported by almost all mobile devices, but not many latops
* Only work if the website is served over HTTPS (as of Chrome 74.x and iOS 12.2)
* Safari on iOS 12.2 also requires a settings change to enable the APIs ([link](https://www.macrumors.com/2019/02/04/ios-12-2-safari-motion-orientation-access-toggle/))

This means you'll need to serve the application over HTTPS to access the motion
and orientation data on Android and iOS devices as of April 2019.

### Forcing Game States

In `container.tsx` you can manipulate the `switch` statement to force certain
screens to appear by copying the case value, e.g `ConfigGameMode.Paused` and
pasting it like so `switch(ConfigGameMode.Paused)`.

### Production

To create a production build of the web assets run:

```
yarn build
```

Pushing a new image can be done using the scripts included in the root of 
the project. These are:

```
./openshift/build.frontend.sh
./openshift/push.frontend.sh
./openshift/deploy.frontend.sh
```

For the all scripts simply set the `UI_IMAGE_REPOSITORY` to a quay.io or
dockerhub repository that you'd like to push or pull the image from.
