import ButtonBase from "@mui/material/ButtonBase";

type TypeButtonProps = {
  type: "CE" | "PE";
  showHeader?: boolean;
  onClick: (type: "CE" | "PE") => void;
};

const TypeButton = ({ type, onClick, showHeader = false }: TypeButtonProps) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center",rowGap: "10px" }}>
      {showHeader && <span style={{ fontSize: "12px", opacity: 0.7 }}>Type</span>}
      <ButtonBase 
        sx={{ display: "flex", alignItems: "center", height: "25px", minWidth: "25px", borderWidth: "1px", borderColor: "color-mix(in srgb, currentColor 23%, transparent)", 
          borderStyle: "solid", borderRadius: "5px", fontSize: "12px" 
        }}
        onClick={() => onClick(type === "CE" ? "PE" : "CE")} 
      >
        {type}
      </ButtonBase>
    </div>
  );
};

export default TypeButton;