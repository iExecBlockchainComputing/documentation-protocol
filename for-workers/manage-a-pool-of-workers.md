---
description: >-
  A workerpool manager is an essential actor in the iExec network. It will be in
  charge of proposing available computing resources (workers) to task
  requesters.
---

# Manage a workerpool

> A workerpool manager is an essential actor in the iExec network. It will be in
> charge of proposing available computing resources (workers) to task
> requesters.

An iExec workerpool is orchestrated by an _iExec Core Scheduler_. The _iExec
Core Scheduler_ watches on-chain deals and schedules off-chain computation among
available workers.

## Deploy a workerpool

You can deploy your own workerpool on iExec with
[this repository](https://github.com/iExecBlockchainComputing/deploy-workerpool).
Be sure to check a particular
[release](https://github.com/iExecBlockchainComputing/deploy-workerpool/releases)
before starting your deployment.

## Manage your workerpoolorders

Orders enable setting custom governance for resources.

Here you will learn how to manage your workerpool's monetization rules.

### Publish a workerpool order

Initialize a `workerpoolorder`:

```bash
iexec order init --workerpool
```

Edit the `workerpoolorder` part in `iexec.json` to set the conditions to use
your workerpool:

| key                 | description                                                                          |
| ------------------- | ------------------------------------------------------------------------------------ |
| `workerpool`        | workerpool address                                                                   |
| `workerpoolprice`   | price to charge the requester for each execution of the app (in nRLC)                |
| `volume`            | number of authorized uses, each use decreases this number                            |
| `tag`               | restrict usage to a specific runtime such as **Scone** or **Gramine** TEE frameworks |
| `category`          | Order category, will define the deal `workClockTimeRef` and its deadlines            |
| `trust`             | Trust level of the execution, impacts the number of replicates                       |
| `apprestrict`       | restrict the workerpool usage to a specifig app (1)                                  |
| `datasetrestrict`   | restrict the workerpool usage to a specific dataset (1)                              |
| `requesterrestrict` | restrict the workerpool usage to a specific requester (1)                            |

1. the restriction is disabled by default with
   0x0000000000000000000000000000000000000000.

The supported tags for workerpool orders are:

| Tag value                                                            | Description                                                                               |
| -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `0x0000000000000000000000000000000000000000000000000000000000000000` | Order for the execution of a standard task                                                |
| `0x0000000000000000000000000000000000000000000000000000000000000003` | Order for the execution of a TEE task with Scone framework                                |
| `0x0000000000000000000000000000000000000000000000000000000000000005` | Order for the execution of a TEE task with Gramine framework (reserved value, do not use) |

::: warning

1. Do not publish workerpool orders with a tag value out of the specified list.
   Such an order could produce undesirable and unpredictable behaviors. The
   [iExec SDK](../for-developers/toolbox/iexec-sdk.md) implements all required
   preflight checks to avoid erroneous orders publishing.
2. Currently, TEE workflow do not support tasks replication on several workers.
   TEE workerpool orders must be published with `trust` value equal to `1`.
3. TEE tasks with Gramine TEE framework are not supported yet. Do not publish
   orders with both `tee` and `gramine` tag bits enabled.

:::

As soon as your `ẁorkerpoolorder` complies to your requirements, you must sign
it and you may publish it.

```bash
iexec order sign --workerpool && iexec order publish --workerpool
```

## Remove an order from iExec Marketplace

List the published orders for your workerpool.

```bash
iexec orderbook workerpool <your workerpool address>
```

Copy the `orderHash` of the order you want to remove

Unpublish the `workerpoolorder` from the iExec Marketplace

```bash
iexec order unpublish --workerpool <orderHash>
```

An unpublished order is still valid on the blockchain, to invalidate it use the
cancel command.

```bash
iexec order cancel --workerpool <orderHash>
```
