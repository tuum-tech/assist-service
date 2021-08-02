
const NAMESPACE = 'Service: Common';

export async function handleRoute(
  url: string,
  body: any,
  headers: any,
  post: boolean = true
) {
  let fetchResponse: any;
  if (post === true) {
    fetchResponse = await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(body),
    });
  } else {
    fetchResponse = await fetch(url, {
      method: "GET",
      headers: headers,
    });
  }

  let response: any = null;
  try {
        response = await fetchResponse.json();
  } catch (err) {
    response = {
      _status: "ERR",
      _error: {
                    code: 500,
                    message: err
                }
    };
  }

  return response;
}