import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useMutation } from '@apollo/client';
import logger from '/imports/startup/client/logger';
import Styled from './styles';
import { RAISED_HAND_USERS } from './queries';
import { SET_RAISE_HAND } from '/imports/ui/core/graphql/mutations/userMutations';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';
import UserListStyles from '../user-participants/user-list-participants/list-item/styles';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import Auth from '/imports/ui/services/auth';
import browserInfo from '/imports/utils/browserInfo';
import { getSettingsSingletonInstance } from '/imports/ui/services/settings';
import UserActions from '../user-participants/user-list-participants/user-actions/component';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import { CURRENT_PRESENTATION_PAGE_SUBSCRIPTION, CurrentPresentationPagesSubscriptionResponse } from '/imports/ui/components/whiteboard/queries';
import { LockSettings, UsersPolicies } from '/imports/ui/Types/meeting';
import { User } from '/imports/ui/Types/user';

const intlMessages = defineMessages({
  raisedHandsTitle: {
    id: 'app.statusNotifier.raisedHandsTitle',
    description: 'Title for the raised hands list',
  },
  lowerHandsLabel: {
    id: 'app.statusNotifier.lowerHands',
    description: 'text displayed to clear all raised hands',
  },
  you: {
    id: 'app.userList.you',
    description: 'Text for identifying your user',
  },

});

type RaisedHandUser = {
  userId: string;
  name: string;
  color?: string;
  presenter?: boolean;
  isModerator?: boolean;
  raiseHand?: boolean;
  raiseHandTime?: string | null;
  whiteboardWriteAccess?: boolean;
  userAvatarFiltered?: string;
  avatarContent?: React.ReactNode;
  voiceUser?: {
    joined: boolean;
    talking: boolean;
    muted: boolean;
    listenOnly: boolean;
    listenOnlyInputDevice: boolean;
    deafened: boolean;
  };
};

interface RaisedHandsComponentProps {
  raisedHands: RaisedHandUser[];
  lowerUserHands: (userId: string) => void;
  meeting: {
    meetingId: string;
    isBreakout: boolean;
    lockSettings: LockSettings;
    usersPolicies: UsersPolicies;
  };
  pageId: string;
}

interface EmojiProps {
  emoji: { native: string; };
  native: string;
  size: number;
}

const RaisedHandsComponent: React.FC<RaisedHandsComponentProps> = ({
  raisedHands,
  lowerUserHands,
  meeting,
  pageId,
}) => {
  const intl = useIntl();

  const [openUserAction, setOpenUserAction] = React.useState<string | null>(null);

  const { data: currentUserData } = useCurrentUser((user) => ({
    presenter: user.presenter,
    isModerator: user.isModerator,
  }));

  const isPresenter = currentUserData?.presenter;
  const isModerator = currentUserData?.isModerator;

  const Settings = getSettingsSingletonInstance();
  const animations = Settings?.application?.animations;

  const { isChrome, isFirefox, isEdge } = browserInfo;

  if (raisedHands.length === 0) {
    return null;
  }

  const handEmoji = {
    id: 'hand',
    native: '✋',
  };

  const emojiSize = 20;

  const Emoji: React.FC<EmojiProps> = ({ emoji, native, size }) => (
    <em-emoji emoji={emoji} native={native} size={size} />
  );

  return (
    <Styled.RaisedHandsContainer>
      <Styled.RaisedHandsTitle data-test="raisedHandsTitle">
        {intl.formatMessage(intlMessages.raisedHandsTitle)}
      </Styled.RaisedHandsTitle>
      {raisedHands.map((user, index) => (
        <Styled.RaisedHandsItem key={`user-${user.userId}`}>
          <UserActions
            user={user as User}
            currentUser={currentUserData as User}
            lockSettings={meeting.lockSettings}
            usersPolicies={meeting.usersPolicies}
            pageId={pageId}
            userListDropdownItems={[]}
            open={user.userId === openUserAction}
            setOpenUserAction={setOpenUserAction}
            isBreakout={meeting.isBreakout}
            type="raised-hand"
          >
            <UserListStyles.UserItemContents id={`raised-hand-index-${index}`} tabIndex={-1} role="listitem">
              <UserListStyles.Avatar
                moderator={user.isModerator}
                presenter={user.presenter}
                muted={user.voiceUser?.muted}
                listenOnly={user.voiceUser?.listenOnly || user.voiceUser?.listenOnlyInputDevice}
                voice={user.voiceUser?.joined && !user.voiceUser?.deafened}
                noVoice={!user.voiceUser?.joined || user.voiceUser?.deafened}
                color={user.color}
                whiteboardAccess={user.whiteboardWriteAccess}
                animations={animations}
                avatar={user.userAvatarFiltered}
                isChrome={isChrome}
                isFirefox={isFirefox}
                isEdge={isEdge}
              >
                <Emoji key={handEmoji.id} emoji={handEmoji} native={handEmoji.native} size={emojiSize} />
              </UserListStyles.Avatar>
              <UserListStyles.UserNameContainer>
                <UserListStyles.UserName>
                  <span>
                    {user.name}
                    <Styled.PositionLabel>{index + 1}</Styled.PositionLabel>
                  </span>
                  &nbsp;
                  {(user.userId === Auth.userID) ? `(${intl.formatMessage(intlMessages.you)})` : ''}
                </UserListStyles.UserName>
              </UserListStyles.UserNameContainer>
            </UserListStyles.UserItemContents>
          </UserActions>
        </Styled.RaisedHandsItem>
      ))}
      {(isModerator || isPresenter) && (
        <Styled.ClearButton
          label={intl.formatMessage(intlMessages.lowerHandsLabel)}
          color="default"
          size="md"
          onClick={() => {
            raisedHands.map((u) => lowerUserHands(u.userId));
          }}
          data-test="raiseHandRejection"
        />
      )}
    </Styled.RaisedHandsContainer>
  );
};

const RaisedHandsContainer: React.FC = () => {
  const {
    data: usersData,
    error: usersError,
  } = useDeduplicatedSubscription<{ user: RaisedHandUser[] }>(RAISED_HAND_USERS);
  const raisedHands: RaisedHandUser[] = usersData?.user ?? [];

  const [setRaiseHand] = useMutation(SET_RAISE_HAND);

  const lowerUserHands = (userId: string) => {
    setRaiseHand({
      variables: {
        userId,
        raiseHand: false,
      },
    });
  };

  const {
    data: meeting,
    loading: meetingLoading,
  } = useMeeting((m) => ({
    lockSettings: m.lockSettings,
    usersPolicies: m.usersPolicies,
    isBreakout: m.isBreakout,
    meetingId: m.meetingId,
    breakoutPolicies: m.breakoutPolicies,
  }));

  const {
    data: presentationData,
    loading: presentationLoading,
  } = useDeduplicatedSubscription<CurrentPresentationPagesSubscriptionResponse>(CURRENT_PRESENTATION_PAGE_SUBSCRIPTION);
  const presentationPage = presentationData?.pres_page_curr[0];
  const pageId = presentationPage?.pageId;

  if (usersError) {
    logger.error({
      logCode: 'raisehand_notifier_container_subscription_error',
      extraInfo: { usersError },
    }, 'Error on requesting raise hand data');
  }

  if (!meeting || meetingLoading || presentationLoading) {
    return null;
  }

  return (
    <RaisedHandsComponent
      raisedHands={raisedHands}
      lowerUserHands={lowerUserHands}
      pageId={pageId ?? ''}
      meeting={{
        meetingId: meeting.meetingId!,
        isBreakout: !!meeting.isBreakout,
        lockSettings: meeting.lockSettings as LockSettings ?? {},
        usersPolicies: (meeting.usersPolicies as UsersPolicies) ?? {},
      }}
    />
  );
};

export default RaisedHandsContainer;
