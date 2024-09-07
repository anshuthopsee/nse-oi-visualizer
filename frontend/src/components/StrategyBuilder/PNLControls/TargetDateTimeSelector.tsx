import { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { getSBTargetDateTime, setSBTargetDateTime, getSBOptionLegs } from '../../../features/selected/selectedSlice';
import { getTargetDateTime, getMinTargetDateTime, getMaxTargetDateTime, getActiveOptionLegs } from '../../../utils';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import UpdateIcon from '@mui/icons-material/Update';

const TargetDateTimeSelector = () => {
  const dispatch = useDispatch();
  const optionLegs = useSelector(getSBOptionLegs);
  const activeOptionLegs = useMemo(() => {
    return getActiveOptionLegs(optionLegs) ;   
  }, [optionLegs]);
  const minTargetDateTime = getMinTargetDateTime();
  const maxTargetDateTime = getMaxTargetDateTime(activeOptionLegs);
  const targetDateTime = new Date(useSelector(getSBTargetDateTime));

  const disabled = !activeOptionLegs || activeOptionLegs.length === 0;

  const [pickerOpen, setPickerOpen] = useState<boolean>(false);

  const handleDateChange = (date: Date | null) => {
    if (date) {

      if (date < minTargetDateTime) {
        date = minTargetDateTime;
      } else if (maxTargetDateTime && date > maxTargetDateTime) {
        date = maxTargetDateTime;
      };

      dispatch(setSBTargetDateTime(date.toISOString()));
    };
  };

  const handleUpdate = () => {
    dispatch(setSBTargetDateTime(getTargetDateTime().toISOString()));
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
          timeSteps={{ hours: 1, minutes: 15 }}
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
                    disabled={disabled} 
                    sx={{ color: disabled ? "disabled" : "primary.main" }} 
                    onClick={(e) => (
                      e.stopPropagation(),
                      handleUpdate()
                    )}
                  >
                    <UpdateIcon />
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