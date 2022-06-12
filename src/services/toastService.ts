import { ChatPostMessageResponse } from '@slack/web-api';
import { client } from '../clients/slackClient';
import { ParsedToast } from '../models/parsedToast';
import { getGifUrl } from '../utils/gifHelper';
import { reactToPost } from './reactionService';

const toastChannelId = process.env.TOAST_CHANNEL_ID;

export async function makeToast(toasterId: string, parsedToast: ParsedToast): Promise<ChatPostMessageResponse> {
    const gifUrl = await getGifUrl(parsedToast.hashtags);
    return await client.chat.postMessage({
        text: `<@${toasterId}> toasted ${joinToastees(parsedToast.toasteeTags)}`,
        attachments: [
            {
                text: parsedToast.toastText,
                image_url: gifUrl ?? undefined,
            },
        ],
        channel: toastChannelId,
    });
}

export async function makeSelfToast(toasterId: string): Promise<void> {
    const selfToastPost = await client.chat.postMessage({
        text: `<@${toasterId}> self-toasted <@${toasterId}>`,
        attachments: [
            {
                text: 'I just toasted myself! #selfpraise',
                image_url: await getGifUrl(['selfpraise']) ?? undefined,
            },
        ],
        channel: toastChannelId,
    });

    if (!!selfToastPost.ok || !!selfToastPost.channel || !!selfToastPost.ts) {
        await reactToPost(selfToastPost, 'selfie');
    }
}

// TODO this shouldn't be in the service
function joinToastees(toastees: string[]): string {
    if (toastees.length === 1) {
        return toastees[0];
    } else {
        return `${toastees.slice(0, -1).join(', ')} and ${toastees.at(-1)}`;
    }
}