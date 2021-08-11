const NAMESPACE = 'Service: Common';

async function handleRoute(url: string, body: any, headers: any, post: boolean = true) {
    let fetchResponse: any;
    if (post === true) {
        fetchResponse = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body)
        });
    } else {
        fetchResponse = await fetch(url, {
            method: 'GET',
            headers: headers
        });
    }

    let response: any = {
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

function returnSuccess(res: any, code: number, network: string, data: any) {
    const returned = {
        meta: { code, message: 'OK', network },
        data
    };
    res.send(returned);
}

function returnError(res: any, code: number, network: string, error: any) {
    const returned = {
        meta: { code, message: 'ERR', network },
        error
    };

    res.send(returned);
}

export default { handleRoute, returnSuccess, returnError };
