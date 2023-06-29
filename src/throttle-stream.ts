// @ts-ignore
import Parser from 'stream-parser'
import { PassThrough } from 'node:stream'

/**
 * The `ThrottleStream` class is very similar to the node core `stream.Passthrough` stream,
 * except that you specify a `bps` "bytes per second" option
 * and data *will not* be passed through faster than the byte value you specify.
 *
 * ``` js
 * process.stdin.pipe(new ThrottleStream(100 * 1024)).pipe(process.stdout)
 * ```
 */
export class ThrottleStream extends PassThrough {
  private readonly chunkSize: number
  private totalBytes = 0;
  private startTime = Date.now();

  constructor(private readonly bps: number) {
    super()
    this.chunkSize = Math.max(1, Math.floor(this.bps))
    this.passthroughChunk()
  }

  /**
   * Begins passing through the next "chunk" of bytes.
   */
  private passthroughChunk() {
    // @ts-ignore
    this._passthrough(this.chunkSize, this.onChunk)
    this.totalBytes += this.chunkSize
  }

  /**
   * Called once a "chunk" of bytes has been passed through.
   * Waits if necessary before passing through the next chunk of bytes.
   */
  private onChunk(_: unknown, done: () => void) {
    var totalSeconds = (Date.now() - this.startTime) / 1000
    var expected = totalSeconds * this.bps

    const d = () => {
      this.passthroughChunk()
      done()
    }

    if (this.totalBytes > expected) {
      // Use this byte count to calculate how many seconds ahead we are.
      var remainder = this.totalBytes - expected
      var sleepTime = remainder / this.bps * 1000
      //console.error('sleep time: %d', sleepTime)
      if (sleepTime > 0) {
        setTimeout(d, sleepTime)
      } else {
        d()
      }
    } else {
      d()
    }
  }
}

Parser(ThrottleStream.prototype)
