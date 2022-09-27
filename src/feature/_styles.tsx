import styled from "styled-components";
import { palette } from "../theme/palette";

export const StyledPopupHeader = styled.div`
  display: flex;
  width: 405px;
  height: 60px;
  padding: 0 24px 0 16px;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid ${palette.grey[200]};

  .header-left {
    display: flex;
    .title {
      margin-left: 8px;
    }
  }
  .header-right {
    width: 40px;
    height: 40px;
    img {
      cursor: pointer;
    }
  }
`;

export const StyledPopupBody = styled.div`
  padding: 0 40px;
  width: 405px;

  .generic-button {
    margin: 20px 0;
    .recording-icon {
      margin-left: 8px;
    }
    &:hover {
      opacity: 0.7;
    }
  }
`;

export const StyledManageAudio = styled.div`
  margin: 20px 0;
  display: flex;

  .audio-btn {
    border-color: ${palette.grey[300]};
    margin-right: 8px;
    &:focus {
      border: none;
      box-shadow: 0 0 0 3px ${palette.green[100]};
    }
  }
  .select-field {
    width: 277px;
    .select-input {
      box-shadow: none;
      &:focus {
        box-shadow: 0 0 0 3px ${palette.secondary[200]};
      }
    }
  }
`;
