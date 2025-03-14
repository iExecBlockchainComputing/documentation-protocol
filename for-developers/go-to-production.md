# Go to production

## Connect to the production environment

To connect to the production environment, make sure your `chain.json` content is
as follows:

```json
{
  "default": "bellecour",
  "chains": {
    "bellecour": {}
  }
}
```

Do not forget to target a production workerpool when running a production
application:

```bash
iexec app run <0x-your-app-address> \
    --workerpool prod-v8-bellecour.main.pools.iexec.eth \
    [...]
```

## Standard application

If you are developing a standard application, then you are already set.

## Confidential Computing application

::: warning

The following applies only to the Scone framework.

:::

If you are developing a Confidential Computing application, be aware of
following information.

### Sign your application

Any Confidential Computing application built previously on the
[develop environment](confidential-computing/intel-sgx-technology.md) runs in a
debug enclave, which, as warned, might be inspected.

To run your application in a production enclave, the application needs to be
signed with a key compatible with the Intel® Attestation Service (IAS). Create
this key in your
[Intel developer Portal](https://api.portal.trustedservices.intel.com/).

When the key is created (`my-signer-key.pem`), update the previous
[sconify.sh](confidential-computing/create-your-first-sgx-app.md#build-the-tee-docker-image)
script by :

- sharing the folder containing the `my-signer-key.pem`, here `/signer`
- adding the `--scone-signer` option

```bash
docker run -it \
            -v /signer:/signer \
            [...]
            registry.scontain.com/scone-production/iexec-sconify-image:<version> \
            sconify_iexec \
            --scone-signer=/signer/my-signer-key.pem \
            [...]
```

### Impacts of the SMS in enclave

As you have already learned in previous
[confidential assets](confidential-computing/access-confidential-assets.md)
section, the iExec SMS is a crucial component for TEE tasks on iExec, being in
charge of:

- storing all secrets of iExec users (application developer, requester, dataset
  owner)
- defining - by following on-chain governance - which secrets are accessible to
  a specific enclave.

To reach a higher level of security on the production environment, the iExec SMS
runs inside an enclave.

Below is a graph showing how the secrets and session mechanism works:

```mermaid
graph TD
    S[Secret owner] -->|1 . Push secret| SMS
    Req[Requester] --> |2 . Buy task| Chain
    Chain[Blockchain] --> |3 . Notify task to compute| Worker[Worker/Workerpool]
    Worker --> |4 . Request:<br> Create session of secrets for task| SMS
    SMS --> |5 . Check authorization <br>for secrets| Chain
    SMS --> |6.a. Get encrypted secrets| SMSDB
    SMS --> |6.b. Get SMS database decryption key| CAS
    SMS --> |7 . Push session of secrets <br>which will be only <br> accessible to <br>the Application| CAS
    SMS --> |8 . Response: <br>session ID| Worker
    Worker --> |9 . Launch application with session ID| App[Application]
    App --> |10 . Get all secrets for this session ID over RA-TLS channel| CAS
    SMS --- SMSCPU
    App --- AppCPU(Intel SGX CPU)
    CAS --- CASDB
    CASDB --- |Encryption is performed using a private Seal Key that <br>is unique to that particular platform/hardware| CASCPU

    subgraph SECU[<b>Security Services</b>]
        SMS[Scone SMS]
        SMSDB[(Encrypted <br>SMS<br> database)]
        SMSCPU(Intel SGX <br>CPU)
        CAS[CAS: Configuration and Attestation Service]
        CASDB[(CAS Database)]
        CASCPU(Specific Intel SGX CPU)
    end

    subgraph Legend
        IN[Enclave protection]
        Out[No enclave protection]
    end

    style Legend fill:#e1effc
    classDef enclaveStyle fill:green,color:white
    class SMS,SMSCPU,SMSDB,CAS,CASDB,CASCPU,App,AppCPU,IN enclaveStyle
```

As seen in this diagram, required secrets are transferred to an authorized
Application enclave over an RA-TLS channel
([Remote Attestation](https://www.intel.com/content/www/us/en/developer/tools/software-guard-extensions/attestation-services.html)).

Inside **Security Services** (yellow area in above diagram), all secrets are
protected by an SMS database encryption key, itself backed by the CAS. The SMS
enclave needs to prove its authenticity and integrity to the CAS in order to get
access to its database encryption key.

To reach a higher level of security, the CAS enclave, which is the only
component aware of the SMS database encryption key, is itself
[sealed](https://www.intel.com/content/www/us/en/developer/articles/technical/introduction-to-intel-sgx-sealing.html)
to a specific platform enclave.

With that pattern, no one, even an administrator or someone with root
privileges, can inspect confidential assets of users.

#### Backup your secrets

::: warning

Always keep a local copy of your secrets. For security reasons, it is not
possible to extract your secret from the SMS. In other words, the SMS only
allows you to share secrets securely in order to process confidential computing
tasks.

:::
