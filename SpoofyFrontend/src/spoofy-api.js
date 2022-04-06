const FRONTEND_URL = window.location.origin;
const BACKEND_URL = "https://spoofyapi.noahc3.ml";

const FRONTEND_AUTH_CALLBACK = FRONTEND_URL + "/callback";

const ENDPOINT_AUTH_LOGIN = BACKEND_URL + "/authentication/login";
const ENDPOINT_AUTH_TOKEN = BACKEND_URL + "/authentication/token";
const ENDPOINT_AUTH_PROFILE = BACKEND_URL + "/authentication/profile";

const ENDPOINT_PLAYLIST_GETPLAYLISTS = BACKEND_URL + "/playlist/getplaylists";
const ENDPOINT_PLAYLIST_SHUFFLE = BACKEND_URL + "/playlist/shuffle";
const ENDPOINT_PLAYLIST_APPLYSHUFFLE = BACKEND_URL + "/playlist/applyshuffle";

let defaultErrorHandler;
let rerender;

let shufflePreviewGeneratingHandler;
let shufflePreviewDisplayHandler;
let shuffleApplyingHandler;
let shuffleCompleteHandler;

let initialized = false;
let lockInit = false;
let lockAuth = false;

let authenticated = false;
let authState = "";
let authBlob = "";

let profile = {};
let playlists = {};

function uuid4() {
    return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : ((r & 0x3) | 0x8);
        return v.toString(16);
    });
}

function handleError(err) {
    console.error(err);
    if (typeof(defaultErrorHandler) === 'function') defaultErrorHandler(err);
}

function tryGetStringFromSessionStorage(key) {
    return sessionStorage.getItem(key) ?? "";
}

function setStringInSessionStorage(key, value) {
    sessionStorage.setItem(key, value);
}

function deleteStringInSessionStorage(key) {
    sessionStorage.removeItem(key);
}

async function fetchJson(endpoint, authenticate) {
    var opts = {};
    if (authenticate && authBlob && authBlob.length > 0) opts.headers = { 'Authorization': 'Bearer ' + authBlob }

    return fetch(endpoint, opts).then(res => {
        if (res.ok) return res.json();
        else {
            return res.text().then(msg =>  {
                let rawMessage = msg;
                if (msg.includes("<html>")) msg = res.statusText;
                return new ApiError(res.status, msg, "fetchJson", rawMessage, res.url);
            });
        }
    }).catch(err => {
        return new ApiError(-2, err.message, "fetchJson", err.stack, endpoint);
    });;
}

// async function fetchString(endpoint) {
//     return fetch(endpoint).then(res => {
//         if (res.ok) return res.text();
//         else {
//             return res.text().then(msg =>  {
//                 let rawMessage = msg;
//                 if (msg.includes("<html>")) msg = res.statusText;
//                 return new ApiError(res.status, msg, "fetchString", rawMessage, res.url);
//             });
//         }
//     }).catch(err => {
//         console.log(err);
//         return new ApiError(-2, err.message, "fetchString", err.stack, endpoint);
//     });
// }

// async function postAndFetchString(endpoint, body) {
//     const opts = {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(body)
//     };
// 
//     return fetch(endpoint, opts).then(res => {
//         if (res.ok) return res.text();
//         else {
//             return res.text().then(msg =>  {
//                 let rawMessage = msg;
//                 if (msg.includes("<html>")) msg = res.statusText;
//                 return new ApiError(res.status, msg, "postAndFetchString", rawMessage, res.url);
//             });
//         }
//     }).catch(err => {
//         return new ApiError(-2, err.message, "postAndFetchString", err.stack, endpoint);
//     });;
// }

// async function postAndFetchJson(endpoint, body, authenticate) {
//     const opts = {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(body)
//     };
//     if (authenticate && authBlob && authBlob.length > 0) opts.headers.Authorization = 'Bearer ' + authBlob;
// 
//     return fetch(endpoint, opts).then(res => {
//         if (res.ok) return res.json();
//         else {
//             return res.text().then(msg =>  {
//                 let rawMessage = msg;
//                 if (msg.includes("<html>")) msg = res.statusText;
//                 return new ApiError(res.status, msg, "postAndFetchJson", rawMessage, res.url);
//             });
//         }
//     }).catch(err => {
//         return new ApiError(-2, err.message, "postAndFetchJson", err.stack, endpoint);
//     });;
// }

async function postJson(endpoint, body, authenticate) {
    const opts = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    };
    if (authenticate && authBlob && authBlob.length > 0) opts.headers.Authorization = 'Bearer ' + authBlob;

    return fetch(endpoint, opts).then(res => {
        if (res.ok) return {};
        else {
            return res.text().then(msg =>  {
                let rawMessage = msg;
                if (msg.includes("<html>")) msg = res.statusText;
                return new ApiError(res.status, msg, "postAndFetchJson", rawMessage, res.url);
            });
        }
    }).catch(err => {
        return new ApiError(-2, err.message, "postAndFetchJson", err.stack, endpoint);
    });;
}

async function postAndFetchJsonAsForm(endpoint, body) {
    const formData = new FormData();
    for (var key in body) {
        formData.append(key, body[key]);
    }

    const opts = {
        method: 'POST',
        body: formData
    };

    return fetch(endpoint, opts).then(res => {
        if (res.ok) return res.json();
        else {
            return res.text().then(msg =>  {
                let rawMessage = msg;
                if (msg.includes("<html>")) msg = res.statusText;
                return new ApiError(res.status, msg, "postAndFetchJsonAsForm", rawMessage, res.url);
            });
        }
    }).catch(err => {
        return new ApiError(-2, err.message, "postAndFetchJsonAsForm", err.stack, endpoint);
    });;
}

export function setDefaultErrorHandler(func) {
    defaultErrorHandler = func;
}

export function setForceUpdate(func) {
    rerender = func;
}

export function setShufflePreviewGeneratingHandler(func) {
    shufflePreviewGeneratingHandler = func;
}

export function setShufflePreviewDisplayHandler(func) {
    shufflePreviewDisplayHandler = func;
}

export function setShuffleApplyingHandler(func) {
    shuffleApplyingHandler = func;
}

export function setShuffleCompleteHandler(func) {
    shuffleCompleteHandler = func;
}

export function getLoginUrl() {
    return ENDPOINT_AUTH_LOGIN + "?redirect_uri=" + encodeURIComponent(FRONTEND_AUTH_CALLBACK) + "&state=" + authState;
}

export async function doTokenLogin() {
    if (lockAuth) return;
    lockAuth = true;

    const urlSearchParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlSearchParams.entries());

    if (params.error) {
        window.location.href = window.location.origin;
        return;
    }

    postAndFetchJsonAsForm(ENDPOINT_AUTH_TOKEN, {
        redirect_uri: FRONTEND_AUTH_CALLBACK,
        code: params.code
    }).then(authData => {
        setStringInSessionStorage("authBlob", authData["access_token"]);
        window.location.href = window.location.origin;
    });
}

export async function doLogout() {
    deleteStringInSessionStorage("authState");
    deleteStringInSessionStorage("authBlob");
    window.location.reload();
}

export function isUserAuthenticated() {
    return authenticated;
}

export function getProfile() {
    return profile;
}

export async function loadPlaylists() {
    let pl = await fetchJson(ENDPOINT_PLAYLIST_GETPLAYLISTS, true);

    if (pl.error) {
        handleError(pl);
        rerender();
        return;
    }

    playlists = pl;
}

export function getPlaylists() {
    return playlists;
}

export async function shuffle(playlistId, shuffleMode) {
    if (typeof(shuffleApplyingHandler) === 'function') shuffleApplyingHandler();

    const shuffle = await fetchJson(ENDPOINT_PLAYLIST_SHUFFLE 
        + "?playlistId=" + playlistId 
        + "&shuffleType=" + shuffleMode
        + "&preview=false",
        true);

    if (shuffle.error) {
        handleError(shuffle);
        rerender();
        return;
    }

    if (typeof(shuffleCompleteHandler) === 'function') shuffleCompleteHandler();
    rerender();
}

export async function previewShuffle(playlistId, shuffleMode) {
    if (typeof(shufflePreviewGeneratingHandler) === 'function') shufflePreviewGeneratingHandler();

    const preview = await fetchJson(ENDPOINT_PLAYLIST_SHUFFLE 
        + "?playlistId=" + playlistId 
        + "&shuffleType=" + shuffleMode
        + "&preview=true",
        true);

    if (preview.error) {
        handleError(preview);
        rerender();
        return;
    }

    if (typeof(shufflePreviewDisplayHandler) === 'function') shufflePreviewDisplayHandler(preview);
    rerender();
}

export async function applyShuffle(previewData) {
    const playlistId = previewData.playlistId;
    const positionDelta = previewData.positionDelta;

    if (typeof(shuffleApplyingHandler) === 'function') shuffleApplyingHandler();

    const result = await postJson(ENDPOINT_PLAYLIST_APPLYSHUFFLE + "?playlistId=" + playlistId, positionDelta, true);

    if (result.error) {
        handleError(result);
        rerender();
        return;
    }

    if (typeof(shuffleCompleteHandler) === 'function') shuffleCompleteHandler();
    rerender();
}

export function isInitialized() {
    return initialized;
}

export async function init() {
    if (lockInit) return;
    lockInit = true;

    authState = tryGetStringFromSessionStorage("authState");
    authBlob = tryGetStringFromSessionStorage("authBlob");

    if (authState === "") {
        authState = uuid4();
        setStringInSessionStorage("authState", uuid4());
    }

    //try authentication    
    let prof = await fetchJson(ENDPOINT_AUTH_PROFILE, true);

    if (prof.error) {
        if (prof.code === 401) {
            authenticated = false;
        } else {
            handleError(prof);
        }
    } else {
        profile = prof;
        authenticated = true;
        await loadPlaylists();
    }

    initialized = true;
    rerender();
}

export class ApiError {
    constructor(code, message, location, rawMessage, url) {
        this.error = true;
        this.code = code;
        this.location = location;
        this.message = message;
        this.rawMessage = rawMessage;
        this.url = url;
        this.ua = navigator.userAgent;
    }

    withLocation(loc) {
        this.location = loc + "/" + this.location; 
        return this;
    }
}