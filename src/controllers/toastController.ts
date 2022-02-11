import { Request, Response } from 'express';
import { WebClient } from '@slack/web-api';
import * as _ from 'lodash';
import { isUserTag, splitByToasteeTags } from '../utils/userTagHelper';
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

const maintenanceMessage = 'Sorry, Toastbot is currently in maintenance mode. '
    + `Please try again later or, if this is unexpected, contact <@${ownerId}>.`;
const untaggedToastError = 'Sorry, Toastbot doesn\'t yet support untagged toasts. '
    + 'Your toast must begin with one or more tagged Slack users.';
const missingMessageError = 'It looks like you didn\'t include a Toast message. Please try again.';

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

    // TODO TOASTBOT-5: consider more parallelisation
    await makeToast(toasterId, parsedText);
    if (parsedText.toasteeTags.some(tag => tag.includes(toasterId))) {
        await makeSelfToast(toasterId);
    }

    // TODO TOASTBOT-2: send user a something went wrong message if makeToast fails
};

async function makeToast(toasterId: string, parsedToast: ParsedToast): Promise<void> {
    const gifUrl = await getGifUrl(parsedToast.hashtags);
    const toastPost = await client.chat.postMessage({
        text: `<@${toasterId}> toasted ${parsedToast.toasteeTags.join(' ')}`,
        attachments: [
            {
                text: parsedToast.toastText,
                image_url: gifUrl,
            },
        ],
        channel: toastChannelId,
    });

    await client.reactions.add({
        channel: toastPost.channel,
        name: 'toastbot',
        timestamp: toastPost.ts,
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
    await client.reactions.add({
        channel: selfToastPost.channel,
        name: 'selfie',
        timestamp: selfToastPost.ts,
    });
}

function parseText(text: string): ParsedToast | ErrorMessage {
    // TODO TOASTBOT-3: allow non-tagged toastees
    const trimmedText = text.trim();
    const splitText = splitByToasteeTags(trimmedText);

    if (splitText.length === 0) return { error: untaggedToastError };

    const toasteeTags: string[] = [];
    for (let i = 0; i < splitText.length; i++) {
        const word = splitText[i];
        if (isUserTag(word)) {
            toasteeTags.push(word);
        } else if (word.trim().length === 0) {
            // do nothing; ignore spaces between toastees
        } else {
            if (toasteeTags.length === 0) return { error: untaggedToastError };
            const toastText = splitText.slice(i).join();
            return {
                toasteeTags: _.uniq(toasteeTags),
                toastText: toastText,
                hashtags: getHashtags(toastText),
            };
        }
    }
    return { error: missingMessageError };
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

interface ErrorMessage {
    error: string
}

interface ParsedToast {
    toasteeTags: string[],
    toastText: string,
    hashtags: string[]
}
