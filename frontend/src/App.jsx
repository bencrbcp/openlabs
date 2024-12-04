import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import axios from 'axios';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';

axios.defaults.withCredentials = true;

const App = () => {
    <ThemeProvider theme={theme}></ThemeProvider>
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
};

export default App;
