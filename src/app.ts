import { App } from '@jovotech/framework';

import { VersionID, VoiceflowDialogPlugin } from './plugins/plugin-voiceflowdialog';

/*
|--------------------------------------------------------------------------
| APP CONFIGURATION
|--------------------------------------------------------------------------
|
| All relevant components, plugins, and configurations for your Jovo app
| Learn more here: www.jovo.tech/docs/app-config
|
*/
const app = new App({
  /*
  |--------------------------------------------------------------------------
  | Components
  |--------------------------------------------------------------------------
  |
  | Components contain the Jovo app logic
  | Learn more here: www.jovo.tech/docs/components
  |
  */
  // components: [GlobalComponent, LoveHatePizzaComponent],
  components: [],

  /*
  |--------------------------------------------------------------------------
  | Plugins
  |--------------------------------------------------------------------------
  |
  | Includes platforms, database integrations, third-party plugins, and more
  | Learn more here: www.jovo.tech/marketplace
  |
  */
  plugins: [
    new VoiceflowDialogPlugin({
      dialogApiKey: '** SET API KEY HERE **',
      // responseConfig: {
      //   tts: false,
      //   stripSSML: true,
      //   stopAll: true,
      //   excludeTypes: ['block', 'debug', 'flow', 'path'],
      // },
      // versionID: VersionID.Production,
    }),
  ],

  /*
  |--------------------------------------------------------------------------
  | Other options
  |--------------------------------------------------------------------------
  |
  | Includes all other configuration options like logging
  | Learn more here: www.jovo.tech/docs/app-config
  |
  */
  logging: true,
});

export { app };
