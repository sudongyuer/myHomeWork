const http = require("http");

http
  .createServer((request, response) => {
    const body = [];
    request
      .on("error", err => {
        console.error(err);
      })
      .on("data", chunk => {
        body.push(chunk.toString());
      })
      .on("end", () => {
        console.log("end from client:", body);
        // body = Buffer.concat(body).toString();

        response.writeHead(200, { "Content-Type": "text/plain" });

        const myHtml = `<html maaa=a >
      <head>
          <style>
        #container {
            width:500px;
            height:300px;
            display:flex;
        }
        #container #myid {
            width:200px;
        }

        #container .c1 {
            flex:1;
        }            
          </style>
      </head>
      <body>
          <div id="container" >
              <div id="myid" />
              <div class="c1" />
          </div>
      </body>
  </html>`;

        //console.log("myHtml=", myHtml);
        response.end(myHtml);
      });
  })
  .listen(8088, "127.0.0.1");
