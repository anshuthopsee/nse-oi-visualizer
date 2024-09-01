import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

type LotsSelectProps = {
  maxLots: number;
  lots: number;
  showHeader?: boolean;
  onChange: (lots: number) => void;
};

const LotsSelect = ({ maxLots, lots, onChange, showHeader = false }: LotsSelectProps) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center",rowGap: "10px" }}>
      {showHeader && <span style={{ fontSize: "12px", opacity: 0.7 }}>Lots</span>}
      <Select
        size="small"
        sx={{ display: "flex", width: "60px", minWidth: "60px", height: "25px", minHeight: "25px", fontSize: "12px", p: 0,
          border: "1px solid", borderColor: "color-mix(in srgb, currentColor 23%, transparent)", borderRadius: "5px",
          '&& .MuiSelect-select': {
            pl: 1,
            pr: "23px !important",
          },
          '& .MuiSelect-nativeInput': {
            p: 0,
          },
          '& .MuiSelect-icon': {
            width: "23px",
            right: 0,
          },
          ' & fieldset': {
            p: 0,
            border: "none",
          }
        }}
        value={lots}
        onChange={(e) => {
          const value = Number(e.target.value);
          if (!isNaN(value)) {
            onChange(value);
          };
        }}
      >
        {Array.from({ length: maxLots }, (_, i) => {
          return (
            <MenuItem key={i + 1} value={i + 1} sx={{ pr: 3 }}>{i + 1}</MenuItem>
          );
        })}
      </Select>
    </div>
  );
};

export default LotsSelect;