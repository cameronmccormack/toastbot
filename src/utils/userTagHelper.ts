export const isUserTag = (possibleTag: string): boolean => /^<@U[\w|\s]*>$/.test(possibleTag);
export const isNonTaggedToastee = (possibleTag: string): boolean => /^\[[\w|\s-]*\[$/.test(possibleTag);

export function splitByToasteeTags(text: string): string[] {
    return text
        .split(/(<@U[\w|\s]*>)|(\[[\w|\s]*\])/g)
        .filter(Boolean);
}
