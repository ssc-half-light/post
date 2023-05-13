import { test } from 'tapzero'
import { WnfsPost } from '@ssc-hermes/wnfs-post'
import { create } from '../dist/index.js'

// @ts-ignore
const wn = self.oddjs

let wnfsPost:WnfsPost

test('setup', async t => {
    const APP_INFO = { name: 'testing', creator: 'test' }
    wnfsPost = await WnfsPost.create(wn, APP_INFO)
    t.ok(wnfsPost, 'create a wnfs instance')
})

test('create a post', async t => {
    const base64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAIAQMAAAD+wSzIAAAABlBMVEX///+/v7+jQ3Y5AAAADklEQVQI12P4AIX8EAgALgAD/aNpbtEAAAAASUVORK5CYII'
    const file = dataURItoFile(base64, 'test.png')
    const post = await create(wnfsPost.crypto, file, {
        seq: 0,
        prev: null,
        text: 'a test post',
        username: wnfsPost.username,
        alt: 'testing'
    })

    t.ok(post, 'should return a post')
    t.equal(post.content.text, 'a test post', 'should have the right text')
    t.equal(typeof post.signature, 'string', 'should have a signature')
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
