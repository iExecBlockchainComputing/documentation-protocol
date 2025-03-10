# Build a Gramine application

In this tutorial, you will learn how to build and run a Confidential Computing
application with the Gramine TEE framework.

::: warning

Before going any further, make sure you managed to
[Build your first application](../your-first-app.md).

:::

::: tip Prerequisites:

- [Docker](https://docs.docker.com/install/) 17.05 or higher on the daemon and
  client.
- [iExec SDK](https://www.npmjs.com/package/iexec) 8.0.0 or higher.
  [Install the iExec SDK](../quick-start-for-developers.md#install-the-iexec-sdk)
- Familiarity with the basic concepts of
  [Intel® SGX](intel-sgx-technology.md#intel-r-software-guard-extension-intel-r-sgx)
  and [Gramine](choose-your-tee-framework.md#gramine) framework.

:::

## Prepare your application

::: warning

For demo purposes, we omitted some development best practices in these examples.

Make sure to check your field's best practices before going to production.

:::

Create a directory tree for your application in `~/iexec-projects/`.

```bash
cd ~/iexec-projects
mkdir tee-hello-world-app && cd tee-hello-world-app
iexec init --skip-wallet
mkdir src
touch Dockerfile
```

### Update chain.json

Make sure your `chain.json` content is as follows:

```json
{
  "default": "bellecour",
  "chains": {
    "bellecour": {}
  }
}
```

Copy from previous steps your
[Javascript or Python sources](../your-first-app.md#write-the-app) in `src/` .

When your sources are copied, your are ready to dockerize your application:

::: code-group

```bash [Dockerfile for Javascript]
FROM iexechub/iexec-gramine-base:0.10.0

RUN apt-get update \
    && apt-get install -y curl \
    && curl -fsSL https://deb.nodesource.com/setup_14.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

ARG SOURCE_DIR=src
ARG GRAMINE_DIR=gramine

# Get the code of app to /workplace/app
COPY $SOURCE_DIR/app.js /workplace/app

# Set the main function for node app, no need for binnary app
RUN sed -i "s#MAIN_FUNC=#MAIN_FUNC=/workplace/app/app.js#" /apploader.sh

WORKDIR /workplace/app

# Install required node dependencies (needs to be ran after WORKDIR has been specified)
RUN npm install figlet@1.x

# Copy the manifest to use from within the base image
# or create your own
RUN cp /common-manifests/nodejs.entrypoint.manifest /entrypoint.manifest

# Finalize app (finalize manifest and sign app)
RUN /finalize-app.sh
```

```bash [Dockerfile for Python]
FROM iexechub/iexec-gramine-base:0.10.0

### Install python and required dependencies
RUN apt-get update \
    && apt-get install -y python3 \
    && rm -rf /var/lib/apt/lists/*

ARG SOURCE_DIR=src
ARG GRAMINE_DIR=gramine

# get the code of app to /workplace/app
COPY $SOURCE_DIR/app.py /workplace/app

# set the main function for python and node app, no need for binnary app
RUN sed -i "s#MAIN_FUNC=#MAIN_FUNC=/workplace/app/app.py#" /apploader.sh

WORKDIR /workplace/app

# Install required dependencies
RUN pip3 install pyfiglet

# Copy the manifest to use from within the base image
# or create your own
RUN cp /common-manifests/python.entrypoint.manifest /entrypoint.manifest

# Finalize app (finalize manifest and sign app)
RUN /finalize-app.sh
```

:::

Build the docker image.

```bash
docker build . --tag <docker-hub-user>/tee-gramine-hello-world:1.0.0
```

Push your image on DockerHub:

```bash
docker push <docker-hub-user>/tee-gramine-hello-world:1.0.0
```

Congratulations, you just built your Gramine TEE application.

## Test your app on iExec

At this stage, your application is ready to be tested on iExec. The process is
similar to testing any type of application on the platform, with these minor
exceptions:

### Deploy the TEE app on iExec

Gramine TEE applications require some additional information to be filled in
during deployment.

```bash
# prepare the Gramine TEE application template
iexec app init --tee-framework gramine
```

Edit `iexec.json` and fill in the standard keys and the `mrenclave` object:

```json
{
  ...
  "app": {
    "owner": "<your-wallet-address>", // starts with 0x
    "name": "tee-gramine-hello-world",
    "type": "DOCKER",
    "multiaddr": "docker.io/<docker-hub-user>/tee-gramine-hello-world:1.0.0", // update it with your own DockerHub username
    "checksum": "<checksum>", // starts with 0x, update it with your own image digest
    "mrenclave": {
      "framework": "GRAMINE",
      "version": "v0",
      "fingerprint": "<mrenclave>" // no 0x prefix, see how to retrieve it below
    }
  },
  ...
}
```

::: info

Run your Gramine TEE image with `sps=unset` to get the enclave fingerprint
(mrenclave):

```bash
docker run --rm -e sps=unset <docker-hub-user>/tee-gramine-hello-world:1.0.0
```

The run is expected to fail but you should look for a `mr_enclave` field in your
logs:

```bash
    mr_enclave:  dcec6d7f76520cb996d6e9dac105b9c3d75c7bb4a4d8f3669f6101cbca6aff4f
```

Hint: The `mr_enclave` is also available in your logs when building your app.

:::

Deploy the app with the standard command:

```bash
iexec app deploy
```

### Run the TEE app

You are now ready to run the app

Specify the tag `--tag tee,gramine` in `iexec app run` command to run a tee app.

```bash
iexec app run --tag tee,gramine --workerpool debug-v8-bellecour.main.pools.iexec.eth --watch
```

::: info

You noticed we used `debug-v8-bellecour.main.pools.iexec.eth` instead of an
ethereum address, this is an ENS name. The
[ENS (Ethereum Name Service)](https://ens.domains/) protocol enables associating
decentralized naming to ethereum addresses.

:::

::: info

Remember, you can access task and app logs by following the instructions on page
[Debug your tasks](../advanced/task-feedback.md).

:::

### Troubleshoot your Gramine task run

If your task does not complete and the error is related to Gramine, you might
see following output:

```bash
[error] get keys failed, return -[<ERROR_CODE>]
```

| Error code | Error message             | Description                                                                                                                     | Action                                                                                                                                                                                                                                                                                                    |
| ---------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `111`      | `Unreachable SPS`         | The SPS is not reachable or offline.                                                                                            | Please contact [iExec Help Center](https://iexecproject.atlassian.net/servicedesk/customer/portal/4).                                                                                                                                                                                                     |
| `9984`     | `Invalid SPS Certificate` | The SSL certificate of the SPS is not signed by a Certificate Authority you trust.                                              | You might be using a `<version>` of the Gramine base (`iexechub/iexec-gramine-base:<version>`) which is too old. Verify the `<version>` to use [in the documentation](#prepare-your-application) or please contact [iExec Help Center](https://iexecproject.atlassian.net/servicedesk/customer/portal/4). |
| `30952`    | `Unexpected MRENCLAVE`    | The measurement of the enclave does not match your on-chain configuration of your deployed dapp `"fingerprint": "<mrenclave>"`. | It is likely you did not set the `<mrenclave>` properly, please verify [how to retrieve it](#deploy-the-tee-app-on-iexec).                                                                                                                                                                                |

## Next step?

You have built and run your Gramine application, you can now go further with:

- [Access confidential assets from your app](access-confidential-assets.md)
- [Protect the result](end-to-end-encryption.md)
