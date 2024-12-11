import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark', // Enables dark theme
    primary: {
      main: '#ff9800', // Orange as the primary color
      light: '#ffc947', // Optional lighter shade
      dark: '#c66900',  // Optional darker shade
      contrastText: '#ffffff', // Text color on primary
    },
    background: {
      default: '#121212', // Default background color for dark mode
      paper: '#1e1e1e', // Background color for surfaces (like cards)
    },
    text: {
      primary: '#ffffff', // Text color for main content
      secondary: '#bdbdbd', // Text color for secondary content
    },
  },
  typography: {
    fontFamily: 'Poppins, Arial, sans-serif', // Keep your existing font
  },
});

export default theme;
