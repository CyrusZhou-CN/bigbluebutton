import styled from 'styled-components';
import {
  colorGray,
  colorPrimary,
} from '/imports/ui/stylesheets/styled-components/palette';
import {
  smPaddingX,
} from '/imports/ui/stylesheets/styled-components/general';
import Button from '/imports/ui/components/common/button/component';

const RaisedHandsContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const RaisedHandsTitle = styled.h2`
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  padding: 0 ${smPaddingX};
  color: ${colorGray};
  margin: 0;
`;

const RaisedHandsItem = styled.div`
  align-items: center;
  margin-left: 0.45rem;
  padding-top: 0.5rem;
`;

// @ts-ignore - as button comes from JS, we can't provide its props
const ClearButton = styled(Button)`
  position: relative;
  color: ${colorPrimary};
  &:focus,
  &:hover,
  &:active {
    color: ${colorPrimary};
    box-shadow: 0;
  }
  padding: 1.2rem 0;
  margin: ${smPaddingX};
`;

export default {
  RaisedHandsContainer,
  RaisedHandsTitle,
  RaisedHandsItem,
  ClearButton,
};
