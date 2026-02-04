const fs = require("fs");
const path = require("path");

beforeAll(() => {
    // minimal DOM elements the script expects
    document.body.innerHTML = `
        <div id="apiUrlLabel"></div>
        <div id="tasks"></div>
        <button id="refreshBtn"></button>
        <form id="createForm">
            <input id="title"/>
            <input id="description"/>
        </form>
    `;

    // provide localStorage so API_URL is set predictably
    global.localStorage = {
        getItem: jest.fn(() => "http://api.test"),
    };

    // default fetch used during module init (refresh call at bottom of app.js)
    global.fetch = jest.fn(() =>
        Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve([]),
        })
    );

    // load and evaluate the app.js in this scope so `api` is available
    const code = fs.readFileSync(path.resolve(__dirname, "app.js"), "utf8");
    eval(code);
});

beforeEach(() => {
    fetch.mockClear();
});

test("api returns parsed json when response ok", async () => {
    fetch.mockImplementationOnce((url, opts) =>
        Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve({ hello: "world" }),
        })
    );

    const res = await api("/test", { method: "PUT", body: JSON.stringify({ a: 1 }) });

    expect(res).toEqual({ hello: "world" });
    expect(fetch).toHaveBeenCalledTimes(1);
    const [calledUrl, calledOpts] = fetch.mock.calls[0];
    expect(calledUrl).toBe("http://api.test/test");
    expect(calledOpts.method).toBe("PUT");
    expect(calledOpts.body).toBe(JSON.stringify({ a: 1 }));
    expect(calledOpts.headers["Content-Type"]).toBe("application/json");
});

test("api returns null on 204 No Content", async () => {
    fetch.mockImplementationOnce(() =>
        Promise.resolve({
            ok: true,
            status: 204,
        })
    );

    const res = await api("/no-content");
    expect(res).toBeNull();
});

test("api throws error with detail from body when not ok", async () => {
    fetch.mockImplementationOnce(() =>
        Promise.resolve({
            ok: false,
            status: 400,
            json: () => Promise.resolve({ detail: "Bad request" }),
        })
    );

    await expect(api("/bad")).rejects.toThrow("Bad request");
});

test("api throws generic HTTP error if body.json fails", async () => {
    fetch.mockImplementationOnce(() =>
        Promise.resolve({
            ok: false,
            status: 500,
            json: () => Promise.reject(new Error("invalid json")),
        })
    );

    await expect(api("/err")).rejects.toThrow("HTTP 500");
});