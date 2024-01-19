import { useSelector } from 'react-redux';
import { getThemeMode } from '../features/theme/themeSlice';
import { Outlet } from 'react-router-dom';
import { ThemeProvider, Container, CssBaseline } from '@mui/material';
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