import { type ServerResponse, createServer } from 'http'
import { createWriteStream } from 'fs'
import { cors } from './cors'
import { ThrottleStream } from './throttle-stream'
import ProgressBar from 'progress'

const respond = (res: ServerResponse, status: number, message: string = '') => {
  res.writeHead(status).write(message)
  return res.end()
}

export const create = () => createServer((req, res) => {
  const method = req.method!.toUpperCase()
  const contentLength = req.headers['content-length']
  if (!contentLength) return respond(res, 400, 'Content-Length header missing')

  cors(req, res)
  if (method === 'OPTIONS') return res.end()

  if (!['POST', 'PUT'].includes(method)) return respond(res, 405, 'Method not allowed')

  const size = parseInt(contentLength, 10)
  if (!size) return respond(res, 400, 'Request is empty')

  const devNull = createWriteStream('/dev/null')
  const bar = new ProgressBar('•' + ' :bar :percent', {
    'width': 50,
    'total': size
  })

  const stream: ThrottleStream = req.pipe(new ThrottleStream(50 * 1024 * 1024))
  stream.pipe(devNull)
  stream.on('data', (data) => bar.tick(data.length))
  stream.once('end', () => {
    devNull.close()
    bar.terminate()
    respond(res, 204)
  })
  req.once('close', () => {
    devNull.close()
    bar.interrupt('connection closed')
  })
})
