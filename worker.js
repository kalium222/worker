// return the file on /path/to/file
// list file on /music?prefix=...&limit=...
export default {
    async fetch(request, env) {
        const url = new URL(request.url)
        const path = url.pathname
        switch (request.method) {
            case "GET": {
                const prefix = url.searchParams.get('prefix') || ''
                const limit = Math.min(parseInt(url.searchParams.get('limit')) || 10, 500)
                if (path === '/music')
                    return await listFile(env.MUSIC, prefix, limit)
                else {
                    const key = decodeURIComponent(path.slice(1));
                    return await getFile(env.MUSIC, key)
                }
            }
            default:
                return new Response("Method Not Allowed", {
                    status: 405,
                    headers: {
                        Allow: "GET",
                    },
                })
        }
    }
};

async function listFile(bucket, prefix, limit) {
    const r2objects = await bucket.list({ prefix, limit })
    const keys = r2objects.objects.map(obj => obj.key)
    const body = keys.join('\n')
    const headers = new Headers()
    return new Response(body, {
        status: 200,
        headers,
    })
}

async function getFile(bucket, key) {
    const r2object = await bucket.get(key)
    if (r2object === null)
        return new Response('Not Found', { status: 404 })
    const headers = new Headers();
    r2object.writeHttpMetadata(headers);
    headers.set("etag", r2object.httpEtag);
    return new Response(r2object.body, {
        status: 200,
        headers,
    });
}
