'use strict';

var CorsHeaders = {
  'Allow-Credentials': true,
  'Allow-Headers': 'accept, origin, authorization, content-type',
  'Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Allow-Origin': '*',
  'Expose-Headers': 'Origin, Content-Type, Accept',
  'Max-Age': 1728000
};

function cors (req, resp) {
  if ('origin' in req.headers) {
    for (var key in CorsHeaders) {
      resp.setHeader('Access-Control-' + key, CorsHeaders[key]);
    }
  }
}

module.exports = cors;
