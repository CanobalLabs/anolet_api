<h1 align="center">
	<a>
		<img align="center"
			width="200"
			alt="Logo"
			src="https://anolet.com/assets/Logo-TransBGFullScale.png">
	</a>
</h1>

none of the below is accurate because a lot of things changed so ignore it
## .env Paramaters

| Parameter Name      | Description |
| ----------- | ----------- |
| DB_URI      | MongoDB Connection URI complete with Username and Password       |
| DISCORD_CLIENT_ID   | Client ID for Discord OAuth        |
| DISCORD_CLIENT_SECRET | Discord OAuth Client Secret |
| DISCORD_GUILD | ID number for the Discord Guild the bot should interact with |
| DISCORD_VERIFIED | Role ID for the verified role to be used for the Discord Bot account autolinking |
| BOT_TOKEN | Token for Discord Bot |
| TOKEN | JWT Signature used when signing logins |
| REDIS | Redis URI for connecting to the Redis database |
| ENVIRONMENT | Environment, "production", or "development" |

## Running Development Environment

To run in a developer environment, run ```npm run dev``` in the project folder to fire up a development environment with nodemon.
<br><br>
The environment will automatically restart when changes are made to the backend code.
<br><br>
To stop the development environment, press ```CTRL+C```.

## Running in Production

To run the platform in production mode, make sure the `ENVIRONMENT` is set to `production`, and then simply run ```npm start```. The server will need to be manually restarted when changes are made.

## Setting Up a MongoDB database

For storing users, circles, and more, Phexora uses MongoDB.
<br><br>
Create a MongoDB instance either locally or using a cloud provider such as MongoDB Cloud Atlas.
<br><br>
Onc you have created your instance, create a database named "platform". Then, set the `DB_URI` to the following, filling in the spots: `mongodb+srv://USERNAME:PASSWORD@DBURL/platform?retryWrites=true&w=majority`

## Creating a Redis Server

For caching and key/value stores, Redis is used. Create a Redis instance either locally or using a cloud provider such as Redis Enterprise or DigitalOcean Databases.
<br><br>
The only key you need to create is a `STRING` key named `"maintenance"`, and set it to either `"true"` (maintenance mode on) or `"false"` (maintenance mode off).
<br><br>
After you have created the key, set the `REDIS` env paramater to the following, filling in the spots:
`redis://USERNAME:PASSWORD@HOST:PORT`

## Setting the JWT token

The JWT token can be anything you would like it to be. Usually, I set `TOKEN` to `TEST` but you could set it to something random if you would like (including symbols, lowercase levels, numbers, etc).

## Discord Setup

To test out development of the Discord Bot, use the development bot in the testing server. (https://discord.gg/)
<br><br>
The development bot is free to be used by all platform developers to aide in the development while testing on your local machine.
<br><br>
This makes it easier so that every developer does not have to create a discord bot and set up OAuth.
<br><br>
To use the development bot and client, set the following ENV Parameters to the following values:
| Paramater Name | Value |
| ----------- | ----------- |
| DISCORD_CLIENT_ID   | TBD |
| DISCORD_CLIENT_SECRET | TBD |
| DISCORD_GUILD | TBD |
| DISCORD_VERIFIED | TBD |
| BOT_TOKEN | TBD |
