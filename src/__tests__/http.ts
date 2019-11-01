import http from "http";

export const server = () =>
  http
    .createServer(function(
      req: http.IncomingMessage,
      res: http.ServerResponse
    ) {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.write("Hello World!");
      res.end();
    })
    .listen(3001);
