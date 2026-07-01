import { useEffect, useRef, useState, useCallback } from 'react';
import { profile } from '../data/profile';
import { lockBodyScroll, unlockBodyScroll } from '../utils/bodyScrollLock';

export default function Contact() {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const glowLineRef = useRef(null);
  const contentRef = useRef(null);
  const cardsRef = useRef(null);

  const [popup, setPopup] = useState(null); // { type, qrImage } | null
  const [toast, setToast] = useState(null);  // { message, key } | null
  const [copied, setCopied] = useState(false);

  // ---- Clipboard helpers ----
  const copyEmail = useCallback(async () => {
    const email = profile.contact.email;
    if (!navigator.clipboard) {
      const ta = document.createElement('textarea');
      ta.value = email;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch { /* ignore */ }
      document.body.removeChild(ta);
      setCopied(true);
      setToast({ message: `已复制：${email}`, key: Date.now() });
      setTimeout(() => setCopied(false), 2000);
      return;
    }
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setToast({ message: `已复制：${email}`, key: Date.now() });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setToast({ message: '复制失败，请手动复制', key: Date.now() });
    }
  }, []);

  // ---- Keyboard helper for card buttons ----
  const handleCardKeyDown = (action) => (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };

  // ---- Contact items from profile ----
  // QR-mode cards always shown (value may be image path); link-mode cards require a URL/value
  const contactItems = Array.isArray(profile.contact?.items)
    ? profile.contact.items.filter((item) => item.mode === 'qrcode' || item.value)
    : [];
  const hasEmail = !!profile.contact?.email;
  const totalCards = contactItems.length + (hasEmail ? 1 : 0);
  const gridCols = totalCards <= 2 ? 'md:grid-cols-2' : 'md:grid-cols-3';

  // Scroll-triggered animation
  useEffect(() => {
    let stModule = null;
    const loadGSAP = async () => {
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      stModule = ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);

      requestAnimationFrame(() => {
        const section = sectionRef.current;
        if (!section) return;

        if (titleRef.current) {
          gsap.fromTo(titleRef.current,
            { opacity: 0, scale: 1.5, filter: 'blur(20px)' },
            {
              opacity: 1,
              scale: 1,
              filter: 'blur(0px)',
              duration: 1.4,
              ease: 'expo.out',
              scrollTrigger: {
                trigger: section,
                start: 'top 70%',
                toggleActions: 'play none none reverse'
              }
            }
          );
        }

        if (glowLineRef.current) {
          gsap.fromTo(glowLineRef.current,
            { width: 0, opacity: 0 },
            {
              width: 96,
              opacity: 1,
              duration: 1,
              delay: 0.3,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: section,
                start: 'top 70%',
                toggleActions: 'play none none reverse'
              }
            }
          );
        }

        if (contentRef.current) {
          gsap.fromTo(contentRef.current,
            { opacity: 0, y: 50 },
            {
              opacity: 1,
              y: 0,
              duration: 1,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: contentRef.current,
                start: 'top 75%',
                toggleActions: 'play none none reverse'
              }
            }
          );
        }

        if (cardsRef.current) {
          const cards = cardsRef.current.children;
          gsap.fromTo(cards,
            { opacity: 0, y: 60, scale: 0.95 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.9,
              stagger: 0.2,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: cardsRef.current,
                start: 'top 80%',
                toggleActions: 'play none none reverse'
              }
            }
          );
        }
      });
    };

    loadGSAP();
    return () => { stModule?.getAll().forEach(st => st.kill()); };
  }, []);

  return (
    <section id="contact" className="section-padding min-h-screen flex items-center" ref={sectionRef}>
      <div className="container-main w-full">
        <div ref={contentRef} className="max-w-4xl mx-auto text-center" style={{ opacity: 0 }}>
          {/* Label */}
          <p className="text-brand-orange font-mono text-xs tracking-[0.3em] uppercase mb-6">
            Get in Touch
          </p>

          {/* Title */}
          <div className="mb-6">
            <h2
              ref={titleRef}
              className="text-section-title font-display text-text-primary"
              style={{ opacity: 0 }}
            >
              让我们聊聊
            </h2>
            <span className="text-section-title font-display text-text-muted/30" style={{ fontSize: 'clamp(1rem, 2vw, 1.5rem)' }}>
              CONTACT
            </span>
          </div>

          {/* Subtitle */}
          <p className="text-text-secondary text-lg leading-relaxed mb-16 max-w-2xl mx-auto">
            如果你有设计需求、合作想法，或者只是想说声 Hi，随时欢迎联系。
          </p>

          {/* Contact Cards */}
          <div ref={cardsRef} className={`grid grid-cols-1 ${gridCols} gap-5 mb-20`}>
            {/* Email Card */}
            {hasEmail && (
              <div
                className="card-base p-8 group cursor-pointer"
                style={{ opacity: 0 }}
                onClick={copyEmail}
                onKeyDown={handleCardKeyDown(copyEmail)}
                tabIndex={0}
                role="button"
                aria-label="点击复制邮箱地址"
              >
                <div className="w-12 h-12 rounded-xl bg-surface-card-hover border border-surface-border flex items-center justify-center mb-5 mx-auto group-hover:bg-brand-orange/10 group-hover:border-brand-orange/30 transition-all duration-500">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-secondary">
                    <rect x="2" y="4" width="20" height="16" rx="1" />
                    <path d="M2 6l10 7 10-7" />
                  </svg>
                </div>
                <p className="text-text-primary font-medium mb-2">邮箱</p>
                <p className={`text-sm font-mono transition-colors duration-300 ${copied ? 'text-brand-orange' : 'text-text-muted'}`}>
                  {copied ? '已复制！' : profile.contact.email}
                </p>
              </div>
            )}

            {/* Dynamic contact items */}
            {contactItems.map((item) => {
              const isQR = item.mode === 'qrcode';
              const handleClick = isQR
                ? () => setPopup({ type: item.type, qrImage: item.value })
                : item.value?.startsWith('http')
                  ? () => window.open(item.value, '_blank')
                  : () => {
                      if (navigator.clipboard) {
                        navigator.clipboard.writeText(item.value);
                      }
                    };

              const labelMap = { wechat: '微信', qq: 'QQ', behance: 'Behance', zcool: '站酷', weibo: '微博', dribbble: 'Dribbble', github: 'GitHub', official: '公众号' };
              const label = labelMap[item.type] || item.type || '联系';

              return (
                <div
                  key={item.type + '-' + item.value?.substring(0, 20)}
                  className="card-base p-8 group cursor-pointer"
                  style={{ opacity: 0 }}
                  onClick={handleClick}
                  onKeyDown={handleCardKeyDown(handleClick)}
                  tabIndex={0}
                  role="button"
                  aria-label={isQR ? `查看${label}二维码` : `打开${label}`}
                >
                  <div className="w-12 h-12 rounded-xl bg-surface-card-hover border border-surface-border flex items-center justify-center mb-5 mx-auto group-hover:bg-brand-orange/10 group-hover:border-brand-orange/30 transition-all duration-500">
                    <span className="text-text-secondary text-xl">{item.type === 'wechat' ? '💬' : item.type === 'qq' ? '🐧' : item.type === 'behance' ? '🎨' : item.type === 'zcool' ? '🔥' : item.type === 'weibo' ? '📢' : item.type === 'dribbble' ? '🏀' : item.type === 'github' ? '🐙' : item.type === 'official' ? '📱' : '🔗'}</span>
                  </div>
                  <p className="text-text-primary font-medium mb-2">{label}</p>
                  <p className="text-text-muted text-sm">{isQR ? '点击查看二维码' : item.value}</p>
                </div>
              );
            })}
          </div>

          {/* Footer Line */}
          <div className="border-t border-surface-border pt-10 flex flex-col md:flex-row items-center justify-between gap-4 text-text-muted text-xs font-mono">
            <p>&copy; {new Date().getFullYear()} {profile.name}. All rights reserved.</p>
            <p>Built with React + Vite + Tailwind CSS</p>
          </div>
        </div>
      </div>

      {/* ---- QR Popup ---- */}
      {popup && <QRPopup type={popup.type} qrImage={popup.qrImage} onClose={() => setPopup(null)} />}

      {/* ---- Toast ---- */}
      {toast && <Toast message={toast.message} onDone={() => setToast(null)} />}
    </section>
  );
}

/* ========================================================
 * QR Code Popup — overlay + centered card
 * ======================================================== */
function QRPopup({ type, qrImage, onClose }) {
  const qrRef = useRef(null);
  const isWechat = type === 'wechat';

  useEffect(() => {
    lockBodyScroll();
    const onEsc = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onEsc);
    return () => {
      unlockBodyScroll();
      window.removeEventListener('keydown', onEsc);
    };
  }, [onClose]);

  // Entrance animation
  useEffect(() => {
    const run = async () => {
      const { gsap } = await import('gsap');
      if (qrRef.current) {
        gsap.fromTo(qrRef.current, 
          { opacity: 0, scale: 0.85, y: 30 },
          { opacity: 1, scale: 1, y: 0, duration: 0.45, ease: 'power3.out' }
        );
      }
    };
    run();
  }, []);

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-6" onClick={onClose}>
      <div className="fixed inset-0 bg-surface-base/90 backdrop-blur-sm" />
      <div
        ref={qrRef}
        className="relative z-10 w-full max-w-sm bg-surface-card border border-surface-border rounded-2xl p-8 text-center"
        onClick={(e) => e.stopPropagation()}
        style={{ opacity: 0 }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-surface-card-hover border border-surface-border text-text-muted hover:text-text-primary transition-colors"
          aria-label="关闭"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl bg-brand-orange/10 border border-brand-orange/20 flex items-center justify-center mx-auto mb-5">
          {isWechat ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF6B00" strokeWidth="1.5">
              <path d="M8 10.5a.5.5 0 01.5-.5h1a.5.5 0 01.5.5v1a.5.5 0 01-.5.5h-1a.5.5 0 01-.5-.5v-1z" />
              <path d="M13 10.5a.5.5 0 01.5-.5h1a.5.5 0 01.5.5v1a.5.5 0 01-.5.5h-1a.5.5 0 01-.5-.5v-1z" />
              <path d="M21 15.5a6 6 0 01-9 5.2l-3 1.5v-3a6 6 0 019-12.2 6 6 0 013 8.5z" />
              <path d="M12 7.5a5 5 0 00-8 4.3l-3 1.5v-3a6 6 0 019.5-5" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF6B00" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <circle cx="8.5" cy="12" r="1.5" />
              <circle cx="15.5" cy="12" r="1.5" />
              <path d="M9 9h6" /><path d="M9 15h6" />
            </svg>
          )}
        </div>

        {/* Title */}
        <h3 className="font-display text-lg font-semibold text-text-primary mb-2">
          {isWechat ? '微信添加好友' : '微信公众号'}
        </h3>
        <p className="text-text-muted text-sm mb-6">
          {isWechat ? '扫描二维码添加微信好友' : '扫描二维码关注公众号'}
        </p>

        {/* QR Code */}
        <div className="w-48 h-48 mx-auto bg-white rounded-xl p-3 mb-4">
          {qrImage ? (
            <img src={qrImage} alt={isWechat ? '微信二维码' : '公众号二维码'} className="w-full h-full object-contain rounded-lg" />
          ) : (
            /* Placeholder SVG when no real QR image */
            <svg viewBox="0 0 168 168" className="w-full h-full">
              <rect width="168" height="168" fill="white" />
              {/* Finder patterns */}
              <g fill="#0A0A0A">
                <rect x="12" y="12" width="42" height="42" rx="4" />
                <rect x="18" y="18" width="30" height="30" rx="2" fill="white" />
                <rect x="24" y="24" width="18" height="18" rx="1" fill="#0A0A0A" />
                <rect x="114" y="12" width="42" height="42" rx="4" />
                <rect x="120" y="18" width="30" height="30" rx="2" fill="white" />
                <rect x="126" y="24" width="18" height="18" rx="1" fill="#0A0A0A" />
                <rect x="12" y="114" width="42" height="42" rx="4" />
                <rect x="18" y="120" width="30" height="30" rx="2" fill="white" />
                <rect x="24" y="126" width="18" height="18" rx="1" fill="#0A0A0A" />
              </g>
              {/* Data modules */}
              <g fill="#0A0A0A">
                {(() => {
                  const cells = [];
                  const seed = isWechat ? 42 : 137;
                  let r = seed;
                  const next = () => { r = (r * 16807) % 2147483647; return r; };
                  for (let row = 0; row < 21; row++) {
                    for (let col = 0; col < 21; col++) {
                      const x = col * 7 + 7; const y = row * 7 + 7;
                      if ((row <= 8 && col <= 8) || (row <= 8 && col >= 14) || (row >= 14 && col <= 8) || (row >= 18 && col >= 18)) continue;
                      if ((col > 9 && col < 14) && (row === 12)) continue;
                      if (next() % 3 > 0) cells.push(<rect key={`${row}-${col}`} x={x} y={y} width="3" height="3" rx="0.5" />);
                    }
                  }
                  return cells;
                })()}
              </g>
              <rect x="66" y="66" width="36" height="36" rx="6" fill="#0A0A0A" />
              <text x="84" y="90" textAnchor="middle" fill="white" fontSize="12" fontFamily="sans-serif" fontWeight="bold">QR</text>
            </svg>
          )}
          </div>
        {!qrImage && <p className="text-text-muted/50 text-[10px] font-mono">请在后台管理上传二维码图片</p>}
      </div>
    </div>
  );
}

/* ========================================================
 * Toast Notification
 * ======================================================== */
function Toast({ message, onDone }) {
  const toastRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(onDone, 2500);
    const run = async () => {
      const { gsap } = await import('gsap');
      if (toastRef.current) {
        gsap.fromTo(toastRef.current,
          { opacity: 0, y: -12, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: 'power2.out' }
        );
      }
    };
    run();
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div ref={toastRef} className="fixed top-20 left-1/2 -translate-x-1/2 z-[130] pointer-events-none">
      <div className="px-5 py-3 bg-surface-card border border-surface-border rounded-full shadow-lg backdrop-blur-md">
        <p className="text-text-secondary text-sm font-mono whitespace-nowrap">{message}</p>
      </div>
    </div>
  );
}
