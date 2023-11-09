/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  PluginConfig,
  Plugin,
  Extensible,
  Jovo,
  axios,
  InputType,
  JovoError,
  AxiosRequestConfig,
  SsmlUtilities,
} from '@jovotech/framework';

import { Action, IntentAction, LogLevel, ResponseConfig, VersionID } from './interfaces';

export interface VoiceflowDialogPluginConfig extends PluginConfig {
  dialogApiKey: string;
  useVoiceflowNlu: boolean;
  responseConfig: ResponseConfig;
  versionID: VersionID;
  logs?: boolean | LogLevel;
}

export class VoiceflowDialogPlugin extends Plugin<VoiceflowDialogPluginConfig> {
  getDefaultConfig(): VoiceflowDialogPluginConfig {
    return {
      dialogApiKey: '',
      useVoiceflowNlu: true,
      responseConfig: {
        tts: false,
        stripSSML: true,
        stopAll: true,
        excludeTypes: ['block', 'debug', 'flow', 'path'],
      },
      versionID: VersionID.Development,
    };
  }

  mount(parent: Extensible): Promise<void> | void {
    const middlewareName = this.config.useVoiceflowNlu
      ? 'before.interpretation.nlu'
      : 'after.interpretation.nlu';
    parent.middlewareCollection.use(middlewareName, async (jovo: Jovo) => {
      if (!jovo.$user.id) {
        throw new JovoError({
          message: `Can not send request to Voiceflow Dialog API. user ID is missing.`,
        });
      }

      if (!this.config.dialogApiKey) {
        throw new JovoError({
          message: `Can not send request to Voiceflow Dialog API. dialogApiKey is missing.`,
        });
      }

      const action = this.processInputAction(jovo);

      if (action) {
        jovo.$data.vfAction = action;
        const data = await this.postInteract(jovo.$user.id, action);
        jovo.$data.vfResponse = data;

        this.processOutput(jovo, data);

        const toSkip = [
          'interpretation.nlu',
          'after.interpretation.nlu',
          'before.interpretation.end',
          'interpretation.end',
          'after.interpretation.end',
          'before.dialogue.start',
          'dialogue.start',
          'after.dialogue.start',
          'before.dialogue.router',
          'dialogue.router',
          'after.dialogue.router',
          'before.dialogue.logic',
          'dialogue.logic',
          'after.dialogue.logic',
        ];

        // When useVoicefowNlu config is true, plugin runs at 'before.interpretation.nlu'
        // which prevents Jovo-configured NLU from running and forwards text to Dialog API.
        // Use the complete list of middlewares to skip including both 'interpretation.nlu' ones.
        //
        // When useVoicefowNlu config is false, plugin runs at 'after.interpretation.nlu'
        // which allows other Jovo-configured NLU to run to convert text into intent + entities.
        // Don't include the first two items in the toSkip array.
        jovo.$handleRequest.skipMiddlewares(...toSkip.slice(this.config.useVoiceflowNlu ? 0 : 2));
      }
    });
  }

  private processOutput(jovo: Jovo, data: any) {
    // loop through the response
    for (const trace of data) {
      switch (trace.type) {
        case 'text':
        case 'speak': {
          if (trace.payload.type === 'message') {
            const message = trace.payload.message;

            if (SsmlUtilities.isPlainText(message)) {
              jovo.$send(message);
            } else {
              jovo.$send({
                message: {
                  speech: message,
                  text: SsmlUtilities.removeSSML(message),
                },
              });
            }
          }

          if (trace.payload.type === 'audio') {
            jovo.$send({ message: { speech: `<audio src="${trace.payload.src}"/>` } });
          }

          break;
        }
        case 'visual': {
          jovo.$send({ card: { imageUrl: trace.payload.image, title: ' ' } });
          break;
        }
        case 'end': {
          // an end trace means the the Voiceflow dialog has ended
          jovo.$send({ listen: false });
          break;
        }
      }
    }
  }

  private processInputAction(jovo: Jovo): Action | undefined {
    const text = jovo.$input.getText()?.toLowerCase();
    const intentName = jovo.$input.getIntentName();

    if (jovo.$input.type === InputType.Launch) {
      return { type: 'launch' };
    }

    // process intent over text if present
    if (intentName) {
      const action: IntentAction = {
        type: 'intent',
        payload: {
          intent: { name: intentName },
          entities: [],
        },
      };

      const entities = jovo.getEntityMap();
      for (const [key, value] of Object.entries(entities)) {
        action.payload.entities?.push({ name: key, value: value?.resolved ?? value?.value ?? '' });
      }

      return action;
    }

    if (text) {
      return { type: 'text', payload: text };
    }

    jovo.$input.type = InputType.Error;
    return;
  }

  private async postInteract(userId: string, action: Action): Promise<any | undefined> {
    const options: AxiosRequestConfig = {
      method: 'POST',
      url: `https://general-runtime.voiceflow.com/state/user/${userId}/interact`,
      params: this.config.logs ? { logs: this.config.logs } : undefined,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': this.config.dialogApiKey,
        'VersionID': this.config.versionID,
      },
      data: {
        action,
        config: this.config.responseConfig,
      },
    };

    try {
      const response = await axios.request(options as AxiosRequestConfig);
      return response.data;
    } catch (error) {
      console.error(error);

      return;
    }
  }
}
