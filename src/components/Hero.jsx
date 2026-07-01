import { useEffect, useRef } from 'react';
import { profile } from '../data/profile';
import { scrollTo } from '../utils/scrollTo';
import GradientText from './reactbits/GradientText';

export default function Hero() {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const rafRef = useRef(null);
  const dirtyRef = useRef(false);

  // Refs for animated elements
  const taglineRef = useRef(null);
  const titleRef = useRef(null);
  const nameEnRef = useRef(null);
  const bioRef = useRef(null);
  const actionsRef = useRef(null);

  // rAF-batched mousemove → CSS custom property parallax
  useEffect(() => {
    const handleMouse = (e) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      mouseRef.current = {
        x: (clientX / innerWidth - 0.5) * 20,
        y: (clientY / innerHeight - 0.5) * 20,
      };
      if (!dirtyRef.current) {
        dirtyRef.current = true;
        rafRef.current = requestAnimationFrame(() => {
          if (containerRef.current) {
            containerRef.current.style.setProperty('--mx', `${mouseRef.current.x}px`);
            containerRef.current.style.setProperty('--my', `${mouseRef.current.y}px`);
          }
          dirtyRef.current = false;
        });
      }
    };
    window.addEventListener('mousemove', handleMouse, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouse);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Opening Animation — 与 Contact 一致的 expo 入场风格
  useEffect(() => {
    const loadGSAP = async () => {
      const { gsap } = await import('gsap');
      
      requestAnimationFrame(() => {
        const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });

        // 1. Tagline - fade up
        if (taglineRef.current) {
          gsap.set(taglineRef.current, { opacity: 0, y: 40 });
          tl.to(taglineRef.current, { opacity: 1, y: 0, duration: 0.8 }, '-=0.6');
        }

        // 2. Title - scale up from center（与 Contact 标题一致）
        if (titleRef.current) {
          gsap.set(titleRef.current, { opacity: 0, scale: 1.5, filter: 'blur(20px)' });
          tl.to(titleRef.current, {
            opacity: 1, scale: 1, filter: 'blur(0px)',
            duration: 1.4,
          }, '-=0.5');
        }

        // 3. English name - fade up
        if (nameEnRef.current) {
          gsap.set(nameEnRef.current, { opacity: 0, y: 30 });
          tl.to(nameEnRef.current, { opacity: 1, y: 0, duration: 1 }, '-=0.6');
        }

        // 4. Bio text - fade up
        if (bioRef.current) {
          gsap.set(bioRef.current, { opacity: 0, y: 30 });
          tl.to(bioRef.current, { opacity: 1, y: 0, duration: 0.8 }, '-=0.4');
        }

        // 5. Action buttons - stagger up
        if (actionsRef.current) {
          const buttons = actionsRef.current.children;
          gsap.set(buttons, { opacity: 0, y: 40 });
          tl.to(buttons, { opacity: 1, y: 0, duration: 0.7, stagger: 0.15 }, '-=0.2');
        }
      });
    };

    loadGSAP();
  }, []);

  return (
    <section
      id="hero"
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Video Background — hidden on mobile (save 11MB download) */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover hidden md:block"
          src={profile.heroVideo || '/videos/hero-bg.mp4'}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-surface-base/75" />
        {/* Subtle grid texture */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.8) 1px, transparent 0)`,
            backgroundSize: '60px 60px',
          }}
        />
        {/* Parallax glow orbs */}
        <div
          className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] rounded-full bg-brand-orange opacity-[0.08] blur-[120px]"
          style={{ transform: 'translate(var(--mx, 0px), var(--my, 0px))' }}
        />
        <div
          className="absolute bottom-1/4 -right-1/4 w-[500px] h-[500px] rounded-full bg-brand-orange-light opacity-[0.06] blur-[100px]"
          style={{ transform: 'translate(calc(var(--mx, 0px) * -0.5), calc(var(--my, 0px) * -0.5))' }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 container-main text-center">
        {/* Subtitle */}
        <p
          ref={taglineRef}
          className="text-brand-orange font-mono text-sm tracking-[0.25em] uppercase mb-8"
          style={{ opacity: 0, willChange: 'transform, filter, opacity' }}
        >
          {profile.roles.join(' \u2022 ')}
        </p>

        {/* Main Heading */}
        <h1
          ref={titleRef}
          className="text-hero font-display text-text-primary mb-6"
          style={{ opacity: 0, willChange: 'transform, filter, opacity' }}
        >
          {profile.name}
        </h1>

        {/* Name EN — GradientText */}
        <div
          ref={nameEnRef}
          className="mb-8"
          style={{ opacity: 0, willChange: 'transform, filter, opacity' }}
        >
          <GradientText
            colors={['#FF6B00', '#FF8A33', '#FFB066']}
            animationSpeed={6}
            direction="horizontal"
          >
            <span className="text-section-title font-display">
              {profile.nameEn}
            </span>
          </GradientText>
        </div>

        {/* Bio */}
        <p
          ref={bioRef}
          className="max-w-2xl mx-auto text-text-secondary text-hero-sub leading-relaxed mb-12"
          style={{ opacity: 0, willChange: 'transform, opacity' }}
        >
          {profile.bio}
        </p>

        {/* Actions */}
        <div
          ref={actionsRef}
          className="flex items-center justify-center gap-6"
          style={{ opacity: 0, willChange: 'transform, opacity' }}
        >
          <button
            onClick={() => scrollTo('projects')}
            className="group relative px-8 py-4 bg-brand-orange text-white font-medium tracking-wider uppercase text-sm rounded-full overflow-hidden transition-all duration-500 hover:shadow-[0_0_40px_rgba(255,107,0,0.4)]"
          >
            <span className="relative z-10">查看作品</span>
            <div className="absolute inset-0 bg-gradient-to-r from-brand-orange to-brand-orange-light opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </button>

          <button
            onClick={() => scrollTo('contact')}
            className="px-8 py-4 border border-surface-border text-text-primary font-medium tracking-wider uppercase text-sm rounded-full hover:border-brand-orange hover:text-brand-orange transition-all duration-300"
          >
            联系我
          </button>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40 hover:opacity-80 transition-opacity">
          <span className="text-xs font-mono tracking-widest text-text-muted">SCROLL</span>
          <div className="w-px h-8 bg-gradient-to-b from-text-muted to-transparent" />
        </div>
      </div>
    </section>
  );
}
