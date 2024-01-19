import { createTheme } from '@mui/material/styles';

const components = {
  MuiAccordion: {
    styleOverrides: {
     root: {
       "&:before": {
         backgroundColor: "transparent",
       },
      },
    },
  },
  MuiButton: {
    defaultProps: {
      disableElevation: true,
    }
  }
};

const lightTheme = createTheme({
  palette: {
    mode: 'light', // Enable light mode
    background: {
      default: '#f2f2f2', // Set the background color for light mode,
      paper: "#ffffff",
    },
    text: {
      primary: "#2e2d2d",
      secondary: "#2e2d2d",
    },
  },
  components
});

// Define the dark mode theme (you can customize it as needed)
const darkTheme = createTheme({
  palette: {
    mode: 'dark', // Enable dark mode
    background: {
      default: "#000000",
      paper: '#0d0d0d', // Set the background color for dark mode
    },
    text: {
      primary: "#ffffff",
      secondary: "#ffffff",
    },
  },
  components
});

export { lightTheme, darkTheme };