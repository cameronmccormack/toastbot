export const isTaggedToastee = (possibleTag: string): boolean => /^<@U[^<>@]*>$/.test(possibleTag);
export const isNonTaggedToastee = (possibleTag: string): boolean => /^\[[^[\]]*\]$/.test(possibleTag);

export const splitByToasteeTags = (text: string): string[] => text
    .split(/(<@U[^<>@]*>)|(\[[^[\]]*\])/g)
    .filter(Boolean);
