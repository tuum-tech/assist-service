import fetch from 'cross-fetch';

const NAMESPACE = 'Service: Common';

async function handleRoute(url: string, body: any, headers: any, post: boolean = true) {
    let fetchResponse: any;
    if (post === true) {
        fetchResponse = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(body)
        });
    } else {
        fetchResponse = await fetch(url, {
            method: 'GET',
            headers
        });
    }

    const response: any = {
        data: null,
        error: null
    };
    try {
        response.data = await fetchResponse.json();
    } catch (err) {
        response.error = err;
    }

    return response;
}

function returnSuccess(network: string, code: number, data: any) {
    const response = {
        meta: { code, message: 'OK', network },
        data
    };
    return response;
}

function returnError(network: string, code: number, error: any) {
    const response = {
        meta: { code, message: 'ERR', network },
        error
    };

    return response;
}

export default { handleRoute, returnSuccess, returnError };
