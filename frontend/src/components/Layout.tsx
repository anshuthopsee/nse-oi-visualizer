import { useSelector } from 'react-redux';
import { getThemeMode } from '../features/theme/themeSlice';
import { Outlet } from 'react-router-dom';
import { ThemeProvider } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import Header from './Header';
import { lightTheme, darkTheme } from '../theme';

const Layout = () => {
  const themeMode = useSelector(getThemeMode);

  return (
    <ThemeProvider theme={themeMode === "light" ? lightTheme : darkTheme}>
      <CssBaseline />
      <Header />
      <Container maxWidth="xl" disableGutters sx={{ height: "calc(100dvh - 70px)" }}>
        <Outlet />
      </Container>
    </ThemeProvider>
  );
};

export default Layout;