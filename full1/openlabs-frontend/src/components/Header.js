import React from 'react';

const Header = () => {
  return (
    <header>
      <div className="logo">OpenLabs</div>
      <div className="user-section">
        <span>admin</span>
        <button style={{ marginLeft: '20px', cursor: 'pointer' }}>Log out</button>
      </div>
    </header>
  );
};

export default Header;
