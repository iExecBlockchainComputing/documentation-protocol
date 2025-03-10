# Choose your TEE framework

::: warning

Before going any further, make sure you managed to
[Build your first application](../your-first-app.md).

:::

After understanding the fundamentals of Confidential Computing and explaining
the technologies behind it, it is time to roll up our sleeves and get hands-on
with [enclaves](intel-sgx-technology.md#enclave). In this guide, we will focus
on protecting an application - that is already compatible with the iExec
platform - using SGX, and without changing the source code. That means we will
use the same code we [previously](../your-first-app.md#build-your-app) deployed
for a basic iExec application.

Two TEE frameworks are supported on the iExec platform:

- Scone
- Gramine

::: warning

Today, it is not possible to build a TEE application for a SGX enclave from a
laptop based on an ARM architecture like the latest **MacBook Pro** devices.
Before going further, please ensure you are working on a `x86_64` compatible
device like a laptop, a server or a virtual machine properly configured with
previously mentioned required tools.

It is strongly recommended to work with an **Ubuntu 20.04 LTS** installation due
to limitations on supported C libraries in Scone and Gramine frameworks.

:::

## Scone

At a high-level, Scone protects the confidentiality and integrity of the data
and the code without needing to modify or recompile the application. With native
Intel® SGX technology, the OS is not a part of the Trusted Computing Base (TCB)
hence system calls and kernel services are not available from an Intel® SGX
enclave. This can be limiting as the application will not be able to use File
System and sockets directly from the code running inside the enclave. The
[Scone](https://scontain.com/) framework resolves this and reduces the burden of
porting the application to Intel® SGX.

More precisely, Scone provides a C standard library interface to container
processes. System calls are executed outside of the enclave, but they are
shielded by transparently encrypting/decrypting application data. Files stored
outside of the enclave are therefore encrypted, and network communication is
protected by Transport Layer Security (TLS).

For a deeper understanding, you can have a look to the official
[Scone documentation](https://sconedocs.github.io/).

## Gramine

Gramine is able to run unmodified applications inside SGX enclaves, without the
toll of manually porting the application to the SGX environment.

For a deeper understanding, you can have a look to the official
[Gramine documentation](https://gramine.readthedocs.io/).

## Let's build

::: warning

Following steps will show you how to build a Confidential Computing application.
The environment you are about to use is a "develop" environment:

- which can be reset at any time
- where configurations and secrets might be inspected (debug enclaves)

When your developer discovery journey is complete, please reach the
[production section](../go-to-production.md).

:::

<table data-view="cards">
   <thead>
      <tr>
         <th></th>
         <th data-hidden data-card-target data-type="content-ref"></th>
         <th data-hidden data-card-cover data-type="files"></th>
      </tr>
   </thead>
   <tbody>
      <tr>
         <td>Build Scone app</td>
         <td><a href="create-your-first-sgx-app.md">create-your-first-sgx-app.md</a></td>
         <td><a href="../../../assets/tee-scone-logo.png">SCONE-logo.png</a></td>
      </tr>
      <tr>
         <td>Build Gramine app</td>
         <td><a href="create-your-first-gramine-app.md">create-your-first-gramine-app.md</a></td>
         <td><a href="../../../assets/tee-gramine-logo.png">gramine.png</a></td>
      </tr>
   </tbody>
</table>
