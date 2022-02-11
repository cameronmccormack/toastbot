export function getHashtags(text: string): string[] {
    // priority order for hashtags is:
    // 1. non-channel hashtags (in order of appearance)
    // 2. channel names (in order of appearance)
    const nonChannelHastags = text.match(/(?<=\B#)\w*[A-Za-z0-9_-]\w*\b(?!#)/g) ?? [];
    const channelHashtags = (text.match(/(?<=\B<#[CDG])[^<>@]*(?=>)/g) ?? [])
        .map(channel => {
            const splitTag = channel.split('|');
            if (splitTag.length < 2) {
                return null;
            } else {
                return splitTag[1];
            }
        })
        .filter(Boolean);
    return nonChannelHastags.concat(channelHashtags);
}
