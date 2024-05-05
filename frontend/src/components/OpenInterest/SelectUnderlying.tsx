import { Box, Autocomplete, TextField, Typography } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import SelectIndices from "./SelectIndices";
import identifiers from "../../identifiers";
import { useDispatch, useSelector } from "react-redux";
import { getUnderlying, setUnderlying } from "../../features/selected/selectedSlice";
import { type IdentifiersType as UnderlyingType } from "../../identifiers";


const SelectUnderlying = () => {
  const dispatch = useDispatch();
  const underlying = useSelector(getUnderlying);


  const handleChange = (selected: UnderlyingType) => {
    dispatch(setUnderlying(selected));
  };

  return (
    <Box sx={{ backgroundColor: "background.paper", borderRadius: "5px", border: 1, borderColor: "divider" }}>
      <Box sx={{ height: "60px", display: "flex", alignItems: "center", borderBottom: 1, borderBottomColor: "divider", px: 1.5}}>
        <Autocomplete
          disablePortal
          disableClearable
          id="underlying-select"
          options={identifiers}
          value={underlying}
          onChange={(_e, selected) => {
            handleChange(selected);
          }}
          size="small"
          sx={{ width: "100%" }}
          renderInput={(params) => (
            <TextField {...params} variant="standard" size="small" 
              InputProps={{...params.InputProps, disableUnderline: true, 
                sx: { fontSize: "15px" },
                startAdornment: <SearchIcon sx={{ fontSize: "20px", mr: 1 }} />
              }} 
              sx={{ fontSize: "15px" }}
            />
          )}
          renderOption={(props, option) => (
            <Typography sx={{ fontSize: "15px" }} {...props}>
                {option}
            </Typography>
          )}
        />
      </Box>
      <SelectIndices/>
    </Box>
  );
};

export default SelectUnderlying;