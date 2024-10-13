import React, { useState, useEffect } from 'react';
import { getRanges, deployRange } from '../services/api';

const RangesPage = () => {
  const [ranges, setRanges] = useState([]);
  const [newRangeName, setNewRangeName] = useState('');
  const [templateName, setTemplateName] = useState('');

  useEffect(() => {
    async function fetchRanges() {
      const response = await getRanges();
      setRanges(response.data);
    }
    fetchRanges();
  }, []);

  const handleDeploy = async () => {
    await deployRange(templateName, newRangeName);
    // Fetch updated list of ranges
  };

  return (
    <div>
      <h2>Available Ranges</h2>
      <ul>
        {ranges.map((range) => (
          <li key={range.id}>{range.name}</li>
        ))}
      </ul>
      <div>
        <input type="text" placeholder="New Range Name" value={newRangeName} onChange={(e) => setNewRangeName(e.target.value)} />
        <input type="text" placeholder="Template Name" value={templateName} onChange={(e) => setTemplateName(e.target.value)} />
        <button onClick={handleDeploy}>Deploy New Range</button>
      </div>
    </div>
  );
};

export default RangesPage;