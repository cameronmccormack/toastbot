export interface ParsedToast {
    toasteeTags: string[],
    toastText: string,
    hashtags: string[]
}

export interface ToastParsingErrorMessage {
    error: string
}
