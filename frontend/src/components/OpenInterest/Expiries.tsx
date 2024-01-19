import { type ChangeEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Checkbox, FormControlLabel, Grid, Typography } from "@mui/material";
import { getExpiries, setExpiries } from "../../features/selected/selectedSlice";

const Expiries = () => {
  const dispatch = useDispatch();
  const expiries = useSelector(getExpiries);

  const handleCheckboxesChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === "current") {
      dispatch(setExpiries({ ...expiries, current: e.target.checked }));
    } else if (e.target.name === "next") {
      dispatch(setExpiries({ ...expiries, next: e.target.checked }));
    };
  };

  return (
    <Box sx={{ height: "auto", borderRadius: "5px", backgroundColor: "background.paper", border: 1, borderColor: "divider" }}>
      <Typography sx={{ fontSize: "15px", width: "100%", height: "fit-content", p: 1.5, fontWeight: "bold" }}>Expiries</Typography>
      <Grid container sx={{ maxWidth: "240px", height: "fit-content", px: 1.5, pb: 1.5 }}>
        <Grid item xs={6} sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <FormControlLabel 
            control={<Checkbox checked={expiries.current} onChange={handleCheckboxesChange} />} 
            label="Current" 
            name="current"
            sx={{ fontSize: "15px", userSelect: "none" }} 
          />
        </Grid>
        <Grid item xs={6} sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <FormControlLabel 
            control={<Checkbox checked={expiries.next} onChange={handleCheckboxesChange} />} 
            label="Next" 
            name="next"
            sx={{ fontSize: "15px", userSelect: "none" }} 
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Expiries;