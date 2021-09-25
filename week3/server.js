const http = require("http");
http
  .createServer((request, response) => {
    let body = [];
    request
      .on("error", err => {
        console.error(err);
      })
      .on("data", chunk => {
        console.log("server on data chunk= :", chunk.toString());
        body.push(chunk.toString());
      })
      .on("end", () => {
        //body = Buffer.concat(body).toString();
        response.writeHead(200, { "Content-Type": "text/html" });

        const myHtml = `
            <html maaa=a >
                <head>
                    <style>
                    #container {
                        width:500px;
                        height:300px;
                        display:flex;
                        background-color:rgb(0,0,255);
                        
                    }
                    #container #myid {
                        width:200px;
                        height:100px;
                        background-color:rgb(255,0,0);
                    }

                    #container .c1 {
                        flex:1;
                        background-color:rgb(0,255,0);
                    }            
                    </style>
                </head>
                <body>
                    <div id="container" >
                        <div id="myid"></div> 
                        <div class="c1"></div>
                    </div>
                </body>
            </html>`;
        //console.log("myHtml=", myHtml);
        response.end(myHtml);
      });
  })
  .listen(8088, () => {
    console.log("server listen on 8088");
  });
