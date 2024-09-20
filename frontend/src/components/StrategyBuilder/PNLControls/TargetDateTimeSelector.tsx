import { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { getSBTargetDateTime, setSBTargetDateTime, getSBOptionLegs } from '../../../features/selected/selectedSlice';
import { getTargetDateTime, getMinTargetDateTime, getMaxTargetDateTime, getActiveOptionLegs } from '../../../utils';
import Box from '@mui/material/Box';
import { Update } from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';

const TargetDateTimeSelector = () => {
  const dispatch = useDispatch();
  const optionLegs = useSelector(getSBOptionLegs);
  const activeOptionLegs = useMemo(() => {
    return getActiveOptionLegs(optionLegs) ;   
  }, [optionLegs]);

  const maxTargetDateTime = getMaxTargetDateTime(activeOptionLegs);
  const minTargetDateTime = getMinTargetDateTime(maxTargetDateTime);
  const targetDateTime = new Date(useSelector(getSBTargetDateTime).value);
  const disabled = !activeOptionLegs || activeOptionLegs.length === 0;
  const resetAutoUpdateDisabled = targetDateTime.getTime() === getTargetDateTime().getTime();
  const [pickerOpen, setPickerOpen] = useState<boolean>(false);

  const handleDateChange = (date: Date | null) => {
    if (date) {
      if (date < minTargetDateTime) {
        date = minTargetDateTime;
      } else if (maxTargetDateTime && date > maxTargetDateTime) {
        date = maxTargetDateTime;
      };

      dispatch(setSBTargetDateTime({
        value: date.toISOString(),
        autoUpdate: false
      }));
    };
  };

  const handleUpdate = () => {
    dispatch(setSBTargetDateTime({
      value: getTargetDateTime().toISOString(),
      autoUpdate: true
    }));
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <DateTimePicker
          label="Target Datetime"
          disabled={disabled}
          open={pickerOpen}
          ampm={false}
          reduceAnimations
          timeSteps={{ hours: 1, minutes: 3 }}
          minTime={minTargetDateTime}
          maxTime={maxTargetDateTime}
          minDate={minTargetDateTime}
          maxDate={maxTargetDateTime}
          closeOnSelect={false}
          onClose={() => setPickerOpen(false)}
          value={targetDateTime}
          onChange={handleDateChange}
          slotProps={{
            textField: {
              disabled: disabled,
              inputProps: { sx: { cursor: "pointer" } },
              InputProps: {
                disabled: disabled,
                readOnly: true,
                startAdornment: (
                  <IconButton
                    disabled={disabled || resetAutoUpdateDisabled} 
                    sx={{ color: (disabled || resetAutoUpdateDisabled) ? "disabled" : "primary.main" }} 
                    onClick={(e) => (
                      e.stopPropagation(),
                      handleUpdate()
                    )}
                  >
                    <Update />
                  </IconButton>
                ),
                sx: {
                  pr: 1.5,
                  pl: 0,
                  cursor: "pointer",
                }
              },
              onClick: () => (!disabled && setPickerOpen(true)),
            },
            openPickerButton: {
              disabled: disabled,
              onClick: () => setPickerOpen(true),
            }
          }}
        />
      </Box>
    </LocalizationProvider>
  );
};

export default TargetDateTimeSelector;