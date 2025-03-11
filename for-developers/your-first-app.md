---
description: >-
  In this section we will show you how you can create a Docker dapp over the
  iExec infrastructure.
---

# Build your first application

> In this section we will show you how you can create a Docker dapp over the
> iExec infrastructure.

::: tip Prerequisites

- [Docker](https://docs.docker.com/install/) 17.05 or higher on the daemon and
  client.
- [Dockerhub](https://hub.docker.com/) account.
- [iExec SDK](https://www.npmjs.com/package/iexec) 8.0.0 or higher.
  [Install the iExec SDK](quick-start-for-developers.md#install-the-iexec-sdk).
- [Quickstart](quick-start-for-developers.md) tutorial completed

:::

In this guide, we will prepare an iExec app based on an existing docker image
and we will run it on iExec decentralized infrastructure.

**Tutorial Steps :**

- [Understand what is an iExec decentralized application?](your-first-app.md#understand-what-is-an-iexec-decentralized-application)
- [Build your app](your-first-app.md#build-your-app)
- [Test your app locally](your-first-app.md#test-your-app-locally)
- [Test your app on iExec](your-first-app.md#test-your-app-on-iexec)
- [Publish your app on iExec marketplace](your-first-app.md#publish-your-app-on-the-iexec-marketplace)
- [What's next?](your-first-app.md#whats-next)

## Understand what is an iExec decentralized application?

iExec leverage [Docker](https://www.docker.com/why-docker) containers to ensure
the execution of your application on a decentralized infrastructure. iExec
supports Linux-based docker images.

### Why using Docker containers?

- Docker Engine is the most **widely used** container engine.
- A Docker container image is a **standard** unit of software that packages up
  code and all its dependencies so the application runs quickly and reliably
  from one computing environment to another. This allows for computations to be
  **run on any worker** connected to the decentralized infrastructure.
- Docker also enables the creation of new layers on top of existing images. This
  allows for any iExec **apps to be easily built on top of existing docker
  images**.

### What kind of application can I build on iExec?

Today you can run any application as a task. This means services are not
supported for now.

## Build your app

Create the folder tree for your application in `~/iexec-projects/`.

```bash
cd ~/iexec-projects
mkdir hello-world-app
cd hello-world-app
mkdir src
touch Dockerfile
```

### Write the app

::: warning

For demo purposes, we omitted some development best practices in these examples.

Make sure to check your field's best practices before going to production.

:::

The following examples only feature Javascript and Python use cases for
simplicity concerns but remember that you can run on iExec anything which is
Dockerizable.

**Copy the following content** in `src/` .

::: code-group

```javascript [src/app.js]
const fsPromises = require('fs').promises;

(async () => {
  try {
    const iexecOut = process.env.IEXEC_OUT;
    // Do whatever you want (let's write hello world here)
    const message = process.argv.length > 2 ? process.argv[2] : 'World';

    const text = `Hello, ${message}!`;
    console.log(text);
    // Append some results in /iexec_out/
    await fsPromises.writeFile(`${iexecOut}/result.txt`, text);
    // Declare everything is computed
    const computedJsonObj = {
      'deterministic-output-path': `${iexecOut}/result.txt`,
    };
    await fsPromises.writeFile(
      `${iexecOut}/computed.json`,
      JSON.stringify(computedJsonObj)
    );
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
})();
```

```python [src/app.py]
import os
import sys
import json

iexec_out = os.environ['IEXEC_OUT']

# Do whatever you want (let's write hello world here)
text = 'Hello, {}!'.format(sys.argv[1] if len(sys.argv) > 1 else "World")
print(text)

# Append some results in /iexec_out/
with open(iexec_out + '/result.txt', 'w+') as fout:
    fout.write(text)

# Declare everything is computed
with open(iexec_out + '/computed.json', 'w+') as f:
    json.dump({ "deterministic-output-path" : iexec_out + '/result.txt' }, f)
```

:::

::: warning

As a developer, make it a rule to never log sensitive information in your
application. Execution logs are accessible by:

- worker(s) involved in the task
- the workerpool manager
- the requester of the task

:::

### Dockerize your app

**Copy the following content** in `Dockerfile` .

::: code-group

```bash [Dockerfile for JavaScript]
FROM node:14-alpine3.11
### install your dependencies if you have some
RUN mkdir /app && cd /app
COPY ./src /app
ENTRYPOINT [ "node", "/app/app.js"]
```

```bash [Dockerfile for Python]
FROM python:3.7.3-alpine3.10
### install python dependencies if you have some
COPY ./src /app
ENTRYPOINT ["python3", "/app/app.py"]
```

:::

Build the docker image.

::: warning

iExec expects your Docker container to be built for the `linux/amd64` platform.
However, if you develop on a **Mac** with Apple **M processor**, the platform is
`linux/arm64`, which is different. To prepare your application, you will need to
install `buildkit` and then prepare your docker image for both platforms.

```bash
brew install buildkit
# ARM64 variant for local testing only
docker buildx build --platform linux/arm64 --tag <docker-hub-user>/hello-world .
# AMD64 variant to deploy on iExec
docker buildx build --platform linux/amd64 --tag <docker-hub-user>/hello-world .
```

:::

```bash
docker build --tag hello-world .
```

::: tip

`docker build` produce an image id, using `--tag <name>` option is a convenient
way to name the image to reuse it in the next steps.

:::

**Congratulations you built your first docker image for iExec!**

## Test your app locally

### Basic test

Create local volumes to simulate input and output directories.

```bash
mkdir -p ./tmp/iexec_in
mkdir -p ./tmp/iexec_out
```

Run your application locally \(container volumes bound with local volumes\).

```bash
docker run --rm \
    -v ./tmp/iexec_in:/iexec_in \
    -v ./tmp/iexec_out:/iexec_out \
    -e IEXEC_IN=/iexec_in \
    -e IEXEC_OUT=/iexec_out \
    hello-world arg1 arg2 arg3
```

::: tip Docker run \[options\] image \[args\]

**docker run usage:**

`docker run [OPTIONS] IMAGE [COMMAND] [ARGS...]`

Use `[COMMAND]` and `[ARGS...]` to simulate the requester arguments

**useful options for iExec:**

`-v` : Bind mount a volume. Use it to bind input and output directories
(`/iexec_in` and `/iexec_out`)

`-e`: Set environnement variable. Use it to simulate iExec Runtime variables

:::

### Test with input files

Starting with the basic test you can simulate input files.

For each input file:

- Copy it in the local volume bound to `/iexec_in` .
- Add `-e IEXEC_INPUT_FILE_NAME_x=NAME` to docker run options \(`x` is the index
  of the file starting by 1 and `NAME` is the name of the file\)

Add `-e IEXEC_INPUT_FILES_NUMBER=n` to docker run options \(`n` is the total
number of input files\).

Example with two inputs files:

```bash
touch ./tmp/iexec_in/file1 && \
touch ./tmp/iexec_in/file2 && \
docker run \
    -v ./tmp/iexec_in:/iexec_in \
    -v ./tmp/iexec_out:/iexec_out \
    -e IEXEC_IN=/iexec_in \
    -e IEXEC_OUT=/iexec_out \
    -e IEXEC_INPUT_FILE_NAME_1=file1 \
    -e IEXEC_INPUT_FILE_NAME_2=file2 \
    -e IEXEC_INPUT_FILES_NUMBER=2 \
    hello-world \
    arg1 arg2 arg3
```

## Test your app on iExec

### Push your app to Dockerhub

Login to your Dockerhub account.

```bash
docker login
```

Tag your application image to push it to your dockerhub public repository.

```bash
docker tag hello-world <docker-hub-user>/hello-world:1.0.0
```

::: warning

replace `<docker-hub-user>` with your docker user name

:::

Push the image to Dockerhub.

```bash
docker push <docker-hub-user>/hello-world:1.0.0
```

**Congratulations, your app is ready to be deployed on iExec!**

### Deploy your app on iExec

You already learned how to deploy the default app on iExec in the
[previous tutorial](quick-start-for-developers.md).

Go back to the `iexec-project` folder.

```bash
cd ~/iexec-projects/
```

You will need a few configurations in `iexec.json` to deploy your app:

- Replace app **name** with your application name \(display only\)
- Replace app **multiaddr** with your app image download URI \(should looks like
  `docker.io/<docker-hub-user>/hello-world:1.0.0`\)
- Replace app **checksum** with your application image checksum \(see tip
  below\)

::: info

The checksum of your app is the sha256 digest of the docker image prefixed with
`0x` , you can use the following command to get it.

```bash
docker pull <docker-hub-user>/hello-world:1.0.0 | grep "Digest: sha256:" | sed 's/.*sha256:/0x/'
```

:::

Deploy your app on iExec

```bash
iexec app deploy
```

Verify the deployed app \(name, multiaddr, checksum, owner\)

```bash
iexec app show
```

### Run your app on iExec

```bash
iexec app run --workerpool debug-v8-learn.main.pools.iexec.eth --watch
```

::: info

**Using arguments:**

You can pass arguments to the app using `--args <args>` option.

With `--args "dostuff --with-option"` the app will receive
`["dostuff", "--with-option"]` as process args.

**Using input files:**

You can pass input files to the app using `--input-files <list of URL>` option.

With
`--input-files https://example.com/file-A.txt,https://example.com/file-B.zip`
the iExec worker will download the files before running the app in `IEXEC_IN`,
and let the app access them throug variables:

- `file-A.txt` as`IEXEC_INPUT_FILE_NAME_1`
- `file-B.zip` as`IEXEC_INPUT_FILE_NAME_2`

:::

Once the run is completed copy the taskid from `iexec app run` output to
download and check the result

```bash
iexec task show <taskid> --download my-app-result  \
    && unzip my-app-result.zip -d my-app-result
```

**Congratulations your app successfully ran on iExec!**

## Manage your app's output

iExec enables running apps producing output files, you will need a place for
storing your apps outputs.

::: info

iExec provides a default storage solution based on [IPFS](https://ipfs.io/).
This solution ensures your result to be publicly accessible through a
decentralized network.

To ensure your business data remains secure and private, iExec offers optional
RSA result encryption and the ability to push results to private storage
providers. For more information, refer to `iexec storage --help` and
the[iExec SDK](for-developers/toolbox/iexec-sdk.md).

:::

## Access to app and task logs on iExec

Sometimes things don't work out right the first time and you may need to
[Debug your tasks](advanced/task-feedback.md).

## Publish your app on the iExec marketplace

```bash
iexec app publish
```

**Congratulations your application is now available on iExec!**

## What's next?

In this tutorial you learned about the key concepts for building an app on
iExec:

- iExec app inputs and outputs
- iExec app must produce a `computed.json` file \(required for the proof of
  execution\)
- using docker to package your app with all its dependencies
- testing an iExec app locally
- publishing on dockerhub

Resources:

- A list of iExec applications with their Docker images can be found at
  [https://github.com/iExecBlockchainComputing/iexec-apps](https://github.com/iExecBlockchainComputing/iexec-apps)

Continue with these articles:

- [Confidential app](confidential-computing/)
- [Learn how to manage your apporders](advanced/manage-your-apporders.md)
