import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useMutation } from '@apollo/client';
import logger from '/imports/startup/client/logger';
import Styled from './styles';
import { RAISED_HAND_USERS } from './queries';
import { SET_RAISE_HAND } from '/imports/ui/core/graphql/mutations/userMutations';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';

const intlMessages = defineMessages({
  raisedHandsTitle: {
    id: 'app.statusNotifier.raisedHandsTitle',
    description: 'Title for the raised hands list',
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
};

interface RaisedHandsComponentProps {
  raisedHands: RaisedHandUser[];
  lowerUserHands: (userId: string) => void;
}

const RaisedHandsComponent: React.FC<RaisedHandsComponentProps> = ({ raisedHands, lowerUserHands }) => {
  const intl = useIntl();

  if (raisedHands.length === 0) {
    return null;
  }

  return (
    <Styled.RaisedHandsContainer>
      <Styled.RaisedHandsTitle data-test="raisedHandsTitle">
        {intl.formatMessage(intlMessages.raisedHandsTitle)}
      </Styled.RaisedHandsTitle>
      {raisedHands.map((user: RaisedHandUser, index: number) => (
        <Styled.RaisedHandsItem
          key={user.userId}
          onClick={() => lowerUserHands(user.userId)}
        >
          {`${index + 1}. ${user.name}`}
        </Styled.RaisedHandsItem>
      ))}
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

  if (usersError) {
    logger.error({
      logCode: 'raisehand_notifier_container_subscription_error',
      extraInfo: { usersError },
    }, 'Error on requesting raise hand data');
  }

  return (
    <RaisedHandsComponent
      raisedHands={raisedHands}
      lowerUserHands={lowerUserHands}
    />
  );
};

export default RaisedHandsContainer;
