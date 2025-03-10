# Access a confidential dataset

In this tutorial, you will learn how to leverage an encrypted dataset by using
the `IEXEC_DATASET_FILENAME` environment variable in your application.

::: tip Prerequisites:

- Familiarity with the basic concepts of
  [Intel® SGX](intel-sgx-technology.md#intel-r-software-guard-extension-intel-r-sgx)
  and [SCONE](intel-sgx-technology.md#scone-framework) framework.
- [Build With a Scone TEE application](create-your-first-sgx-app.md)

:::

Trusted Execution Environments offer a huge advantage from a security
perspective. They guarantee that the behavior of execution does not change even
when launched on an untrusted remote machine. The data inside this type of
environment is also protected, which allows its monetization while preventing
leakage.

With iExec, it is possible to authorize only applications you trust to use your
datasets and get paid for it. Data is encrypted using standard encryption
mechanisms and the plain version never leaves your machine. The encrypted
version is made available for usage and the encryption key is pushed into the
[SMS](intel-sgx-technology.md#secret-management-service-sms). After you deploy
the dataset on iExec it is you, and only you, who decides which application is
allowed to get the secret to decrypt it.

::: warning

Datasets are only decrypted inside authorized
[enclaves](intel-sgx-technology.md#enclave) and never leave them. The same thing
applies to secrets.

:::

::: info

Your secrets are transferred with the SDK from your machine to the SMS over a
TLS channel.

:::

Let's see how to do all of that!

## Encrypt the dataset

Before starting, let's make sure we are inside the `~/iexec-projects` folder
previously created during the [quick start](../quick-start-for-developers.md)
tutorial.

```bash
cd ~/iexec-projects
mkdir tee-dataset-app && cd tee-dataset-app
iexec init --skip-wallet
```

Make sure your `chain.json` content is the same as the one described
[here](create-your-first-sgx-app.md#update-chain-json).

Init the dataset configuration.

```bash
iexec dataset init --encrypted
```

This command will create the `datasets/encrypted`, `datasets/original` and
`.secrets/datasets` folders. A new `dataset` section will be added to the
`iexec.json` file as well.

```bash
.
├── datasets
│   ├── encrypted
│   └── original
└── .secrets
    └── datasets
```

We will create a dummy file that has `"Hello, world!"` as content inside
`datasets/original`. Alternatively, you can put your own dataset file.

```bash
echo "Hello, confidential world!" > datasets/original/my-first-dataset.txt
```

```bash
datasets
├── encrypted
└── original
    └── my-first-dataset.txt
```

Now run the following command to encrypt the file:

```bash
iexec dataset encrypt
```

::: info

`iexec dataset encrypt` will output a checksum, keep this value for a later use.

:::

```bash
datasets
├── encrypted
│   └── my-first-dataset.txt.enc
└── original
    └── my-first-dataset.txt
```

As you can see, the command generated the file
`datasets/encrypted/my-first-dataset.txt.enc`. That file is the encrypted
version of your dataset, you should push it somewhere accessible because the
worker will download it during the execution process. You will enter this file's
URI in the `iexec.json`file (`multiaddr` attribute) when you will deploy your
dataset. Make sure that the URI is a **DIRECT** download link (not a link to a
web page for example).

::: info

You can use Github for example to publish the file but you should add **/raw/**
to the URI like this:
[https://github.com/&lt;username&gt;/&lt;repo&gt;/raw/master/my-first-dataset.txt.enc](https://github.com/<username>/<repo>/raw/master/my-first-dataset.txt.enc)

:::

The file `.secrets/datasets/my-first-dataset.txt.key` is the encryption key,
make sure to back it up securely. The file `.secrets/datasets/dataset.key` is
just an "alias" in the sense that it is the key of the last encrypted dataset.

```bash
.secrets
└── datasets
    ├── dataset.key
    └── my-first-dataset.txt.key
```

## Deploy the dataset

Fill in the fields of the `iexec.json` file. Choose a `name` for your dataset,
put the encrypted file's URI in `multiaddr` (the URI you got after publishing
the file) and fill the `checksum` field. The `checksum` of the dataset consists
of a `0x` prefix followed by the `sha256sum` of the dataset. This `checksum` is
printed when running the `iexec dataset encrypt` command. If you missed it, you
can retrieve the `sha256sum` of the dataset by running
`sha256sum datasets/encrypted/my-first-dataset.txt.enc`.

```bash
$ cat iexec.json
{
  "description": "My iExec ressource description...",

  ...

  "dataset": {
    "owner": "0x-your-wallet-address",
    "name": "Encrypted hello world dataset",
    "multiaddr": "/ipfs/QmW2WQi7j6c7UgJTarActp7tDNikE4B2qXtFCfLPdsgaTQ",
    "checksum": "<0x-sha256sum-of-the-dataset>" // starts with 0x
  }
}
```

To deploy your dataset run:

```bash
iexec dataset deploy
```

You will get a hexadecimal address for your deployed dataset. Use that address
to push the encryption key to the
[SMS](intel-sgx-technology.md#secret-management-service-sms) so it is available
for authorized applications.

For simplicity, we will use the dataset with a TEE-debug app on a debug
workerpool. The debug workerpool is connected to a debug Secret Management
Service so we will send the dataset encryption key to this SMS (this is fine for
debugging but do not use to store production secrets).

### Push the dataset secret to the SMS

```bash
iexec dataset push-secret
```

### Check secret availability on the SMS

```bash
iexec dataset check-secret
```

We saw in this section how to encrypt a dataset and deploy it on iExec. In
addition, we learned how to push the encryption secret to the
[SMS](intel-sgx-technology.md#secret-management-service-sms). Now we need to
build the application that is going to consume this dataset.

## Prepare your application

::: warning

For demo purposes, we omitted some development best practices in these examples.

Make sure to check your field's best practices before going to production.

:::

Let's create a directory tree for this app in `~/iexec-projects/`.

```bash
cd ~/iexec-projects/tee-dataset-app
mkdir src
touch Dockerfile
touch sconify.sh
chmod +x sconify.sh
```

In the folder `src/` create the file `app.js` or `app.py` then copy this code
inside:

The application reads the content of the dataset and writes it into the result's
folder:

::: code-group

```javascript [src/app.js]
const fsPromises = require('fs').promises;

(async () => {
  try {
    const iexecOut = process.env.IEXEC_OUT;
    const iexecIn = process.env.IEXEC_IN;
    const datasetFileName = process.env.IEXEC_DATASET_FILENAME;

    // Use some confidential assets
    let text = '';
    try {
      const confidentialFile = await fsPromises.readFile(
        `${iexecIn}/${datasetFileName}`
      );
      text = confidentialFile.toString();
    } catch (e) {
      console.log('confidential file does not exist');
    }
    // Append some results
    await fsPromises.writeFile(`${iexecOut}/result.txt`, text);
    console.log(text);
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
import json
import os

iexec_out = os.environ['IEXEC_OUT']
iexec_in = os.environ['IEXEC_IN']
dataset_filename = os.environ['IEXEC_DATASET_FILENAME']

text = ''

# Check the confidential file exists and open it
try:
    dataset_file = open(iexec_in + '/' + dataset_filename, 'r')
    dataset = dataset_file.read()
    text = dataset
except OSError:
    print('confidential file does not exists')
    exit(1)

print(text)

# Append some results in /iexec_out/
with open(iexec_out + '/result.txt', 'w+') as fout:
    fout.write(text)

# Declare everything is computed
with open(iexec_out + '/computed.json', 'w+') as f:
    json.dump({"deterministic-output-path": iexec_out + '/result.txt'}, f)
```

:::

## Build the TEE docker image

Create the `Dockerfile` as described in
[Build your first application](../your-first-app.md#dockerize-your-app).

Build the Docker image:

```bash
docker build . --tag <docker-hub-user>/hello-world-with-dataset:1.0.0
```

Follow the steps described in
[Build Scone app > Build the TEE docker image](create-your-first-sgx-app.md#build-the-tee-docker-image).

Update the `sconify.sh` script with the variables as follow:

```bash
# declare related variables
IMG_NAME=tee-scone-hello-world-with-dataset
IMG_FROM=<docker-hub-user>/hello-world-with-dataset:1.0.0
IMG_TO=<docker-hub-user>/${IMG_NAME}:1.0.0-debug
```

Run the `sconify.sh` script to build the Scone TEE application:

```bash
./sconify.sh
```

```bash
docker push <docker-hub-user>/tee-scone-hello-world-with-dataset:1.0.0-debug
```

## Test your app on iExec

At this stage, your application is ready to be tested on iExec.

### Deploy the TEE app on iExec

Deploy the application as described in
[Build Scone app](create-your-first-sgx-app.md#deploy-the-tee-app-on-iexec).

### Run the TEE app

Specify the tag `--tag tee,scone` and the dataset to use
`--dataset <datasetAddress>` in `iexec app run` command to run a tee app with a
dataset.

One last thing, in order to run a **TEE-debug** app you will also need to select
a debug workerpool, use the debug workerpool
`debug-v8-learn.main.pools.iexec.eth`.

You are now ready to run the app

```bash
iexec app run <appAddress> \
  --tag tee,scone \
  --dataset <datasetAddress> \
  --workerpool debug-v8-learn.main.pools.iexec.eth \
  --watch
```

## Next step?

Thanks to the explained confidential computing workflow, you now know how to use
an encrypted dataset in a Confidential Computing application.

To go further, check out how to:

- [Attach a secret to your app](app-developer-secret.md)
- [Access requester secrets](requester-secrets.md)
- [Protect the result](end-to-end-encryption.md)
