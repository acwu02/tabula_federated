class HTTPError extends Error {
  constructor(status, error) {
    super(status);
    this.error = error;
  }
}

const apiRequest = async (method, uri, body = null) => {

  let options = {
    method: method,
    headers: {},
    body: null
  }
  if (body instanceof FormData) {
    options.headers = {}; // Don't set Content-Type for FormData
    options.body = body;
  } else if (body) {
    options.headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(body);
  }

  let response = await fetch(uri, options);
  if (response.status === 200) {
    return response.json();
  } else {
    if (response.status === 404) {
      throw new HTTPError(response.status, "File not found");
    } else if (response.status === 500) {
      throw new HTTPError(response.status, "Server error");
    } else {
      throw new HTTPError(response.status, "Unknown error");
    }
  }
};

export default apiRequest;
