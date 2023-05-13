# post
Create post objects

## install
```
npm i -S @ssc-hermes/post
```

## example
```ts
const wnfsPost = await WnfsPost.create(wn, { name: 'testing', creator: 'test' })

const file:File = document.querySelector('file-input').files[0]

const post = await create(wnfsPost.crypto, file, {
    seq: 0,
    prev: null,
    text: 'a test post',
    username: wnfsPost.username,
    alt: 'testing'
})

// now do something with the post, and save the `file` somewhere
// `mentions` is an array containing the hash of the file passed in

// => {
//     author: string,
//     seq: number,
//     prev: number|null,
//     username: string,
//     content: { type:string, text:string, alt:string, mentions: string[] }
//     timestamp: number,
//     signature: string
// }
```
