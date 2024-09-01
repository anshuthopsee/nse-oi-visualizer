import { ButtonBase } from "@mui/material";

type ActionButtonsProps = {
  show: boolean;
  type: "CE" | "PE";
  buyActive: boolean;
  sellActive: boolean;
  onAction: (type: "CE" | "PE", action: "B" | "S") => void;
};

const ActionButtons = ({ show, type, buyActive, sellActive, onAction }: ActionButtonsProps) => {
  return (
    <>
      {
        show && 
        (<div style={{ display: "inline-flex", width: "fit-content", columnGap: 8 }}>
          <ButtonBase
            aria-label="B"
            disableRipple 
            sx={{ height: "25px", width: "25px", fontSize: "14px", backgroundColor: `${buyActive ? "actionButton.buyPrimary" : "background.paper"}`, 
            color: `${buyActive ? "buttonText.primary" : "currentColor"}`, border: 1, borderColor: "divider", borderRadius: "3px" }}
            onClick={() => onAction(type, "B")} 
          >
            B
          </ButtonBase>
          <ButtonBase
            aria-label="S"
            disableRipple 
            sx={{ height: "25px", width: "25px", fontSize: "14px", backgroundColor:`${sellActive ? "actionButton.sellPrimary" : "background.paper"}`, 
            color: `${sellActive ? "buttonText.primary" : "currentColor"}`,  border: 1, borderColor: "divider", borderRadius: "3px" }}
            onClick={() => onAction(type, "S")}
          >
            S
          </ButtonBase>
        </div>)
      }
    </>
  );
};

export default ActionButtons;