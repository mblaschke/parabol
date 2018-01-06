import GraphQLSubscriptionType from 'server/graphql/GraphQLSubscriptionType';
import ApproveToOrgPayload from 'server/graphql/types/ApproveToOrgPayload';
import CancelApprovalPayload from 'server/graphql/types/CancelApprovalPayload';
import CancelTeamInvitePayload from 'server/graphql/types/CancelTeamInvitePayload';
import ClearNotificationPayload from 'server/graphql/types/ClearNotificationPayload';
import CreateProjectPayload from 'server/graphql/types/CreateProjectPayload';
import DeleteProjectPayload from 'server/graphql/types/DeleteProjectPayload';
import InviteTeamMembersPayload from 'server/graphql/types/InviteTeamMembersPayload';
import NotifyVersionInfo from 'server/graphql/types/NotifyVersionInfo';
import RejectOrgApprovalInviterPayload from 'server/graphql/types/RejectOrgApprovalInviterPayload';
import RejectOrgApprovalOrgLeaderPayload from 'server/graphql/types/RejectOrgApprovalOrgLeaderPayload';
import StripeFailPaymentPayload from 'server/graphql/types/StripeFailPaymentPayload';
import User from 'server/graphql/types/User';

const types = [
  ApproveToOrgPayload,
  CancelApprovalPayload,
  CancelTeamInvitePayload,
  ClearNotificationPayload,
  CreateProjectPayload,
  DeleteProjectPayload,
  InviteTeamMembersPayload,
  RejectOrgApprovalInviterPayload,
  RejectOrgApprovalOrgLeaderPayload,
  StripeFailPaymentPayload,
  User,
  NotifyVersionInfo
];

export default new GraphQLSubscriptionType('NotificationSubscriptionPayload', types);
