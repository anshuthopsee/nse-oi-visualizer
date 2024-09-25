import { useRef, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getSBUnderlyingPrice, getSBTargetUnderlyingPrice, setSBTargetUnderlyingPrice } from '../../../features/selected/selectedSlice';
import Slider from '@mui/material/Slider';
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import ButtonBase from "@mui/material/ButtonBase";
import IconButton from "@mui/material/IconButton";
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';

const TargetUnderlyingPriceSelector = () => {
  
  const dispatch = useDispatch();
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const underlyingPrice = useSelector(getSBUnderlyingPrice) || 0;
  const targetUnderlyingPriceAutoUpdate = useSelector(getSBTargetUnderlyingPrice).autoUpdate;
  console.log("targetUnderlyingPriceAutoUpdate", targetUnderlyingPriceAutoUpdate);
  const [targetUnderlyingPrice, setTargetUnderlyingPrice] = useState<number>(underlyingPrice);
  const minTargetUnderlyingPrice = Math.round((underlyingPrice * 0.9));
  const maxTargetUnderlyingPrice = Math.round((underlyingPrice * 1.1));
  const step = Math.ceil((underlyingPrice * 0.005));
  const resetAutoUpdateDisabled = targetUnderlyingPriceAutoUpdate || targetUnderlyingPrice === underlyingPrice;

  const handleReset = () => {
    setTargetUnderlyingPrice(underlyingPrice);
    console.log("resetting");
    timerRef.current && clearTimeout(timerRef.current);
    if (typeof underlyingPrice !== "number") return;
    timerRef.current = setTimeout(() => {
      
      dispatch(setSBTargetUnderlyingPrice({
        value: underlyingPrice,
        autoUpdate: true,
      }));

    }, 500);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setTargetUnderlyingPrice(value);
  };

  const handleSliderChange = (_e: Event, value: number | number[]) => {
    if (typeof value === "number") {
      setTargetUnderlyingPrice(value);
    };
  };

  useEffect(() => {
    if (!resetAutoUpdateDisabled) return;
    setTargetUnderlyingPrice(underlyingPrice);
  }, [underlyingPrice]);

  useEffect(() => {
    timerRef.current && clearTimeout(timerRef.current);
    if (typeof targetUnderlyingPrice !== "number") return;

    timerRef.current = setTimeout(() => {
      dispatch(setSBTargetUnderlyingPrice({
        value: targetUnderlyingPrice,
        autoUpdate: false,
      }));

    }, 500);
    return () => {
      timerRef.current && clearTimeout(timerRef.current);
    };
  }, [targetUnderlyingPrice, dispatch]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", width: "100%", mt: 1.5 }}>
      <Box sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "start" }}>
        <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "start" }}>
          <Typography variant="body2">Target Underlying Price</Typography>
          <ButtonBase 
            sx={{ color: resetAutoUpdateDisabled ? "text.disabled" : "primary.main", fontSize: 14 }}
            disabled={resetAutoUpdateDisabled}
            onClick={handleReset}
          >
            Reset & Auto Update
          </ButtonBase>
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-end", flex: 1 }}>
          <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center", border: "1px solid", 
            borderColor: "color-mix(in srgb, currentColor 23%, transparent)", borderTopLeftRadius: 5, borderBottomLeftRadius: 5,
            borderTopRightRadius: 5, borderBottomRightRadius: 5 }}
          >
            <Box sx={{ borderRight: "1px solid", borderColor: "color-mix(in srgb, currentColor 23%, transparent)" }}>
              <IconButton
                size="small"
                sx={{ height: "40px", width: "40px", color: "primary" }}
                onClick={() => setTargetUnderlyingPrice(targetUnderlyingPrice - step)}
                disabled={targetUnderlyingPrice <= minTargetUnderlyingPrice}
              >
                <RemoveIcon fontSize="small" />
              </IconButton>
            </Box>
            <TextField
              id="target-underlying-price-input"
              size="small"
              type="number"
              sx={{ 
                width: { xs: 100, sm: 120 }, minHeight: 25,
                "& fieldset": {
                  border: "none",
                  p: 0,
                },
                '& .MuiInputBase-input': {
                  cursor: "pointer",
                },
                "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button": {
                  display: "none",
                },
                "& input[type=number]": {
                  MozAppearance: "textfield",
                },
              }}
              value={targetUnderlyingPrice}
              onChange={handleInputChange}
              inputProps={{ 
                min: minTargetUnderlyingPrice, 
                max: maxTargetUnderlyingPrice, 
                step: step,
                readOnly: true, 
              }}
              InputProps={{ 
                sx: { fontSize: { xs: 12, md: 14 }, textAlign: "center" },
              }}
              InputLabelProps={{
                shrink: true,
              }}
              variant="outlined"
            />
            <Box sx={{ borderLeft: "1px solid", borderColor: "color-mix(in srgb, currentColor 23%, transparent)" }}>
              <IconButton
                size="small"
                sx={{ height: "40px", width: "40px", color: "primary" }}
                onClick={() => setTargetUnderlyingPrice(targetUnderlyingPrice + step)}
                disabled={targetUnderlyingPrice >= maxTargetUnderlyingPrice}
              > 
                <AddIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Box>
      <Slider
        aria-label="Target Underlying Price"
        sx={{
          "& .MuiSlider-rail": { height: 10, borderRadius: 3, opacity: 0.9 },
          "& .MuiSlider-track": { height: 10, borderRadius: 3,  },
        }}
        value={targetUnderlyingPrice}
        valueLabelFormat={(value) => value.toFixed(2)}
        track={false}
        step={step}
        min={minTargetUnderlyingPrice}
        max={maxTargetUnderlyingPrice}
        valueLabelDisplay="off"
        onChange={handleSliderChange}
      />
    </Box>
  )
};

export default TargetUnderlyingPriceSelector