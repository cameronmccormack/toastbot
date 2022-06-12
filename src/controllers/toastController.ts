import { Request, Response } from 'express';
import { makeSelfToast, makeToast } from '../services/toastService';
import { reactToPost } from '../services/reactionService';
import { parseText } from '../utils/toastParser';

const toastChannelId = process.env.TOAST_CHANNEL_ID;
const ownerId = process.env.OWNER_ID;
const verificationToken = process.env.SLACK_VERIFICATION_TOKEN;
const isInMaintenanceMode = process.env.MAINTENANCE_MODE.trim() === 'true';
const maintenanceBypassUserIds = process.env.MAINTENANCE_BYPASS_USER_IDS
    ? process.env.MAINTENANCE_BYPASS_USER_IDS.trim().split(',')
    : [];

const maintenanceMessage = 'Sorry, Toastbot is currently in maintenance mode. '
    + `Please try again later or, if this is unexpected, contact <@${ownerId}>.`;

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
        // TODO TOASTBOT-2: send user a something went wrong message using webhook if makeToast fails
    }

    const reactToToastPromise = reactToPost(primaryToast, 'toastbot');
    const selfToastPromise = (parsedText.toasteeTags.some(tag => tag.includes(toasterId)))
        ? makeSelfToast(toasterId)
        : Promise.resolve();

    await Promise.allSettled([reactToToastPromise, selfToastPromise]);
};

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
