import { create as createMsg, SignedRequest } from '@ssc-hermes/message'
import { Crypto } from '@oddjs/odd'
import timestamp from 'monotonic-timestamp'
import { getHash, getHashFile } from '@ssc-hermes/util/hash'
import { blake3 } from '@noble/hashes/blake3'
import { toString } from 'uint8arrays/to-string'
import canon from 'json-canon'

export { verify } from '@ssc-hermes/message'

export interface Post {
    content: { text:string, alt:string, mentions: string[] },
}

interface NewPostArgs {
    text:string,
    username:string,
    alt:string,
    seq:number,
    prev:string|null,  // the hash of the previous message
    type:'public'|'private'
}

export interface Metadata {
    type:'public'|'private',
    timestamp: number,
    proof:string,
    seq: number,
    prev: string|null,
    username: string,
}

export type SignedMetadata = SignedRequest<Metadata>

export interface Content {
    text:string,
    alt:string,
    mentions:string[]
}

export async function createContent (
    file:File,
    { text, alt }:{text:string, alt:string}
):Promise<Content> {
    const mention = await getHashFile(file)
    return { text, alt, mentions: [mention] }
}

/**
 * Create new signed metadata and content objects. You need to figure out the
 * `prev` and `seq` args.
 * @param crypto {Crypto.Implementation} Fission crypto object
 * @param file {File} A file object, as from a browser, for the image that
 * goes with this post
 * @param args {NewPostArgs}
 * @returns {{ metadata:SignedMetaData, content:SignedContent }} The new post
 * with a signature
 */
export async function create (crypto:Crypto.Implementation, file:File, args:NewPostArgs):
Promise<{ metadata: SignedMetadata, content:Content }> {
    const { text, username, alt, seq, prev, type } = args

    // content is not signed
    // but we take its hash, and sign a message including the hash
    const content = await createContent(file, { text, alt })

    const metadata = await createMetadata(crypto, content, {
        username,
        seq,
        prev,
        type
    })

    return { metadata, content }
}

// need to create content first
export async function createMetadata (
    crypto:Crypto.Implementation,
    content:Content,
    args:{ username:string, seq:number, prev:string|null, type:'private'|'public' }
): Promise<SignedMetadata> {
    const { username, seq, prev, type } = args

    return createMsg(crypto, {
        timestamp: timestamp(),
        seq,
        prev,
        type,
        username,
        proof: getId(content)
    })
}

export async function createFromBuffer (crypto:Crypto.Implementation, buf:Uint8Array,
    args:NewPostArgs):Promise<{metadata:SignedMetadata, content:Content}> {
    const { text, username, alt, seq, prev, type } = args

    const content = { text, alt, mentions: [getHash(buf)] }

    return {
        metadata: await createMetadata(crypto, content, {
            username,
            seq,
            prev,
            type,
        }),
        content
    }
}

export function getId (msg:object):string {
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
