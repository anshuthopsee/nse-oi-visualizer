import TextField from "@mui/material/TextField";

type PriceInputProps = {
  price: number;
  showHeader?: boolean;
  onChange: (price: number) => void;
};

const PriceInput = ({ price, onChange, showHeader = false }: PriceInputProps) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center",rowGap: "10px" }}>
      {showHeader && <span style={{ fontSize: "12px", opacity: 0.7 }}>Price</span>}
      <TextField
        size="small"
        InputProps={{ readOnly: true, sx: { height: "25px", fontSize: "11px" } }}
        sx={{ width: "65px", minWidth: "65px", height: "25px", minHeight: "25px", fontSize: "12px",
          border: "1px solid", borderColor: "color-mix(in srgb, currentColor 23%, transparent)", borderRadius: "5px",
          '& .MuiInputBase-input': {
            px: 1,
            fontSize: "12px",
            cursor: "pointer",
          },
          '& fieldset': {
            p: 0,
            border: "none",
          }
        }}
        value={price}
        onChange={(e) => {
          return;
          // Price input read-only for now
          const value = Number(e.target.value);
          if (!isNaN(value)) {
            onChange(value);
          };
        }}
      />
    </div>
  );
};

export default PriceInput;