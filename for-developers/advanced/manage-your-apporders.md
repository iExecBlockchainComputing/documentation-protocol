# Manage your apporders

Orders enable setting custom governance for resources.

Here you will learn how to manage your application's monetization rules.

## Publish a custom apporder

Initialize an `apporder`:

```bash
iexec order init --app
```

Edit the `apporder` part in `iexec.json` to set the conditions to use your app:

| key                  | description                                                                         |
| -------------------- | ----------------------------------------------------------------------------------- |
| `app`                | app address                                                                         |
| `appprice`           | price to charge the requester for each execution of the app (in nRLC)               |
| `volume`             | number of authorized uses, each use decreases this number                           |
| `tag`                | restrict usage to a specific runtime such as **Scone** or **Gramine** TEE framework |
| `datasetrestrict`    | restrict to use the app with a specific dataset (1)                                 |
| `workerpoolrestrict` | restrict to run the app on a specific workerpool (1)                                |
| `requesterrestrict`  | restrict the app usage to a specific requester (1)                                  |

1. the restriction is disabled by default with
   0x0000000000000000000000000000000000000000

The supported tags for application orders are:

| Tag value                                                            | Description                                                  |
| -------------------------------------------------------------------- | ------------------------------------------------------------ |
| `0x0000000000000000000000000000000000000000000000000000000000000000` | Standard task                                                |
| `0x0000000000000000000000000000000000000000000000000000000000000003` | TEE task with Scone framework                                |
| `0x0000000000000000000000000000000000000000000000000000000000000005` | TEE task with Gramine framework (reserved value, do not use) |

::: warning

TEE tasks with Gramine TEE framework are not supported yet. Do not publish
orders with both `tee` and `gramine` tag bits enabled.

:::

As soon as your `apporder` complies to your requirements, you must sign it and
you may publish it.

```bash
iexec order sign --app && iexec order publish --app
```

## Remove an order from iExec Marketplace

List the published orders for your app.

```bash
iexec orderbook app <your app address>
```

Copy the `orderHash` of the order you want to remove

Unpublish the `apporder` from the iExec Marketplace

```bash
iexec order unpublish --app <orderHash>
```

An unpublished order is still valid on the blockchain, to invalidate it use the
cancel command.

```bash
iexec order cancel --app <orderHash>
```
