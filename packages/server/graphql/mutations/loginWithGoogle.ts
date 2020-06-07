import {GraphQLID, GraphQLNonNull} from 'graphql'
import {AuthIdentityTypeEnum} from 'parabol-client/types/graphql'
import getRethink from '../../database/rethinkDriver'
import AuthIdentityGoogle from '../../database/types/AuthIdentityGoogle'
import AuthToken from '../../database/types/AuthToken'
import User from '../../database/types/User'
import encodeAuthToken from '../../utils/encodeAuthToken'
import GoogleServerManager from '../../utils/GoogleServerManager'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import rateLimit from '../rateLimit'
import LoginWithGooglePayload from '../types/LoginWithGooglePayload'
import bootstrapNewUser from './helpers/bootstrapNewUser'

const loginWithGoogle = {
  type: new GraphQLNonNull(LoginWithGooglePayload),
  description: 'Sign up or login using Google',
  args: {
    code: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The code provided from the OAuth2 flow'
    },
    segmentId: {
      type: GraphQLID,
      description: 'optional segment id created before they were a user'
    },
    invitationToken: {
      type: GraphQLID,
      description: 'if present, the user is also joining a team'
    }
  },
  resolve: rateLimit({perMinute: 50, perHour: 500})(
    async (_source, {code, invitationToken, segmentId}, context: GQLContext) => {
        return {error: {message: 'login with google not allowed'}}
    }
  )
}

export default loginWithGoogle
