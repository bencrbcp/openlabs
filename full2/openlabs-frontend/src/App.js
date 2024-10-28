import React, { useState } from 'react';
import './App.css';
import ActiveRanges from './components/ActiveRanges';
import RangeDetails from './components/RangeDetails';

function App() {
  const [page, setPage] = useState('activeRanges');  // To switch between pages
  const [activeRange, setActiveRange] = useState(null);  // To manage the current range

  return (
    <div className="App">
      <header>
        <h1>OpenLabs</h1>
        <div className="user-info">
          <span>admin</span>
          <button>Log out</button>
        </div>
      </header>

      <nav>
        <button className={page === 'activeRanges' ? 'active' : ''} onClick={() => setPage('activeRanges')}>Active Ranges</button>
        <button>Range Templates</button>
        <button>Template Community</button>
        <button>Wiki</button>
      </nav>

      {page === 'activeRanges' && <ActiveRanges setActiveRange={setActiveRange} setPage={setPage} />}
      {page === 'rangeDetails' && activeRange && <RangeDetails activeRange={activeRange} />}
    </div>
  );
}

export default App;