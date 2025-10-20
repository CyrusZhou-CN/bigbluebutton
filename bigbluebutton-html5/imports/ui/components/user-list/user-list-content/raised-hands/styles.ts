import styled from 'styled-components';
import {
  colorGray,
} from '/imports/ui/stylesheets/styled-components/palette';
import {
  smPaddingX,
} from '/imports/ui/stylesheets/styled-components/general';

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
  margin-left: 0.45rem;
  padding-left: 0.6rem;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 120ms ease-in-out;

  &:hover {
    background-color: rgba(0, 0, 0, 0.06);
  }

  &:active {
    background-color: rgba(0, 0, 0, 0.1);
  }

  &:focus-visible {
    outline: 2px solid ${colorGray};
    outline-offset: 2px;
  }
`;

export default {
  RaisedHandsContainer,
  RaisedHandsTitle,
  RaisedHandsItem,
};
