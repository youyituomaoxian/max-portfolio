import { useState, useEffect, useCallback } from 'react';
import { navItems, profile } from '../data/profile';
import { scrollTo } from '../utils/scrollTo';
import { lockBodyScroll, unlockBodyScroll } from '../utils/bodyScrollLock';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Scroll → background glass effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // IntersectionObserver → active navigation highlight
  useEffect(() => {
    const sectionIds = ['hero', ...navItems.map((i) => i.id)];
    const observer = new IntersectionObserver(
      (entries) => {
        let bestEntry = null;
        for (const entry of entries) {
          if (entry.isIntersecting) {
            if (!bestEntry || entry.intersectionRatio > bestEntry.intersectionRatio) {
              bestEntry = entry;
            }
          }
        }
        if (bestEntry) setActiveSection(bestEntry.target.id);
      },
      { rootMargin: '-40% 0px -50% 0px', threshold: 0 }
    );
    const els = sectionIds.map((id) => document.getElementById(id)).filter(Boolean);
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Body scroll lock when mobile menu open
  useEffect(() => {
    if (mobileMenuOpen) {
      lockBodyScroll();
    } else {
      unlockBodyScroll();
    }
  }, [mobileMenuOpen]);

  const handleNavClick = useCallback((id) => {
    scrollTo(id);
    setMobileMenuOpen(false);
  }, []);

  const handleCTAClick = useCallback(() => {
    scrollTo('contact');
    setMobileMenuOpen(false);
  }, []);

  return (
    <>
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled || mobileMenuOpen ? 'py-3 glass-panel' : 'py-6 bg-transparent'
      }`}
    >
      <div className="container-main flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => scrollTo('hero')}
          className="text-text-primary font-display text-lg font-semibold tracking-tight hover:text-brand-orange transition-colors"
        >
          {(profile.nameEn || 'M').split(' ').filter(Boolean).map((w) => w[0]).join('') || 'M'}
        </button>

        {/* Desktop Nav Items */}
        <div className="hidden md:flex items-center gap-10">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className={`text-sm font-medium tracking-wider uppercase transition-all duration-300 hover:text-text-primary relative group ${
                activeSection === item.id ? 'text-text-primary' : 'text-text-secondary'
              }`}
            >
              {item.label}
              <span className="absolute -bottom-1 left-0 h-px bg-brand-orange transition-all duration-300 group-hover:w-full w-0" />
            </button>
          ))}
        </div>

        {/* Desktop CTA */}
        <button
          onClick={() => scrollTo('contact')}
          className="hidden md:flex items-center gap-2 px-5 py-2.5 border border-surface-border text-sm font-medium tracking-wider uppercase text-text-primary rounded-full hover:bg-brand-orange hover:border-brand-orange hover:text-white transition-all duration-300"
        >
          <span>Let&apos;s Talk</span>
          <span className="text-brand-orange group-hover:text-white transition-colors">&rarr;</span>
        </button>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileMenuOpen((v) => !v)}
          className="md:hidden w-10 h-10 flex items-center justify-center text-text-primary"
          aria-label={mobileMenuOpen ? '关闭菜单' : '打开菜单'}
          aria-expanded={mobileMenuOpen}
        >
          <div className="relative w-5 h-4">
            <span className={`absolute left-0 top-0 w-full h-px bg-current transition-all duration-300 ${mobileMenuOpen ? 'top-1/2 -translate-y-1/2 rotate-45' : ''}`} />
            <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-full h-px bg-current transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`} />
            <span className={`absolute left-0 bottom-0 w-full h-px bg-current transition-all duration-300 ${mobileMenuOpen ? 'top-1/2 -translate-y-1/2 -rotate-45' : ''}`} />
          </div>
        </button>
      </div>
    </nav>

    {/* Mobile Drawer */}
    {mobileMenuOpen && (
      <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)}>
        <div className="absolute inset-0 bg-surface-base/95 backdrop-blur-xl" />
        <div
          className="relative z-10 flex flex-col items-center justify-center h-full gap-8 px-6"
          onClick={(e) => e.stopPropagation()}
        >
          {navItems.map((item, i) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`text-2xl font-display tracking-wider uppercase transition-all duration-300 ${
                activeSection === item.id ? 'text-brand-orange' : 'text-text-secondary hover:text-text-primary'
              }`}
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              {item.label}
            </button>
          ))}
          <div className="mt-8 pt-8 border-t border-surface-border w-32" />
          <button
            onClick={handleCTAClick}
            className="px-8 py-3 bg-brand-orange text-white text-sm font-medium tracking-wider uppercase rounded-full hover:shadow-[0_0_40px_rgba(255,107,0,0.4)] transition-all duration-300"
          >
            Let&apos;s Talk
          </button>
        </div>
      </div>
    )}

    {/* Back to Top */}
    <button
      onClick={() => scrollTo('hero')}
      className={`fixed bottom-8 right-8 z-40 w-11 h-11 flex items-center justify-center rounded-full border border-surface-border bg-surface-card/80 backdrop-blur-sm text-text-muted hover:text-brand-orange hover:border-brand-orange/50 transition-all duration-500 ${
        scrolled ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
      aria-label="回到顶部"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polyline points="18 15 12 9 6 15" />
      </svg>
    </button>
    </>
  );
}
