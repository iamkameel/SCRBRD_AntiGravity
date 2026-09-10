export const D = {
    base: 'hsl(var(--background))', surf0: 'hsl(var(--card))', surf1: 'hsl(var(--input))', surf2: 'hsl(var(--muted))', surf3: 'hsl(var(--border))',
    glass: 'rgba(10,14,28,0.75)',
    grad: 'linear-gradient(135deg, #4f46e5, #3b82f6)',
    gradLive: 'linear-gradient(135deg, #10b981, #06b6d4)',
    indigo: '#4f46e5', sky: '#0ea5e9', emerald: '#10b981', amber: '#f59e0b',
    rose: '#f43f5e', orange: '#f97316', violet: '#7c3aed', cyan: '#06b6d4', pink: '#ec4899',
    textPrimary: '#ffffff', textSecondary: 'hsl(var(--muted-foreground))', textMuted: 'hsl(var(--muted-foreground))',
    border: 'hsl(var(--border))', borderMed: 'hsl(var(--border))',
    sm: '8px', md: '12px', lg: '16px', xl: '20px', xxl: '24px', pill: '9999px',
    mono: "'DM Mono',monospace", head: "var(--font-syne), sans-serif", body: "var(--font-open-sans), sans-serif", 
    sans: "var(--font-open-sans), sans-serif", syne: "var(--font-syne), sans-serif",
};

export function GlobalStyles() {
    return (
        <style>{`
      @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&display=swap');
      *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
      html{font-size:14px;-webkit-font-smoothing:antialiased}
      body{background:hsl(var(--background));overflow-x:hidden}
      ::-webkit-scrollbar{width:2px;height:2px}
      ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:99px}
      @keyframes dotPulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(.75);opacity:.45}}
      @keyframes pulseGlow{0%,100%{box-shadow:0 0 6px rgba(52,211,153,.6)}50%{box-shadow:0 0 18px rgba(52,211,153,.3)}}
      @keyframes slideUp{from{transform:translateY(24px);opacity:0}to{transform:translateY(0);opacity:1}}
      @keyframes scoreReveal{from{transform:translateY(-8px) scale(.95);opacity:0}to{transform:translateY(0) scale(1);opacity:1}}
      @keyframes fadeIn{from{opacity:0}to{opacity:1}}
      @keyframes wagonDraw{from{stroke-dashoffset:320}to{stroke-dashoffset:0}}
      @keyframes barSlide{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)}}
      @keyframes chipPop{0%{transform:scale(.85);opacity:0}60%{transform:scale(1.06)}100%{transform:scale(1);opacity:1}}
      @keyframes toastIn{from{transform:translate(-50%,-20px);opacity:0}to{transform:translate(-50%,0);opacity:1}}
      .sh-slide-up{animation:slideUp .32s cubic-bezier(.22,1,.36,1) both}
      .sh-fade-in{animation:fadeIn .22s ease both}
      .sh-score-anim{animation:scoreReveal .28s cubic-bezier(.22,1,.36,1) both}
      .sh-live-dot{animation:dotPulse 1.8s ease-in-out infinite}
      .sh-live-glow{animation:pulseGlow 2s ease-in-out infinite}
      .sh-wagon-line{stroke-dasharray:320;animation:wagonDraw .38s ease both}
      .sh-press{transition:transform .1s ease,opacity .1s ease}
      .sh-press:active:not(:disabled){transform:scale(.95);opacity:.85}
      .sh-press:disabled{cursor:not-allowed!important;opacity:.38!important}
      input,button,textarea,select{font-family:var(--font-open-sans),sans-serif}
    `} </style>
  );
}
