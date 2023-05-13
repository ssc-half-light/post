import { create as createMsg, SignedRequest } from '@ssc-hermes/message'
import { Crypto } from '@oddjs/odd'
import timestamp from 'monotonic-timestamp'
import { writeKeyToDid } from '@ssc-hermes/util'
import { getHash } from '@ssc-hermes/util/hash'

export interface Post {
    author: string,
    seq: number,
    prev: number,
    username: string,
    content: { type:string, text:string, alt:string, mentions: string[] }
    timestamp: number
}

interface NewPostArgs {
    text:string,
    username:string,
    alt:string,
    seq:number,
    prev:number
}

export type SignedPost = SignedRequest<Post>

/**
 * Create and sign a new post object. You need to figure out the `prev` and `seq`
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
    const { text, username, alt, seq, prev } = args

    return createMsg(crypto, {
        timestamp: timestamp(),
        author,
        seq,
        prev,
        username,
        content: {
            type: 'public',
            text,
            alt,
            mentions: [await getHash(file)]
        }
    })
}
