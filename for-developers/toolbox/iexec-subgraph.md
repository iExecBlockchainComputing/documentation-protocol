# iExec subgraph

Reading and aggregating complex data from blockchains can be slow and tedious,
that's why developers build systems to index onchain data and redistribute it as
web API.

The iExec's protocol is indexed by [The Graph](https://thegraph.com) and can be
explored with a [GraphQL](https://graphql.org/) API.

The [iExec Explorer](./iexec-explorer.md) is an example of an application built
with the iExec subgraph.

## GraphQL API

The subgraph can be queried through the
[Graph*i*QL interface](https://thegraph.bellecour.iex.ec/subgraphs/name/bellecour/poco-v5/graphql)

The GraphQL API is publicly available:

- for queries:
  `https://thegraph.bellecour.iex.ec/subgraphs/name/bellecour/poco-v5`
- for subscriptions:
  `wss://ws-thegraph.bellecour.iex.ec/subgraphs/name/bellecour/poco-v5`

::: warning

This subgraph is hosted by iExec and shared across all developers.

Keep in mind that you must use efficient calls and caching policy when querying
this subgraph to avoid being rate limited.

:::

## Examples queries

### Protocol metrics

```graphql
{
  protocol(id: "iExec") {
    appsCount
    datasetsCount
    workerpoolsCount
    dealsCount
    tasksCount
    completedTasksCount
    claimedTasksCount
  }
}
```

[Try this query](https://thegraph.bellecour.iex.ec/subgraphs/name/bellecour/poco-v5/graphql?query=%7B%0A++protocol%28id%3A+%22iExec%22%29+%7B%0A++++appsCount%0A++++datasetsCount%0A++++workerpoolsCount%0A++++dealsCount%0A++++tasksCount%0A++++completedTasksCount%0A++++claimedTasksCount%0A++%7D%0A%7D)

### Application latest usages

```graphql
query appUsages($appAddress: String!) {
  app(id: $appAddress) {
    usages(orderBy: timestamp, orderDirection: desc) {
      dealid: id
      timestamp
      tasks {
        taskid: id
        status
      }
    }
  }
}
```

[Try this query](https://thegraph.bellecour.iex.ec/subgraphs/name/bellecour/poco-v5/graphql?query=query+appUsages%28%24appAddress%3A+String%21%29+%7B%0A++app%28id%3A+%24appAddress%29+%7B%0A++++usages%28orderBy%3A+timestamp%2C+orderDirection%3A+desc%29+%7B%0A++++++dealid%3A+id%0A++++++timestamp%0A++++++tasks+%7B%0A++++++++taskid%3A+id%0A++++++++status%0A++++++%7D%0A++++%7D%0A++%7D%0A%7D&variables=%22%7B%5Cn++%5C%22appAddress%5C%22%3A+%5C%220x18de0518fea922d376596b1ad2a1f62f3981be35%5C%22%5Cn%7D%22&operationName=appUsages)

#### Worker rewards an seizes

```graphql
query workerRewardsAndSeizes($worker: String!) {
  rewards(
    where: { account: $worker }
    orderBy: timestamp
    orderDirection: desc
  ) {
    value
    timestamp
    task {
      taskid: id
    }
    transaction {
      txHash: id
    }
  }
  seizes(
    where: { account: $worker }
    orderBy: timestamp
    orderDirection: desc
  ) {
    value
    timestamp
    task {
      taskid: id
    }
    transaction {
      txHash: id
    }
  }
}
```

[Try this query](https://thegraph.bellecour.iex.ec/subgraphs/name/bellecour/poco-v5/graphql?query=query+workerRewardsAndSeizes%28%24worker%3A+String%21%29+%7B%0A++rewards%28%0A++++where%3A+%7B+account%3A+%24worker+%7D%0A++++orderBy%3A+timestamp%0A++++orderDirection%3A+desc%0A++%29+%7B%0A++++value%0A++++timestamp%0A++++task+%7B%0A++++++taskid%3A+id%0A++++%7D%0A++++transaction+%7B%0A++++++txHash%3A+id%0A++++%7D%0A++%7D%0A++seizes%28%0A++++where%3A+%7B+account%3A+%24worker+%7D%0A++++orderBy%3A+timestamp%0A++++orderDirection%3A+desc%0A++%29+%7B%0A++++value%0A++++timestamp%0A++++task+%7B%0A++++++taskid%3A+id%0A++++%7D%0A++++transaction+%7B%0A++++++txHash%3A+id%0A++++%7D%0A++%7D%0A%7D&variables=%22%7B%5Cn++%5C%22worker%5C%22%3A+%5C%220xcdad8338eec22e909015ca7ea92dc544336f2007%5C%22%5Cn%7D%22&operationName=workerRewardsAndSeizes)

## FAQ

Here are some frequently asked questions about iExec's subgraph.

You may also find useful information on these resources:

- [GraphQL documentation](https://graphql.org/learn/)
- [The Graph documentation](https://thegraph.com/docs/)

### How to find an item by its ethereum address?

Although an ethereum address has multiple valid formats, The Graph requires
lowercase addresses.

- :heavy_check_mark: lowercase `0xf048ef3d7e3b33a465e0599e641bb29421f7df92`
- :x: checksum `0xF048eF3d7E3B33A465E0599E641BB29421f7Df92`
- :x: uppercase `0XF048EF3D7E3B33A465E0599E641BB29421F7DF92`

### How to get more than 100 items?

By default, query responses are limited to 100 items per collection. If you want
to receive more, you can go up to 1000 items per collection and beyond that, you
can paginate with:

```graphql
someCollection(first: 1000, skip: <number>) { ... }
```

### Can I rely on a subgraph to check the state of the protocol?

Subgraphs are built to quickly access a representation of onchain state through
a friendly API.

Under the hood, a subgraph is a centralized system watching the blockchain
events and indexing data in a database. Like any system, it may be subject to
issues (bugs, sync problems...) and reflect an erroneous or outdated state of
the onchain data.

However relying on a subgraph to read and display non critical data is fine,
users must always check the onchain state before interacting with a contract.

### Can I deploy my own instance?

The subgraph source code is publicly available on the
[GitHub repository](https://github.com/iExecBlockchainComputing/PoCo-subgraph).
You can use it to deploy the subgraph on a graphnode connected to the iExec
Sidechain.

### Can I use mutations?

No, as the subgraph reflects the onchain data, GraphQL mutations are disabled.
Changes only occurs when an onchain event is indexed.
