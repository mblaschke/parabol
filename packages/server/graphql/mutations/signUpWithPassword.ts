import bcrypt from 'bcrypt'
import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql'
import {AuthenticationError, Security} from 'parabol-client/types/constEnums'
import {ISignUpWithPasswordOnMutationArguments, TierEnum} from 'parabol-client/types/graphql'
import getRethink from '../../database/rethinkDriver'
import createEmailVerification from '../../email/createEmailVerification'
import createNewLocalUser from '../../utils/createNewLocalUser'
import encodeAuthToken from '../../utils/encodeAuthToken'
import isEmailVerificationRequired from '../../utils/isEmailVerificationRequired'
import {GQLContext} from '../graphql'
import rateLimit from '../rateLimit'
import SignUpWithPasswordPayload from '../types/SignUpWithPasswordPayload'
import attemptLogin from './helpers/attemptLogin'
import bootstrapNewUser from './helpers/bootstrapNewUser'
import AuthToken from "../../database/types/AuthToken";
import shortid from "shortid";
import User from "../../database/types/User";

const signUpWithPassword = {
  type: new GraphQLNonNull(SignUpWithPasswordPayload),
  description: 'Sign up using an email address and password',
  args: {
    email: {
      type: new GraphQLNonNull(GraphQLID)
    },
    password: {
      type: new GraphQLNonNull(GraphQLString)
    },
    segmentId: {
      type: GraphQLID,
      description: 'optional segment id created before they were a user'
    },
    invitationToken: {
      type: GraphQLID,
      description: 'used to determine what suggested actions to create'
    }
  },
  resolve: rateLimit({perMinute: 50, perHour: 500})(
    async (_source, args: ISignUpWithPasswordOnMutationArguments, context: GQLContext) => {
      const {invitationToken, password, segmentId} = args

      let headerAuthInfo = context.headerAuthInfo
      if (!headerAuthInfo || !headerAuthInfo.email || !headerAuthInfo.name) {
        return {error: {message: 'invalid auth'}}
      }

      headerAuthInfo.email = headerAuthInfo.email.toLowerCase()

      console.log("Handling auth from", headerAuthInfo)

      const r = await getRethink()
      const user = await r
          .table('User')
          .getAll(headerAuthInfo.email, {index: 'email'})
          .nth(0)
          .default(null)
          .run()
      if (user) {
        // MUTATIVE
        context.authToken = new AuthToken({sub: user.id, tms: user.tms})
        return {
          userId: user.id,
          authToken: encodeAuthToken(context.authToken)
        }
      } else {
        console.log("Creating new user for", headerAuthInfo)
        const userId = `sso|${shortid.generate()}`
        const newUser = new User({
          id: userId,
          email: headerAuthInfo.email,
          preferredName: headerAuthInfo.name,
          emailVerified: true,
          lastSeenAt: new Date(),
          tier: TierEnum.personal
        })
        // MUTATIVE
        context.authToken = await bootstrapNewUser(newUser, false)
        return {
          userId: newUser.id,
          authToken: encodeAuthToken(context.authToken)
        }
      }
    }
  )
}

export default signUpWithPassword
