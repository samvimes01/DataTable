const http = require('http');

const nodeStatic = require('node-static');

const file = new nodeStatic.Server('./src', {
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET',
    'Access-Control-Allow-Headers': 'Content-Type',
  },
});

http.createServer((req, res) => {
  file.serve(req, res);
})
  .listen(8080);

console.log('open http://localhost:8080');
