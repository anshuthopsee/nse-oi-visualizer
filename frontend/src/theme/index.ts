import { createTheme } from '@mui/material/styles';

declare module "@mui/material/styles" {

  interface Palette {
    tableCell: {
      itm: string;
      atm: string;
    },
    button: {
      primary: string;
    },
    buttonText: {
      primary: string;
    },
    actionButton: {
      buyPrimary: string;
      sellPrimary: string;
      buySecondary: string;
      sellSecondary: string;
    },
    sliderMark: {
      primary: string;
    },
    payoffLine: {
      itm: string;
      otm: string;
    };
  }

  interface PaletteOptions {
    tableCell?: {
      itm: string;
      atm: string;
    },
    button?: {
      primary: string;
    },
    buttonText?: {
      primary: string;
    },
    actionButton?: {
      buyPrimary: string;
      sellPrimary: string;
      buySecondary: string;
      sellSecondary: string;
    },
    sliderMark?: {
      primary: string;
    },
    payoffLine: {
      itm: string;
      otm: string;
    };
  }
}

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
    mode: 'light',
    background: {
      default: '#f2f2f2',
      paper: "#ffffff",
    },
    text: {
      primary: "#2e2d2d",
      secondary: "#2e2d2d",
    },
    tableCell: {
      itm: "#FFFEE5",
      atm: "#E5EFFB",
    },
    button: {
      primary: "#006CE6"
    },
    buttonText: {
      primary: "#ffffff"
    },
    actionButton: {
      buyPrimary: "#006CE6",
      sellPrimary: "#C85959",
      buySecondary: "#E5EFFB",
      sellSecondary: "#FFE2E3"
    },
    sliderMark: {
      primary: "white",
    },
    payoffLine: {
      itm: "#15d458",
      otm: "#eb3434"
    }
  },
  components
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: "#000000",
      paper: '#0d0d0d',
    },
    text: {
      primary: "#ffffff",
      secondary: "#ffffff",
    },
    tableCell: {
      itm: "#3A3426",
      atm: "#314256",
    },
    button: {
      primary: "#68A5EA"
    },
    actionButton: {
      buyPrimary: "#68A5EA",
      sellPrimary: "#C06767",
      buySecondary: "#314256",
      sellSecondary: "#542A27"
    },
    sliderMark: {
      primary: "#0d0d0d",
    }, 
    payoffLine: {
      itm: "#4dff6a",
      otm: "#ff3848"
    }
  },
  components
});

export { lightTheme, darkTheme };