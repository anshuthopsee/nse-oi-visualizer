import { type ReactNode } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Button, Typography } from "@mui/material";
import { getUnderlying, setUnderlying } from "../../features/selected/selectedSlice";

const benchmarkIndices = ["NIFTY", "BANKNIFTY", "MIDCPNIFTY", "FINNIFTY"] as const;

type StyledButtonProps = {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
};

const StyledButton = ({ selected, onClick, children }: StyledButtonProps) => {
  return (
    <Button 
      variant={selected ? "contained" : "outlined"} 
      onClick={onClick}
      size="small"
      sx={{ width: "fit-content", borderRadius: "5px", fontSize: "12px", minWidth: "fit-content", px: 1 }}
    >
      {children}
    </Button>
  )
}

const SelectIndices = () => {
  const dispatch = useDispatch();
  const underlying = useSelector(getUnderlying);

  const handleClick = (selected: typeof benchmarkIndices[number]) => {
    dispatch(setUnderlying(selected));
  };

  return (
    <Box sx={{ height: "auto", borderRadius: "5px", backgroundColor: "background.paper" }}>
      <Typography sx={{ fontSize: "15px", width: "100%", height: "fit-content", p: 1.5, fontWeight: "bold" }}>Indices</Typography>
      <Box sx={{ display: "inline-flex", px: "15px", pb: 2, columnGap: 1, rowGap: 2, flexWrap: "wrap" }}>
        {benchmarkIndices.map((benchmarkIndex) => (
          <StyledButton 
            key={benchmarkIndex}
            selected={underlying === benchmarkIndex}
            onClick={() => handleClick(benchmarkIndex)}
          >
            {benchmarkIndex}
          </StyledButton>
        ))}
      </Box>
    </Box>
  );
};

export default SelectIndices;