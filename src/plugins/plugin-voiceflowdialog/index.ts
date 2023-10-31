import { VoiceflowDialogPlugin, VoiceflowDialogPluginConfig } from './VoiceFlowDialogPlugin';

declare module '@jovotech/framework/dist/types/Extensible' {
  interface ExtensiblePluginConfig {
    VoiceflowDialogPlugin?: VoiceflowDialogPluginConfig;
  }

  interface ExtensiblePlugins {
    VoiceflowDialogPlugin?: VoiceflowDialogPlugin;
  }
}

export * from './interfaces';
export * from './VoiceFlowDialogPlugin';
