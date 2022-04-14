<p align="center">
    <a href="https://spoofy.noahc3.ml">
        <img alt="spoofy" src="https://i.imgur.com/wAF5Z7m.png">
    </a>
</p>

<p align="center">
    <img alt="License: AGPLv3" src="https://img.shields.io/badge/License-AGPL%20v3-blue.svg"/>
    <img alt="Build Status" src="https://github.com/noahc3/Spoofy/actions/workflows/build-deploy.yml/badge.svg"/>
</p>

Spoofy is a web app you can use to apply a permanent shuffle to your Spotify playlists. The tool gives you the option to do a fully random shuffle, or to shuffle while spacing apart songs by the same artist.

The website uses the official Spotify REST API to perform playlist shuffles. To use Spoofy, head over to [https://spoofy.noahc3.ml](https://spoofy.noahc3.ml), login with your Spotify account and start shuffling!

## Build & Run Locally
The frontend is a Node.js project built with ReactJS, you can launch into debug mode with the command `npm start`. You can build the static output with `npm run build`.

The backend server is written in C# using ASP.NET 6.0 and can be easily build by opening the solution in Visual Studio 2022 and building as usual, or using the `dotnet build` command.

### Required configuration for backend server

The backend server requires Spotify application credentials to interact with the Spotify API. Please see the [Spotify developer quick start guide](https://developer.spotify.com/documentation/web-api/quick-start/) for information on how to setup an app with Spotify and get your client ID and client secret. You will need to configure the following redirect URIs in the Spotify developer dashboard for you app:

* Frontend: `http://localhost:3000/callback`
* Swagger/OpenAPI: `http://localhost:5003/swagger/oauth2-redirect.html`


The backend server also needs a 256bit key to encrypt and store the users authentication token within their browser. You should generate a random 16 character ASCII string for this purpose.

**Development Mode**

Set your configuration settings using dotnet user secrets. Run these commands in the backend solution directory:

```
dotnet user-secrets init
dotnet user-secrets set "Spotify:ClientID" [clientid]
dotnet user-secrets set "Spotify:ClientSecret" [clientsecret]
dotnet user-secrets set "Spotify:AuthDataKey" [authdatakey]
```

**Production Deployment**

Set your configuration settings in `appsettings.json` in a top level `Spotify` object property

```
{
    ...
    "Spotify": {
        "ClientID": "{clientid}",
        "ClientSecret": "{clientsecret}",
        "AuthDataKey": "{authdatakey}"
    },
    ...
}