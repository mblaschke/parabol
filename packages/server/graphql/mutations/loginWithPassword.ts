import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql'
import LoginWithPasswordPayload from '../types/LoginWithPasswordPayload'
import {AuthenticationError} from 'parabol-client/types/constEnums'
import rateLimit from '../rateLimit'
import attemptLogin from './helpers/attemptLogin'
import encodeAuthToken from '../../utils/encodeAuthToken'
import getReqAuth from "../../utils/getReqAuth";
import getRethink from "../../database/rethinkDriver";
import AuthToken from "../../database/types/AuthToken";
import shortid from "shortid";
import User from "../../database/types/User";
import {TierEnum} from "~/types/graphql";
import bootstrapNewUser from "./helpers/bootstrapNewUser";

const loginWithPassword = {
  type: new GraphQLNonNull(LoginWithPasswordPayload),
  description: 'Login using an email address and password',
  args: {
    email: {
      type: new GraphQLNonNull(GraphQLID)
    },
    password: {
      type: new GraphQLNonNull(GraphQLString)
    }
  },
  resolve: rateLimit({perMinute: 50, perHour: 500})(async (_source, {email, password}, context) => {
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
  })
}

export default loginWithPassword
