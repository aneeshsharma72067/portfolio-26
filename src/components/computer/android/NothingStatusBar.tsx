import React, { useState, useEffect } from 'react';
import { Wifi, Battery } from 'lucide-react';

const NothingStatusBar: React.FC = () => {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setTime(`${hours}:${minutes}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const containerStyle: React.CSSProperties = {
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 20px',
    background: 'transparent',
  };

  const leftStyle: React.CSSProperties = {
    fontFamily: "'Space Mono', monospace",
    fontSize: '12px',
    color: '#FFFFFF',
    fontWeight: 500,
  };

  const rightStyle: React.CSSProperties = {
    display: 'flex',
    gap: '6px',
    alignItems: 'center',
  };

  const signalBarsContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '1px',
    height: '10px',
  };

  const getSignalBarStyle = (height: string): React.CSSProperties => ({
    width: '2.5px',
    height,
    backgroundColor: '#FFFFFF',
  });

  const batteryTextStyle: React.CSSProperties = {
    fontFamily: "'Space Mono', monospace",
    fontSize: '10px',
    color: '#999999',
    marginLeft: '2px',
  };

  return (
    <div style={containerStyle}>
      <div style={leftStyle}>{time}</div>
      <div style={rightStyle}>
        <div style={signalBarsContainerStyle}>
          <div style={getSignalBarStyle('3px')} />
          <div style={getSignalBarStyle('5px')} />
          <div style={getSignalBarStyle('7px')} />
          <div style={getSignalBarStyle('10px')} />
        </div>
        <Wifi size={14} color="#FFFFFF" strokeWidth={1.5} />
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Battery size={16} color="#FFFFFF" strokeWidth={1.5} />
          <span style={batteryTextStyle}>89%</span>
        </div>
      </div>
    </div>
  );
};

export default NothingStatusBar;
