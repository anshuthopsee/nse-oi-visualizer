import { useDispatch, useSelector } from "react-redux";
import { Box, Typography, TextField, Button } from "@mui/material";
import { getStrikeRange, setStrikeRange, getStrikeDistanceFromATM, setStrikeDistanceFromATM } from "../../features/selected/selectedSlice";
import { strikeDistancesFromATM } from "../../features/selected/types";

const StrikeRange = () => {
  const dispatch = useDispatch();
  const strikeRange = useSelector(getStrikeRange);
  const strikeDistanceFromATM = useSelector(getStrikeDistanceFromATM);

  const handleTextFieldsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    const payload = {
      customStrikeRange: true
    };

    if (e.target.name === "min-strike") {
      dispatch(setStrikeRange({...payload, strikeRange: { ...strikeRange, min: value }}));
    } else if (e.target.name === "max-strike") {  
      dispatch(setStrikeRange({...payload, strikeRange: { ...strikeRange, max: value }}));
    };
  };

  return (
    <Box sx={{ height: "auto", borderRadius: "5px", backgroundColor: "background.paper", border: 1, borderColor: "divider" }}>
      <Typography sx={{ fontSize: "15px", width: "100%", height: "fit-content", p: 1.5, fontWeight: "bold" }}>Strike Range</Typography>
      <Box sx={{ display: "inline-flex", width: "100%", height: "fit-content", px: 1.5, pt: 1.5, columnGap: "10px" }}>
        <TextField
          id="min-strike"
          label="Min Strike"
          name="min-strike"
          type="number"
          value={strikeRange.min === null ? "" : strikeRange.min}
          InputLabelProps={{
            shrink: true,
          }}
          onChange={handleTextFieldsChange}
          variant="outlined"
          size="small"
          sx={{ height: "fit-content" }}
        />
        <TextField
          id="max-strike"
          label="Max Strike"
          name="max-strike"
          type="number"
          value={strikeRange.max === null ? "" : strikeRange.max}
          InputLabelProps={{
            shrink: true,
          }}
          onChange={handleTextFieldsChange}
          variant="outlined"
          size="small"
          sx={{ height: "fit-content" }}
        />
      </Box>
      <Typography sx={{ fontSize: "15px", width: "100%", height: "fit-content", p: 1.5, }}>Strikes above and below ATM</Typography>
      <Box sx={{ display: "flex", justifyContent: "flex-start", alignItems: "center", 
        height: "fit-content", pb: 2.5, flexDirection: "row", flexWrap: "wrap", 
        gap: "10px", px: 1.5 }}
      >
        {strikeDistancesFromATM.map((strikeDistance) => (
          <Button 
            key={strikeDistance} 
            variant={strikeDistance === strikeDistanceFromATM ? "contained" : "outlined"} 
            size="small" 
            sx={{ fontSize: "15px", textTransform: "none", minWidth: "40px" }}
            onClick={(() => dispatch(setStrikeDistanceFromATM(strikeDistance)))}
          >
            {strikeDistance}
          </Button>
        ))}
      </Box>
    </Box>
  );
};

export default StrikeRange;