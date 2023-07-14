<h1 align="center">
	<a>
		<img align="center"
			width="600"
			alt="Logo"
			src="https://cdn.anolet.com/logos/longform/color/LongFormSideBlack80.png">
	</a>
</h1>

# Anolet API Internal Documentation

## Setting up for the first time
### Setting up Doppler
#### Signing up for Doppler
All Anolet services use Doppler to manage environment variables. To get access to Anolet's Doppler workplace, [sign up to Doppler](https://dashboard.doppler.com/register) with your @anolet.com email. You will be prompted to create your own Doppler workplace. Click "Skip" located in the top right. Then, ask Rus to grant you permissions. You will be added as a collaborator and will be able to view secrets for `dev`.
#### Downloading Doppler CLI
Run the following commands:
```shell
mkdir -p $HOME/bin
curl -Ls --tlsv1.2 --proto "=https" --retry 3 https://cli.doppler.com/install.sh | sh -s -- --install-path $HOME/bin
```
Now, verify the Doppler CLI was installed by checking its version:
```shell
doppler -v
```
#### Authenticating Doppler CLI
Now, you will have to authenticate Doppler CLI with your Doppler account by running:
```shell
doppler login
```
You will only have to do this part once for all of Anolet, so you will not need to reinstall Doppler CLI or relogin if you are working on the API.
#### Linking Doppler
Now, you'll need to configure this folder to use the Doppler configuration for the dev@client project:
```shell
doppler setup
```
You'll see a message that says "Use default settings from repo config file (...)?". Answer yes.
You have now configured Doppler.

If you want to hange any environment variables for testing purposes, [create a branched config](https://docs.doppler.com/docs/branch-configs).

### Installing packages
Install all the NPM packages by running the following command:
```shell
npm i
```

## Starting in development mode

### Start the server
Start the node server with the following command:
```shell
npm run dev
```
This will automatically restart the server when server changes are made.
