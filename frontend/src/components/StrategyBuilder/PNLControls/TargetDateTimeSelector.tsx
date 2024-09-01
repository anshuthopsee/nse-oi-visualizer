import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { getSBTargetDateTime, setSBTargetDateTime, getSBOptionLegs } from '../../../features/selected/selectedSlice';
import { getIST, getExpiryDateTime, getTargetDateTime } from '../../../utils';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import UpdateIcon from '@mui/icons-material/Update';

const getMinDateTime = () => {
  const dateTime = getIST();
  dateTime.setHours(9, 15, 0, 0);
  return dateTime;
};

const TargetDateTimeSelector = () => {
  const dispatch = useDispatch();
  const targetDateTime = new Date(useSelector(getSBTargetDateTime));
  const optionLegs = useSelector(getSBOptionLegs);
  const minDateTime = getMinDateTime();
  const maxDateTime = optionLegs?.filter((leg) => leg.active).reduce((nearestExpiryDateTime, leg) => {
    if (nearestExpiryDateTime === undefined) return;

    const dateTime = getIST();
    const expiryDateTime = new Date(leg.expiry);
    expiryDateTime.setHours(15, 30, 0, 0);

    if (dateTime < expiryDateTime && expiryDateTime < nearestExpiryDateTime) {
      return expiryDateTime;
    };
    return nearestExpiryDateTime;

  }, optionLegs.length > 0 ? getExpiryDateTime(optionLegs[0].expiry) : undefined);

  const disabled = !optionLegs || optionLegs.length === 0;

  const [pickerOpen, setPickerOpen] = useState<boolean>(false);

  const handleDateChange = (date: Date | null) => {
    if (date) {

      if (date < minDateTime) {
        date = minDateTime;
      } else if (maxDateTime && date > maxDateTime) {
        date = maxDateTime;
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
          minTime={minDateTime}
          maxTime={maxDateTime}
          minDate={minDateTime}
          maxDate={maxDateTime}
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