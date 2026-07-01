import { useEffect, useRef } from 'react';
import { profile } from '../data/profile';
import CountUp from './reactbits/CountUp';

export default function About() {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const glowLineRef = useRef(null);
  const contentRef = useRef(null);
  const avatarRef = useRef(null);
  const statsRef = useRef(null);

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
            { opacity: 0, x: -100, scale: 0.8, rotate: -2 },
            {
              opacity: 1, x: 0, scale: 1, rotate: 0,
              duration: 1.2, ease: 'power3.out',
              scrollTrigger: { trigger: section, start: 'top 70%', toggleActions: 'play none none reverse' }
            }
          );
        }

        if (glowLineRef.current) {
          gsap.fromTo(glowLineRef.current,
            { width: 0, opacity: 0 },
            {
              width: 96, opacity: 1,
              duration: 1, delay: 0.3, ease: 'power2.out',
              scrollTrigger: { trigger: section, start: 'top 70%', toggleActions: 'play none none reverse' }
            }
          );
        }

        if (contentRef.current) {
          gsap.fromTo(contentRef.current,
            { opacity: 0, y: 60 },
            {
              opacity: 1, y: 0,
              duration: 1, ease: 'power3.out',
              scrollTrigger: { trigger: section, start: 'top 60%', toggleActions: 'play none none reverse' }
            }
          );
        }

        if (avatarRef.current) {
          gsap.fromTo(avatarRef.current,
            { opacity: 0, y: 80, scale: 0.95 },
            {
              opacity: 1, y: 0, scale: 1,
              duration: 1.2, ease: 'power3.out',
              scrollTrigger: { trigger: section, start: 'top 65%', toggleActions: 'play none none reverse' }
            }
          );
        }

        if (statsRef.current) {
          const cards = statsRef.current.children;
          gsap.fromTo(cards,
            { opacity: 0, y: 50, scale: 0.9 },
            {
              opacity: 1, y: 0, scale: 1,
              duration: 0.8, stagger: 0.15, ease: 'power2.out',
              scrollTrigger: { trigger: statsRef.current, start: 'top 80%', toggleActions: 'play none none reverse' }
            }
          );
        }
      });
    };

    loadGSAP();
    return () => { stModule?.getAll().forEach(st => st.kill()); };
  }, []);

  const currentWork = profile.experience?.work?.[0] ?? null;

  return (
    <section id="about" className="section-padding" ref={sectionRef}>
      <div className="container-main">
        {/* Section Header */}
        <div className="mb-20">
          <p className="text-brand-orange font-mono text-xs tracking-[0.3em] uppercase mb-4">
            About
          </p>
          <div className="flex items-end gap-6 mb-6">
            <h2
              ref={titleRef}
              className="text-section-title font-display text-text-primary"
              style={{ opacity: 0 }}
            >
              关于
            </h2>
            <span className="text-section-title font-display text-text-muted/30 mb-2" style={{ fontSize: 'clamp(1rem, 2vw, 1.5rem)', opacity: 0 }}>
              ABOUT ME
            </span>
          </div>
          <div ref={glowLineRef} className="glow-line w-24" style={{ width: 0, opacity: 0 }} />
        </div>

        <div ref={contentRef} className="grid grid-cols-1 lg:grid-cols-12 gap-16" style={{ opacity: 0 }}>
          {/* Left: Avatar & Stats */}
          <div className="lg:col-span-5">
            {/* Avatar — real image or placeholder */}
            <div ref={avatarRef} className="relative mb-10" style={{ opacity: 0 }}>
              <div className="aspect-[4/5] bg-surface-card border border-surface-border rounded-2xl overflow-hidden relative group">
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-surface-card-hover border border-surface-border flex items-center justify-center">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-text-muted">
                          <circle cx="12" cy="8" r="4" />
                          <path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" />
                        </svg>
                      </div>
                      <p className="text-text-muted text-sm font-mono">头像占位</p>
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-t from-brand-orange/10 to-transparent pointer-events-none" />
              </div>
            </div>

            {/* Stats Grid with CountUp */}
            <div ref={statsRef} className="grid grid-cols-2 gap-3">
              {profile.stats.map((stat, i) => (
                <div
                  key={stat.label}
                  className="card-base p-6 text-center group"
                  style={{ opacity: 0 }}
                >
                  <p className="font-display text-3xl font-bold text-text-primary mb-1 group-hover:text-brand-orange transition-colors">
                    <CountUp
                      from={0}
                      to={stat.numericValue}
                      duration={2}
                      delay={0.2 * i}
                    />
                    {stat.suffix}
                  </p>
                  <p className="text-text-muted text-xs font-medium tracking-wider uppercase">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Content */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <span className="text-section-title font-display text-text-muted/20 mb-4 block" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.8rem)', lineHeight: '1', letterSpacing: '-0.02em' }}>
              ABOUT ME
            </span>
            <p className="text-text-secondary text-lg leading-relaxed mb-10">
              {profile.bio}
            </p>

            {/* Experience Timeline */}
            {currentWork && (
              <div className="mb-10">
                <div className="flex items-center gap-4 mb-6">
                  <span className="w-3 h-3 rounded-full bg-brand-orange animate-pulse-glow" />
                  <h3 className="font-display text-xl font-semibold text-text-primary">
                    {currentWork.company}
                  </h3>
                  <span className="text-text-muted text-sm font-mono">
                    {currentWork.period}
                  </span>
                </div>

                <div className="space-y-5 ml-7 border-l border-surface-border pl-8">
                  {currentWork.roles.map((role, i) => (
                    <div key={i} className="relative">
                      <div className="absolute -left-[2.375rem] top-1.5 w-2 h-2 bg-surface-card border border-surface-border rounded-full" />
                      <h4 className="text-text-primary font-medium mb-1">
                        {role.title}
                      </h4>
                      <p className="text-text-secondary text-sm leading-relaxed">
                        {role.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            <div className="flex items-center gap-3">
              <span className="px-3 py-1.5 bg-surface-card border border-surface-border rounded-full text-text-secondary text-xs font-mono">
                {profile.experience.education.year}
              </span>
              <span className="text-text-secondary text-sm">
                {profile.experience.education.school} · {profile.experience.education.degree}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
