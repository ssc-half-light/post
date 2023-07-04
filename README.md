# post
Create in-memory post objects. This does not handle persistence.

We create an object with two fields, `metadata` and `content`. This way we can keep a merkle-list of posts without concern of what the content is in the posts. The content can be encrypted or deleted, and either way, the merkle list of metadata would still be valid.

```ts
{
  metadata: {
    seq: number,
    prev: string|null,  // <- hash of previous `metadata`
    username: string,
    timestamp: number,
    proof: string   // <- a hash of the content
    signature: string,
    author: string,  // <- the DID of the author device
  },
  content: {
    text:string,
    alt:string,
    mentions:string[]  // <- an array of hashes of blobs in this post
  }
}
```

## install
```
npm i -S @ssc-hermes/post
```

## example
You need to supply a Fission `Crypto` object, the hash of the previous message, the sequence of the current message, and the post content.

### create

```ts
import { create } from '@ssc-hermes/post'
import { WnfsPost } from '@ssc-hermes/wnfs-post'
const wn = self.oddjs  // `@oddjs/odd` is attached to `window` here
const wnfsPost = await WnfsPost.create(wn, { name: 'testing', creator: 'test' })

const file:File = document.querySelector('.file-input').files[0]

const post = await create(wnfsPost.crypto, file, {
    seq: 0,
    prev: null,  // `prev` should be a hash of the previous message
    text: 'a test post',
    username: wnfsPost.username,
    alt: 'testing'
})

/*
=> {
      metadata: {
        seq: number,
        prev: string|null,
        username: string,
        timestamp: number,
        proof: string
        signature: string,
        author: string,
      },
      content: { text:string, alt:string, mentions:string[] }
}
*/

// now do something with the post, and save the `file` somewhere.
// `mentions` is an array containing the hash of the file passed in
```

### getId
Get a URL-safe hash of this post. 

```js
import { getId } from '@ssc-hermes/post'
const id = getId(post)
// 5olZOzr5xalmGXTxATl4Ldt4V0Z2Z8OrD3KxLTj-ngU
```
