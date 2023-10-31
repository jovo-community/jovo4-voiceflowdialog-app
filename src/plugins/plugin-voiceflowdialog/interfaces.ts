export interface LaunchAction {
  type: 'launch';
}

export interface TextAction {
  type: 'text';
  payload: string;
}

export interface IntentAction {
  type: 'intent';
  payload: IntentPayload;
}

export type Action = LaunchAction | TextAction | IntentAction;

export interface IntentPayload {
  intent: Intent;
  query?: string;
  entities?: Entity[];
  confidence?: number;
}

export interface Intent {
  name: string;
}

export interface Entity {
  name: string;
  value: string;
  query?: string;
  verboseValue?: VerboseValue[];
}

export interface VerboseValue {
  canonicalText: string;
  rawText: string;
  startIndex: number;
}

export interface ResponseConfig {
  tts?: boolean;
  stripSSML?: boolean;
  stopAll?: boolean;
  stopTypes?: string[];
  excludeTypes?: string[];
}

export interface RequestMetadata {
  userID: string;
  verbose?: boolean;
  logs?: boolean;
}

export enum VersionID {
  Development = 'development',
  Production = 'production',
}

export enum LogLevel {
  Off = 'off',
  Verbose = 'verbose',
  Info = 'info',
  Warn = 'warn',
  Error = 'error',
}
