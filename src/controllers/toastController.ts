import { Request, Response } from 'express';
import { ChatPostMessageResponse, WebClient } from '@slack/web-api';
import { isNonTaggedToastee, isTaggedToastee, splitByToasteeTags } from '../utils/toasteeHelper';
import { getHashtags } from '../utils/hashtagHelper';
import { getGifUrl } from '../utils/gifHelper';

const token = process.env.SLACK_TOKEN;
const ownerId = process.env.OWNER_ID;
const toastChannelId = process.env.TOAST_CHANNEL_ID;
const verificationToken = process.env.SLACK_VERIFICATION_TOKEN;
const isInMaintenanceMode = process.env.MAINTENANCE_MODE.trim() === 'true';
const maintenanceBypassUserIds = process.env.MAINTENANCE_BYPASS_USER_IDS
    ? process.env.MAINTENANCE_BYPASS_USER_IDS.trim().split(',')
    : [];

const client = new WebClient(token);

interface ToastParsingErrorMessage {
    error: string
}

interface ParsedToast {
    toasteeTags: string[],
    toastText: string,
    hashtags: string[]
}

const maintenanceMessage = 'Sorry, Toastbot is currently in maintenance mode. '
    + `Please try again later or, if this is unexpected, contact <@${ownerId}>.`;
const noToasteeError = {
    error: 'Your toast must either start with a Slack user tagged with an @ or an untagged toastee in square brackets.',
};
const missingMessageError = {
    error: 'It looks like you didn\'t include a Toast message. Please try again.',
};

export const toast = async (req: Request, res: Response): Promise<Response> => {
    // TODO TOASTBOT-1: make signature hash check work
    //if (!isValidRequest(req)) return res.status(400).send();

    // TODO TOASTBOT-1: delete this deprecated check method once the signature hash check works
    if (req.body.token !== verificationToken) return res.status(400).send();

    const toasterId = req.body.user_id;
    const { text } = req.body;

    if (isInMaintenanceMode && !maintenanceBypassUserIds.some(userId => userId === toasterId)) {
        return res.status(200).json({
            text: maintenanceMessage,
        });
    }

    const parsedText = parseText(text);
    if ('error' in parsedText) {
        // This has to be a 200 for Slack to show it to the user, even though this is an
        // invalid user input case
        return res.status(200).json({ text: parsedText.error });
    }

    // Need to send this now to stop slack treating as a 3000ms timeout
    res.status(200).json({
        text: `Ok! I'll send a toast to the <#${toastChannelId}> channel. Thanks for using Toastbot!`,
    });

    // Ensure that the primary toast has been sent before any other actions
    const primaryToast = await makeToast(toasterId, parsedText);

    if (!primaryToast.ok || !primaryToast.channel || !primaryToast.ts) {
        // TODO TOASTBOT-2: send user a something went wrong message if makeToast fails
    }

    const reactToToastPromise = reactToPost(primaryToast, 'toastbot');
    const selfToastPromise = (parsedText.toasteeTags.some(tag => tag.includes(toasterId)))
        ? makeSelfToast(toasterId)
        : Promise.resolve();

    await Promise.allSettled([reactToToastPromise, selfToastPromise]);
};

async function makeToast(toasterId: string, parsedToast: ParsedToast): Promise<ChatPostMessageResponse> {
    const gifUrl = await getGifUrl(parsedToast.hashtags);
    return await client.chat.postMessage({
        text: `<@${toasterId}> toasted ${joinToastees(parsedToast.toasteeTags)}`,
        attachments: [
            {
                text: parsedToast.toastText,
                image_url: gifUrl,
            },
        ],
        channel: toastChannelId,
    });
}

async function makeSelfToast(toasterId: string): Promise<void> {
    const selfToastPost = await client.chat.postMessage({
        text: `<@${toasterId}> self-toasted <@${toasterId}>`,
        attachments: [
            {
                text: 'I just toasted myself! #selfpraise',
                image_url: await getGifUrl(['selfpraise']),
            },
        ],
        channel: toastChannelId,
    });

    if (!!selfToastPost.ok || !!selfToastPost.channel || !!selfToastPost.ts) {
        await reactToPost(selfToastPost, 'selfie');
    }
}

async function reactToPost(post: ChatPostMessageResponse, reactionName: string): Promise<void> {
    await client.reactions.add({
        channel: post.channel,
        name: reactionName,
        timestamp: post.ts,
    });
}

function parseText(text: string): ParsedToast | ToastParsingErrorMessage {
    const trimmedText = text.trim();
    const splitText = splitByToasteeTags(trimmedText);

    if (splitText.length === 0) return noToasteeError;

    const toasteeTags: string[] = [];
    for (let i = 0; i < splitText.length; i++) {
        const word = splitText[i];
        if (isTaggedToastee(word)) {
            toasteeTags.push(word);
        } else if (isNonTaggedToastee(word)) {
            toasteeTags.push(`\`${word.slice(1, word.length - 1)}\``);
        } else if (word.trim().length === 0) {
            // do nothing; ignore spaces between toastees
        } else {
            if (toasteeTags.length === 0) return noToasteeError;
            const toastText = splitText.slice(i).join();
            return {
                toasteeTags: [...new Set(toasteeTags)],
                toastText: toastText,
                hashtags: getHashtags(toastText),
            };
        }
    }
    return missingMessageError;
}

function joinToastees(toastees: string[]): string {
    if (toastees.length === 1) {
        return toastees[0];
    } else {
        return `${toastees.slice(0, -1).join(', ')} and ${toastees.at(-1)}`;
    }
}

// TODO TOASTBOT-1: make this work
/*function isValidRequest(req: Request): boolean {
    // Protect against replay attacks by rejecting if timestamp over a minute old
    const requestUnixSeconds = parseInt(
        req.get('X-Slack-Request-Timestamp')
    );
    const nowUnixSeconds = Math.floor(Date.now() / 1000)
    if (requestUnixSeconds < nowUnixSeconds - 60) return false;

    // Verify signing secret
    const signatureBaseString = `v0:${requestUnixSeconds}:${req.body}}`;
    const generatedSignature = createHmac('sha256', signingSecret)
        .update(signatureBaseString)
        .digest('hex');
    const fullGeneratedSignature = `v0=${generatedSignature}`;
    const slackSignature = req.get('X-Slack-Signature');
    logger.info(fullGeneratedSignature)
    logger.info(slackSignature);

    return true;
}*/
