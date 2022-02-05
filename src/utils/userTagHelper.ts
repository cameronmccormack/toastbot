export const isUserTag = (possibleTag: string): boolean => possibleTag.startsWith('<@') && possibleTag.endsWith('>');

export function removeUsernames(text: string): string {
    return text.replace(
        /<@.*?>/g,
        function (x) { return x.split('|')[0] + '>'; }
    );
}