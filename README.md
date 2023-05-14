# post
Create post objects

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

// => {
//     author: string,
//     seq: number,
//     prev: string|null,
//     username: string,
//     content: { type:string, text:string, alt:string, mentions: string[] }
//     timestamp: number,
//     signature: string
// }

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
