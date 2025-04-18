# Build Intel TDX app

In this tutorial, you will learn how to build and run a Confidential Computing
application with the TDX framework.

::: warning

⚠️ **Experimental Feature – TDX Testbed Access This TDX-powered workerpool is
not a production environment. It is an early-access testbed for selected
builders. Please note:**

- ❌ No guaranteed uptime or availability
- 🔓 Secrets may be lost or leaked
- 🔄 Service may change or be discontinued at any time

**Use at your own risk.** Your feedback is essential — help us improve by
sharing insights on the documentation, tooling, app performance, and your
overall experience.

:::

## Prerequisites

- [Docker](https://docs.docker.com/install/) 17.05 or higher on the daemon and
  client.
- [iExec SDK 8.13.0-tdx](https://github.com/aimen-djari/iexec-sdk/tree/feature/tdx).
  Contact us to have this special release.

## Build your application

Thanks to **Intel TDX**, neither the source code or the binaries of your
application need to be changed in order to run securely in a TEE. Only two files
need to be changed compared to the usual SGX workflow: `chain.json` and
`iexec.json`.

iApps for the TDX framework follow the same format as non-TEE applications;
follow the instructions on [Build your first application](../your-first-app.md)
to create and Dockerize your iApp.

After this step, the Docker image of your iApp should be published on Docker Hub
(e.g. `<docker-hub-user>/hello-world:1.0.0`).

### Update `chain.json`

Modify your `chain.json` as follows to reference the TDX Workerpool:

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

### Update `iexec.json`

TEE applications need a few more keys in the `iexec.json` file; run this to add
them automatically:

```bash
iexec app init --tee-framework tdx
```

Your `iexec.json` should now look like this example:

```json
{
  ...
  "app": {
    "owner": "<your-wallet-address>", // starts with 0x
    "name": "tee-scone-hello-world", // application name
    "type": "DOCKER",
    "multiaddr": "<docker-hub-user>/hello-world:1.0.0", // app image
    "checksum": "<checksum>", // starts with 0x, update it with your own image digest
    "mrenclave": {
      "framework": "TDX", // TEE framework (keep default value)
  	}
  },
  ...
}
```

::: info

See [Deploy your app on iExec](../your-first-app.md#deploy-your-app-on-iexec) to
retrieve your image `<checksum>`.

:::

### Deploy and run the TEE app

Deploy the app with the standard command:

```bash
iexec app deploy
```

To execute the app in TDX, ddd `--tag tee,tdx` to the `iexec app run` and select
the TDX workerpool (`tdx-labs.pools.iexec.eth`).

```bash
iexec app run --tag tee,tdx --workerpool tdx-labs.pools.iexec.eth --watch
```

::: info

Remember, you can access task and app logs by following the instructions on page
[Debug your tasks](../advanced/task-feedback.md).

:::
