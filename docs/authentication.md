### Register a new user

Register an account with Assist Service using a username and password

```
curl -XPOST  http://localhost:2000/v1/users/register -H "Content-Type: application/json" -d '{"network": "mainnet", "username": "kiran", "password": "kiran"}'
```

```yaml
Request type: POST
Url: /v1/users/register
Content-Type: 'application/json'
Data: {"network": "mainnet|testnet", "username": "kiran", "password": "kiran"}
Return:
    Success:
    {
        "meta": {
            "code": 200,
            "message": "OK",
            "network": "mainnet"
        },
        "data": {
            "user": {
                "requests": {
                    "freeEndpoints": {
                        "today": 0,
                        "all": 0,
                        "dailyLimit": 10000
                    },
                    "premiumEndpoints": {
                        "today": 0,
                        "all": 0,
                        "dailyLimit": 10
                    }
                },
                "_id": "613139ccfa203e0c0c944515",
                "username": "kiran",
                "password": "$2a$10$v4MqiNr/jBJHgEmm8e4o9.2oZ6ZJkQqeekY6KSxxFaKF6v8S.7Xa.",
                "accountType": "free",
                "createdAt": "2021-09-02T20:53:32.348Z",
                "updatedAt": "2021-09-02T20:53:32.348Z",
                "__v": 0
            }
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

### Generate an API token

Generate an API token using your username and password that was used when registering

```
curl -XPOST  http://localhost:2000/v1/users/login -H "Content-Type: application/json" -d '{"network": "mainnet", "username": "kiran", "password": "kiran"}'
```

```yaml
Request type: POST
Url: /v1/users/login
Content-Type: 'application/json'
Data: {"network": "mainnet|testnet", "username": "kiran", "password": "kiran"}
Return:
    Success:
    {
        "meta": {
            "code": 200,
            "message": "OK",
            "network": "mainnet"
        },
        "data": {
            "message": "Auth successful",
            "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImtpcmFuIiwiaWF0IjoxNjMxMTQ2Nzk2LCJleHAiOjMyNjI2NTM1OTIsImlzcyI6ImRpZDplbGFzdG9zOmlhZzhxd3ExeFBCcExzR3Y0elI0Q216THBMVWtCTmZQSFgifQ.eXGmZEXRnSMSaD4iGdF7YIpUmy4AKd9FsNFmlwie-gU",
            "user": {
                "requests": {
                    "freeEndpoints": {
                        "today": 0,
                        "all": 0,
                        "dailyLimit": 10000
                    },
                    "premiumEndpoints": {
                        "today": 0,
                        "all": 3,
                        "dailyLimit": 10
                    }
                },
                "_id": "613139ccfa203e0c0c944515",
                "username": "kiran",
                "accountType": "free",
                "createdAt": "2021-09-02T20:53:32.348Z",
                "updatedAt": "2021-09-09T00:00:01.412Z",
                "__v": 0
            }
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

### Validate your API token

Check whether your API token is valid

```bash
token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImtpcmFuIiwiaWF0IjoxNjMwMzUwODI2LCJleHAiOjMyNjEwNjE2NTIsImlzcyI6ImRpZDplbGFzdG9zOmlhZzhxd3ExeFBCcExzR3Y0elI0Q216THBMVWtCTmZQSFgifQ.meX4soGF0s_ugAo-c2tZeQOKTvILJj-ZhZBeXqG5_RQ";
curl http://localhost:2000/v1/users/validate?network=mainnet -H "Authorization: Bearer ${token}"
```

```yaml
Request type: GET
Url: /v1/users/validate?network=[mainnet|testnet]
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
            "message": "Token validated",
            "decoded": {
                "username": "kiran",
                "issuedDate": "2021-08-30T19:13:46.000Z",
                "expirationDate": "2073-05-03T18:27:32.000Z",
                "issuer": "did:elastos:iag8qwq1xPBpLsGv4zR4CmzLpLUkBNfPHX"
            }
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
