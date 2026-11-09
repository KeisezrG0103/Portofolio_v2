import React, { useEffect, useState } from 'react';
import { useStore } from '../store.js';
import { getContentByIndex } from '../data/content.js';

export function Panel() {
  const mode = useStore((s) => s.mode);
  const panel = useStore((s) => s.panel);
  const closePanel = useStore((s) => s.closePanel);
  const exitFreeMode = useStore((s) => s.exitFreeMode);

  const [animatedSkillIndex, setAnimatedSkillIndex] = useState(0);
  const [signalSent, setSignalSent] = useState(false);
  const [formState, setFormState] = useState({ name: '', email: '', message: '' });

  const content = getContentByIndex(panel.index);
  const animateSkills = panel.open && animatedSkillIndex === panel.index;

  useEffect(() => {
    const timer = setTimeout(() => {
      if (panel.open && content && content.type === 'skills') {
        setAnimatedSkillIndex(panel.index);
      } else {
        setAnimatedSkillIndex(0);
      }
    }, 60);
    return () => clearTimeout(timer);
  }, [panel.open, panel.index, content]);

  const handleReturnToVoyage = (e) => {
    e.currentTarget.blur();
    exitFreeMode(panel.index);
  };

  const handleClose = (e) => {
    e.currentTarget.blur();
    closePanel();
  };



  useEffect(() => {
    if (!panel.open) {
      setSignalSent(false);
    }
  }, [panel.open]);

  const sideClass = panel.side === 'l' ? 'l' : 'r';
  const visibilityClass = panel.open ? 'on' : 'out';

  return (
    <section
      id="panel"
      role="dialog"
      aria-modal="true"
      aria-labelledby="panel-heading"
      aria-hidden={!panel.open}
      className={`${sideClass} ${visibilityClass}`}
    >
      {content && (
        <div id="pc">
          <div className="panel-header-row">
            <div className="k">{content.kicker}</div>
            <button
              type="button"
              className="panel-close-btn"
              aria-label="Tutup panel"
              onClick={handleClose}
            >
              ×
            </button>
          </div>

          <h2 id="panel-heading">{content.title}</h2>

          {content.paragraphs &&
            content.paragraphs.map((p, idx) => (
              <p key={idx} style={idx > 0 ? { marginTop: '12px' } : undefined}>
                {p}
              </p>
            ))}

          {content.timeline &&
            content.timeline.map((item, idx) => (
              <div key={idx} className="tl">
                <em>{item.period}</em>
                <strong>{item.title}</strong>
                <p>{item.description}</p>
              </div>
            ))}

          {content.skills && (
            <div className="skills-list">
              {content.skills.map((sk) => (
                <div key={sk.name} className="sk">
                  <div>
                    <span>{sk.name}</span>
                    <span>{sk.percent}%</span>
                  </div>
                  <s>
                    <i
                      style={{
                        width: animateSkills ? `${sk.percent}%` : '0%',
                      }}
                    />
                  </s>
                </div>
              ))}
            </div>
          )}

          {content.chips && (
            <div className="vals">
              {content.chips.map((chip) => (
                <b key={chip}>{chip}</b>
              ))}
            </div>
          )}

          {content.type === 'contact' && (
            <>
              <div className="ct" style={{ marginTop: '14px' }}>
                {content.links.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target={link.href.startsWith('http') ? '_blank' : undefined}
                    rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </>
          )}

          {mode === 'free' && (
            <div className="vals" style={{ marginTop: '20px' }}>
              <button
                type="button"
                id="fgo"
                className="chip-btn"
                aria-label="Kembali ke perjalanan terpandu pada planet ini"
                onClick={handleReturnToVoyage}
              >
                Kembali ke perjalanan →
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default Panel;
