import React, {lazy} from 'react'
import styled from '@emotion/styled'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import EditableAvatar from '../../../components/EditableAvatar/EditableAvatar'
import FieldLabel from '../../../components/FieldLabel/FieldLabel'
import BasicInput from '../../../components/InputField/BasicInput'
import Panel from '../../../components/Panel/Panel'
import SecondaryButton from '../../../components/SecondaryButton'
import UserSettingsWrapper from './UserSettingsWrapper/UserSettingsWrapper'
import UpdateUserProfileMutation from '../../../mutations/UpdateUserProfileMutation'
import defaultUserAvatar from '../../../styles/theme/images/avatar-user.svg'
import {WithMutationProps} from '../../../utils/relay/withMutationProps'
import {WithAtmosphereProps} from '../../../decorators/withAtmosphere/withAtmosphere'
import withForm, {WithFormProps} from '../../../utils/relay/withForm'
import Legitity from '../../../validation/Legitity'
import {UserProfile_viewer} from '../../../__generated__/UserProfile_viewer.graphql'
import {Breakpoint, Layout} from '../../../types/constEnums'
import {PALETTE} from '../../../styles/paletteV2'
import NotificationErrorMessage from '../../notifications/components/NotificationErrorMessage'
import useModal from '../../../hooks/useModal'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useMutationProps from '../../../hooks/useMutationProps'
import useDocumentTitle from '../../../hooks/useDocumentTitle'

const SettingsBlock = styled('div')({
  width: '100%'
})

const SettingsForm = styled('form')({
  alignItems: 'center',
  borderTop: `1px solid ${PALETTE.BORDER_LIGHTER}`,
  display: 'flex',
  flexDirection: 'column',
  padding: Layout.ROW_GUTTER,
  width: '100%',
  [`@media screen and (min-width: ${Breakpoint.SIDEBAR_LEFT}px)`]: {
    flexDirection: 'row'
  }
})

const InfoBlock = styled('div')({
  flex: 1,
  paddingLeft: Layout.ROW_GUTTER
})

const FieldBlock = styled('div')({
  flex: 1,
  minWidth: 0,
  padding: '0 0 16px',
  [`@media screen and (min-width: ${Breakpoint.SIDEBAR_LEFT}px)`]: {
    padding: '0 16px 0 0'
  }
})

const ControlBlock = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  [`@media screen and (min-width: ${Breakpoint.SIDEBAR_LEFT}px)`]: {
    flexDirection: 'row',
    flex: 1
  }
})

const StyledButton = styled(SecondaryButton)({
  width: 112
})

const UserAvatarInput = lazy(() =>
  import(/* webpackChunkName: 'UserAvatarInput' */ '../../../components/UserAvatarInput')
)

interface Props extends WithAtmosphereProps, WithMutationProps, WithFormProps {
  viewer: UserProfile_viewer
}

const UserProfile = (props: Props) => {
  const {fields, onChange, validateField, viewer} = props
  const atmosphere = useAtmosphere()
  const {error, onCompleted, onError, submitMutation, submitting} = useMutationProps()
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const preferredNameRes = validateField('preferredName')
    const preferredName = preferredNameRes.value
    if (preferredNameRes.error || preferredName === viewer.preferredName || submitting) return
    submitMutation()
    UpdateUserProfileMutation(atmosphere, {preferredName}, {onError, onCompleted})
  }

  const {picture} = viewer
  const pictureOrDefault = picture || defaultUserAvatar
  const {togglePortal, modalPortal} = useModal()
  useDocumentTitle('My Profile | Parabol', 'My Profile')
  return (
    <UserSettingsWrapper>
      <SettingsBlock>
        <Panel label='My Information'>
          <SettingsForm onSubmit={onSubmit}>
            <EditableAvatar picture={pictureOrDefault} size={96} />
            <InfoBlock>
              <FieldLabel
                customStyles={{paddingBottom: 8}}
                label='Name'
                fieldSize='medium'
                indent
                htmlFor='preferredName'
              />
              <ControlBlock>
                <FieldBlock>
                  {/* TODO: Make me Editable.js (TA) */}
                  <BasicInput
                    {...fields.preferredName}
                    autoFocus
                    onChange={onChange}
                    name='preferredName'
                    placeholder='My name'
                  />
                </FieldBlock>
                <StyledButton size='medium'>{'Update'}</StyledButton>
              </ControlBlock>
              <NotificationErrorMessage error={error} />
            </InfoBlock>
          </SettingsForm>
        </Panel>
      </SettingsBlock>
    </UserSettingsWrapper>
  )
}

const form = withForm({
  preferredName: {
    getDefault: (props) => props.viewer.preferredName,
    validate: (value) =>
      new Legitity(value)
        .trim()
        .required('That’s not much of a name, is it?')
        .min(2, 'C’mon, you call that a name?')
        .max(100, 'I want your name, not your life story')
  }
})

export default createFragmentContainer(form(UserProfile), {
  viewer: graphql`
    fragment UserProfile_viewer on User {
      preferredName
      picture
    }
  `
})
