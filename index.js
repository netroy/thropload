var http = require('http');
var fs = require('fs');

var Throttle = require('throttle');
var ProgressBar = require('progress');
require('colors');

var server = http.createServer(function(req, resp) {

  var method = req.method.toUpperCase();
  if(method === 'OPTIONS') {
    resp.writeHead(200, {
      'Access-Control-Allow-Credentials': true,
      'Access-Control-Allow-Headers': 'accept, origin, authorization, content-type',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Origin': req.headers.origin || '*',
      'Access-Control-Expose-Headers': 'Origin, Content-Type, Accept',
      'Access-Control-Max-Age':1728000
    });
    return resp.end();
  }

  var size = parseInt(req.headers['content-length'], 10);
  if(!/^(PUT|POST)$/.test(method)) {
    return resp.end('{}');
  }

  if(size) {
    var devNull = fs.createWriteStream('/dev/null');

    var stream = req.pipe(new Throttle(50 * 1024));
    var bar = new ProgressBar('•'.red + ' :bar '.blue + req.url.green, {
      'width': 30,
      'total': size
    });

    stream.pipe(devNull);
    stream.on('data', function (data) {
      bar.tick(data.length);
    });

    req.on('end', function () {
      devNull.close();
      resp.end();
    });
  } else {
    resp.end();
  }
});

server.listen(9090);
console.log('http://0.0.0.0:9090/');
