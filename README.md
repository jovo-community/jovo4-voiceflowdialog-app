# Jovo v4 Template

[![Jovo Framework](https://www.jovo.tech/img/github-header.png)](https://www.jovo.tech)

<p>
<a href="https://www.jovo.tech" target="_blank">Website</a> -  <a href="https://www.jovo.tech/docs" target="_blank">Docs</a> - <a href="https://www.jovo.tech/marketplace" target="_blank">Marketplace</a> - <a href="https://github.com/jovotech/jovo-v4-template" target="_blank">Template</a>   
</p>

A sample [Jovo `v4`](https://www.jovo.tech) app that makes it possible to build experiences for voice and chat platforms.

This is the default template for the [`jovo new` command](https://www.jovo.tech/docs/new-command).

## Getting Started

> Learn more in Jovo docs: https://www.jovo.tech/docs/getting-started

You can install the new Jovo CLI like this:

```sh
# Install globally
$ npm install -g @jovotech/cli

# Test the installation
$ jovo -v
```

After successfully installing the Jovo CLI, you can install the template using the [`new` command](https://www.jovo.tech/docs/new-command):

```sh
$ jovo new <directory>
```

Change your working directory into your newly created project directory and [`run`](https://www.jovo.tech/docs/run-command) your Jovo app:

```sh
# Change working directory to your previously specified directory
$ cd <directory>

# Run local development server
$ jovo run
```

You can now open the Jovo Debugger with the `.` key.

## Voiceflow Dialog API

This sample app uses the Voiceflow Dialog API and the [Interact endpoint](https://developer.voiceflow.com/reference/stateinteract-1). All requests (Alexa, web chat, Jovo Debugger) are handled by the [VoiceflowDialogPlugin](./src/plugins/plugin-voiceflowdialog/VoiceflowDialogPlugin.ts).

The quickest way to test this is by setting the `dialogApiKey` in [app.ts](./src/app.ts) to an existing Voiceflow project and adding intents to the [/models/en.json](./models/en.json) file. Then use the Jovo Debugger as the test client.

To get you started, use this Voiceflow [clone link](https://creator.voiceflow.com/dashboard?import=654054d0bfefa7000746c7f3).

You can overwrite the default VoiceflowDialogPlugin config settings in [app.ts](./src/app.ts).

This sample uses Jovo's ability to accept various JSON request formats for different platforms (Alexa, web chat) and maps inputs to the Voiceflow Dialog API call. It then maps outputs from Voiceflow and converts them to the appropriate JSON response format.

Since Voiceflow is handling the logic, the following Jovo 4 features are not used and various steps in the middleware pipeline are skipped:
- Database
- Router
- Components