<div align="center"><img width="400" alt="twitch" src="https://github.com/Durss/twitchat/blob/main/src/assets/logo.svg"></div>
<br>
<br>
This is a custom twitch chat that aims to fill gaps in the official Twitch chat.
<br>
The goal is to reduce as much as possible the number of missed messages with features missing from the Twitch chat.
<br>
<br>
<br>

# Project setup
First create a `credentials.json` file on the root directory and fill in these values :
```json
{
	"client_id": "",
	"client_secret": "",
	"redirect_uri": "http://localhost:8080/oauth"
}
```
Create a [twitch application](https://dev.twitch.tv/console) and fill in the `client_id` and `client_secret` values.\
Configure the redirect URI of the application with your localhost and/or production URI. Set it as the  `redirect_uri` value of the credentials.\
<br>
By default the server listens on port 3018, you can change it on `server.js` and `src/utils/Config.ts`.
<br>
<br>
<br>

# Compile project
### Install dependencies
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Run server
```
node server.js
```
<br>
<br>
<br>

# Server
The server is super basic for now as there isn't much needs.
For this reason it's a just a single file server coded in vanila JS that doesn't need any compilation. That might change in the futur.
