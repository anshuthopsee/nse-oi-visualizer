import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

type LotsSelectProps = {
  type: "CE" | "PE";
  lots: number;
  onChange: (type: "CE" | "PE", lots: number) => void;
};

const LotsSelect = ({ type, lots, onChange }: LotsSelectProps) => {;
  
  return (
    <>
      {(
        <Select
          size="small"
          sx={{ display: "flex", width: "60px", minWidth: "60px", height: "25px", minHeight: "25px", fontSize: "12px", p: 0,
            border: "1px solid", borderColor: "color-mix(in srgb, currentColor 23%, transparent)", borderRadius: "5px", backgroundColor: "background.paper",
            textAlign: "left",
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
              onChange(type, value);
            };
          }}
        >
          {Array.from({ length: 150 }, (_, i) => {
            return (
              <MenuItem key={i + 1} value={i + 1} sx={{ pr: 3 }}>{i + 1}</MenuItem>
            );
          })}
        </Select>
      )
    }
  </>
)};

export default LotsSelect;