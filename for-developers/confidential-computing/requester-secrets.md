# Access requester secrets

In this tutorial, you will learn how to:

- leverage requester secrets by using the following environment variables in
  your code: `IEXEC_REQUESTER_SECRET_1`, `IEXEC_REQUESTER_SECRET_2`, `...`,
  `IEXEC_REQUESTER_SECRET_<N>`
- map your personal secrets to those environment variables when buying an
  execution on iExec network

::: warning

Before going any further, make sure you managed to
[Build your first application with Scone framework](create-your-first-sgx-app.md).

:::

::: tip Prerequisites:

- [Docker](https://docs.docker.com/install/) 17.05 or higher on the daemon and
  client.
- [iExec SDK](https://www.npmjs.com/package/iexec) 8.0.0 or higher.
  [Install the iExec SDK](../quick-start-for-developers.md#install-the-iexec-sdk)
- Familiarity with the basic concepts of [Intel® SGX](intel-sgx-technology.md)
  and [SCONE](https://scontain.com) framework.

:::

Trusted Execution Environments offer a huge advantage from a security
perspective. They guarantee that the behavior of execution does not change even
when launched on an untrusted remote machine. The data inside this type of
environment is also protected, which allows its monetization while preventing
leakage.

With iExec, it is possible to securely consume requester-provided secrets in the
application.

::: warning

The requester secrets are only exposed to authorized apps inside
[enclaves](intel-sgx-technology.md#enclave) and never leave them.

:::

::: info

Your secrets are transferred with the SDK from your machine to the SMS over a
TLS channel.

:::

Let's see how to do all of that!

## Prepare your application

::: warning

For demo purposes, we omitted some development best practices in these examples.

Make sure to check your field's best practices before going to production.

:::

Let's develop an application designed to evaluate the function:
$$f(x) = ax^3 + bx^2 + cx + d$$

where the coefficients a, b, c and d are kept confidential using an application
secret, and the input x is kept confidential using the requester's secret.

Let's create a directory tree for this app in `~/iexec-projects/`.

```bash
cd ~/iexec-projects
mkdir tee-requester-secrets-app && cd tee-requester-secrets-app
iexec init --skip-wallet
mkdir src
touch Dockerfile
touch sconify.sh
chmod +x sconify.sh
```

Make sure your [`chain.json`](create-your-first-sgx-app.md#update-chain-json)
content is correct.

The application uses the requester's secret to evaluate a secret function f(x),
keeping the input x also confidential, and writes the result in a file.

**Copy the following content** in `src/` .

::: code-group

```javascript [src/app.js]
const fsPromises = require('fs').promises;

(async () => {
  try {
    const iexecOut = process.env.IEXEC_OUT;
    // get the secret endpoint from app developer secret
    const app_secret = process.env.IEXEC_APP_DEVELOPER_SECRET;
    let a = 1,
      b = 1,
      c = 1,
      d = 1; // Default values
    const req_secret = process.env.IEXEC_REQUESTER_SECRET_1;
    let x = 1;

    if (!app_secret) {
      console.log('missing IEXEC_APP_DEVELOPER_SECRET');
    } else {
      // Split the secret into coefficients
      let coefficients = app_secret.split(';');
      if (coefficients.length !== 4) {
        console.log('problem with the length of IEXEC_APP_DEVELOPER_SECRET');
      } else {
        [a, b, c, d] = coefficients.map(parseFloat);
      }
    }

    if (!req_secret) {
      console.log('missing IEXEC_REQUESTER_SECRET_1');
    } else {
      x = parseFloat(req_secret);
    }

    // Function to compute f(x)
    function cubicPolynomial(x) {
      return a * Math.pow(x, 3) + b * Math.pow(x, 2) + c * x + d;
    }

    // Compute f(x)
    let result = cubicPolynomial(x);
    // Create result object
    const resultObj = {
      x: x,
      result: result,
    };

    // Convert result object to JSON string
    const resultJson = JSON.stringify(resultObj);
    // Write result to file
    await fsPromises.writeFile(`${iexecOut}/result.txt`, resultJson);

    // Declare everything is computed
    const computedJsonObj = {
      'deterministic-output-path': `${iexecOut}/result.txt`,
    };
    await fsPromises.writeFile(
      `${iexecOut}/computed.json`,
      JSON.stringify(computedJsonObj)
    );
  } catch (e) {
    // do not log anything that could reveal the app developer secret!
    console.log(e);
    process.exit(1);
  }
})();
```

```python [src/app.py]
import os
import json

# Retrieve the output directory path
iexec_out = os.environ.get("IEXEC_OUT")
print(iexec_out)

# Get the app secret containing coefficients
app_secret = os.environ.get("IEXEC_APP_DEVELOPER_SECRET")
a, b, c, d = 1, 1, 1, 1  # Default values
if not app_secret:
    print("Warning: Missing IEXEC_APP_DEVELOPER_SECRET. Using default coefficients.")
else:
    coefficients = app_secret.split(";")
    if len(coefficients) != 4:
        print("Warning: Problem with the length of IEXEC_APP_DEVELOPER_SECRET")
    else:
        a, b, c, d = map(float, coefficients)

# Get the input value from the requester secret
req_secret = os.environ.get("IEXEC_REQUESTER_SECRET_1")
x = 1  # Default value
if not req_secret:
    print("Warning: Missing IEXEC_REQUESTER_SECRET_1. Using default input value.")
else:
    try:
        x = float(req_secret)
    except ValueError as e:
        print("Invalid value for IEXEC_REQUESTER_SECRET_1:", e)
        exit(1)

# Function to compute f(x)
def cubic_polynomial(x):
    return a * x**3 + b * x**2 + c * x + d

# Compute f(x)
result = cubic_polynomial(x)
print("compute")

# Create result object
result_obj = {
    "x": x,
    "result": result
}

# Convert result object to JSON string
result_json = json.dumps(result_obj)

# Write result to file
with open(f"{iexec_out}/result.txt", "w+") as f:
    f.write(result_json)

# Declare computation complete
computed_json_obj = {
    "deterministic-output-path": f"{iexec_out}/result.txt",
}
with open(f"{iexec_out}/computed.json", "w+") as f:
    json.dump(computed_json_obj, f)
```

:::

## Build a Confidential Computing application

Create the `Dockerfile`

In this section, you will:

- Build the native image of the application as described in
  [Build your first application](../your-first-app.md#dockerize-your-app).
- Create and execute the `sconify.sh` script to build the **Scone TEE
  application** as we saw in
  [Build Scone app > Prepare your application](create-your-first-sgx-app.md#prepare-your-application).

The Dockerfile and the build scripts are similar to the ones we saw
[previously](create-your-first-sgx-app.md) for a trusted application:

Create the `Dockerfile`

**For a Javascript application:**

```bash
# Starting from a base image supported by SCONE
FROM node:22-alpine3.21

# install your dependencies
RUN mkdir /app && cd /app

COPY ./src /app

ENTRYPOINT [ "node", "/app/app.js"]
```

**For a Python application:**

```bash
FROM python:3.13.3-alpine3.21

### install python dependencies if you have some
COPY ./src /app
ENTRYPOINT ["python3", "/app/app.py"]
```

Build the docker image.

```bash
docker build . --tag <docker-hub-user>/secret-function:1.0.0
```

Follow the steps described in
[Build Scone app > Build the TEE docker image](create-your-first-sgx-app.md#build-the-tee-docker-image).

Update the `sconify.sh` script with the variables as follow:

```bash
# Declare image related variables
IMG_NAME=tee-scone-secret-function
IMG_FROM=<docker-hub-user>/secret-function:1.0.0
IMG_TO=<docker-hub-user>/${IMG_NAME}:1.0.0-debug
```

Run the `sconify.sh` script to build the Scone TEE application:

```bash
./sconify.sh
```

### Push the image on Docker Hub

```bash
docker push <docker-hub-user>/tee-scone-secret-function:1.0.0-debug
```

## Test your app on iExec

At this stage, your application is ready to be tested on iExec with the
following steps:

### Deploy the TEE app on iExec

[Deploy your application](create-your-first-sgx-app.md#deploy-the-tee-app-on-iexec)

For simplicity, we will use secrets in a TEE-debug app on a debug workerpool.
The debug workerpool is connected to a debug Secret Management Service so we
will send the requester secrets to this SMS (this is fine for debugging but do
not use to store production secrets).

In this example, the app developer's secret must be strictly defined in the
following format `a;b;c;d`. For example set your secret to `1;1;1;1` for
coeficients a,b,c,d. For details, go to
[Use app secret](app-developer-secret.md####Push-an-application-developer-secret-to-the-SMS)

```bash
iexec app  push-secret <appAddress>
iexec app  check-secret <appAddress>
```

### Push some requester secrets to the SMS

```bash
iexec requester push-secret x1 --secret-value 1
```

### Check secrets availability in the SMS

```bash
iexec requester check-secret x1
```

### Run the TEE app

You are now ready to run the app with requester secrets.

Specify the `--secret` and `--tag tee,scone` options in `iexec app run` command
to run a tee app with requester secrets on Scone

```bash
iexec app run <appAddress> \
  --tag tee,scone \
  --workerpool debug-v8-learn.main.pools.iexec.eth \
  --secret 1=x1 \
  --watch
```

::: info

The option `--secret <secretMapping...>` allows the requester to provision any
number of secrets with the mapping syntax `<key>=<name>`.

example:

```bash
--secret 1=foo 3=bar
```

- the secret named `foo` will be available in `IEXEC_REQUESTER_SECRET_1`
- the secret named `bar` will be available in `IEXEC_REQUESTER_SECRET_3`
- `IEXEC_REQUESTER_SECRET_2` will be skipped

:::

## Next step?

Thanks to the explained confidential computing workflow, you now know how to
consume requester secrets in a Confidential Computing application.

To go further, check out how to:

- [Attach a secret to your app](app-developer-secret.md)
- [Access a confidential dataset](sgx-encrypted-dataset.md)
- [Protect the result](end-to-end-encryption.md)
