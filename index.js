'use strict';

var http = require('http');
var fs = require('fs');

var Throttle = require('throttle');
var ProgressBar = require('progress');
var debug = require('debug')('thropload');

var port = 9090;

var server = http.createServer(function(req, resp) {

  var method = req.method.toUpperCase();
  var headers = {
    'Access-Control-Allow-Credentials': true,
    'Access-Control-Allow-Headers': 'accept, origin, authorization, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Origin': req.headers.origin || '*',
    'Access-Control-Expose-Headers': 'Origin, Content-Type, Accept',
    'Access-Control-Max-Age': 1728000
  };

  if ('origin' in req.headers) {
    for (var key in headers) {
      resp.setHeader(key, headers[key]);
    }
  }

  if(method === 'OPTIONS') {
    debug('received a CORS request');
    resp.writeHead(200);
    return resp.end();
  }

  var size = parseInt(req.headers['content-length'], 10);
  if(!/^(PUT|POST)$/.test(method)) {
    return resp.end('{}');
  }

  if (size) {
    var devNull = fs.createWriteStream('/dev/null');

    var stream = req.pipe(new Throttle(50 * 1024));
    var bar = new ProgressBar('•' + ' :bar :percent', {
      'width': 50,
      'total': size
    });

    stream.pipe(devNull);
    stream.on('data', function (data) {
      bar.tick(data.length);
    });

    stream.on('end', function () {
      devNull.close();
      resp.end('{}');
    });
  } else {
    resp.writeHead(204);
    resp.end();
  }
});

server.listen(port, function () {
  debug('server started on - http://0.0.0.0:%s/', port);
});

