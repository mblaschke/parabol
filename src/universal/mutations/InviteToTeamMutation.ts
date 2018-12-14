import {InviteToTeamMutation} from '__generated__/InviteToTeamMutation.graphql'
import {InviteToTeamMutation_notification} from '__generated__/InviteToTeamMutation_notification.graphql'
import {commitMutation, graphql} from 'react-relay'
import handleAddNotifications from 'universal/mutations/handlers/handleAddNotifications'
import plural from 'universal/utils/plural'
import {IInviteToTeamOnMutationArguments} from '../types/graphql'
import {LocalHandlers} from '../types/relayMutations'
import AcceptTeamInvitationMutation from './AcceptTeamInvitationMutation'

graphql`
  fragment InviteToTeamMutation_notification on InviteToTeamPayload {
    teamInvitationNotification {
      id
      type
      team {
        name
      }
      inviter {
        preferredName
      }
      invitation {
        token
      }
    }
  }
`

const mutation = graphql`
  mutation InviteToTeamMutation($teamId: ID!, $invitees: [Email!]!) {
    inviteToTeam(invitees: $invitees, teamId: $teamId) {
      error {
        message
      }
      invitees
      ...InviteToTeamMutation_notification @relay(mask: false)
    }
  }
`

const popInvitationSentToast = (invitees: ReadonlyArray<string> | null, {atmosphere}) => {
  if (!invitees) return
  const emailStr = invitees.join(', ')
  atmosphere.eventEmitter.emit('addToast', {
    level: 'success',
    title: `${plural(invitees, 'Invitation')} sent!`,
    message: `An invitation has been sent to ${emailStr}`
  })
}

const popInvitationReceivedToast = (
  notification: InviteToTeamMutation_notification['teamInvitationNotification'] | null,
  {atmosphere, history}
) => {
  if (!notification) return
  const {
    inviter: {preferredName: inviterName},
    team: {name: teamName},
    invitation: {token: invitationToken}
  } = notification
  atmosphere.eventEmitter.emit('addToast', {
    autoDismiss: 10,
    title: 'You’re invited!',
    message: `${inviterName} would like you to join their team ${teamName}`,
    action: {
      label: 'Accept!',
      callback: () => {
        AcceptTeamInvitationMutation(atmosphere, {invitationToken}, {history})
      }
    }
  })
}

export const inviteToTeamNotificationUpdater = (payload, {atmosphere, store}) => {
  const {viewerId} = atmosphere
  const teamInvitationNotification = payload.getLinkedRecord('teamInvitationNotification')
  handleAddNotifications(teamInvitationNotification, store, viewerId)
}

export const inviteToTeamNotificationOnNext = (
  payload: InviteToTeamMutation_notification,
  {atmosphere, history}
) => {
  const {teamInvitationNotification} = payload
  popInvitationReceivedToast(teamInvitationNotification, {atmosphere, history})
}

const InviteToTeamMutation = (
  atmosphere: any,
  variables: IInviteToTeamOnMutationArguments,
  {onError, onCompleted}: LocalHandlers
) => {
  return commitMutation<InviteToTeamMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted: (res, errors) => {
      if (onCompleted) {
        onCompleted(res, errors)
      }
      const payload = res.inviteToTeam
      if (payload && !payload.error) {
        popInvitationSentToast(payload.invitees, {atmosphere})
      }
    },
    onError
  })
}

export default InviteToTeamMutation
