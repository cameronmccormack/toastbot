import { Request, Response } from 'express'
import { WebClient } from '@slack/web-api';

const token = process.env.SLACK_TOKEN;
const toastChannelId = process.env.TOAST_CHANNEL_ID
const client = new WebClient(token);

const untaggedToastError = 'Sorry, Toastbot doesn\'t yet support untagged toasts. '
    + 'Your toast must begin with one or more tagged Slack users.'
const missingMessageError = 'It looks like you didn\'t include a Toast message. Please try again.';

export const toast = async (req: Request, res: Response): Promise<Response> => {
    const toasterId = req.body.user_id;
    const { text } = req.body;

    const parsedText = parseText(text)
    if ('error' in parsedText) {
        return res.status(200).json({ text: parsedText.error }).send()
    }

    // TODO: add a GIF too
    await client.chat.postMessage({
        text: `<@${toasterId}> toasted ${parsedText.toasteeTags.join(' ')}`,
        attachments: [
            {
                text: parsedText.toastText,
            }
        ],
        channel: toastChannelId,
    });

    return res.status(200).json({ text: `Ok! I have toasted in the <#${toastChannelId}> channel. Thanks for using Toastbot!` }).send();
}

function parseText(text: string): ParsedToast | ErrorMessage {
    const trimmedText = text.trim()

    if (!trimmedText.startsWith('<@')) return { error: untaggedToastError };

    const words = trimmedText.split(' ');
    const firstWordOfToast = words.find(word => !isUserTag(word) && word !== ' ')
    if (!firstWordOfToast) return { error: missingMessageError };

    const indexOfFirstWord = words.indexOf(firstWordOfToast);
    const toasteeTags = words.slice(0, indexOfFirstWord).filter(x => x !== ' ');
    if (toasteeTags.length === 0) return { error: untaggedToastError };

    const toastText = words.slice(indexOfFirstWord).join(' ');
    if (toastText.trim().length === 0) return { error: missingMessageError };

    return { toasteeTags, toastText };
}

const isUserTag = (possibleTag: string): boolean => possibleTag.startsWith('<@') && possibleTag.endsWith('>');

interface ErrorMessage {
    error: string
}

interface ParsedToast {
    toasteeTags: string[],
    toastText: string
}
