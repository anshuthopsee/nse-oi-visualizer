import { useDispatch, useSelector } from 'react-redux';
import { getThemeMode, setThemeMode, type ThemeMode } from '../features/theme/themeSlice';
import { setDrawerState } from '../features/drawer/drawerSlice';
import { AppBar, Toolbar, IconButton, Typography } from '@mui/material';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import MenuIcon from '@mui/icons-material/Menu';
import trendIcon from '../assets/trend-icon.svg';
import "@fontsource/exo/400.css";

const Header = () => {
  const dispatch = useDispatch();
  const themeMode = useSelector(getThemeMode);

  const changeThemeMode = (mode: ThemeMode) => {
    dispatch(setThemeMode(mode));
  };

  return (
    <AppBar position='fixed' elevation={0} sx={{ backgroundColor: "background.paper", borderBottom: 1, borderBottomColor: "divider" }}>
      <Toolbar disableGutters>
        <div style={{ flexGrow: 1, display: "inline-flex", alignItems: "center" }}>
          {/* <SignalCellularAltIcon sx={{ color: "#c203fc", ml: 1, fontSize: { xs: "16px", sm: "18px" } }}/> */}
          <Typography color="inherit" component="div" sx={{ height: { xs: "30px", sm: "35px" }, width: { xs: "30px", sm: "35px" }, ml: "10px", mr: "5px" }}>
            <img src={trendIcon} alt="logo" style={{ height: "100%", width: "100%" }}/>
          </Typography>
          <Typography variant="h6" color="inherit" component="div" 
            sx={{ pr: 1, fontWeight: "bold", color: "text.primary", fontFamily: "Exo", fontSize: { xs: "16px", sm: "18px" } }}
          >
            nse-oi-visualizer
          </Typography>
        </div>
        <IconButton edge="start" color="inherit" aria-label="menu"
          sx={{ color: "text.primary", mx: 1 }}
          onClick={() => changeThemeMode(themeMode === "light" ? "dark" : "light")}
        >
          {themeMode === "light" ? 
            <DarkModeIcon/> 
              : 
            <LightModeIcon/>
          }
        </IconButton>
        <IconButton
          size="small"
          color="inherit"
          aria-label="menu"
          onClick={() => dispatch(setDrawerState(true))}
          sx={{ display: { xs: 'flex', lg: 'none'}, color: "text.primary", mr: 1.5 }}
        >
          <MenuIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default Header;