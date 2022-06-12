import { ChatPostMessageResponse } from '@slack/web-api';
import { client } from '../clients/slackClient';

export async function reactToPost(post: ChatPostMessageResponse, reactionName: string): Promise<void> {
    await client.reactions.add({
        channel: post.channel,
        name: reactionName,
        timestamp: post.ts,
    });
}
