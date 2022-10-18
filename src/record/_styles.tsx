import { theme } from "@appquality/unguess-design-system";
import styled from "styled-components";

export const StyledScreenRecorder = styled.div`
  margin: 8px 0 0 110px;
  display: flex;
  flex-direction: column;
  font-family: ${theme.fonts.system};

  .logo {
    width: 172px;
  }
  .container {
    margin: 10px 0 0 55px;
    .title {
      margin-bottom: 8px;
    }
  }
`;
