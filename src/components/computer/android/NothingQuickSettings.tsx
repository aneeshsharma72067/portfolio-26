import React from 'react';
import { X, Wifi, Bluetooth, BellOff, Flashlight, RotateCw, Plane } from 'lucide-react';

interface NothingQuickSettingsProps {
  open: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

const NothingQuickSettings: React.FC<NothingQuickSettingsProps> = ({ open, onClose, onNavigate }) => {
  if (!open) return null;

  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    zIndex: 50,
    background: '#000000',
    padding: '20px 20px 0 20px',
    fontFamily: "'Space Grotesk', sans-serif",
  };

  const topRowStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '11px',
    color: '#555555',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
  };

  const closeButtonStyle: React.CSSProperties = {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '8px',
    marginTop: '16px',
  };

  const tileStyle = (isActive: boolean = false): React.CSSProperties => ({
    width: '100%',
    height: '56px',
    background: isActive ? '#1A1A1A' : '#0D0D0D',
    border: '1px solid #2E2E2E',
    borderRadius: 16,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    position: 'relative',
    cursor: 'pointer',
  });

  const tileLabelStyle: React.CSSProperties = {
    fontSize: '9px',
    textTransform: 'uppercase',
    color: '#999999',
    letterSpacing: '0.10em',
  };

  const dotStyle: React.CSSProperties = {
    position: 'absolute',
    top: '6px',
    right: '6px',
    width: '4px',
    height: '4px',
    background: '#FF3030',
    borderRadius: '50%',
  };

  const sectionLabelStyle: React.CSSProperties = {
    fontSize: '9px',
    color: '#555555',
    textTransform: 'uppercase',
    letterSpacing: '0.10em',
  };

  const trackStyle: React.CSSProperties = {
    height: '4px',
    width: '100%',
    background: '#1A1A1A',
    borderRadius: '999px',
    marginTop: '8px',
    position: 'relative',
  };

  const fillStyle: React.CSSProperties = {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '70%',
    height: '4px',
    background: '#FFFFFF',
    borderRadius: '999px',
  };

  const deviceInfoContainerStyle: React.CSSProperties = {
    marginTop: '32px',
    textAlign: 'center',
  };

  const deviceInfoStyle1: React.CSSProperties = {
    fontFamily: "'Space Mono', monospace",
    fontSize: '11px',
    color: '#555555',
  };

  const deviceInfoStyle2: React.CSSProperties = {
    fontFamily: "'Space Mono', monospace",
    fontSize: '10px',
    color: '#555555',
    marginTop: '4px',
  };

  const exitButtonStyle: React.CSSProperties = {
    width: '100%',
    height: '44px',
    background: 'transparent',
    border: '1px solid #2E2E2E',
    borderRadius: '999px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    marginTop: '20px',
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.10em',
    color: '#FFFFFF',
  };

  const bottomTextStyle: React.CSSProperties = {
    fontSize: '10px',
    color: '#555555',
    textAlign: 'center',
    position: 'absolute',
    bottom: '40px',
    left: 0,
    right: 0,
  };

  return (
    <div className="nos-slide-down" style={containerStyle}>
      <div style={topRowStyle}>
        <div style={labelStyle}>QUICK SETTINGS</div>
        <button style={closeButtonStyle} onClick={onClose}>
          <X size={20} color="#999999" strokeWidth={1.5} />
        </button>
      </div>

      <div style={gridStyle}>
        <div style={tileStyle(true)}>
          <div style={dotStyle} />
          <Wifi size={18} color="#FFFFFF" strokeWidth={1.5} />
          <div style={tileLabelStyle}>WIFI</div>
        </div>
        <div style={tileStyle()}>
          <Bluetooth size={18} color="#FFFFFF" strokeWidth={1.5} />
          <div style={tileLabelStyle}>BLUETOOTH</div>
        </div>
        <div style={tileStyle()}>
          <BellOff size={18} color="#FFFFFF" strokeWidth={1.5} />
          <div style={tileLabelStyle}>DND</div>
        </div>
        <div style={tileStyle()}>
          <Flashlight size={18} color="#FFFFFF" strokeWidth={1.5} />
          <div style={tileLabelStyle}>FLASHLIGHT</div>
        </div>
        <div style={tileStyle()}>
          <RotateCw size={18} color="#FFFFFF" strokeWidth={1.5} />
          <div style={tileLabelStyle}>ROTATE</div>
        </div>
        <div style={tileStyle()}>
          <Plane size={18} color="#FFFFFF" strokeWidth={1.5} />
          <div style={tileLabelStyle}>AIRPLANE</div>
        </div>
      </div>

      <div style={{ marginTop: '20px' }}>
        <div style={sectionLabelStyle}>BRIGHTNESS</div>
        <div style={trackStyle}>
          <div style={fillStyle} />
        </div>
      </div>

      <div style={deviceInfoContainerStyle}>
        <div style={deviceInfoStyle1}>Nothing Phone (3)</div>
        <div style={deviceInfoStyle2}>Nothing OS 4.0 &middot; Android 16</div>
      </div>

      <button style={exitButtonStyle} onClick={() => onNavigate('/')}>
        EXIT TO PORTFOLIO
      </button>

      <div style={bottomTextStyle}>TAP OUTSIDE TO CLOSE</div>
    </div>
  );
};

export default NothingQuickSettings;
