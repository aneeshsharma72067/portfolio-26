import { useState, useRef, useEffect, type FormEvent } from 'react';
import { personal, socials, projects, experiences, skillGroups, links } from '@/data/content';
import { ExternalLink, Github, Linkedin, Twitter, Mail, MapPin } from 'lucide-react';

const CARD: React.CSSProperties = {
  background: '#0D0D0D',
  border: '1px solid #2E2E2E',
  borderRadius: 16,
  padding: '16px',
};

export function NothingAppProjects() {
  return (
    <div className="nos-no-scrollbar nos-slide-up" style={{ overflowY: 'auto', height: '100%', padding: '16px' }}>
      <div style={{ color: '#555555', fontSize: '10px', letterSpacing: '0.12em', marginBottom: '16px', fontFamily: "'Space Grotesk', sans-serif", textTransform: 'uppercase' }}>
        PROPERTIES & CREATIONS
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {projects.map((project, i) => (
          <div key={i} style={CARD}>
            <div>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF' }}>{project.title}</span>
              <span style={{ fontSize: '11px', color: '#555555', fontFamily: "'Space Mono', monospace", marginLeft: '8px' }}>{project.year}</span>
            </div>
            <div style={{ fontSize: '12px', color: '#999999', lineHeight: 1.6, marginTop: '8px', fontFamily: "'Space Grotesk', sans-serif" }}>
              {project.description}
            </div>
            <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {project.tags.map((tag, j) => (
                <div key={j} style={{ fontSize: '10px', color: '#999999', background: '#1A1A1A', border: '1px solid #2E2E2E', borderRadius: '999px', padding: '3px 10px', fontFamily: "'Space Mono', monospace" }}>
                  {tag}
                </div>
              ))}
            </div>
            <div style={{ marginTop: '10px', display: 'flex', gap: '12px' }}>
              {project.github && (
                <a href={project.github} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
                  <span style={{ fontSize: '10px', textTransform: 'uppercase', color: '#999999', letterSpacing: '0.08em' }}>SOURCE</span>
                  <ExternalLink size={10} color="#999999" strokeWidth={1.5} />
                </a>
              )}
              {project.live && (
                <a href={project.live} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
                  <span style={{ fontSize: '10px', textTransform: 'uppercase', color: '#FFFFFF', letterSpacing: '0.08em' }}>LIVE</span>
                  <ExternalLink size={10} color="#FFFFFF" strokeWidth={1.5} />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function NothingAppAbout() {
  return (
    <div className="nos-no-scrollbar nos-slide-up" style={{ overflowY: 'auto', height: '100%', padding: '16px' }}>
      <div style={{ ...CARD, marginBottom: '12px' }}>
        <div style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF' }}>{personal.name}</div>
        <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#999999', letterSpacing: '0.10em', marginTop: '4px' }}>
          {personal.role}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px' }}>
          <MapPin size={12} color="#555555" strokeWidth={1.5} />
          <span style={{ fontSize: '11px', color: '#555555' }}>{personal.location}</span>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {personal.bio.map((paragraph, i) => (
          <div key={i} style={CARD}>
            <div style={{ fontSize: '13px', color: '#999999', lineHeight: 1.7, fontFamily: "'Space Grotesk', sans-serif" }}>
              {paragraph}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function NothingAppExperience() {
  return (
    <div className="nos-no-scrollbar nos-slide-up" style={{ overflowY: 'auto', height: '100%', padding: '16px' }}>
      <div style={{ color: '#555555', fontSize: '10px', letterSpacing: '0.12em', marginBottom: '16px', fontFamily: "'Space Grotesk', sans-serif", textTransform: 'uppercase' }}>
        CAREER LOG
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {experiences.map((exp, i) => (
          <div key={i} style={CARD}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF' }}>{exp.role}</div>
            <div style={{ fontSize: '12px', color: '#999999', marginTop: '2px' }}>{exp.company}</div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <span style={{ color: '#FF3030', fontFamily: "'Space Mono', monospace", fontSize: '11px' }}>{exp.period}</span>
              <span style={{ color: '#555555', fontSize: '11px' }}>— {exp.location}</span>
            </div>
            <div style={{ fontSize: '12px', color: '#999999', lineHeight: 1.6, marginTop: '8px' }}>
              {exp.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function NothingAppSkills() {
  return (
    <div className="nos-no-scrollbar nos-slide-up" style={{ overflowY: 'auto', height: '100%', padding: '16px' }}>
      <div style={{ color: '#555555', fontSize: '10px', letterSpacing: '0.12em', marginBottom: '16px', fontFamily: "'Space Grotesk', sans-serif", textTransform: 'uppercase' }}>
        TECHNICAL STACK
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {skillGroups.map((group, i) => (
          <div key={i}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#555555', letterSpacing: '0.10em', marginBottom: '8px' }}>
              {group.title}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {group.items.map((item, j) => (
                <div key={j} style={{ fontSize: '12px', color: '#FFFFFF', background: '#0D0D0D', border: '1px solid #2E2E2E', borderRadius: '999px', padding: '6px 14px', fontFamily: "'Space Mono', monospace" }}>
                  {item}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function NothingAppContact() {
  const getIcon = (label: string) => {
    const l = label.toLowerCase();
    if (l.includes('github')) return <Github size={18} color="#FFFFFF" strokeWidth={1.5} />;
    if (l.includes('linkedin')) return <Linkedin size={18} color="#FFFFFF" strokeWidth={1.5} />;
    if (l.includes('twitter') || l.includes('x')) return <Twitter size={18} color="#FFFFFF" strokeWidth={1.5} />;
    if (l.includes('email') || l.includes('mail')) return <Mail size={18} color="#FFFFFF" strokeWidth={1.5} />;
    return <ExternalLink size={18} color="#FFFFFF" strokeWidth={1.5} />;
  };

  return (
    <div className="nos-no-scrollbar nos-slide-up" style={{ overflowY: 'auto', height: '100%', padding: '16px' }}>
      <div style={{ color: '#555555', fontSize: '10px', letterSpacing: '0.12em', marginBottom: '16px', fontFamily: "'Space Grotesk', sans-serif", textTransform: 'uppercase' }}>
        GET IN TOUCH
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {socials.map((social, i) => (
          <a key={i} href={social.href} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
            <div style={{ ...CARD, display: 'flex', alignItems: 'center', gap: '12px' }}>
              {getIcon(social.label)}
              <div>
                <div style={{ fontSize: '12px', textTransform: 'uppercase', color: '#555555', letterSpacing: '0.08em' }}>
                  {social.label}
                </div>
                <div style={{ fontSize: '13px', color: '#FFFFFF', marginTop: '2px' }}>
                  {social.handle}
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

export function NothingAppTerminal({ onExit }: { onExit: () => void }) {
  const [lines, setLines] = useState<{ text: string; color?: string }[]>([
    { text: 'Nothing OS [v4.0.0]', color: '#555555' },
    { text: "Type 'help' for commands.", color: '#555555' },
    { text: '' }
  ]);
  const [cmd, setCmd] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const command = cmd.trim();
    if (!command) return;

    const newLines = [...lines, { text: `$ ${command}`, color: '#FFFFFF' }];

    switch (command.toLowerCase()) {
      case 'help':
        newLines.push({ text: 'Commands: help, about, projects, skills, clear, exit', color: '#999999' });
        break;
      case 'about':
        newLines.push({ text: personal.bio[0] || 'No bio available.', color: '#999999' });
        break;
      case 'projects':
        projects.forEach(p => newLines.push({ text: p.title, color: '#999999' }));
        break;
      case 'skills':
        const allSkills = skillGroups.flatMap(g => g.items).join(', ');
        newLines.push({ text: allSkills, color: '#999999' });
        break;
      case 'clear':
        setLines([]);
        setCmd('');
        return;
      case 'exit':
        onExit();
        return;
      default:
        newLines.push({ text: `command not found: ${command}`, color: '#FF3030' });
        break;
    }

    setLines(newLines);
    setCmd('');
  };

  return (
    <div className="nos-slide-up" style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#000000', fontFamily: "'Space Mono', monospace", fontSize: '12px' }}>
      <div ref={scrollRef} className="nos-no-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {lines.map((line, i) => (
          <div key={i} style={{ color: line.color || '#999999', minHeight: '18px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {line.text}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} style={{ borderTop: '1px solid #2E2E2E', padding: '12px 16px', display: 'flex', gap: '8px' }}>
        <span style={{ color: '#FF3030', fontWeight: 700 }}>$</span>
        <input
          type="text"
          value={cmd}
          onChange={(e) => setCmd(e.target.value)}
          autoFocus
          style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#FFFFFF', fontSize: '12px', fontFamily: "'Space Mono', monospace" }}
        />
      </form>
    </div>
  );
}

export function NothingAppSettings({ onNavigate }: { onNavigate: (path: string) => void }) {
  return (
    <div className="nos-no-scrollbar nos-slide-up" style={{ overflowY: 'auto', height: '100%', padding: '16px' }}>
      <div style={{ color: '#555555', fontSize: '10px', letterSpacing: '0.12em', marginBottom: '16px', fontFamily: "'Space Grotesk', sans-serif", textTransform: 'uppercase' }}>
        SYSTEM
      </div>
      
      <div style={CARD}>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #2E2E2E', padding: '10px 0' }}>
          <span style={{ fontSize: '12px', color: '#555555', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: "'Space Mono', monospace" }}>DEVICE</span>
          <span style={{ fontSize: '12px', color: '#FFFFFF', fontFamily: "'Space Mono', monospace" }}>Nothing Phone (3)</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #2E2E2E', padding: '10px 0' }}>
          <span style={{ fontSize: '12px', color: '#555555', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: "'Space Mono', monospace" }}>OS VERSION</span>
          <span style={{ fontSize: '12px', color: '#FFFFFF', fontFamily: "'Space Mono', monospace" }}>Nothing OS 4.0</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #2E2E2E', padding: '10px 0' }}>
          <span style={{ fontSize: '12px', color: '#555555', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: "'Space Mono', monospace" }}>ANDROID</span>
          <span style={{ fontSize: '12px', color: '#FFFFFF', fontFamily: "'Space Mono', monospace" }}>16</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
          <span style={{ fontSize: '12px', color: '#555555', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: "'Space Mono', monospace" }}>BUILD</span>
          <span style={{ fontSize: '12px', color: '#FFFFFF', fontFamily: "'Space Mono', monospace" }}>NOS-4.0.0-2025</span>
        </div>
      </div>

      <div style={{ ...CARD, marginTop: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #2E2E2E', padding: '10px 0' }}>
          <span style={{ fontSize: '12px', color: '#555555', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: "'Space Mono', monospace" }}>NAME</span>
          <span style={{ fontSize: '12px', color: '#FFFFFF', fontFamily: "'Space Mono', monospace" }}>{personal.name}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #2E2E2E', padding: '10px 0' }}>
          <span style={{ fontSize: '12px', color: '#555555', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: "'Space Mono', monospace" }}>ROLE</span>
          <span style={{ fontSize: '12px', color: '#FFFFFF', fontFamily: "'Space Mono', monospace" }}>{personal.role}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
          <span style={{ fontSize: '12px', color: '#555555', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: "'Space Mono', monospace" }}>LOCATION</span>
          <span style={{ fontSize: '12px', color: '#FFFFFF', fontFamily: "'Space Mono', monospace" }}>{personal.location}</span>
        </div>
      </div>

      <button
        onClick={() => onNavigate('/')}
        style={{
          marginTop: '24px',
          width: '100%',
          height: '48px',
          borderRadius: '999px',
          background: 'transparent',
          border: '1px solid #2E2E2E',
          color: '#FFFFFF',
          fontSize: '12px',
          textTransform: 'uppercase',
          letterSpacing: '0.10em',
          cursor: 'pointer',
          fontFamily: "'Space Grotesk', sans-serif"
        }}
      >
        EXIT SYSTEM
      </button>
    </div>
  );
}
