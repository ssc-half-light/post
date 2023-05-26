import { create as createMsg, SignedRequest } from '@ssc-hermes/message'
import { Crypto } from '@oddjs/odd'
import timestamp from 'monotonic-timestamp'
import { writeKeyToDid } from '@ssc-hermes/util'
import { getHash, getHashFile } from '@ssc-hermes/util/hash'
import { blake3 } from '@noble/hashes/blake3'
import { toString } from 'uint8arrays/to-string'
import canon from 'json-canon'

export { verify } from '@ssc-hermes/message'

export interface Post {
    seq: number,
    prev: string|null,
    username: string,
    content: { type:string, text:string, alt:string, mentions: string[] }
    timestamp: number
}

interface NewPostArgs {
    text:string,
    username:string,
    alt:string,
    seq:number,
    prev:string|null,  // the hash of the previous message
    type:'public'|'private'
}

export type SignedPost = SignedRequest<Post>

/**
 * Create a signed new post object. You need to figure out the `prev` and `seq`
 * args.
 * @param crypto {Crypto.Implementation} Fission crypto object
 * @param file {File} A file object, as from a browser, for the image that
 * goes with this post
 * @param args {NewPostArgs}
 * @returns {SignedPost} The new post with a signature
 */
export async function create (crypto:Crypto.Implementation, file:File, args:NewPostArgs):
Promise<SignedPost> {
    const author = await writeKeyToDid(crypto)
    const { text, username, alt, seq, prev, type } = args

    return createMsg(crypto, {
        timestamp: timestamp(),
        author,
        seq,
        prev,
        username,
        content: {
            type,
            text,
            alt,
            mentions: [await getHashFile(file)]
        }
    })
}

export async function createFromBuffer (crypto:Crypto.Implementation, arr:Uint8Array,
    args:NewPostArgs):Promise<SignedPost> {
    const author = await writeKeyToDid(crypto)
    const { text, username, alt, seq, prev, type } = args

    return createMsg(crypto, {
        timestamp: timestamp(),
        author,
        seq,
        prev,
        username,
        content: {
            type,
            text,
            alt,
            mentions: [getHash(arr)]
        }
    })
}

export function getId (msg:SignedPost):string {
    const hash = blake3(canon(msg))
    const slugifiedHash = toString(hash, 'base64url')
    return slugifiedHash
}

// https://github.com/ssbc/ssb2-discussion-forum/issues/22#issuecomment-1513622620
// {
//     "content": {
//       "text": "Hello world!",
//       "when": 1681842582086 // optional
//     },
//     "metadata": {
//       // hashes the `content` (encoded as alphabetically-sorted JSON with no spaces nor newlines)
//       "hash": "9R7XmBhHF5ooPg34j9TQcz",
//       "size": 23, // size of the `content` (same encoding as above)
//       "tangles": {
//         // this is the feed's "root msg" ID, but there may be more tangles
//         "3F26EgnwbMHm1EEeeVM1Eb": {
//           "depth": 1,
//           "prev": [
//             "3F26EgnwbMHm1EEeeVM1Eb"
//           ]
//         }
//       },
//       "type": "post",
//       "v": 1, // feed format version, so far hard-coded at 1
//       "who": "4mjQ5aJu378cEu6TksRG3uXAiKFiwGjYQtWAjfVjDAJW"
//     },
//     // Signs the `metadata` (encoded as alphabetically-sorted JSON with no spaces nor newlines)
//     "sig": "5abJdD6RRCsWXKJLaEKRhUb1HKh4aKPFteFRgUBfyJD4cFzo5MVaMdWbwM2CfpNRFSjR9NkczRL2LcSyQVThYnRr"
//   }
