### Get all users

Get a list of all the users

```bash
token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImtpcmFuIiwiaWF0IjoxNjMwMzUwODI2LCJleHAiOjMyNjEwNjE2NTIsImlzcyI6ImRpZDplbGFzdG9zOmlhZzhxd3ExeFBCcExzR3Y0elI0Q216THBMVWtCTmZQSFgifQ.meX4soGF0s_ugAo-c2tZeQOKTvILJj-ZhZBeXqG5_RQ";
curl http://localhost:2000/v1/users/get/all?network=mainnet -H "Authorization: Bearer ${token}"
```

```yaml
Request type: GET
Url: /v1/users/get/all?network=[mainnet|testnet]
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
            "users": [
                {
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
            ],
            "count": 1
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

### Get new user stats

Get a summary of new users and the number of API endpoints they have exhausted during a period of time

```bash
token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImtpcmFuIiwiaWF0IjoxNjMwMzUwODI2LCJleHAiOjMyNjEwNjE2NTIsImlzcyI6ImRpZDplbGFzdG9zOmlhZzhxd3ExeFBCcExzR3Y0elI0Q216THBMVWtCTmZQSFgifQ.meX4soGF0s_ugAo-c2tZeQOKTvILJj-ZhZBeXqG5_RQ";
curl http://localhost:2000/v1/users/get/newUserStats?network=mainnet&created=2021-09-02 -H "Authorization: Bearer ${token}"
```

```yaml
Request type: GET
Url: /v1/users/get/newUserStats?network=[mainnet|testnet]&created=[today|yesterday|2021-09-02]
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
            "freeAPI": 0,
            "premiumAPI": 5,
            "users": {
                "kiran": {
                    "freeAPI": 0,
                    "premiumAPI": 5
                }
            },
            "numUsers": 1
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
