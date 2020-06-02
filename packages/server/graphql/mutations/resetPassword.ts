import bcrypt from 'bcrypt'
import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql'
import {Security, Threshold} from 'parabol-client/types/constEnums'
import {AuthIdentityTypeEnum} from 'parabol-client/types/graphql'
import getRethink from '../../database/rethinkDriver'
import AuthIdentityLocal from '../../database/types/AuthIdentityLocal'
import AuthToken from '../../database/types/AuthToken'
import PasswordResetRequest from '../../database/types/PasswordResetRequest'
import encodeAuthToken from '../../utils/encodeAuthToken'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import rateLimit from '../rateLimit'
import ResetPasswordPayload from '../types/ResetPasswordPayload'
import blacklistJWT from '../../utils/blacklistJWT'

const resetPassword = {
  type: new GraphQLNonNull(ResetPasswordPayload),
  description: 'Reset the password for an account',
  args: {
    token: {
      type: GraphQLNonNull(GraphQLID),
      description: 'the password reset token'
    },
    newPassword: {
      type: GraphQLNonNull(GraphQLString),
      description: 'The new password for the account'
    }
  },
  resolve: rateLimit({perMinute: 10, perHour: 100})(
    async (_source, {token, newPassword}, context: GQLContext) => {
        return {error: {message: 'reset password not allowed'}}
    }
  )
}

export default resetPassword
