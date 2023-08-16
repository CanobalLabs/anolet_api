const axios = require('axios');
const {test, expect, describe, it} = require('@jest/globals');

const baseurl = process.env.PUBLISHED_URL;

test("Connect to server, should return 404 on /", async () => {
    await axios.get(baseurl + "/").catch(err => expect(err.response.status).toEqual(404));
});

let token = "YT/XK1ctsfM7FI~0ca21f4745e543b498d7e4a390b8eb730b69d60ec54aa56e05cb7802c1262422186726f1f61b325b802c1c52630679dca51bcde21a8403d2b115efd6444139a870288d6c117c0fdcc5746183cc0cc4ae8b2da5e64469942c4ead13e9d8adb6c70850822c7f6b94b7c6c6b1c7b09e9b6f094e4c841efbd2273a626b06ad1b037c69302922f69c03a6ed1b0d";

describe('Gang Endpoints', () => {
    it('GET /gang/s should show 0-20 gangs', async () => {
        const res = await axios.get(baseurl + '/gang/s');
        expect(res.status).toEqual(200);
        expect(res.data.length).toBeLessThanOrEqual(20);
        expect(res.data).toEqual(expect.arrayContaining([
            expect.objectContaining({
                id: expect.any(String),
                realName: expect.any(String),
                displayName: expect.any(String),
                description: expect.any(String),
                visible: expect.any(Boolean),
                security: expect.stringMatching(/^(public|apply|invite)$/),
                owner: expect.any(String),
                iconUploaded: expect.any(Boolean),
                bannerUploaded: expect.any(Boolean),
            })
        ]));
    });

    it('POST /gang/ should create a gang', async () => {
        const res = await axios({
            url: baseurl + '/gang/',
            method: 'POST',
            data: {
                realName: "tg",
                displayName: "Test Gang",
                description: "Test Gang",
                security: "public",
            },
            headers: {
                "Authorization": "Bearer " + token,
            }
        });

        expect(res.status).toEqual(201);
        expect(res.data).toEqual(expect.objectContaining({
            id: expect.any(String),
            realName: "tg",
            displayName: "Test Gang",
            description: "Test Gang",
            visible: true,
            security: "public",
            owner: expect.any(String),
            iconUploaded: false,
            bannerUploaded: false,
        }));
    });
});
