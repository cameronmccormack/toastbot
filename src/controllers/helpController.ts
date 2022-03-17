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
    + 'in order of appearance.\n\n'
    + '*Error Messages*\n\n'
    + 'If you see the error message `/toast failed with the error "operation_timeout"`, this means that Toastbot has '
    + 'taken longer than Slack\'s required 3000ms to respond to the slash command. This is probably due to a Heroku '
    + 'cold start and will be fixed in the near future! If you see this message, your toast will probably still work '
    + 'fine - wait 20 seconds or so before trying again.';
