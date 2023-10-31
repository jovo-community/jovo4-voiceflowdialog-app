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
} from '@jovotech/framework';

import { Action, IntentAction, LogLevel, ResponseConfig, VersionID } from './interfaces';

export interface VoiceflowDialogPluginConfig extends PluginConfig {
  dialogApiKey: string;
  responseConfig: ResponseConfig;
  versionID: VersionID;
  logs?: boolean | LogLevel;
}

export class VoiceflowDialogPlugin extends Plugin<VoiceflowDialogPluginConfig> {
  getDefaultConfig(): VoiceflowDialogPluginConfig {
    return {
      dialogApiKey: '',
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
    parent.middlewareCollection.use('after.interpretation.nlu', async (jovo: Jovo) => {
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
        const data = await this.postInteract(jovo.$user.id, action);
        jovo.$data.voiceflow = data;

        this.processOutput(jovo, data);

        jovo.$handleRequest.skipMiddlewares(
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
        );
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
            jovo.$send(trace.payload.message);
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

    if (text) {
      return { type: 'text', payload: text };
    }

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
