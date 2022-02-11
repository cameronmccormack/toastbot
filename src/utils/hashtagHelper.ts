export const getHashtags = (text: string): string[] =>
    text.match(/(?<=\B#)\w*[A-Za-z0-9_-]\w*\b(?!#)/g) ?? [];
