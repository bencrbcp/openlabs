import React from 'react';

function Dialog({ title, onClose, onSubmit, inputValue, setInputValue }) {
  return (
    <div className="dialog">
      <h3>{title}</h3>
      <input
        type="text"
        value={inputValue}
        onChange={e => setInputValue(e.target.value)}
        placeholder="Enter name"
      />
      <div>
        <button onClick={onSubmit}>Submit</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}

export default Dialog;
