import { useDispatch, useSelector } from "react-redux";
import { Box, Typography } from "@mui/material";
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Chip from '@mui/material/Chip';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { getExpiries, setExpiries } from "../../features/selected/selectedSlice";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const Expiries = () => {
  const dispatch = useDispatch();
  const expiries = useSelector(getExpiries) || [];

  const chosenExpiryDates = expiries.reduce<string[]>((acc, { chosen, date }) => {
    if (chosen) {
        acc.push(date);
    }
    return acc;
  }, []);

  const handleChange = (e: SelectChangeEvent<typeof chosenExpiryDates>) => {
    const expiryDates = e.target.value as string[];

    const updatedExpiries = expiries.map((expiry) => { 
      return {
        date: expiry.date,
        chosen: expiryDates.includes(expiry.date)
      }
    });

    dispatch(setExpiries(updatedExpiries));

  };

  return (
    <Box sx={{ height: "auto", borderRadius: "5px", backgroundColor: "background.paper", border: 1, borderColor: "divider" }}>
      <Typography sx={{ fontSize: "15px", width: "100%", height: "fit-content", p: 1.5, fontWeight: "bold" }}>Expiries</Typography>
      <Box sx={{ display: "flex", height: "fit-content", px: 1.5, pb: 1.5 }}>
        <FormControl sx={{ m: 0, width: "100%" }} size="small">
          <InputLabel id="expiries-label"></InputLabel>
          <Select
            labelId="expries-label"
            id="expiries-select"
            multiple
            value={chosenExpiryDates}
            onChange={handleChange}
            sx={{
              '& .MuiSelect-select': {
                 px: 1,
              }
            }}
            SelectDisplayProps={{
              style: {
                minHeight: "33px",
              }
            }}
            input={<OutlinedInput id="selected-expiry-chip" />}
            renderValue={(chosen) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {chosen.map((expiry) => (
                  <Chip key={expiry} label={expiry} sx={{ fontSize: "11px" }} />
                ))}
              </Box>
            )}
            MenuProps={MenuProps}
          >
            {(expiries || []).map((expiry) => (
              <MenuItem
                key={expiry.date}
                value={expiry.date}
              >
                {expiry.date}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </Box>
  );
};

export default Expiries;