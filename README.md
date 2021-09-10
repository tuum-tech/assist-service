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

# API Endpoints

For detailed deep-dive of all the API endpionts, you can check out [Tuum Documentation](https://docs.tuum.tech/tuum-tech/assist-service). You can also find the same documentation below.

## Healthcheck

To check whether the Assist Service is running:

```bash
curl http://localhost:2000/v1/healthCheck/ping
```

```yaml
Request type: GET
Url: /v1/healthCheck/ping
Return:
    Success: { '_status': 'OK', 'message': 'pong' }
    Failure: { '_status': 'ERR', '_error': { 'code': 404, 'message': 'err_message' } }
```

## Authentication

Read more on [Authentication APIs](./docs/authentication.md)

## User Data

Read more on [User Data APIs](./docs/user_data.md)

## Elastos ID Sidechain

Read more on [Elastos ID Sidechain APIs](./docs/eid_sidechain.md)

## Elastos Smart Contract Sidechain

Read more on [Elastos Smart Contract Sidechain APIs](./docs/esc_sidechain.md)

## Elastos Mainchain

Read more on [Elastos Mainchain APIs](./docs/ela_mainchain.md)
