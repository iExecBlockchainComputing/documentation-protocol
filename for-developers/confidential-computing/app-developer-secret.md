# Use a developer secret

In this tutorial, you will learn how to leverage an application developer secret
by using the `IEXEC_APP_DEVELOPER_SECRET` environment variable in your
application code.

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

With iExec, it is possible to securely associate an application developer secret
to the runtime of an application. This association is performed through the
usage of environment variables which cannot leak outside of the enclave memory.

::: warning

The app developer secret is only exposed to your app inside authorized
[enclaves](intel-sgx-technology.md) and never leaves them.

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
secret, and the input x is given as argument of the app.

Let's create a directory tree for this app in `~/iexec-projects/`.

```bash
cd ~/iexec-projects
mkdir tee-developer-secret-app && cd tee-developer-secret-app
iexec init --skip-wallet
mkdir src
touch Dockerfile
touch sconify.sh
chmod +x sconify.sh
```

Make sure your [`chain.json`](create-your-first-sgx-app.md#update-chain-json)
content is correct.

**Copy the following content** in `src/` .

::: code-group

```javascript [src/app.js]
const fsPromises = require('fs').promises;

(async () => {
  try {
    const iexecOut = process.env.IEXEC_OUT;
    // get the secret endpoint from app developer secret
    const secret = process.env.IEXEC_APP_DEVELOPER_SECRET;

    let a = 1,
      b = 1,
      c = 1,
      d = 1; // Default values
    if (!secret) {
      console.log('missing IEXEC_APP_DEVELOPER_SECRET');
    } else {
      // Split the secret into coefficients
      let coefficients = secret.split(';');
      if (coefficients.length !== 4) {
        console.log('problem length IEXEC_APP_DEVELOPER_SECRET');
      } else {
        [a, b, c, d] = coefficients.map(parseFloat);
      }
    }

    // Function to compute f(x)
    function cubicPolynomial(x) {
      return a * Math.pow(x, 3) + b * Math.pow(x, 2) + c * x + d;
    }

    // Get the value of x from command-line arguments
    let x;
    if (process.argv.length !== 3) {
      console.log(
        'Usage: exactly one argument required for this dapp: x ; to compute f(x)=a.x^3 + b.x^2 + c.x + d , x=1 by default'
      );
      x = 1;
    } else {
      x = parseFloat(process.argv[2]);
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
import sys
import json

try:
    iexec_out = os.environ["IEXEC_OUT"]

    # Get the secret endpoint from the app developer secret
    try:
        secret = os.environ["IEXEC_APP_DEVELOPER_SECRET"]
        # Split the secret into coefficients
        coefficients = secret.split(";")
        if len(coefficients) != 4:
            raise ValueError("Incorrect number of coefficients provided")
        a, b, c, d = map(float, coefficients)
    except KeyError:
        print("Missing IEXEC_APP_DEVELOPER_SECRET")
        exit(1)
    except ValueError as e:
        print("Invalid coefficients:", e)
        exit(1)

    # Function to compute f(x)
    def cubic_polynomial(x):
        return a * x**3 + b * x**2 + c * x + d

    # Get the x value from command-line arguments
    if len(sys.argv) != 2:
        result="Usage: exactly one argument required for this dapp: x ; to compute f(x)=a.x^3 + b.x^2 + c.x + d , x=1 by default"
        print(result)
        _x=1
    else:
        _x=sys.argv[1]

    x = float(_x)

    # Compute f(x)
    result = cubic_polynomial(x)

    # Write the result to a JSON file
    with open(iexec_out + "/result.json", "w+") as f:
        json.dump({"x= ": x, ";f(x)=": result}, f)
    f.close()
    # Declare computation complete
    with open(iexec_out + "/computed.json", "w+") as f:
        json.dump({"deterministic-output-path": iexec_out + "/result.json"}, f)
    f.close()

except Exception as e:
    print("Something went wrong:", e)
    exit(1)
```

:::

::: info

As seen above, a single slot is dedicated to store the application developer
secret. If you want to use multiple secrets, feel free to pack your secrets into
a single one and unpack them when reading the `IEXEC_APP_DEVELOPER_SECRET`
environment variable from the application code.

:::

## Build a Confidential Computing application

### Build the docker image

In this section, you will:

- Build the native image of the application as described in
  [Build your first application](../your-first-app.md#dockerize-your-app).
- Create and execute the `sconify.sh` script to build the **Scone TEE
  application** as we saw in
  [Build Scone app > Prepare your application](create-your-first-sgx-app.md#prepare-your-application).

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
FROM python:3.7.3-alpine3.10
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

### Push an application developer secret to the SMS

```bash
iexec app push-secret
```

In this example, the app developer's secret must be strictly defined in the
following format `a;b;c;d`.

For example set your secret to `1;1;1;1` for coeficients a,b,c,d.

::: warning

For Secret Management Service security reasons, the app secret cannot be
updated. Use with caution.

:::

### Check the secret exists in the SMS

```bash
iexec app check-secret
```

### Run the TEE app

[Run your application](create-your-first-sgx-app.md#run-the-tee-app)

## Next step?

Thanks to the explained confidential computing workflow, you now know how to use
an app developer secret in a Confidential Computing application.

To go further, check out how to:

- [Access requester secrets](requester-secrets.md)
- [Access a confidential dataset](sgx-encrypted-dataset.md)
- [Protect the result](end-to-end-encryption.md)
