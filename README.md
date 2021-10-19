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
    ./setup.sh cleanup
    ```
-   Start API server
    ```
    ./setup.sh start; npm run dev
    ```

# API Endpoints

For detailed deep-dive of all the API endpionts, you can check out [Assist Service Documentation](https://docs.tuum.tech/assist-service).

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
