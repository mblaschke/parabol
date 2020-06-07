import base64url from 'base64url'
import crypto from 'crypto'
import {GraphQLBoolean, GraphQLID, GraphQLNonNull} from 'graphql'
import ms from 'ms'
import {Threshold} from 'parabol-client/types/constEnums'
import {AuthIdentityTypeEnum} from 'parabol-client/types/graphql'
import util from 'util'
import getRethink from '../../database/rethinkDriver'
import AuthIdentityLocal from '../../database/types/AuthIdentityLocal'
import PasswordResetRequest from '../../database/types/PasswordResetRequest'
import User from '../../database/types/User'
import getMailManager from '../../email/getMailManager'
import resetPasswordEmailCreator from '../../email/resetPasswordEmailCreator'
import {GQLContext} from '../graphql'
import rateLimit from '../rateLimit'

const randomBytes = util.promisify(crypto.randomBytes)

const emailPasswordReset = {
  type: new GraphQLNonNull(GraphQLBoolean),
  description: 'Send an email to reset a password',
  args: {
    email: {
      type: GraphQLNonNull(GraphQLID),
      description: 'email to send the password reset code to'
    }
  },
  resolve: rateLimit({perMinute: 5, perHour: 50})(async (_source, {email}, {ip}: GQLContext) => {
    return {error: {message: 'password reset not allowed'}}
  })
}

export default emailPasswordReset
