import { Request, Response } from 'express';

export const help = (req: Request, res: Response): Response => {
    return res.status(200).json({ text: helpText });
};

const helpText = '*Toast Help*\n\n'
    + 'To make a toast, use the following syntax: '
    + '`/toast @name1 @name2 [untagged toastee] great work on the thing #wahey`\n\n'
    + '*Slash command:* Your toast must start with the `/toast` slash command.\n\n'
    + '*Toastees:* After the slash command, you may add one or more toastees separated by spaces. '
    + 'Toastees can either be tagged Slack users or non-tagged toastees contained within square brackets.\n\n'
    + '*Toast:* After the toastees, the rest of the message will be sent as the toast. This message may contain '
    + 'hashtags (channel names also work as hashtags). If hashtags are included, Toastbot will search for an '
    + 'appropriate GIF. The priority order is non-channel hashtags in order of appearance followed by channel names '
    + 'in order of appearance.';
