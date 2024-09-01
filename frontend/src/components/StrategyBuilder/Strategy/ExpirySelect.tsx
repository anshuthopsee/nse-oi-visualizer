import { useContext } from "react";
import { type TransformedData, type DataItem } from "../../../features/selected/types";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { ToastContext } from "../../../contexts/ToastContextProvider";

const getStrikePrices = (dataItems: DataItem[]) => {
  return dataItems.map((item) => item.strikePrice);
};

type ExpirySelectProps = {
  data: TransformedData;
  expiries: string[];
  strike: number;
  expiry: string;
  showHeader?: boolean;
  onChange: (expiry: string) => void;
};

const ExpirySelect = ({ data, strike, expiries, expiry, onChange, showHeader = false }: ExpirySelectProps) => {
  
  const { setToastPack } = useContext(ToastContext);

  const handleChange = (chosenExpiry: string) => {
    const strikes = getStrikePrices(data.grouped[chosenExpiry].data);

    if (!strikes.includes(strike)) {
      const message = `Chosen strike price ${strike} is not available for expiry ${chosenExpiry}.`;
      const toastType = "error";
      setToastPack((prev) => [...prev, { message, type: toastType, key: new Date().getTime() }]);
      return;
    };

    onChange(chosenExpiry);
  };
  
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center",rowGap: "10px" }}>
      {showHeader && <span style={{ fontSize: "12px", opacity: 0.7 }}>Expiry</span>}
      <Select
        size="small"
        renderValue={(value) => value.slice(0, -5)}
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
          },
        }}
        value={expiry}
        onChange={(e) => handleChange(e.target.value)}
      >
        {expiries.map((expiry) => (
          <MenuItem key={expiry} value={expiry}>{expiry}</MenuItem>
        ))}
      </Select>
    </div>
  );
};

export default ExpirySelect;