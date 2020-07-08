# spotify-stats

Check your Spotify top tracks and artists in your terminal.

### Install

So far no plans to put this in npm.

```shell
$ git clone git@github.com:ricomonster/spotify-stats-cli.git
$ cd spotify-stats-cli
$ npm i
$ npm link
```

### Configure

In order to use the CLI app, secure first a client ID and secret keys from [https://developer.spotify.com/](https://developer.spotify.com/).

Please set `http://localhost:5000/callback` as Redirect URI's in the App Settings.

Once you have those keys, configure it to save those keys in your machine.

```shell
$ spotify-stats configure --clientId [your client id key] --clientSecret [your client secret key]
```

### Login

In order to access your Spotify account, perform the login command. This will open up a browser to sign in to your account and permits the application to access your Spotify account.

```shell
$ spotify-stats login
```

Once everything is complete, you can now track your top artists and songs in your terminal.

### License

Licensed under MIT. See [LICENSE](LICENSE) for more information.

### Issues

Report a bug in issues.
