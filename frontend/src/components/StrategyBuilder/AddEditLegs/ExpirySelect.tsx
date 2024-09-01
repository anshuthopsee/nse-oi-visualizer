import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";

type ExpirySelectProps = {
  expiry: string | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  expiries: string[];
};

const ExpirySelect = ({ expiry, expiries, onChange }: ExpirySelectProps) => {
  return (
    <div style={{ display: "flex", rowGap: "0px", alignItems: "start", flexDirection: "column" }}>
      {/* <label htmlFor="options-table-expiry-select" style={{ fontSize: "11px", fontWeight: "bold" }}>Expiry</label> */}
      <TextField 
        select
        size="small"
        id="options-table-expiry-select"
        label="Expiry"
        value={expiry || ""}
        onChange={onChange}
        sx={{
          display: "flex",
          height: "35px",
          minHeight: "35px",
          fontSize: "12px",
          '& .MuiInputBase-root': {
            height: "35px",
            minHeight: "35px",
            fontSize: "12px",
            backgroundColor: "background.paper",
            '& .MuiSelect-select': {
              display: "flex",
              alignItems: "center",
              height: "35px",
              paddingTop: 0,
              paddingBottom: 0,
              '&:focus': {
                backgroundColor: "transparent",
                border : "none",
              },
            },
            '& .MuiSelect-icon': {
              width: "17px",
              height: "35px",
              top: "calc(50% - 17.5px)",
            },
          },
        }}
      >
        {expiries.map((expiry) => (
          <MenuItem key={expiry} value={expiry}>{expiry}</MenuItem>
        ))}
      </TextField>
    </div>
  );
};

export default ExpirySelect;