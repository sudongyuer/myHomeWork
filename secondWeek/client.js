const net = require("net");
const parser = require("./parser.js");

class TrunkedBodyParser {
  constructor() {
    this.WAITING_LENGTH = 0;
    this.WAITING_LENGTH_LINE_END = 1;
    this.READING_TRUNK = 2;
    this.WAITING_NEW_LINE = 3;
    this.WAITING_NEW_LINE_END = 4;
    this.length = 0;
    this.content = [];
    this.isFinished = false;
    this.current = this.WAITING_LENGTH;
  }

  receiveChar(char) {
    if (this.current === this.WAITING_LENGTH) {
      if (char === "\r") {
        if (this.length === 0) {
          this.isFinished = true;
        }
        this.current = this.WAITING_LENGTH_LINE_END;
      } else {
        this.length *= 16;
        this.length += parseInt(char, 16);
      }
    } else if (this.current === this.WAITING_LENGTH_LINE_END) {
      if (char === "\n") {
        this.current = this.READING_TRUNK;
      }
    } else if (this.current === this.READING_TRUNK) {
      this.content.push(char);
      this.length--;
      if (this.length === 0) {
        this.current = this.WAITING_NEW_LINE;
      }
    } else if (this.current === this.WAITING_NEW_LINE) {
      if (char === "\r") {
        this.current = this.WAITING_NEW_LINE_END;
      }
    } else if (this.current === this.WAITING_NEW_LINE_END) {
      if (char === "\n") {
        this.current = this.WAITING_LENGTH;
      }
    }
  }
}

class ResponseParser {
  constructor() {
    this.WAITING_STATUS_LINE = 0;
    this.WAITING_STATUS_LINE_END = 1;
    this.WAITING_HEADER_NAME = 2;
    this.WAITING_HEADER_SPACE = 3;
    this.WAITING_HEADER_VALUE = 4;
    this.WAITING_HEADER_LINE_END = 5;
    this.WAITING_HEADER_BLOCK_END = 6;
    this.WAITING_BODY = 7;

    this.current = this.WAITING_STATUS_LINE;
    this.statusLine = "";
    this.headers = {};
    this.headerName = "";
    this.headerValue = "";
    this.bodyParse = null;
  }

  isFinished() {
    return this.bodyParse && this.bodyParse.isFinished;
  }

  response() {
    const found = this.statusLine.match(/HTTP\/1.1 ([0-9]+) ([\s\S]+)/);
    // console.log("ResponseParser -> response -> found", found)
    return {
      statusCod: found[1],
      statusText: found[2],
      headers: this.headers,
      body: this.bodyParse.content.join("")
    };
  }

  receive(string) {
    for (let i = 0; i < string.length; i++) {
      this.receiveChar(string.charAt(i));
    }
  }

  receiveChar(char) {
    if (this.current === this.WAITING_STATUS_LINE) {
      if (char === "\r") {
        this.current = this.WAITING_STATUS_LINE_END;
      } else {
        this.statusLine += char;
      }
    } else if (this.current === this.WAITING_STATUS_LINE_END) {
      if (char === "\n") {
        this.current = this.WAITING_HEADER_NAME;
      }
    } else if (this.current === this.WAITING_HEADER_NAME) {
      if (char === ":") {
        this.current = this.WAITING_HEADER_SPACE;
      } else if (char === "\r") {
        this.current = this.WAITING_HEADER_BLOCK_END;

        if (this.headers["Transfer-Encoding"] === "chunked") {
          this.bodyParse = new TrunkedBodyParser();
        }
      } else {
        this.headerName += char;
      }
    } else if (this.current === this.WAITING_HEADER_SPACE) {
      if (char === " ") {
        this.current = this.WAITING_HEADER_VALUE;
      }
    } else if (this.current === this.WAITING_HEADER_VALUE) {
      if (char === "\r") {
        this.current = this.WAITING_HEADER_LINE_END;
        this.headers[this.headerName] = this.headerValue;
        this.headerName = "";
        this.headerValue = "";
      } else {
        this.headerValue += char;
      }
    } else if (this.current === this.WAITING_HEADER_LINE_END) {
      if (char === "\n") {
        this.current = this.WAITING_HEADER_NAME;
      }
    } else if (this.current === this.WAITING_HEADER_BLOCK_END) {
      if (char === "\n") {
        this.current = this.WAITING_BODY;
      }
    } else if (this.current === this.WAITING_BODY) {
      this.bodyParse.receiveChar(char);
    }
  }
}

class Request {
  constructor(options) {
    this.method = options.method || "GET";
    this.host = options.host || "localhost";
    this.port = options.port || 8080;
    this.path = options.path || "/";
    this.body = options.body || {};
    this.headers = options.headers || {};

    if (!this.headers["Content-Type"]) {
      this.headers["Content-Type"] = "application/x-www-form-urlencoded";
    }

    switch (this.headers["Content-Type"]) {
      case "application/json":
        this.bodyText = JSON.stringify(this.body);
        break;
      case "application/x-www-form-urlencoded":
        this.bodyText = Object.keys(this.body)
          .map(key => `${key}=${encodeURIComponent(this.body[key])}`)
          .join("&");
        break;
    }

    this.headers["content-Length"] = this.bodyText.length;
  }

  send(connection) {
    return new Promise((resolve, reject) => {
      const aResponseParser = new ResponseParser();
      //console.log('-----data to send----\n', this.toString(), '\n-------end---');
      if (connection) {
        connection.write(this.toString());
      } else {
        connection = net.createConnection(
          {
            host: this.host,
            port: this.port
          },
          () => connection.write(this.toString())
        );
      }

      connection.on("data", data => {
        // console.log('\n-----client on data:\n', data.toString());
        aResponseParser.receive(data.toString());
        if (aResponseParser.isFinished) {
          resolve(aResponseParser.response());
          connection.end();
        }
      });

      connection.on("close", () => {
        console.log("Connection closed");
        resolve();
      });

      connection.on("error", err => {
        reject(err);
        connection.end();
      });
    });
  }

  toString() {
    return `${this.method} ${this.path} HTTP/1.1\r\n${Object.keys(this.headers)
      .map(key => `${key}: ${this.headers[key]}`)
      .join("\r\n")}\r\n\r\n${this.bodyText}`;
  }
}

void (async function() {
  const request = new Request({
    method: "POST",
    host: "127.0.0.1",
    port: "8088",
    path: "/",
    headers: {
      "Content-Type": "application/json",
      "X-Foo2": "customed"
    },
    body: { name: "from client kkma" }
  });

  const response = await request.send();
  let dom = parser.parseHTML(response.body);

  console.log(JSON.stringify(dom, null, "  "));
})();
