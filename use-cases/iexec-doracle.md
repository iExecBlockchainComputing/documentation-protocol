---
description: A flexible and secure Oracle Solution
---

# iExec DOracle

> A flexible and secure Oracle Solution

## Why do we need Oracles?

The Ethereum blockchain provides a global trustless computer: given some input
and the smart contract code, the blockchain guarantees execution according to
the Ethereum specification, by replicating the execution across thousands of
nodes and implementing a consensus mechanism across all these nodes. Hence the
execution of the contract is decentralized, and will happen without the need to
trust any single actor.

Unfortunately decentralizing the execution is not sufficient. To be of any
real-world use, a smart contract most often requires access to external,
real-world information. For example an insurance smart contract could require
data about the weather to trigger payment, or a hedging contract could require
pricing data. This information is already available in the digital world: the
web 2.0 is full of nice APIs that provide all kinds of data. It is however not
straightforward to put this information on the blockchain: if the update message
comes from a single wallet, then this wallet controls the whole execution
outcome. It means the smart contract has to trust an off-chain actor \(the owner
of an Ethereum wallet\) to provide such information, which defeats the purpose
of decentralization: now the information provider becomes the trusted third
party that decentralization was supposed to do away with in the first place!

Oracles are systems designed to solve this problem: providing the blockchain
with data from the real world in the most secure and robust way possible. It
turns out we at iExec have been working on this problem for a long time. Indeed
an update to an Oracle \(for example the price of a stock or the average
temperature for a day\) can be seen as the result of a specific type of
off-chain computation, one that would involve calling an API and processing the
response to return the final result. As a result the iExec infrastructure is
perfectly suited to build an efficient and secure Oracle system: the iExec
dOracle.

## The iExec solution: the Decentralized Oracle \(dOracle\)

For two years iExec has been working on the design of the
[Proof of Contribution protocol](../key-concepts/proof-of-contribution.md),
which provides a flexible and highly robust solution to the problem of off-chain
computation. At its core it is a simple Schelling game between off-chain
computation providers \(Workers\): a given number of Workers are randomly chosen
in a much bigger group, and are assigned the same computation. Each of them
proposes a result, and the result that is proposed by the biggest number of
workers is taken as the overall computation result \(see PoCo documentation for
more details\).

The PoCo is both flexible and robust: the trust level for the computation \(e.g.
for the Oracle update in the dOracle case\) can be set arbitrarily, and
determines the number of replications. It also includes a coherent on-chain
incentive mechanism, that protects the whole system against any \(financially
sustainable\) attack. Last but not least, it is cheap and scalable: the more
Workers join the iExec platform, the more secure and the cheaper running a
dOracle will be. iExec dOracle relies on random sampling among all the Workers
on the iExec platform, along with an on-chain consensus algorithm and an
integrated trust score system to make an attack on the dOracle result
exponentially expensive.

iExec dOracle builds on top of the decentralized cloud computing platform
developed by iExec to allow developers to easily create robust and secure
decentralized oracle. Building an Oracle with iExec is therefore extremely
simple: just create a dApp with the logic of the Oracle \(querying an API,
processing different results into a final one\); the iExec platform will
automatically replicate it across many different workers; then the PoCo will
realize a consensus on the different values. The whole process is simple and as
secure as you wish - provided enough money is paid for each execution / oracle
update.

### Why you should use iExec dOracle

iExec dOracle allows you to create your own Oracle, with custom logic, while
benefiting from the security guarantees of the whole iExec platform.

- It is secure. You can set the desired level of trust for your dOracle
  execution. The conjunction of random sampling and iExec’s built-in incentive
  and reputation systems makes your dOracle highly secured.
- It is easy-to-use. It relies on 2 years of research and development to make
  the iExec platform simple and developer friendly. Creating your own
  personalized Decentralized Oracle only takes a simple dockerized application
  and a few lines of Solidity!
- It is cheap. It does not rely on bribing or incentivizing honest behavior,
  only on random sampling and a powerful reputation system to make attack
  impractical.

## How does it work?

### Background: task execution on the iExec platform

The iExec architecture is two-sided: the on-chain part is a set of smart
contracts that implement the PoCo, handle the incentive and adjudication
systems; and the off-chain part is made of workers, that provide computing
resources to execute the tasks, and schedulers, that dispatch the tasks to
execute between the workers of the worker-pool they manage. Each side of the
iExec platform \(worker-pool, computation requester\) create and sign orders
that describe the kind of transaction they are willing to enter \(type of
hardware, minimum price, etc…\). When several orders of different types are
compatible they are matched together on the blockchain, to create a deal. Once a
deal is made, the scheduler that is part of the deal will choose a set of
workers in his workerpool to execute the task. Each worker will download the
dApp \(a docker container\) and run it. Upon execution of the task, each worker
sends back two values on the blockchain:

- a hash of the result.
- after consensus is reached, the corresponding result.

A normal execution ends when the deal is finalized; all the stakeholders are
paid, and the computation requester is free to download the data pointed to by
the results field of the `Deal` object on the blockchain.

### iExec d'Oracle: general architecture

An iExec dOracle can be seen as an “on-chain API”: fundamentally it is a simple
value-store smart contract, with accessors for other smart contracts to get its
data, and an internal mechanism to update the data in the most secure way
possible. The dOracle architecture is composed of two parts: an on-chain smart
contract and a classical iExec dApp \(packaged in a docker container\).

**Off-chain component:**

The off-chain part of a dOracle is a classical iExec dApp, that will be executed
on the iExec platform and be replicated on several workers as part of an iExec
computation deal. It contains the oracle logic, for example to query a web API
and process the result. Whenever an operator wishes to update the dOracle, it
requests a computation like in a normal iExec deal, specifying the dOracle app
as dApp, and the parameters if applicable. The dOracle result is written in the
`${IEXEC_OUT}/computed.json` file by the dApp, under the `callback_data` key.

```bash
$ cat ${IEXEC_OUT}/computed.json
{ 'callback-data': '0x48656c6c6f2c20776f726c6421'}
```

When the computation ends the worker will send both this `callback-data`
\(containing the oracle result\) on the blockchain. The `callback-data` value is
stored in the `resultsCallback` field of the `Task` object in the `IexecProxy`
smart contract.

**On-chain component:**

The on-chain part is the dOracle contract. Anyone can request an update of its
internal state by sending the id of a task corresponding to the execution of the
corresponding dApp. With this id, the dOracle contract will query the blockchain
and retrieve the deal object. It then checks that the execution passes the
dOracle requirements \(trust level, execution tag, that the app is right\). If
it does the dOracle contract then decodes the value in the results field and
update its fields accordingly. The value is then accessible like a normal value
on a smart contract.

## Example: development and workflow of a price-feed application

A simple example of dOracle is available on Github. The following section goes
through its different components, explaining what each of them does.

### The PriceFeed dApp

The PriceFeed dApp is a simple Node.js script, available at
[Kaiko PriceFeed Source](https://github.com/iExecBlockchainComputing/iexec-apps/blob/master/offchain-computing/offchain-tee-kaiko-pricefeed/src/app.py).
Given a set of parameters, the application encodes its result so that it can be
interpreted by the corresponding dOracle smart contract, stores it in
`${IEXEC_OUT}/computed.json`, and stores the hash of this encoded value to
perform the consensus. The Worker will then send these values on-chain as part
of the task finalization, where they will be accessible by the dOracle smart
contract.

For example, given the parameters `"BTC USD 9 2019-04-11T13:08:32.605Z"` the
price-oracle application will:

- Retrieve the price of BTC in USD at 2019-04-11T13:08:32.605Z
- Multiply this value by `10e9` \(to capture the price value more accurately as
  it will be represented by an integer onchain\)
- Encode the date, the description \(`"btc-usd-9"`\) and the value using
  `abi.encode`
- Store this result in `${IEXEC_OUT}/computed.json` under the `callback-data`
  key

iExec will then achieve PoCo consensus on the hash of the `callback-data` value,
and will then submit `callback-data` values on-chain, in the `Task` object on
the `IexecProxy` smart contract.

Once your oracle dApp is written, you can build it into a Docker image and make
it available on the iExec platform as explained here.

### The dOracle generic contract

Every dOracle must inherit from the `IexecDoracle` contract \(source available
on [Github](https://github.com/iExecBlockchainComputing/iexec-doracle-base) and
[npm](https://www.npmjs.com/package/iexec-doracle-base)\).

This contract stores the following fields:

```text
IexecInterfaceToken public iexecproxy;
address             public m_authorizedApp;
address             public m_authorizedDataset;
address             public m_authorizedWorkerpool;
bytes32             public m_requiredtag;
uint256             public m_requiredtrust;
```

In particular, the `m_authorizedApp` must be the address of the smart contract
of the dOracle dApp, and the `m_requiredtag` describes the parameters of the
iExec `Task` necessary to validate the dOracle update.

The dOracle exposes mainly three internal functions, that may be used by the
contracts that inherit from it:

A constructor:

```text
constructor(address _iexecproxy) public
```

A function to initialize/update the settings:

```text
function _iexecDoracleUpdateSettings(
        address _authorizedApp
,       address _authorizedDataset
,       address _authorizedWorkerpoo
,       bytes32 _requiredtag
,       uint256 _requiredtrust
)
internal
```

The update function, that takes in input a task id, and reads the `Task` object
data from the `IexecProxy` smart contract to perform the required checks (the
execution must be completed; the app, the dataset, and the workerpool must be
authorized; the trust level and tags mus be valid). The `IexecProxy` already
checked that the hash of the `resultsCallback` is equal to the `resultDigest`
\(over which the consensus was reached\). If the task passes the checks then it
returns the `results` field of the `Task` object, i.e. the result of the dOracle
dApp computation.

```text
function _iexecDoracleGetVerifiedResult(bytes32 _doracleCallId)
internal view returns (bytes memory)
```

A dOracle smart contract should inherit from the generic `IexecDOracle`
contract, and expose two main functionalities:

- An update function, that will call the internal \(and inherited\)
  `_iexecDoracleGetVerifiedResult` function and process its result to update the
  dOracle contract internal state.
- One or several accessor functions, that allows other smart contract to access
  the oracle value\(s\).

### The PriceOracle dOracle contract

In the PriceFeed example, the
[PriceOracle](https://github.com/iExecBlockchainComputing/iexec-doracle-base/blob/bb4c04dc77c822d16d7ca8baed99f5626e44d7be/contracts/example/PriceOracle.sol)
smart contract is made of three parts:

- Its internal state description: a `TimedValue` struct storing the oracle data
  for a given value, and a `values` field that maps an index of the form
  `“BTC-USD-9”` to the corresponding `TimedValue` struct value.

```text
struct TimedValue
{
        bytes32 oracleCallID;
        uint256 date;
        uint256 value;
        string  details;
}

mapping(bytes32 => TimedValue) public values;
```

This also allows to read the resulting prices. For example, to get the most
recent price of BTC in USD with 9 place precision \(as described above\), query
`values(keccak256(bytes("BTC-USD-9")))` from the dOracle contract and this will
return a structure containing the value, the associated date, and the details of
the request.

- The update function `processResult`, that takes the task id of an execution of
  the dOracle dApp, calls the internal `_iexecDoracleGetVerifiedResult` and
  processes the result to update the `values` map.

```text
function processResult(bytes32 _oracleCallID)
public
{
        uint256       date;
        string memory details;
        uint256       value;

        // Parse results
        (date, details, value) = decodeResults(_iexecDoracleGetVerifiedResult(_oracleCallID));

        // Process results
        bytes32 id = keccak256(bytes(details));
        require(values[id].date < date, "new-value-is-too-old");
        emit ValueChange(id, _oracleCallID, values[id].date, values[id].value, date, value);
        values[id].oracleCallID = _oracleCallID;
        values[id].date         = date;
        values[id].value        = value;
        values[id].details      = details;
}
```

The PriceFeed dOracle also declares an event `ValueChange`, that is fired
whenever an update is made.

- An `updateEnv` function, that can be used by the owner of the dOracle to
  update its parameters. It simply calls the `_iexecDoracleUpdateSettings`
  function of its parent `IexecDoracle` contract.

```text
function updateEnv(
        address _authorizedApp
,       address _authorizedDataset
,       address _authorizedWorkerpool
,       bytes32 _requiredtag
,       uint256 _requiredtrust
)
public onlyOwner
{
        _iexecDoracleUpdateSettings(_authorizedApp, _authorizedDataset, _authorizedWorkerpool, _requiredtag, _requiredtrust);
}
```
