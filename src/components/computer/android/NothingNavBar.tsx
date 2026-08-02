import React from 'react';

const NothingNavBar: React.FC = () => {
  const containerStyle: React.CSSProperties = {
    height: '20px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '8px 0',
    background: 'transparent',
  };

  const pillStyle: React.CSSProperties = {
    width: '134px',
    height: '5px',
    background: '#555555',
    borderRadius: '999px',
  };

  return (
    <div style={containerStyle}>
      <div style={pillStyle} />
    </div>
  );
};

export default NothingNavBar;
