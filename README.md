# Assist Service

Assist Service provides unparalleled access to the Elastos ecosystem that lets developers connect to any component of Elastos via a simple REST API

To start, clone assist-service repo

```
git clone https://github.com/tuum-tech/assist-service.git;
cd assist-service;
```

# Prerequisites

-   Install node(v12 or later) and npm
-   Install dependencies
    ```
    npm i
    ```

# Run

-   Copy example environment file
    ```
    cp .env.example .env
    ```
-   Modify .env file with any number of wallets to use
-   [OPTIONAL]: If you want to remove previous mongodb data and start fresh, remove the mongodb directory
    ```
    rm -rf ~/.tuum-mongodb-data
    ```
-   Start API server
    ```
    ./run.sh start
    ```

# Verify

### To check whether the Assist Service is running:

```bash
curl http://localhost:2000/v1/healthCheck/ping
```

```yaml
Request type: GET
Url: /
Return:
    Success: { '_status': 'OK', 'message': 'pong' }
    Failure: { '_status': 'ERR', '_error': { 'code': 404, 'message': 'err_message' } }
```

## Elastos ID Sidechain

### Create a did transaction to be published by Assist Service

```bash
curl -XPOST http://localhost:2000/v1/eidSidechain/create/didTx -H "Content-Type: application/json" -d @test/did_tx.json
```

```yaml
Request type: POST
Url: /v1/eidSidechain/create/didTx
Content-Type: 'application/json'
Data: { 'didRequest': {} }
Return:
    Success:
    {
      '_status': 'OK',
      'didTx': {
        "_id": "61006dc73932a6bb4c0cf651",
        "did": "did:elastos:ik8ChHLQozrqt1hBzXq2WSjMFsZ9JUoxat#primary",
        "requestFrom": "Assist Service",
        "didRequest": {},
        "status": "Pending",
        "walletUsed": "0x365b70f14e10b02bef7e463eca6aa3e75ca3cdb1",
        "createdAt": "2021-07-27T20:34:15.127Z",
        "updatedAt": "2021-07-27T20:34:15.127Z"
      }
    }
    Failure: { '_status': 'ERR', '_error': { 'code': 404, 'message': 'err_message' } }
```

### Get all did transactions published by Assist Service

```bash
curl http://localhost:2000/v1/eidSidechain/get/didTxs
```

```yaml
Request type: GET
Url: /v1/eidSidechain/get/didTxs
Return:
    Success:
    {
      '_status': 'OK',
      'didTxs': [{
        "_id": "61006dc73932a6bb4c0cf651",
        "did": "did:elastos:ik8ChHLQozrqt1hBzXq2WSjMFsZ9JUoxat#primary",
        "requestFrom": "Assist Service",
        "didRequest": {},
        "status": "Pending",
        "walletUsed": "0x365b70f14e10b02bef7e463eca6aa3e75ca3cdb1",
        "createdAt": "2021-07-27T20:34:15.127Z",
        "updatedAt": "2021-07-27T20:34:15.127Z"
      }],
      "count": 1
    }
    Failure: { 'status': 'ERR', 'error': { 'code': 401, 'message': 'err_message' } }
```

## Authentication

### TODO: Generate an API key

1. Since we don't want users to pass in their mnemonics to the Assist Service, provide a local script that a user can run locally by passing in their mnemonics offline that generates an auth token
2. Use the auth token from this script to then generate an API key that will be used by the user to interact with Assist API endpoints

```bash
curl -XPOST http://localhost:8000/v1/auth/generate_api_key -H "Content-Type: application/json" -d '{"jwt": "auth_token"}'
```

```yaml
Request type: POST
Url: /v1/auth/generate_api_key
Content-Type: 'application/json'
Data: { 'jwt': 'auth_token' }
Return:
    Success: { '_status': 'OK', 'api_key': 'api_key' }
    Failure: { '_status': 'ERR', '_error': { 'code': 401, 'message': 'err_message' } }
```

### TODO: Verify the API key

1. Return whether the API key is valid along with other details about the API key

```bash
curl http://localhost:8000/v1/auth/verify_api_key -H "Authorization: api_key $api_key"
```

```yaml
Request type: GET
Url: /v1/auth/verify_api_key
Authorization: 'api_key 38b8c2c1093dd0fec383a9d9ac940515'
Return:
    Success: { '_status': 'OK' }
    Failure: { '_status': 'ERR', '_error': { 'code': 401, 'message': 'err_message' } }
```

### TODO: Get public stats of an API key via a corresponding DID

```bash
curl -XPOST http://localhost:8000/v1/auth/stats_api_key -H "Content-Type: application/json" -d '{"did": "did:elastos:iag8qwq1xPBpLsGv4zR4CmzLpLUkBNfPHX"}'
```

```yaml
Request type: POST
Url: /v1/auth/stats_api_key
Content-Type: "application/json"
Data: { "did": "did:elastos:iag8qwq1xPBpLsGv4zR4CmzLpLUkBNfPHX" }
Return:
  Success:
    Free Account Response:
      {
        "_status": "OK",
        "created": "2021-07-22T17:58:24.140+00:00",
        "account_type": "free",
        "requests": {
          "regular_endpoints": {
            "today": 3,
            "all": 100,
            "daily_limit": 10000
          },
          "premium_endpoints": {
            "today": 3,
            "all": 100,
            "daily_limit": 10
          }
        }
      }
    Premium Account Response:
    {
      "_status": "OK",
      "created": "2021-07-22T17:58:24.140+00:00",
      "account_type": "premium",
      "requests": {
        "regular_endpoints": {
          "today": 3,
          "all": 100,
          "daily_limit": -1
        },
        "premium_endpoints": {
          "today": 3,
          "all": 100,
          "daily_limit": -1
        }
      }
    }
  Failure:
    { "_status": "ERR", "_error": { "code": 401, "message": "err_message" } }
```

## Elastos Mainchain

### Retrieve the latest block info

```bash
curl -XPOST http://localhost:8000/v1/mainchain/latest_block_info -H "Authorization: api_key $api_key" -H "Content-Type: application/json" -d @- << EOF
{
  "network": "mainnet"
}
EOF
```

```yaml
Request type: POST
Url: /v1/mainchain/latest_block_info
Authorization: 'api_key 38b8c2c1093dd0fec383a9d9ac940515'
Content-Type: 'application/json'
Data: { 'network': 'mainnet|testnet|tuumnet' }
Return:
    Success:
        {
            '_status': 'OK',
            'miner': 'F2Pool',
            'validator': 'Noderators - Watermelon',
            'avg_tx_hourly': 84,
            'accounts_over_1_ELA': 26247,
            'num_tx': 1,
            'hashrate': '27618978773646499814',
            'hashrate_btc': '127618978773646499814',
            'hash': '3893390c9fe372eab5b356a02c54d3baa41fc48918bbddfbac78cf48564d9d72',
            'confirmations': 2,
            'size': 498,
            'weight': 1992,
            'height': 905345,
            'version': 0,
            'versionhex': '00000000',
            'merkleroot': '764691821f937fd566bcf533611a5e5b193008ea1ba1396f67b7b0da22717c02',
            'tx':
                [
                    {
                        'txid': '219184ea3c0a2973b90b8402c8405b76d7fbe10a268f6de7e4f48e93f5d03df7',
                        'hash': '219184ea3c0a2973b90b8402c8405b76d7fbe10a268f6de7e4f48e93f5d03df7',
                        'size': 192,
                        'vsize': 192,
                        'version': 0,
                        'locktime': 2001,
                        'vin': [{ 'txid': '0000000000000000000000000000000000000000000000000000000000000000', 'vout': 65535, 'sequence': 4294967295 }],
                        'vout':
                            [
                                {
                                    'value': '0.01255707',
                                    'n': 0,
                                    'address': '8VYXVxKKSAxkmRrfmGpQR2Kc66XhG6m3ta',
                                    'assetid': 'b037db964a231458d2d6ffd5ea18944c4f90e63d547c5d3b9874df66a4ead0a3',
                                    'outputlock': 0
                                },
                                {
                                    'value': '0.02929985',
                                    'n': 1,
                                    'address': 'EXca4DJwqCXa6vbJmpovwatHiP8HRTVS1Z',
                                    'assetid': 'b037db964a231458d2d6ffd5ea18944c4f90e63d547c5d3b9874df66a4ead0a3',
                                    'outputlock': 0
                                }
                            ],
                        'blockhash': '3ca6bcc86bada4642fea709731f1653bd34b28ab15b790e102e14e0d7bd138d8',
                        'confirmations': 1,
                        'time': 1527324355,
                        'blocktime': 1527324355,
                        'type': 0,
                        'payloadversion': 4,
                        'payload': { 'CoinbaseData': 'ELA' },
                        'attributes': [{ 'usage': 0, 'data': '46444170b0e427d2' }],
                        'programs': []
                    }
                ],
            'timestamp': '2021-07-22T17:58:24.140+00:00',
            'nonce': 0,
            'bits': 545259519,
            'difficulty': '1',
            'chainwork': '00001423',
            'previousblockhash': '8d7014f2f941caa1972c8033b2f0a860ec8d4938b12bae2c62512852a558f405',
            'nextblockhash': 'aa98305779686e66294a9b667e6ac77f5231bb2ce09fe7d9ca641775413ecb5a',
            'auxpow': '01000000010000000000000000000000000000000000000000000000000000000000000000000000002cfabe6d6d3893390c9fe'
        }
    Failure: { '_status': 'ERR', '_error': { 'code': 401, 'message': 'err_message' } }
```

### Retrieve the top merged miners

```bash
curl -XPOST http://localhost:8000/v1/mainchain/top_miners -H "Authorization: api_key $api_key" -H "Content-Type: application/json" -d @- << EOF
{
  "network": "mainnet"
}
EOF
```

```yaml
Request type: POST
Url: /v1/mainchain/top_miners
Authorization: 'api_key 38b8c2c1093dd0fec383a9d9ac940515'
Content-Type: 'application/json'
Data: { 'network': 'mainnet|testnet|tuumnet' }
Return:
    Success:
        {
            '_status': 'OK',
            'latest_height': 905345,
            'latest_miner': 'F2Pool',
            'latest_timestamp': '2021-07-22T17:58:24.140+00:00',
            'top_miners_100_blocks': { 'F2Pool': 20, 'Antpool': 20, 'binance': 10, 'BTC.com': 30, 'OkPool': 20 },
            'top_miners_1000_blocks': { 'F2Pool': 200, 'Antpool': 200, 'binance': 100, 'BTC.com': 300, 'OkPool': 200 },
            'top_miners_10000_blocks': { 'F2Pool': 2000, 'Antpool': 2000, 'binance': 1000, 'BTC.com': 3000, 'OkPool': 2000 }
        }
    Failure: { '_status': 'ERR', '_error': { 'code': 401, 'message': 'err_message' } }
```

### Retrieve the top DPoS validators

```bash
curl -XPOST http://localhost:8000/v1/mainchain/top_validators -H "Authorization: api_key $api_key" -H "Content-Type: application/json" -d @- << EOF
{
  "network": "mainnet"
}
EOF
```

```yaml
Request type: POST
Url: /v1/mainchain/top_validators
Authorization: 'api_key 38b8c2c1093dd0fec383a9d9ac940515'
Content-Type: 'application/json'
Data: { 'network': 'mainnet|testnet|tuumnet' }
Return:
    Success:
        {
            '_status': 'OK',
            'latest_height': 905345,
            'latest_timestamp': '2021-07-22T17:58:24.140+00:00',
            'top_validator_100_blocks': { 'Noderators - Watermelon': 20, 'Elastos HIVE': 20, 'Starfish': 10, '韩锋/SunnyFengHan': 30, 'Elastos Scandinavia': 20 },
            'top_validator_1000_blocks': { 'Noderators - Watermelon': 20, 'Elastos HIVE': 200, 'Starfish': 100, '韩锋/SunnyFengHan': 300, 'Elastos Scandinavia': 200 },
            'top_validator_10000_blocks': { 'Noderators - Watermelon': 2000, 'Elastos HIVE': 2000, 'Starfish': 1000, '韩锋/SunnyFengHan': 3000, 'Elastos Scandinavia': 2000 }
        }
    Failure: { '_status': 'ERR', '_error': { 'code': 401, 'message': 'err_message' } }
```

### Retrieve the list of current and future 36 DPoS validators(supernodes)

```bash
# By default, the value of "round" is set to "current". Other values include: "next"
curl -XPOST http://localhost:8000/v1/mainchain/validators_list -H "Authorization: api_key $api_key" -H "Content-Type: application/json" -d @- << EOF
{
  "network": "mainnet",
  "round": "current"
}
EOF
```

```yaml
Request type: POST
Url: /v1/mainchain/validators_list
Authorization: "api_key 38b8c2c1093dd0fec383a9d9ac940515"
Content-Type: "application/json"
Data:
  {
    "network": "mainnet|testnet|tuumnet",
    "round": "current|next"
  }
Return:
  Success:
    {
      "_status": "OK",
      "latest_height": 905345,
      "latest_timestamp": "2021-07-22T17:58:24.140+00:00",
      "latest_validator": {
        "name": "Noderators - Watermelon",
        "rank": 1,
        "owner_key": "038659a36232f36f52fbfc67a2f606922c037ec8a53757a04e4e7623943a05fc03",
        "node_key": "02c322507b6e343613e1d799307a9286bedf13d7dbec16d23d8d5468ceb54855c3",
        "location": "India",
        "votes": 1500,
        "voters": 500,
        "url": "https://www.noderators.org/watermelon",
        "ip": "127.0.0.1:22337",
        "estimated_timestamp": "2021-07-22T17:58:24.140+00:00",
        "state": "Active",
        "registerheight": 236,
        "cancelheight": 0,
        "inactiveheight": 0,
        "illegalheight": 0
      },
      "total_votes": 10000,
      "total_voters": 1846,
      "round_start_height": 905345,
      "round_end_height": 905347,
      "validators": {
        "Elastos HIVE": {
          "rank": 2,
          "height": 905346
          "owner_key": "028659a36232f36f52fbfc67a2f606922c037ec8a53757a04e4e7623943a05fc56",
          "node_key": "01c322507b6e343613e1d799307a9286bedf13d7dbec16d23d8d5468ceb54855d9",
          "location": "China",
          "votes": 1500,
          "voters": 500,
          "url": "https://www.elastos.hive",
          "ip": "127.0.0.1:22338",
          "estimated_timestamp": "2021-07-22T17:58:24.140+00:00",
          "state": "Active",
          "registerheight": 236,
          "cancelheight": 0,
          "inactiveheight": 0,
          "illegalheight": 0
        },
        "Starfish": {
          "rank": 3,
          "height": 905347
          "owner_key": "045659a36232f36f52fbfc67a2f606922c037ec8a53757a04e4e7623943a05fc23",
          "node_key": "034322507b6e343613e1d799307a9286bedf13d7dbec16d23d8d5468ceb54855e7",
          "location": "United States",
          "votes": 1500,
          "voters": 500,
          "url": "https://www.starfish.com",
          "ip": "127.0.0.1:22339",
          "estimated_timestamp": "2021-07-22T17:58:24.140+00:00",
          "state": "Active",
          "registerheight": 236,
          "cancelheight": 0,
          "inactiveheight": 0,
          "illegalheight": 0
        }
      },
      "candidates": {
        "韩锋/SunnyFengHan": {
          "rank": 25,
          "owner_key": "028659a36232f36f52fbfc67a2f606922c037ec8a53757a04e4e7623943a05fc56",
          "node_key": "01c322507b6e343613e1d799307a9286bedf13d7dbec16d23d8d5468ceb54855d9",
          "location": "Singapore",
          "votes": 1500,
          "voters": 500,
          "url": "https://www.sunnyfenghan.com",
          "ip": "127.0.0.1:22340",
          "state": "Active",
          "registerheight": 236,
          "cancelheight": 0,
          "inactiveheight": 0,
          "illegalheight": 0
        },
        "Elastos Scandinavia": {
          "rank": 26,
          "owner_key": "045659a36232f36f52fbfc67a2f606922c037ec8a53757a04e4e7623943a05fc23",
          "node_key": "034322507b6e343613e1d799307a9286bedf13d7dbec16d23d8d5468ceb54855e7",
          "location": "Europe",
          "votes": 1500,
          "voters": 500,
          "url": "https://www.scandinavia.com",
          "ip": "127.0.0.1:22341",
          "state": "Active",
          "registerheight": 236,
          "cancelheight": 0,
          "inactiveheight": 0,
          "illegalheight": 0
        }
      }
    }
  Failure:
    { "_status": "ERR", "_error": { "code": 401, "message": "err_message" } }
```

### Retrieve the transaction history of an ELA address

```bash
# By default, the value of "history" is set to "current". Other values include: "all"
# By default, the value of "min_amount" is set to "1" which means it'll only retrieve all the transactions that included >1 ELA
curl -XPOST http://localhost:8000/v1/mainchain/address_history -H "Authorization: api_key $api_key" -H "Content-Type: application/json" -d @- << EOF
{
  "network": "mainnet",
  "address": "EHohTEm9oVUY5EQxm8MDb6fBEoRpwTyjbb",
  "history": "current",
  "min_amount": 1
}
EOF
```

```yaml
Request type: POST
Url: /v1/mainchain/address_history
Authorization: 'api_key 38b8c2c1093dd0fec383a9d9ac940515'
Content-Type: 'application/json'
Data: { 'network': 'mainnet|testnet|tuumnet', 'address': 'EHohTEm9oVUY5EQxm8MDb6fBEoRpwTyjbb', 'history': 'current|all', 'min_amount': 0|1|2|n }
Return:
    Success:
        {
            '_status': 'OK',
            'balance': 100,
            'total_num_tx': 14563,
            'created': '2021-07-22T17:58:24.140+00:00',
            'vote_weight': 95,
            'votes_cast': 36,
            'tx':
                [
                    '5ed515bd33bcdfc5fe91ce1c59018457b416330dd833c3339cf1fb56cd274253':
                        {
                            'tx_type': 'incoming',
                            'from': 'EJohTEm9oVUY5EQxm8MDb6fBEoRpwTyjae',
                            'to': 'EHohTEm9oVUY5EQxm8MDb6fBEoRpwTyjbb',
                            'amount': 5,
                            'timestamp': '2021-07-22T17:58:24.140+00:00',
                            'block_height': 940594,
                            'block_hash': '2ed515bd33bcdfc5fe91ce1c59018457b416330dd833c3339cf1fb56cd274255'
                        },
                    '4ed515bd33bcdfc5fe91ce1c59018457b416330dd833c3339cf1fb56cd274252':
                        {
                            'tx_type': 'outgoing',
                            'from': 'EHohTEm9oVUY5EQxm8MDb6fBEoRpwTyjbb',
                            'to': 'EJohTEm9oVUY5EQxm8MDb6fBEoRpwTyjae',
                            'amount': 2,
                            'timestamp': '2021-07-22T17:58:24.140+00:00',
                            'block_height': 940594,
                            'block_hash': '3ed515bd33bcdfc5fe91ce1c59018457b416330dd833c3339cf1fb56cd274254'
                        }
                ]
        }
    Failure: { '_status': 'ERR', '_error': { 'code': 401, 'message': 'err_message' } }
```
