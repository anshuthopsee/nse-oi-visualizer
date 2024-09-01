import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

type StrikeSelectProps = {
  strikes: number[];
  strike: number;
  showHeader?: boolean;
  onChange: (strike: number) => void;
};

// IF STRIKE IS CHANGED, IT WILL CREATE A NEW LEG WON'T IT? THIS IS NOT DESIRED
// EXPIRY CHANGE SHOULD NOT BE ALLOWED IF STRIKE IS NOT AVAILABLE FOR THAT EXPIRY

const StrikeSelect = ({ strikes, strike, onChange, showHeader = false }: StrikeSelectProps) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center",rowGap: "10px" }}>
      {showHeader && <span style={{ fontSize: "12px", opacity: 0.7 }}>Strike</span>}
      <Select
        size="small"
        sx={{ width: "75px", minWidth: "75px", height: "25px", minHeight: "25px", fontSize: "12px", p: 0,
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
        value={strike}
        onChange={(e) => onChange(Number(e.target.value))}
      >
        {strikes.map((strike) => (
          <MenuItem key={strike} value={strike} sx={{ pr: 3 }}>{strike}</MenuItem>
        ))}
      </Select>
    </div>
  );
};

export default StrikeSelect;