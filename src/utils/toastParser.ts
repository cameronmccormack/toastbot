import { ParsedToast } from '../models/parsedToast';
import { ToastParsingError } from '../models/toastParsingError';
import { getHashtags } from './hashtagHelper';
import { splitByToasteeTags, isTaggedToastee, isNonTaggedToastee } from './toasteeHelper';

const noToasteeError = {
    error: 'Your toast must either start with a Slack user tagged with an @ or an untagged toastee in square brackets.',
};
const missingMessageError = {
    error: 'It looks like you didn\'t include a Toast message. Please try again.',
};

export function parseText(text: string): ParsedToast | ToastParsingError {
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