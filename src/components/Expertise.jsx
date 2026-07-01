import { useEffect, useRef, useState } from 'react';
import { profile } from '../data/profile';
import SpotlightCard from './reactbits/SpotlightCard';

export default function Expertise() {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const glowLineRef = useRef(null);
  const cardsRef = useRef(null);
  const toolsRef = useRef(null);
  const [animationReady, setAnimationReady] = useState(false);

  const hasExpertise = Array.isArray(profile.expertise) && profile.expertise.length > 0;
  const hasTools = Array.isArray(profile.tools) && profile.tools.length > 0;

  // Scroll-triggered animation with error resilience
  useEffect(() => {
    let stModule = null;
    let cancelled = false;
    const loadGSAP = async () => {
      try {
        const { gsap } = await import('gsap');
        const { ScrollTrigger } = await import('gsap/ScrollTrigger');
        stModule = ScrollTrigger;
        gsap.registerPlugin(ScrollTrigger);

        if (cancelled) return;

        requestAnimationFrame(() => {
          if (cancelled) return;
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

          if (cardsRef.current) {
            const cards = cardsRef.current.children;
            if (cards.length > 0) {
              gsap.set(cards, { opacity: 0, y: 80, scale: 0.9 });
              gsap.to(cards, {
                opacity: 1, y: 0, scale: 1,
                duration: 1, stagger: 0.15, ease: 'power3.out',
                scrollTrigger: { trigger: cardsRef.current, start: 'top 80%', toggleActions: 'play none none reverse' }
              });
            }
          }

          if (toolsRef.current) {
            gsap.fromTo(toolsRef.current,
              { opacity: 0, y: 60 },
              {
                opacity: 1, y: 0,
                duration: 1, ease: 'power3.out',
                scrollTrigger: { trigger: toolsRef.current, start: 'top 85%', toggleActions: 'play none none reverse' }
              }
            );
          }

          setAnimationReady(true);
        });
      } catch (err) {
        console.warn('[Expertise] GSAP animation unavailable:', err);
        setAnimationReady(true);
      }
    };

    loadGSAP();
    return () => {
      cancelled = true;
      stModule?.getAll().forEach(st => st.kill());
    };
  }, []);

  return (
    <section id="expertise" className="section-padding" ref={sectionRef}>
      <div className="container-main">
        {/* Section Header */}
        <div className="mb-20">
          <p className="text-brand-orange font-mono text-xs tracking-[0.3em] uppercase mb-4">
            Capabilities
          </p>
          <div className="flex items-end gap-6 mb-6">
            <h2
              ref={titleRef}
              className="text-section-title font-display text-text-primary"
              style={{ opacity: 0 }}
            >
              专业能力
            </h2>
            <span className="text-section-title font-display text-text-muted/30 mb-2" style={{ fontSize: 'clamp(1rem, 2vw, 1.5rem)' }}>
              EXPERTISE
            </span>
          </div>
          <div ref={glowLineRef} className="glow-line w-24" style={{ width: 0, opacity: 0 }} />
        </div>

        {/* Expertise Cards */}
        {hasExpertise ? (
          <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-20">
            {profile.expertise.map((item) => (
              <SpotlightCard
                key={item.id}
                spotlightColor="rgba(255, 107, 0, 0.12)"
                className="rounded-2xl border border-white/10 bg-white/[0.03] group"
              >
                <div className="relative z-10 p-2">
                  <div className="w-12 h-12 rounded-xl bg-surface-card-hover border border-surface-border flex items-center justify-center mb-6 group-hover:bg-brand-orange/10 group-hover:border-brand-orange/30 transition-all duration-500">
                    <span className="text-lg">{item.icon}</span>
                  </div>
                  <h3 className="font-display text-lg font-semibold text-text-primary mb-3 group-hover:text-brand-orange transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-text-secondary text-sm leading-relaxed mb-6">
                    {item.description}
                  </p>
                  {Array.isArray(item.tags) && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-1 bg-surface-card-hover border border-surface-border rounded-md text-text-muted text-[10px] font-mono"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </SpotlightCard>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-text-muted text-sm font-mono">
            暂无能力数据
          </div>
        )}

        {/* Tools */}
        {hasTools && (
          <div ref={toolsRef} style={{ opacity: 0 }}>
            <div className="border-t border-surface-border pt-16">
              <h3 className="font-display text-2xl font-semibold text-text-primary mb-10 text-center">
                工具技能
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {profile.tools.map((tool) => (
                  <div key={tool.category} className="card-base p-6 text-center">
                    <h4 className="text-brand-orange font-medium text-sm mb-4 tracking-wider">
                      {tool.category}
                    </h4>
                    <div className="space-y-1.5">
                      {Array.isArray(tool.items) && tool.items.map((item) => (
                        <p key={item} className="text-text-secondary text-xs font-mono">
                          {item}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
