import { WebClient } from '@slack/web-api';
import { config } from '../config';

export const client = new WebClient(config.slackToken);
