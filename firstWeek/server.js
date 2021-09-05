const http = require('http')

http.createServer((request, response) => {

    let body = []
    request.on('error', (err) => {
        console.error(err)
    })
        .on('data', (chunk) => {
            body.push(chunk.toString())
        })
        .on('end', () => {
            console.log("end from client:", body)
            //body = Buffer.concat(body).toString();

            response.writeHead(200, { 'Content-Type': 'text/html' })
            response.end('Hello from server')
        })



}).listen(8088, '127.0.0.1');