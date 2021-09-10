### Retrieve the latest block info

Get the latest block info from the ELA mainchain

```bash
token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImtpcmFuIiwiaWF0IjoxNjMwMzUwODI2LCJleHAiOjMyNjEwNjE2NTIsImlzcyI6ImRpZDplbGFzdG9zOmlhZzhxd3ExeFBCcExzR3Y0elI0Q216THBMVWtCTmZQSFgifQ.meX4soGF0s_ugAo-c2tZeQOKTvILJj-ZhZBeXqG5_RQ";
curl http://localhost:2000/v1/elaMainchain/get/blockInfo/latest?network=mainnet -H "Authorization: Bearer ${token}"
```

```yaml
Request type: GET
Url: /v1/elaMainchain/get/blockInfo/latest?network=[mainnet|testnet]
Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
Return:
    Success:
    {
        "meta": {
            "code": 200,
            "message": "OK",
            "network": "mainnet"
        },
        "data": {
            "_id": "613ab820577b6cfd3755c7f1",
            "chain": "elaMainchain",
            "network": "mainnet",
            "extraInfo": {
                "rpcUrl": "https://api.elastos.io/ela",
                "backupRpcUrl": "https://api.trinity-tech.cn/ela"
            },
            "height": 987997,
            "miner": "F2Pool",
            "validator": "Noderators - Watermelon",
            "avgTxHourly": 84,
            "accountsOverOneELA": 26247,
            "hashrate": "27618978773646499814",
            "numTx": 1,
            "block": {
                "hash": "8a5af3561783871b5504c55c17da79c60275c2de70f497ab0c135d27a3153ebb",
                "confirmations": 1,
                "strippedsize": 3781,
                "size": 3781,
                "weight": 15124,
                "height": 987997,
                "version": 0,
                "versionhex": "00000000",
                "merkleroot": "ecf2c0f73a88e6629b73d677f9dec1929d482b4c9b4392b9137620e211f1979d",
                "tx": [
                    {
                        "txid": "028c01fb3059c56aea0b7a13615a7803870648f1058ab0144be90394be1ac98c",
                        "hash": "028c01fb3059c56aea0b7a13615a7803870648f1058ab0144be90394be1ac98c",
                        "size": 196,
                        "vsize": 196,
                        "version": 9,
                        "type": 0,
                        "payloadversion": 4,
                        "payload": {
                            "coinbasedata": "🐟"
                        },
                        "attributes": [
                            {
                                "usage": 0,
                                "data": "f78b4bdca2663f89"
                            }
                        ],
                        "vin": [
                            {
                                "txid": "0000000000000000000000000000000000000000000000000000000000000000",
                                "vout": 65535,
                                "sequence": 4294967295
                            }
                        ],
                        "vout": [
                            {
                                "value": "0.91339381",
                                "n": 0,
                                "address": "CRASSETSXXXXXXXXXXXXXXXXXXXX2qDX5J",
                                "assetid": "a3d0eaa466df74983b5d7c543de6904f4c9418ead5ffd6d25814234a96db37b0",
                                "outputlock": 0,
                                "type": 0
                            },
                            {
                                "value": "1.06562610",
                                "n": 1,
                                "address": "EVNwKGtBffffrjYwcqdvLMTiXVeLniQ3Bc",
                                "assetid": "a3d0eaa466df74983b5d7c543de6904f4c9418ead5ffd6d25814234a96db37b0",
                                "outputlock": 0,
                                "type": 0
                            }
                        ],
                        "locktime": 987997,
                        "programs": [],
                        "blockhash": "8a5af3561783871b5504c55c17da79c60275c2de70f497ab0c135d27a3153ebb",
                        "confirmations": 1,
                        "time": 1631304734,
                        "blocktime": 1631304734
                    }
                ],
                "time": 1631304734,
                "mediantime": 1631304734,
                "nonce": 0,
                "bits": 402691492,
                "difficulty": "4331957791305942",
                "chainwork": "00000000",
                "previousblockhash": "f565ec73ee383d1efdc492ada5314ec9b3a303d3aa3febe4f2f8cd74d9034319",
                "nextblockhash": "0000000000000000000000000000000000000000000000000000000000000000",
                "auxpow": "01000000010000000000000000000000000000000000000000000000000000000000000000000000002cfabe6d6d3893390c9fe",
                "minerinfo": "🐟"
            },
            "createdAt": "2021-09-10T01:42:56.618Z",
            "updatedAt": "2021-09-10T20:13:20.143Z",
            "__v": 0
        }
    }
    Failure:
    {
        "meta": {
            "code": 401,
            "message": "ERR",
            "network": "mainnet"
        },
        "error": err_message
    }
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
