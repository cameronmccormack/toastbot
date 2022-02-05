import axios from 'axios';

const baseUrl = 'https://softwire.ontoast.io/hashtags/image/'

export async function getGifUrl(hashtags: string[]): Promise<string | undefined> {
    for (const hashtag of hashtags) {
        const url = baseUrl + hashtag;
        try {
            const gifResponse = await axios.get(url)
            if (gifResponse.status === 200) return url
        } catch {
            // This is an expected case - the user might make a hashtag that doesn't have a gif.
        }
    }
    return undefined;
}
