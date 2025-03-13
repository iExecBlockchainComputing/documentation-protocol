# Protect the result

In previous tutorials, we saw how to build
[Confidential Computing applications](intel-sgx-technology.md) that run securely
inside enclaves and combine them with confidential assets to get the most out of
confidential computing advantages. In this chapter, we will push things further
to protect the workflow in an end to end mode. That means the next step would be
encrypting results.

::: warning

Before going any further, make sure you managed to
[Build your first application with Scone framework](create-your-first-sgx-app.md).

:::

::: tip Prerequisites:

- [Docker](https://docs.docker.com/install/) 17.05 or higher on the daemon and
  client.
- [iExec SDK](https://www.npmjs.com/package/iexec) 8.0.0 or higher.
  [Install the iExec SDK](../quick-start-for-developers.md#install-the-iexec-sdk)
- Familiarity with the basic concepts of
  [Intel® SGX](intel-sgx-technology.md)
  and [SCONE](https://scontain.com) framework.

:::

::: info

You don't need to change your application's code or redeploy it to add this
feature.

:::

Assuming your application is deployed (if not please check how to do it
[with Scone](create-your-first-sgx-app.md#deploy-the-tee-app-on-iexec)), before
triggering an execution you need to generate an RSA key-pair, then push the
public key to the
[Secret Management Service](intel-sgx-technology.md).
The latter, in turn, will provide it, at runtime, to the enclave running your
Confidential Computing application.

To generate the key-pair, go to `~/iexec-projects` and use the following SDK
command:

Make sure your [`chain.json`](create-your-first-sgx-app.md#update-chain-json)
content is correct.

```bash
iexec result generate-encryption-keypair
```

This generates two files in `.secrets/beneficiary/`. Make sure to back up the
private key in the file `<0x-your-wallet-address>_key`.

```bash
.secrets
├── beneficiary
│   ├── <0x-you-wallet-address>_key
│   └── <0x-you-wallet-address>_key.pub
...
```

Now, push the public key to the SMS:

```bash
iexec result push-encryption-key --tee-framework scone
```

And check it using:

```bash
iexec result check-encryption-key --tee-framework scone
```

Now to see that in action, you'd need to trigger a task and specify yourself as
the beneficiary in the command:

```bash
iexec app run <0x-your-app-address> \
    --workerpool debug-v8-learn.main.pools.iexec.eth \
    --tag tee,scone \
    --encrypt-result \
    --watch
```

Wait for the task to be `COMPLETED` and download the result:

```bash
iexec task show <0x-your-task-id> --download
```

If you extract the obtained zip and try to read the content of the file
`iexec_out/result.zip.aes` you will find it encrypted:

```bash
mkdir /tmp/trash && \
    unzip <0x-your-task-id>.zip -d /tmp/trash && \
    cat /tmp/trash/iexec_out/result.zip.aes
```

`iexec_out/result.zip` :

```bash
)3�Xq��Yv��ȿzE�fRu<\�ݵm�m���疞r���c��(a���{{'��ܼ���͛�q/[{����H�t>��������h��gD$g��\.�k��j�����"�s?"�h�J�_Q41�_[{��X��������Ԛ��a�蘟v���E����r����肽
�����Յ]9W�TL�*���
          �t��d���z��O`����!���e�&snoL3�K6L9���%
```

Now you should decrypt the result by running:

```bash
iexec result decrypt <0x-your-task-id.zip>
```

A new zip file appears in the current folder under the name `results.zip`.
Eventually, unzip it:

```bash
unzip results.zip -d my-decrypted-result
```

And you can see the content of your result file:

```bash
$ cat my-decrypted-result/result.txt
Hello, world!
```

Voilà! By finishing this part, you should be able to use confidential computing
on iExec like a Ninja. All parts of the workflow are protected: the execution,
the dataset, and the result.

You can go to the advanced section and learn more about managing orders on the
iExec to effectively monetize your applications and datasets.
