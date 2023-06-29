import type { RequestListener } from "http";

const CorsHeaders = Object.entries({
  'Allow-Credentials': 'true',
  'Allow-Headers': 'accept, origin, authorization, content-type',
  'Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Allow-Origin': '*',
  'Expose-Headers': 'Origin, Content-Type, Accept',
  'Max-Age': '1728000'
});

export const cors: RequestListener = (req, resp) => {
  if ('origin' in req.headers) {
    for (const [key, value] of CorsHeaders) {
      resp.setHeader('Access-Control-' + key, value);
    }
  }
}
