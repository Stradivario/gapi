import { InjectionToken } from '@gapi/core';
import { OpenAIApi } from 'openai';

export const OpenAI = new InjectionToken<OpenAI>('open-ai');

export type OpenAI = OpenAIApi;
