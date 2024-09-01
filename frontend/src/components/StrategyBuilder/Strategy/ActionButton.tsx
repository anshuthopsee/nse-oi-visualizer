import ButtonBase from "@mui/material/ButtonBase";

type ActionButtonProps = {
  action: "B" | "S";
  showHeader?: boolean;
  onClick: (action: "B" | "S") => void;
};

const ActionButton = ({ action, onClick, showHeader = false }: ActionButtonProps) => {

  const colorPropPrefix = action === "B" ? "buy" : "sell";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center",rowGap: "10px" }}>
      {showHeader && <span style={{ fontSize: "12px", opacity: 0.7 }}>B/S</span>}
      <ButtonBase 
        sx={{ height: "25px", minWidth: "25px", backgroundColor: `actionButton.${colorPropPrefix}Secondary`, 
          borderRadius: 1, color: `actionButton.${colorPropPrefix}Primary`, fontSize: "12px" 
        }}
        onClick={() => onClick(action === "B" ? "S" : "B")}
      >
        {action}
      </ButtonBase>
    </div>
  );
};

export default ActionButton;