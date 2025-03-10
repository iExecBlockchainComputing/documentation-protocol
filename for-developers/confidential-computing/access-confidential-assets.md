# Access confidential assets from your app

::: warning

Before going any further, make sure you managed to
[Build your first application with Scone framework](create-your-first-sgx-app.md).

:::

## Secret Management Service (SMS)

You can use confidential assets on iExec thanks to the _iExec Secret Management
Service_. This service verifies that the enclave asking for secrets is
authorized to do so. Any user - as a confidential asset provider - declares on
the blockchain which enclaves are authorized to access it. For each task, the
SMS will query the blockchain to determine if the enclave requesting secrets is
indeed whitelisted for it.

The SMS currently supports 3 types of secrets:

1. [Application developer secret](app-developer-secret.md): This secret is
   directly accessible from the application as an environment variable. It is
   owned by the developer of the application. It can be any kind of data (API
   key, private key, token, ..) as long as it respects the size limit (max. 4096
   kB).
2. [Requester secrets](requester-secrets.md): These secrets are directly
   accessible from the application as environment variables, as long as the
   requester has decided to share them with it. These secrets can be any kind of
   data as long as they respect the size limit (max. 4096 kB). Before buying a
   task, a requester secret is pushed into the SMS and is not linked to any
   application. When a requester buys a task, the requester can declare which
   secrets can be accessed by the application. Doing so, a single requester
   secret can be shared with multiple applications.
3. [Dataset secret](sgx-encrypted-dataset.md): A dataset secret is not directly
   accessible from the application but its decrypted content is. If a dataset is
   requested and authorized to be used in it, its content will be automatically
   decrypted in the application enclave. To monetize such a dataset on iExec,
   the original dataset must be encrypted using the iExec SDK, its encrypted
   counterpart must be publicly available and its encryption key pushed into the
   SMS.

Here is a general overview of how confidential assets are used on iExec:

```mermaid
graph TD
    Req[Requester] -->|1.a. Push secret| SMS[SMS]
    AppDev[Application developer] -->|1.b. Push secret| SMS
    DatasetOwn[Dataset owner] -->|1.c. Push secret| SMS
    Req --> |2 . Buy task| Chain
    Chain[Blockchain] --> |3 . Notify task to compute| Worker[Worker/Workerpool]
    Worker --> |4 . Launch TEE application| App[TEE application]
    App --> |5.a. Get secrets for task| SMS
    SMS --> |5.b. Check authorization for secrets| Chain
```

## Next step?

You now understand how these three kinds of confidential assets work on iExec,
you can go one step further by learning how to manipulate them:

- [Attach a secret to your app](app-developer-secret.md)
- [Access requester secrets](requester-secrets.md)
- [Access a confidential dataset](sgx-encrypted-dataset.md)
