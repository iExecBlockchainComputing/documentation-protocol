# Application I/O

Following page describes for an iExec application:

- [Application Inputs](#application-inputs)
- [Runtime variables](#runtime-variables)
- [Application outputs](#application-outputs)

Mastering all sections in detail is not required, only pick what you need for
your particular use-case.

## Application Inputs

The different kinds of input are listed below:

| name                                          | type    | confidentiality | provider                   |
| --------------------------------------------- | ------- | --------------- | -------------------------- |
| [args](#args)                                 | string  | public          | requester                  |
| [input files](#input-files)                   | files   | public          | requester                  |
| [requester secrets](#requester-secrets)       | strings | secret\*        | requester                  |
| [dataset](#dataset)                           | file    | secret\*        | requester/<br/>third-party |
| [app developer secret](#app-developer-secret) | string  | secret\*        | app developer              |

\* secret inputs are only available in Confidential Computing tasks.

### Args

The requester uses **args** to pass non-sensitive arguments to the app.

#### Provisioning args

**args** are defined by the requester via `requestorder` `params.iexec_args`.

::: code-group

```json [requestorder]
{
  ...
  "params": {
    ...
    "iexec_args": "do something"
    ...
  }
  ...
}
```

:::

#### Consuming args

**args** are forwarded as they are, straight to the application.

### Input files

The requester uses **input files** to pass non-sensitive files to process.

#### Provisioning input files

**input files** are defined by the requester via a list of download URLs in
`requestorder` `params.iexec_input_files`.

::: code-group

```json [requestorder]
{
  ...
  "params": {
    ...
    "iexec_input_files": [
      "https://example.com/file.txt",
      "https://example.com/image.jpeg"
      ]
    ...
  }
  ...
}
```

:::

#### Consuming input files

Each **input file** is downloaded in the `IEXEC_IN` directory and gets its name
exposed to the application via `IEXEC_INPUT_FILE_NAME_x` (where `x` is the index
of the file starting with `1`).

Input files count is exposed via `IEXEC_INPUT_FILES_NUMBER`.

### Requester secrets

The requester uses **requester secrets** to securely pass secrets to the
application.

#### Provisioning requester secrets

The requester pushes named secrets to the SMS.

The requester defines a mapping of secret names onto secret numbers via
`requestorder` `params.iexec_secrets` (secrets numbers must be strictly
positive).

::: code-group

```json [requestorder]
{
  ...
  "params": {
    ...
    "iexec_secrets": {
      "1": "my-login",
      "2": "my-password"
    }
    ...
  }
  ...
}
```

:::

#### Consuming requester secrets

Each **requester secret** is exposed to the application in
`IEXEC_REQUESTER_SECRET_x` where `x` is the secret number set by the requester.

### Dataset

The requester uses a **dataset** to use third-party confidential data in the
application.

#### Provisioning a dataset

The dataset provider creates a **dataset** and defines the governance in
`datasetorder`s.

The requester specifies the **dataset** to use via `requestorder` `dataset`.

`requestorder` :

```json
{
  ...
  "dataset": "0x915F00E3A45e7A78aa21401D0398109f795D8bcA",
  "datasetmaxprice": "0"
  ...
}
```

#### Consuming a dataset

The **dataset** file is downloaded and decrypted on the fly in the `IEXEC_IN`
directory. It gets its name exposed to the application via
`IEXEC_DATASET_FILENAME`.

The **dataset** address is also exposed via `IEXEC_DATASET_ADDRESS`.

### App developer secret

The developer uses an **app developer secret** to inject an immutable secret
into the application.

#### Provisioning an app developer secret

The app developer pushes an **app developer secret** to the Secret Management
Service.

Once pushed, an **app developer secret** cannot be modified.

#### Consuming an app developer secret

The **app developer secret** is exposed to the application in
`IEXEC_APP_DEVELOPER_SECRET`

## Runtime variables

Runtime variables are environment variables set by the iExec protocol and
available for your application.

### Input variables

| Name                       | Type            | Content                                                   |
| -------------------------- | --------------- | --------------------------------------------------------- |
| IEXEC_IN                   | path            | Absolute path of iexec input folder                       |
| IEXEC_INPUT_FILES_NUMBER   | int &gt;= 0     | Total number of input files                               |
| IEXEC_INPUT_FILE_NAME_x    | string or unset | Name of the input file indexed by x (`x` starts with `1`) |
| IEXEC_REQUESTER_SECRET_x   | string or unset | requester secret number x (`x` starts with `1`)           |
| IEXEC_DATASET_FILENAME     | string or unset | Name of the dataset file                                  |
| IEXEC_DATASET_ADDRESS      | address         | ethereum address of the dataset used (or address zero)    |
| IEXEC_APP_DEVELOPER_SECRET | string or unset | app developer secret                                      |

### Other variables

| Name                  | Type        | Content                                                            |
| --------------------- | ----------- | ------------------------------------------------------------------ |
| IEXEC_OUT             | path        | Absolute path of iexec output folder                               |
| IEXEC_TASK_ID         | bytes32     | taskid of the running task                                         |
| IEXEC_BOT_TASK_INDEX  | int &gt;= 0 | Index of the current task in the Bag of Tasks\*                    |
| IEXEC_BOT_FIRST_INDEX | int &gt;= 0 | Index of the first task in the current Deal (Bag of task\* subset) |
| IEXEC_BOT_SIZE        | int &gt;= 1 | Total number of parallelized tasks in a Bag of Tasks\*             |

\* The requester may request multiple tasks in a single requestorder (Bag of
Tasks), a unique index is given to each task of the bag.

## Application outputs

An iExec application produces a result archive (`zip` file) for the requester
with the following tree:

```text
result.zip
  ├── stdout.txt
  ├── stderr.txt
  ├── computed.json
  └── ...
```

- The iExec worker automatically creates `stdout.txt` and `stderr.txt`
  containing the logs of your application.
- Your application **must** create the `computed.json` file in `IEXEC_OUT` when
  the computing is over.
- Any file placed in `IEXEC_OUT` will also be added to the result archive.

::: warning

Your application must always create a `computed.json` file in the iExec output
directory as a proof of execution.

It contains at least a field `deterministic-output-path` which is the path of
the deterministic portion of your results (file or a non-empty folder) and is
required for the proof of execution (this file should always be the same when
same inputs are given).

`computed.json` could look like
`{ "deterministic-output-path" : "/iexec_out/result.txt" }`.

The `computed.json` file is compared across replicated tasks in the
[Proof of Contribution protocol](../key-concepts/proof-of-contribution.md) to
achieve a consensus on workers.

:::

::: warning

iExec platform currently only supports result files whose name doesn't exceed 31
characters. Please ensure your file names respect this limit. Otherwise, the app
execution on iExec will fail.

:::
