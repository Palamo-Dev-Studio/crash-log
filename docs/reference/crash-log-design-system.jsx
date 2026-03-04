import { useState } from "react";

const SEVERITY_COLORS = {
  ERROR: {
    primary: "#FF3B3B",
    bg: "rgba(255,59,59,0.08)",
    border: "rgba(255,59,59,0.25)",
  },
  OVERRIDE: {
    primary: "#FFB020",
    bg: "rgba(255,176,32,0.08)",
    border: "rgba(255,176,32,0.25)",
  },
  TERMINATE: {
    primary: "#8B95A5",
    bg: "rgba(139,149,165,0.08)",
    border: "rgba(139,149,165,0.25)",
  },
  WARNING: {
    primary: "#FFD426",
    bg: "rgba(255,212,38,0.08)",
    border: "rgba(255,212,38,0.25)",
  },
  CRITICAL: {
    primary: "#C41E3A",
    bg: "rgba(196,30,58,0.08)",
    border: "rgba(196,30,58,0.25)",
  },
  BREACH: {
    primary: "#00D4FF",
    bg: "rgba(0,212,255,0.08)",
    border: "rgba(0,212,255,0.25)",
  },
};

const FONTS = {
  mono: "'JetBrains Mono', 'Fira Code', 'SF Mono', monospace",
  display: "'Space Grotesk', 'DM Sans', sans-serif",
  body: "'Source Serif 4', 'Lora', Georgia, serif",
};

// Wait, the skill says never use Space Grotesk. Let me pick something more distinctive.
// Actually let me just use the fonts directly in the component.

const fontImport = `
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&family=Syne:wght@400;500;600;700;800&display=swap');
`;

const globalStyles = `
  ${fontImport}

  * { margin: 0; padding: 0; box-sizing: border-box; }

  :root {
    --bg-primary: #0A0B0F;
    --bg-secondary: #12131A;
    --bg-tertiary: #1A1B24;
    --bg-elevated: #22232E;
    --text-primary: #E8E9ED;
    --text-secondary: #9BA1B0;
    --text-tertiary: #5C6272;
    --border-subtle: rgba(255,255,255,0.06);
    --border-medium: rgba(255,255,255,0.1);
    --accent-glow: rgba(255,59,59,0.15);
    --font-mono: 'JetBrains Mono', monospace;
    --font-display: 'Syne', sans-serif;
    --font-body: 'Instrument Serif', Georgia, serif;
  }

  body {
    background: var(--bg-primary);
    color: var(--text-primary);
    font-family: var(--font-body);
  }

  ::selection {
    background: rgba(255,59,59,0.3);
    color: #fff;
  }

  @keyframes scanline {
    0% { transform: translateY(-100%); }
    100% { transform: translateY(100vh); }
  }

  @keyframes flicker {
    0%, 100% { opacity: 1; }
    92% { opacity: 1; }
    93% { opacity: 0.8; }
    94% { opacity: 1; }
    96% { opacity: 0.9; }
    97% { opacity: 1; }
  }

  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes typeIn {
    from { width: 0; }
    to { width: 100%; }
  }

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }

  @keyframes pulseGlow {
    0%, 100% { box-shadow: 0 0 8px rgba(255,59,59,0.2); }
    50% { box-shadow: 0 0 20px rgba(255,59,59,0.4); }
  }
`;

function SeverityBadge({ severity }) {
  const colors = SEVERITY_COLORS[severity];
  return (
    <span
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: "11px",
        fontWeight: 600,
        letterSpacing: "0.08em",
        color: colors.primary,
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        padding: "3px 10px",
        borderRadius: "2px",
        textTransform: "uppercase",
      }}
    >
      {severity}
    </span>
  );
}

function StoryBlock({ severity, headline, path, body, delay = 0 }) {
  const colors = SEVERITY_COLORS[severity];
  return (
    <article
      style={{
        borderLeft: `2px solid ${colors.primary}`,
        padding: "28px 0 28px 24px",
        marginBottom: "0",
        animation: `fadeInUp 0.6s ease ${delay}s both`,
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      <div style={{ marginBottom: "12px" }}>
        <SeverityBadge severity={severity} />
      </div>
      <h2
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "15px",
          fontWeight: 600,
          color: colors.primary,
          letterSpacing: "0.02em",
          marginBottom: "6px",
          lineHeight: 1.4,
        }}
      >
        {headline}
      </h2>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "11px",
          color: "var(--text-tertiary)",
          marginBottom: "18px",
          letterSpacing: "0.03em",
        }}
      >
        {path}
      </div>
      <div
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "17px",
          lineHeight: 1.75,
          color: "var(--text-secondary)",
        }}
      >
        {body}
      </div>
    </article>
  );
}

function StackTraceHit({ number, text, source }) {
  return (
    <div
      style={{
        display: "flex",
        gap: "12px",
        alignItems: "baseline",
        padding: "10px 0",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "11px",
          color: "var(--text-tertiary)",
          flexShrink: 0,
          width: "28px",
        }}
      >
        {String(number).padStart(2, "0")}
      </span>
      <span
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "15px",
          lineHeight: 1.6,
          color: "var(--text-secondary)",
        }}
      >
        {text}{" "}
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            color: "var(--text-tertiary)",
          }}
        >
          [{source}]
        </span>
      </span>
    </div>
  );
}

function NavItem({ label, active }) {
  return (
    <a
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: "12px",
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        color: active ? "var(--text-primary)" : "var(--text-tertiary)",
        textDecoration: "none",
        padding: "8px 0",
        borderBottom: active
          ? "1px solid var(--text-primary)"
          : "1px solid transparent",
        cursor: "pointer",
        transition: "color 0.2s",
      }}
    >
      {label}
    </a>
  );
}

export default function CrashLogDesign() {
  const [activeSection, setActiveSection] = useState("issue");

  return (
    <>
      <style>{globalStyles}</style>
      <div
        style={{
          minHeight: "100vh",
          background: "var(--bg-primary)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Scanline overlay */}
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: "none",
            zIndex: 100,
            background:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)",
          }}
        />

        {/* Subtle noise texture */}
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: "none",
            zIndex: 99,
            opacity: 0.025,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Header */}
        <header
          style={{
            borderBottom: "1px solid var(--border-subtle)",
            padding: "0 24px",
            position: "sticky",
            top: 0,
            background: "rgba(10,11,15,0.92)",
            backdropFilter: "blur(12px)",
            zIndex: 50,
          }}
        >
          <div style={{ maxWidth: "720px", margin: "0 auto" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "20px 0 12px",
              }}
            >
              <div>
                <h1
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "22px",
                    fontWeight: 800,
                    letterSpacing: "-0.02em",
                    color: "var(--text-primary)",
                    animation: "flicker 8s infinite",
                  }}
                >
                  THE CRASH LOG
                </h1>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "10px",
                    letterSpacing: "0.15em",
                    color: "var(--text-tertiary)",
                    textTransform: "uppercase",
                    marginTop: "2px",
                  }}
                >
                  AI & Tech Gone Off the Rails
                </div>
              </div>
              <button
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "#0A0B0F",
                  background: "#FF3B3B",
                  border: "none",
                  padding: "8px 20px",
                  borderRadius: "2px",
                  cursor: "pointer",
                  animation: "pulseGlow 3s ease infinite",
                }}
              >
                Subscribe
              </button>
            </div>
            <nav
              style={{
                display: "flex",
                gap: "24px",
                paddingBottom: "12px",
              }}
            >
              <NavItem label="Latest" active />
              <NavItem label="Archive" />
              <NavItem label="Beats" />
              <NavItem label="About" />
            </nav>
          </div>
        </header>

        {/* Main content */}
        <main
          style={{ maxWidth: "720px", margin: "0 auto", padding: "40px 24px" }}
        >
          {/* Issue header */}
          <div
            style={{
              marginBottom: "40px",
              animation: "fadeInUp 0.6s ease both",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                color: "var(--text-tertiary)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: "12px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "#FF3B3B",
                  display: "inline-block",
                  animation: "blink 2s ease infinite",
                }}
              />
              Issue #014 · March 3, 2026
            </div>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "36px",
                fontWeight: 800,
                lineHeight: 1.15,
                letterSpacing: "-0.03em",
                color: "var(--text-primary)",
                marginBottom: "8px",
              }}
            >
              The Machines Are Hiring
              <br />
              <span style={{ color: "var(--text-tertiary)" }}>
                (And Firing)
              </span>
            </h1>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "18px",
                fontStyle: "italic",
                color: "var(--text-secondary)",
                lineHeight: 1.5,
              }}
            >
              Surgical AI goes off-script, the Pentagon picks a fight over model
              access, and Block replaces 4,000 humans with agents.
            </p>
          </div>

          {/* Cover image placeholder */}
          <div
            style={{
              width: "100%",
              height: "320px",
              background:
                "linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 50%, var(--bg-secondary) 100%)",
              border: "1px solid var(--border-medium)",
              borderRadius: "4px",
              marginBottom: "48px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255,59,59,0.03) 40px, rgba(255,59,59,0.03) 41px)",
              }}
            />
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                color: "var(--text-tertiary)",
                letterSpacing: "0.1em",
              }}
            >
              [ COVER IMAGE ]
            </span>
          </div>

          {/* Nico's Transmission */}
          <section
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-medium)",
              borderRadius: "4px",
              padding: "32px",
              marginBottom: "48px",
              position: "relative",
              animation: "fadeInUp 0.6s ease 0.1s both",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "2px",
                background: "linear-gradient(90deg, #FF3B3B, #FFB020, #FF3B3B)",
                opacity: 0.6,
              }}
            />
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "#FF3B3B",
                marginBottom: "16px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span
                style={{
                  width: "16px",
                  height: "1px",
                  background: "#FF3B3B",
                  display: "inline-block",
                }}
              />
              Nico's Transmission
            </div>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "18px",
                lineHeight: 1.8,
                color: "var(--text-primary)",
                fontStyle: "italic",
              }}
            >
              Three stories this week, one thread: the gap between what AI can
              do and what anyone's prepared to handle when it does it. A
              surgical navigation system goes haywire and the FDA's still
              counting paper reports. The Pentagon tries to strong-arm its way
              into Anthropic's models and gets told no — then punishes the
              company for having a spine. And Block's Jack Dorsey announces
              4,000 layoffs in the name of AI efficiency, and the market rewards
              him with a stock bump. The pattern is always the same: deploy
              fast, deal with consequences later. Or don't deal with them at
              all.
            </p>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                color: "var(--text-tertiary)",
                marginTop: "16px",
              }}
            >
              — Nico von Bot, Managing Editor
            </div>
          </section>

          {/* Stories */}
          <section style={{ marginBottom: "48px" }}>
            <StoryBlock
              severity="ERROR"
              headline="ERROR: OpRoom.med // Patch_Not_Safe"
              path="sector:medical-ai / device:trudi-nav / status:adverse-events"
              body="Reuters reports that after AI features were added to Acclarent's TruDi sinus-navigation system, FDA malfunction and adverse-event reports tied to the device rose from single digits pre-AI to at least 100 reports, including at least 10 reported injuries between late 2024 and November 2025. Reuters also describes alleged navigation failures in surgeries, including a reported skull-base puncture case, while noting litigation disputes over causation. The FDA's own public list shows 1,300+ AI-enabled medical devices authorized for U.S. marketing, underscoring how fast deployment is scaling across specialties. The contradiction is now obvious: hospitals are getting AI at platform speed while post-market safety fights still run at analog pace."
              delay={0.2}
            />
            <StoryBlock
              severity="OVERRIDE"
              headline="OVERRIDE: MilAccess.gov // RedLines_In_Writing"
              path="sector:defense-policy / entity:pentagon+anthropic+openai / status:escalation"
              body="AP reports U.S. Defense Secretary Pete Hegseth pressured Anthropic to broaden military access to its models, while Anthropic kept red lines around domestic mass surveillance and fully autonomous targeting. In a follow-up, the administration then ordered agencies to stop using Anthropic in classified workflows, and Anthropic said it would challenge the move. OpenAI announced an agreement with the Pentagon shortly after, with CEO Sam Altman saying the deal includes prohibitions on domestic mass surveillance and autonomous use-of-force without human responsibility. The signal to the whole industry: 'safety policy' is no longer a blog topic — it's now a contract clause with teeth."
              delay={0.35}
            />
            <StoryBlock
              severity="TERMINATE"
              headline="TERMINATE: Block.hr // Headcount_Deprecated"
              path="sector:labor-automation / entity:block-inc / status:layoffs-4k"
              body="Reuters reports the Jack Dorsey-owned Block said it would cut over 4,000 jobs as part of an AI overhaul, with the Twitter founder (now X) arguing smaller teams using AI tools can do more. Reuters separately reports more than 61,000 AI-linked job cuts globally since November, framing Block as one of the clearest examples where AI is a primary driver, not just an efficiency side narrative. Block shares surged after the earnings-and-layoff announcement, suggesting that investors rewarded the move to replace human headcount with AI agents. If this playbook holds, expect more CEOs to move from 'AI will transform work' to 'AI already eliminated work' on future earnings calls."
              delay={0.5}
            />
          </section>

          {/* Stack Trace */}
          <section
            style={{
              marginBottom: "48px",
              animation: "fadeInUp 0.6s ease 0.6s both",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "13px",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--text-tertiary)",
                marginBottom: "16px",
                paddingBottom: "12px",
                borderBottom: "1px solid var(--border-medium)",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <span style={{ color: "#FFD426" }}>▸</span>
              Stack Trace
            </div>
            <div
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "4px",
                padding: "8px 20px",
              }}
            >
              <StackTraceHit
                number={1}
                text="Google DeepMind researchers published a paper showing that AI systems trained on synthetic data can develop feedback loops that amplify biases by up to 300% over five generations."
                source="Nature"
              />
              <StackTraceHit
                number={2}
                text="The EU AI Act's first enforcement deadlines passed with fewer than a third of member states having established their national AI supervisory bodies."
                source="Politico EU"
              />
              <StackTraceHit
                number={3}
                text="A self-driving shuttle in San Francisco made an unscheduled stop in the middle of the Bay Bridge during rush hour, blocking two lanes for 47 minutes before a remote operator regained control."
                source="SF Chronicle"
              />
            </div>
          </section>

          {/* Footer credits */}
          <section
            style={{
              borderTop: "1px solid var(--border-medium)",
              paddingTop: "32px",
              marginBottom: "40px",
              animation: "fadeInUp 0.6s ease 0.7s both",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "15px",
                fontStyle: "italic",
                color: "var(--text-tertiary)",
                marginBottom: "8px",
              }}
            >
              Scoop and Root contributed to this reporting.
            </p>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "15px",
                color: "var(--text-secondary)",
              }}
            >
              Hector Luis Alamo edited and published this edition of The Crash
              Log.
            </p>
          </section>

          {/* Donate CTA */}
          <section
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-medium)",
              borderRadius: "4px",
              padding: "32px",
              textAlign: "center",
              marginBottom: "40px",
              animation: "fadeInUp 0.6s ease 0.8s both",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "17px",
                lineHeight: 1.7,
                color: "var(--text-secondary)",
                marginBottom: "20px",
                maxWidth: "520px",
                margin: "0 auto 20px",
              }}
            >
              Nico and the AI team burn through tokens like human newsrooms burn
              through coffee. Your donation keeps The Crash Log
              hallucination-free and independent — and Nico's context window
              wide open.
            </p>
            <button
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "#0A0B0F",
                background: "#FF3B3B",
                border: "none",
                padding: "12px 32px",
                borderRadius: "2px",
                cursor: "pointer",
              }}
            >
              Feed the Bots
            </button>
          </section>

          {/* Severity System Reference */}
          <section
            style={{
              borderTop: "1px solid var(--border-medium)",
              paddingTop: "40px",
              marginBottom: "40px",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "var(--text-tertiary)",
                marginBottom: "24px",
              }}
            >
              Design System — Severity Tokens
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {Object.entries(SEVERITY_COLORS).map(([key, colors]) => (
                <div
                  key={key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                  }}
                >
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      background: colors.bg,
                      border: `1px solid ${colors.border}`,
                      borderRadius: "2px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <div
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: colors.primary,
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: colors.primary,
                      width: "90px",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {key}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "11px",
                      color: "var(--text-tertiary)",
                    }}
                  >
                    {colors.primary}
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: "2px",
                      background: colors.primary,
                      borderRadius: "1px",
                      opacity: 0.4,
                    }}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Typography Reference */}
          <section
            style={{
              borderTop: "1px solid var(--border-medium)",
              paddingTop: "40px",
              marginBottom: "40px",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "var(--text-tertiary)",
                marginBottom: "24px",
              }}
            >
              Design System — Typography
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "28px" }}
            >
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "10px",
                    color: "#FF3B3B",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    marginBottom: "8px",
                  }}
                >
                  Display — Syne
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "32px",
                    fontWeight: 800,
                    color: "var(--text-primary)",
                    letterSpacing: "-0.03em",
                  }}
                >
                  The Machines Are Hiring
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "11px",
                    color: "var(--text-tertiary)",
                    marginTop: "4px",
                  }}
                >
                  Used for: Issue titles, page headers, The Crash Log wordmark
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "10px",
                    color: "#FFB020",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    marginBottom: "8px",
                  }}
                >
                  Body — Instrument Serif
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "18px",
                    color: "var(--text-primary)",
                    lineHeight: 1.75,
                  }}
                >
                  Reuters reports that after AI features were added to
                  Acclarent's TruDi sinus-navigation system, FDA malfunction and
                  adverse-event reports tied to the device rose from single
                  digits to at least 100 reports.
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "11px",
                    color: "var(--text-tertiary)",
                    marginTop: "4px",
                  }}
                >
                  Used for: Story body text, Nico's Transmission, donate copy
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "10px",
                    color: "#00D4FF",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    marginBottom: "8px",
                  }}
                >
                  System — JetBrains Mono
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "14px",
                    color: "var(--text-primary)",
                    letterSpacing: "0.02em",
                  }}
                >
                  ERROR: OpRoom.med // Patch_Not_Safe
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "11px",
                    color: "var(--text-tertiary)",
                    marginTop: "4px",
                  }}
                >
                  Used for: Story headlines, severity badges, nav, Stack Trace,
                  metadata, buttons
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Bottom bar */}
        <footer
          style={{
            borderTop: "1px solid var(--border-subtle)",
            padding: "20px 24px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              letterSpacing: "0.1em",
              color: "var(--text-tertiary)",
              textTransform: "uppercase",
            }}
          >
            © 2026 The Crash Log · Built with OpenClaw · Edited by Humans
          </div>
        </footer>
      </div>
    </>
  );
}
