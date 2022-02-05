import { Request, Response } from 'express';
import { WebClient } from '@slack/web-api';
import * as _ from 'lodash';
import { isUserTag, removeUsernames } from '../utils/userTagHelper';
import { getHashtags } from '../utils/hashtagHelper';
import { getGifUrl } from '../utils/gifHelper';

const token = process.env.SLACK_TOKEN;
const toastChannelId = process.env.TOAST_CHANNEL_ID;
const verificationToken = process.env.SLACK_VERIFICATION_TOKEN;
const client = new WebClient(token);

const untaggedToastError = 'Sorry, Toastbot doesn\'t yet support untagged toasts. '
    + 'Your toast must begin with one or more tagged Slack users.'
const missingMessageError = 'It looks like you didn\'t include a Toast message. Please try again.';

export const toast = async (req: Request, res: Response): Promise<Response> => {
    // TODO: make signature hash check work
    //if (!isValidRequest(req)) return res.status(400).send();

    // TODO: delete this deprecated check method once the signature hash check works
    if (req.body.token !== verificationToken) return res.status(400).send();

    const toasterId = req.body.user_id;
    const { text } = req.body;

    const parsedText = parseText(text)
    if ('error' in parsedText) {
        // This has to be a 200 for Slack to show it to the user, even though this is an
        // invalid user input case
        return res.status(200).json({ text: parsedText.error });
    }

    // Need to send this now to stop slack treating as a 3000ms timeout
    res.status(200).json({
        text: `Ok! I'll send a toast to the <#${toastChannelId}> channel. Thanks for using Toastbot!`
    })

    // TODO: consider more parallelisation
    await makeToast(toasterId, parsedText);
    if (parsedText.toasteeTags.some(tag => tag.includes(toasterId))) {
        await makeSelfToast(toasterId)
    }

    // TODO: send user a something went wrong message if makeToast fails
}

async function makeToast(toasterId: string, parsedToast: ParsedToast): Promise<void> {
    const gifUrl = await getGifUrl(parsedToast.hashtags);
    const toastPost = await client.chat.postMessage({
        text: `<@${toasterId}> toasted ${parsedToast.toasteeTags.join(' ')}`,
        attachments: [
            {
                text: parsedToast.toastText,
                image_url: gifUrl,
            }
        ],
        channel: toastChannelId,
    });

    await client.reactions.add({
        channel: toastPost.channel,
        name: 'toastbot',
        timestamp: toastPost.ts
    });
}

async function makeSelfToast(toasterId: string): Promise<void> {
    const selfToastPost = await client.chat.postMessage({
        text: `<@${toasterId}> self-toasted <@${toasterId}>`,
        attachments: [
            {
                text: 'I just toasted myself! #selfpraise',
                image_url: await getGifUrl(['selfpraise']),
            }
        ],
        channel: toastChannelId,
    });
    await client.reactions.add({
        channel: selfToastPost.channel,
        name: 'selfie',
        timestamp: selfToastPost.ts
    });
}

function parseText(text: string): ParsedToast | ErrorMessage {
    // TODO: update and refactor the logic in this method to allow non-tagged toastees
    // (including those with spaces in their names)

    const trimmedText = text.trim();

    if (!trimmedText.startsWith('<@')) return { error: untaggedToastError };

    // Slack user tags can come in the form <@U123456789|username>.
    // Only the ID (the first part) is required for the tag to work.
    // If the username has a space in it, it will break the logic below, so
    // we strip off the usernames first as they are unnecessary.
    const textWithoutUsernames = removeUsernames(trimmedText);

    const words = textWithoutUsernames.split(' ');
    const firstWordOfToast = words.find(word => !isUserTag(word) && word !== ' ')
    if (!firstWordOfToast) return { error: missingMessageError };

    const indexOfFirstWord = words.indexOf(firstWordOfToast);
    const toasteeTags = _.uniq(
        words.slice(0, indexOfFirstWord).filter(x => x !== ' ')
    );
    if (toasteeTags.length === 0) return { error: untaggedToastError };

    const toastText = words.slice(indexOfFirstWord).join(' ');
    if (toastText.trim().length === 0) return { error: missingMessageError };

    return {
        toasteeTags: toasteeTags,
        toastText: toastText,
        hashtags: getHashtags(toastText)
    };
}

// TODO make this work
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
