import { test } from 'tapzero'
// import { WnfsPost } from '@ssc-half-light/wnfs-post'
import { SignedMetadata, Content, create, getId, verify } from '../dist/index.js'

// @ts-ignore
const wn = self.oddjs

// let wnfsPost:WnfsPost

test('setup', async t => {
    const APP_INFO = { name: 'testing', creator: 'test' }
    // wnfsPost = await WnfsPost.create(wn, APP_INFO)
    // t.ok(wnfsPost, 'create a wnfs instance')
})

let post:{ metadata:SignedMetadata, content:Content }
test('create a post', async t => {
    const base64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAIAQMAAAD+wSzIAAAABlBMVEX///+/v7+jQ3Y5AAAADklEQVQI12P4AIX8EAgALgAD/aNpbtEAAAAASUVORK5CYII'
    const file = dataURItoFile(base64, 'test.png')
    post = await create(wnfsPost.crypto, file, {
        seq: 0,
        prev: null,
        text: 'a test post',
        username: wnfsPost.username,
        alt: 'testing'
    })

    t.ok(post, 'should return a post')
    t.equal(typeof post.metadata.proof, 'string',
        'should include a `proof` in metadata')
    t.equal(post.content.text, 'a test post', 'should have the right text')
    t.equal(typeof post.metadata.signature, 'string', 'should have a signature')
})

test('get an ID for a post', t => {
    const id = getId(post)
    console.log('**id**', id)
    // the id will be different each time because it contains a signature
    t.equal(typeof id, 'string', 'should create an ID as a string')
})

test('verify a post', async t => {
    const isValid = await verify(post.metadata)
    t.equal(isValid, true, 'should verify a valid post')
})

function dataURItoFile (dataurl, filename) {
    const arr = dataurl.split(',')
    const mime = arr[0].match(/:(.*?);/)[1]
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)

    while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
    }

    return new File([u8arr], filename, { type: mime })
}
