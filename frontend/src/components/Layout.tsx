import { useSelector } from 'react-redux';
import { getThemeMode } from '../features/theme/themeSlice';
import { Outlet } from 'react-router-dom';
import { ThemeProvider } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Header from './Common/Header';
import { lightTheme, darkTheme } from '../theme';

const Layout = () => {
  const themeMode = useSelector(getThemeMode);

  return (
    <ThemeProvider theme={themeMode === "light" ? lightTheme : darkTheme}>
      <CssBaseline />
      <Header />
      <Box sx={{ height: "calc(100dvh - 70px)", position: "relative", width: "100%" }}>
        <Container maxWidth="xl" disableGutters sx={{ position: undefined }}>
          <Outlet />
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default Layout;