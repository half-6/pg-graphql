# PG-GraphQL
GraphQL API for PostgreSQL (BETA) 
<span style="color:gray; font-size: 10px;">An easier way to query PostgreSQL database</span>

Table of Contents
- [Installation](#installation)
- [Initialize](#usage)
- [Query](#query)

## Installation

The easiest way to install @linkfuture/pg-graphql is with [`npm`][npm].

[npm]: https://www.npmjs.com/

```sh
npm install @linkfuture/pg-graphql
```

## Initialize
by following follow nodejs code to install pg-graphql
``` js
import PGGraphql from '@linkfuture/pg-graphql';
import {graphqlHTTP } from 'express-graphql';
const option: PGGraphqlOption = {
    PGConnectionString: process.env.PG,
};
const gp = new PGGraphql(option);
const query = await gp.build();
$app.use('/graphql', graphqlHTTP(query));

```

## Query 
After initialize, you can easily query all your table or view by using standard GraphQL language,
For example if you have user table in your PostgreSQL DB
### Find user by account_id 
``` curl
curl -X POST \
-H "Content-Type: application/json" \
-d '{"query": "{ user(account_id:\"1\") { account_id account gender} "}' \
http://localhost:4000/graphql

```
### Find users by gender(enum type)
``` curl
curl -X POST \
-H "Content-Type: application/json" \
-d '{"query": "{ users(gender:male) { account_id account gender} }' \
http://localhost:4000/graphql

```
