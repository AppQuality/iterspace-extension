import { theme } from "@appquality/unguess-design-system";
import styled from "styled-components";

export const StyledPopupHeader = styled.div`
  display: flex;
  width: 405px;
  height: 60px;
  padding: 0 24px 0 16px;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid ${theme.palette.grey[200]};

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

  .generic-button {
    margin: 20px 0;
    .recording-icon {
      margin-left: 8px;
    }
  }
`;
