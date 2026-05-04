/* FM Aberturas — Logo SVG Component */

const FMLogo = ({ size = 36, showText = false, textSize = 'lg' }) => {
  const id = `grad-${size}`;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: showText ? 10 : 0 }}>
      {/* Mark: stylized window / glass pane */}
      <svg width={size} height={size} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1a56db" />
            <stop offset="100%" stopColor="#1c3d8f" />
          </linearGradient>
        </defs>
        {/* Outer frame — window shape with rounded corners */}
        <rect x="2" y="2" width="40" height="40" rx="9" fill={`url(#${id})`} />
        {/* Inner frame lines (window panes) */}
        <rect x="6" y="6" width="32" height="32" rx="5" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.2" />
        {/* Horizontal divider */}
        <line x1="6" y1="22" x2="38" y2="22" stroke="rgba(255,255,255,0.3)" strokeWidth="1.4" />
        {/* Vertical divider */}
        <line x1="22" y1="6" x2="22" y2="38" stroke="rgba(255,255,255,0.3)" strokeWidth="1.4" />
        {/* Shine / reflection top-left pane */}
        <path d="M9 9 L17 9 L9 17 Z" fill="rgba(255,255,255,0.12)" />
        {/* Small shine dot */}
        <circle cx="11" cy="11" r="1.5" fill="rgba(255,255,255,0.25)" />
      </svg>

      {showText && (
        <div>
          {textSize === 'lg' && (
            <>
              <div style={{ fontFamily: 'Space Grotesk,sans-serif', fontWeight: 700, fontSize: 15, color: '#fff', lineHeight: 1.1, letterSpacing: -0.3 }}>Facundo Morazzo</div>
              <div style={{ fontFamily: 'DM Sans,sans-serif', fontWeight: 400, fontSize: 10, color: '#94a3b8', letterSpacing: 0.3, marginTop: 1 }}>Aberturas y Cristales</div>
            </>
          )}
          {textSize === 'sm' && (
            <>
              <div style={{ fontFamily: 'Space Grotesk,sans-serif', fontWeight: 700, fontSize: 12, color: '#fff', lineHeight: 1.1 }}>FM Aberturas</div>
              <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 9, color: '#64748b', marginTop: 1 }}>& Cristales</div>
            </>
          )}
          {textSize === 'header' && (
            <>
              <div style={{ fontFamily: 'Space Grotesk,sans-serif', fontWeight: 700, fontSize: 18, color: '#0f172a', lineHeight: 1.1, letterSpacing: -0.5 }}>Facundo Morazzo</div>
              <div style={{ fontFamily: 'DM Sans,sans-serif', fontWeight: 400, fontSize: 12, color: '#64748b', letterSpacing: 0.3, marginTop: 1 }}>Aberturas y Cristales · CRM</div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

/* Standalone logo for print/PDF headers */
const FMLogoFull = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
    <FMLogo size={48} />
    <div>
      <div style={{ fontFamily: 'Space Grotesk,sans-serif', fontWeight: 700, fontSize: 20, color: '#1a56db', letterSpacing: -0.5, lineHeight: 1.1 }}>Facundo Morazzo</div>
      <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 13, color: '#64748b', letterSpacing: 0.3 }}>Aberturas y Cristales</div>
    </div>
  </div>
);

Object.assign(window, { FMLogo, FMLogoFull });
