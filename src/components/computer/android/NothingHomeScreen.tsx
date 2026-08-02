import React from 'react';
import { 
  Search, 
  FolderOpen, 
  User, 
  Briefcase, 
  Cpu, 
  Mail, 
  TerminalSquare, 
  Settings, 
  Music,
  Github,
  Linkedin,
  Twitter
} from 'lucide-react';
import NothingDotMatrix from './NothingDotMatrix';
import { personal, nowPlaying, links } from '@/data/content';

interface NothingHomeScreenProps {
  time: string;
  date: string;
  onOpenApp: (id: string) => void;
}

const NothingHomeScreen: React.FC<NothingHomeScreenProps> = ({ time, date, onOpenApp }) => {
  const apps = [
    { id: 'projects', icon: FolderOpen, label: 'Projects' },
    { id: 'about', icon: User, label: 'About' },
    { id: 'experience', icon: Briefcase, label: 'Work' },
    { id: 'skills', icon: Cpu, label: 'Stack' },
    { id: 'contact', icon: Mail, label: 'Contact' },
    { id: 'terminal', icon: TerminalSquare, label: 'Terminal' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div 
      className="nos-no-scrollbar"
      style={{
        overflowY: 'auto',
        height: '100%',
        padding: '16px',
        backgroundColor: '#000000',
        fontFamily: "'Space Grotesk', sans-serif"
      }}
    >
      {/* Section 1: Clock Widget Card */}
      <div 
        style={{
          background: '#0D0D0D',
          border: '1px solid #2E2E2E',
          borderRadius: 24,
          padding: '24px 20px',
          position: 'relative'
        }}
      >
        <span 
          style={{
            position: 'absolute',
            top: '12px',
            right: '16px',
            fontSize: '9px',
            textTransform: 'uppercase',
            letterSpacing: '0.14em',
            color: '#555555',
            fontFamily: "'Space Grotesk', sans-serif"
          }}
        >
          NOTHING
        </span>

        <NothingDotMatrix text={time} dotSize={8} gap={3} />
        
        <div 
          style={{
            marginTop: '14px',
            fontFamily: "'Space Mono', monospace",
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: '#999999'
          }}
        >
          {date}
        </div>

        <div 
          style={{
            marginTop: '6px',
            fontFamily: "'Space Mono', monospace",
            fontSize: '10px',
            color: '#999999',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <span style={{ color: '#FF3030', fontSize: '8px' }}>●</span> BILASPUR, IN
        </div>

        <div 
          style={{
            marginTop: '16px',
            borderTop: '1px solid #2E2E2E',
            paddingTop: '12px',
            fontSize: '11px',
            color: '#999999',
            fontFamily: "'Space Grotesk', sans-serif",
            textTransform: 'uppercase',
            letterSpacing: '0.06em'
          }}
        >
          {personal.role}
        </div>
      </div>

      {/* Section 2: Search Bar */}
      <div 
        style={{
          marginTop: '16px',
          background: '#0D0D0D',
          border: '1px solid #2E2E2E',
          borderRadius: '999px',
          height: '44px',
          padding: '0 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        <Search size={16} strokeWidth={1.5} color="#555555" />
        <span 
          style={{
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.10em',
            color: '#555555',
            fontFamily: "'Space Grotesk', sans-serif"
          }}
        >
          SEARCH
        </span>
      </div>

      {/* Section 3: App Grid */}
      <div 
        style={{
          marginTop: '28px',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '28px 16px',
          justifyItems: 'center'
        }}
      >
        {apps.map((app, index) => {
          const Icon = app.icon;
          return (
            <button
              key={app.id}
              onClick={() => onOpenApp(app.id)}
              className={`nos-fade-in nos-stagger-${index + 1}`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: 0
              }}
            >
              <div 
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '16px',
                  background: '#0D0D0D',
                  border: '1px solid #2E2E2E',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Icon size={22} strokeWidth={1.5} color="#FFFFFF" />
              </div>
              <span 
                style={{
                  marginTop: '8px',
                  fontSize: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: '#999999',
                  fontFamily: "'Space Grotesk', sans-serif"
                }}
              >
                {app.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Section 4: Now Playing Widget */}
      <div 
        style={{
          marginTop: '28px',
          background: '#0D0D0D',
          border: '1px solid #2E2E2E',
          borderRadius: 24,
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          position: 'relative'
        }}
      >
        <span 
          style={{
            position: 'absolute',
            top: '4px',
            right: '8px',
            fontSize: '8px',
            color: '#555555',
            textTransform: 'uppercase',
            letterSpacing: '0.10em',
            fontFamily: "'Space Grotesk', sans-serif"
          }}
        >
          NOW PLAYING
        </span>
        <Music size={18} color="#555555" strokeWidth={1.5} />
        <div style={{ display: 'flex', flexDirection: 'column', fontFamily: "'Space Grotesk', sans-serif" }}>
          <div style={{ fontSize: '12px', color: '#FFFFFF', fontWeight: 500 }}>
            {nowPlaying.track}
          </div>
          <div style={{ fontSize: '10px', color: '#555555', marginTop: '2px' }}>
            {nowPlaying.artist}
          </div>
        </div>
      </div>

      {/* Section 5: Social Dock */}
      <div 
        style={{
          marginTop: '28px',
          marginBottom: '16px',
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        <div 
          style={{
            display: 'inline-flex',
            gap: '24px',
            padding: '12px 28px',
            background: '#0D0D0D',
            border: '1px solid #2E2E2E',
            borderRadius: '999px'
          }}
        >
          <a href={links.github} target="_blank" rel="noreferrer" style={{ display: 'flex' }}>
            <Github size={18} color="#999999" strokeWidth={1.5} />
          </a>
          <a href={links.linkedin} target="_blank" rel="noreferrer" style={{ display: 'flex' }}>
            <Linkedin size={18} color="#999999" strokeWidth={1.5} />
          </a>
          <a href={links.twitter} target="_blank" rel="noreferrer" style={{ display: 'flex' }}>
            <Twitter size={18} color="#999999" strokeWidth={1.5} />
          </a>
          <a href={`mailto:${links.email}`} target="_blank" rel="noreferrer" style={{ display: 'flex' }}>
            <Mail size={18} color="#999999" strokeWidth={1.5} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default NothingHomeScreen;
