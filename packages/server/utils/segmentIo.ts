import SegmentIo from 'analytics-node'
import crypto from 'crypto'
import getRethink from '../database/rethinkDriver'
import PROD from '../PROD'
import {toEpochSeconds} from './epochTime'
import getRedis from './getRedis'
import sendToSentry from './sendToSentry'

const {SEGMENT_WRITE_KEY, SERVER_SECRET} = process.env

const segmentIo = new SegmentIo(SEGMENT_WRITE_KEY || 'x', {
  flushAt: PROD ? 20 : 1,
  enable: !!SEGMENT_WRITE_KEY
}) as any
segmentIo._track = segmentIo.track
segmentIo.track = async (options) => {

}
export default segmentIo as SegmentIo
