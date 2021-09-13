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

        const myHtml = `<html maaa=a atester=b>
      <head>
          <style>
              body div #myid{
                  width:100px;
                  background-color: #ff1111;
              }
  
              body div img{
                  width:20px;
                  background-color: #ff2222;
                  
              }

              body div .myclass{
                width:30px;
                background-color: #ff3333;
                
            }
          </style>
      </head>
      <body>
          <div>
              <img id="myid" />
              <img class='myclass' />
          </div>
      </body>
  </html>`;
        response.end(myHtml);
      });
  })
  .listen(8088, "127.0.0.1");
