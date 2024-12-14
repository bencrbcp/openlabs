import React from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import CreateVMPage from './components/CreateVMPage';
import Header from './components/Header';
import Profile from './components/Profile';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';
import CreateNetworkPage from './components/CreateNetworkPage';
import ManageNetworks from './components/ManageNetworks';
import ManageNetworkDetail from './components/ManageNetworkDetail';
import NetworkManagerTabs from './components/NetworkManagerTabs';

axios.defaults.withCredentials = true;

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/profile"
            element={
              <>
                <Header />
                <Profile />
              </>
            }
          />
          <Route
            path="/dashboard"
            element={
              <>
                <Header />
                <Dashboard />
              </>
            }
          />
          <Route
            path="/create-vm"
            element={
              <>
                <Header />
                <CreateVMPage />
              </>
            }
          />
          <Route
            path="/create-network"
            element={
              <>
                <Header />
                <CreateNetworkPage />
              </>
            }
          />
          <Route
            path="/manage-networks"
            element={
              <>
                <Header />
                <ManageNetworks />
              </>
            }
          />
          <Route
            path="/manage-networks/:poolid/*"
            element={
              <>
                <Header />
                <ManageNetworkDetail />
              </>
            }
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
