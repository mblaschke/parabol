import SegmentIo from 'analytics-node'
import crypto from 'crypto'
import PROD from '../PROD'
import {toEpochSeconds} from './epochTime'

const {SEGMENT_WRITE_KEY, SERVER_SECRET} = process.env

const segmentIo = new SegmentIo(SEGMENT_WRITE_KEY || 'x', {
  flushAt: PROD ? 20 : 1,
  enable: !!SEGMENT_WRITE_KEY
})
;(segmentIo as any)._track = segmentIo.track
segmentIo.track = (options) => {

}
export default segmentIo
