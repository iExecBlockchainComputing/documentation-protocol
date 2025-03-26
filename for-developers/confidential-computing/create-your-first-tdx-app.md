# Build a TDX application

In this tutorial, you will learn how to build and run a Confidential Computing application with the TDX framework.

::: warning

The TDX Framework you’ll be using in this tutorial is an experimental environment designed for testing and development. It provides a sandbox for builders to deploy and run applications, experiment with new features, and identify potential issues. Since this is an alpha version, bugs and unexpected behaviors may occur. Access is granted to a select group of builders who can use the platform to validate their applications before moving to a production-ready environment.

Unlike SGX, there’s no need for Sconification—making deployment much simpler. However, everything must be done through the [iExec SDK 8.13.0-tdx](https://github.com/aimen-djari/iexec-sdk/tree/feature/tdx), and only applications deployed with this SDK should be used to ensure compatibility and security.

:::

::: warning

Before going any further, make sure you managed to [Build your first application](../your-first-app.md).

:::

::: tip Prerequisites:

- [Docker](https://docs.docker.com/install/) 17.05 or higher on the daemon and client.
- [iExec SDK 8.13.0-tdx](https://github.com/aimen-djari/iexec-sdk/tree/feature/tdx). Contact us to have this special release.

:::

## Prepare your application

::: warning

For demo purposes, we omitted some development best practices in these examples.

Make sure to check your field's best practices before going to production.

:::

Before going further, your `<docker-hub-user>/hello-world:1.0.0` image built previously is required.

If you missed that part, please go back to [Build your first application](../your-first-app.md).

For this tutorial, you can reuse the same directory tree or create a new one.

To create a new directory tree, execute the following commands in `~/iexec-projects/`.

```bash
cd ~/iexec-projects
mkdir tee-hello-world-app && cd tee-hello-world-app
iexec init --skip-wallet
mkdir src
touch Dockerfile
```

### Update chain json

Make sure your `chain.json` content is as follows:

```json
{
  "default": "bellecour",
  "chains": {
    "bellecour": {
      "sms": { "tdx": "https://sms.labs.iex.ec" }
    }
  }
}
```

If you start from a new directory tree, you will need to replay the following steps from [Build your first application](../your-first-app.md):

- [Write the app](../your-first-app.md#write-the-app) Javascript or Python source code in `src/`
- [Dockerize your app](../your-first-app.md#dockerize-your-app)
- [Push your app to Dockerhub](../your-first-app.md#push-your-app-to-dockerhub)

As we mentioned earlier, the advantage of using **TDX** is the ability to run the application in a TEE without changing the source code. The only thing we are going to do is adding some information in the iexec.json file.

## Test your app on iExec

At this stage, your application is ready to be tested on iExec. The process is similar to testing any type of application on the platform, with these minor exceptions:

### Deploy the TEE app on iExec

TEE applications require some additional information to be filled in during deployment.

```bash
# prepare the TEE application template
iexec app init --tee-framework tdx
```

Edit `iexec.json` and fill in the standard keys. Please do not change the `mrenclave` object.

```json
{
  ...
  "app": {
    "owner": "<your-wallet-address>", // starts with 0x
    "name": "tee-scone-hello-world", // application name
    "type": "DOCKER",
    "multiaddr": "docker.io/<docker-hub-user>/tee-scone-hello-world:1.0.0-debug", // app image
    "checksum": "<checksum>", // starts with 0x, update it with your own image digest
    "mrenclave": {
      "framework": "TDX", // TEE framework (keep default value)
  	}
  },
  ...
}
```

::: info

See [Create your identity on the blockchain](../quick-start-for-developers.md#create-your-identity-on-the-blockchain) to retrieve `<your-wallet-address>` value.

See [Deploy your app on iExec](../your-first-app.md#deploy-your-app-on-iexec) to retrieve your image `<checksum>`.

:::

Deploy the app with the standard command:

```bash
iexec app deploy
```

### Run the TEE app

Specify the tag `--tag tee,tdx` in `iexec app run` command to run a **TDX** app.

One last thing, in order to run a **TDX** app you will also need to select a TDX workerpool, use the TDX workerpool `tdx-labs.iexec.eth`.

You are now ready to run the app

```bash
iexec app run --tag tee,tdx --workerpool tdx-labs.iexec.eth --watch
```

::: info

You noticed we used `tdx-labs.iexec.eth` instead of an ethereum address, this is an ENS name.

The [ENS (Ethereum Name Service)](https://ens.domains/) protocol enables associating decentralized naming to ethereum addresses.

:::

::: info

Remember, you can access task and app logs by following the instructions on page [Debug your tasks](../advanced/task-feedback.md).

:::
