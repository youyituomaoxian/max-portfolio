import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { profile } from '../data/profile';
import SpotlightCard from './reactbits/SpotlightCard';
import ProjectModal from './ProjectModal';

const ALL = '全部';
const categories = [ALL, ...new Set(profile.projects.map((p) => p.category))];

export default function Projects() {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const glowLineRef = useRef(null);
  const gridRef = useRef(null);
  const tabsRef = useRef(null);

  const [activeCategory, setActiveCategory] = useState(ALL);
  const [sortBy, setSortBy] = useState('time');
  const [visibleCount, setVisibleCount] = useState(9);
  const [selectedIndex, setSelectedIndex] = useState(null);

  const filteredProjects = useMemo(() => {
    let list = activeCategory === ALL
      ? [...profile.projects]
      : profile.projects.filter((p) => p.category === activeCategory);

    if (sortBy === 'time') {
      list.sort((a, b) => b.date.localeCompare(a.date));
    } else {
      list.sort((a, b) => a.category.localeCompare(b.category) || b.date.localeCompare(a.date));
    }

    return list;
  }, [activeCategory, sortBy]);

  // Only apply visibleCount limit when "全部" is selected
  const displayProjects = useMemo(() => {
    if (activeCategory === ALL) {
      return filteredProjects.slice(0, visibleCount);
    }
    return filteredProjects;
  }, [filteredProjects, activeCategory, visibleCount]);

  const hasMore = activeCategory === ALL && visibleCount < filteredProjects.length;

  // 全部用3列，分类过滤用2列
  const gridCols = activeCategory === ALL
    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
    : 'grid-cols-1 md:grid-cols-2';

  // Scroll-triggered animation for title + tabs
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
            { opacity: 0, x: 100, scale: 0.8, rotate: 2 },
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

        if (tabsRef.current) {
          gsap.fromTo(tabsRef.current.children,
            { opacity: 0, y: 20 },
            {
              opacity: 1, y: 0,
              duration: 0.6, stagger: 0.08, ease: 'power2.out',
              scrollTrigger: { trigger: section, start: 'top 70%', toggleActions: 'play none none reverse' }
            }
          );
        }
      });
    };
    loadGSAP();
    return () => { stModule?.getAll().forEach(st => st.kill()); };
  }, []);

  const prevCountRef = useRef(0);

  // Reset visible count and animation tracking on category switch
  useEffect(() => {
    setVisibleCount(9);
    prevCountRef.current = 0;
  }, [activeCategory, sortBy]);

  // Animate only newly appeared cards when list grows
  useEffect(() => {
    const prevCount = prevCountRef.current;
    prevCountRef.current = displayProjects.length;

    if (!gridRef.current || displayProjects.length <= prevCount) return;

    const loadGSAP = async () => {
      const { gsap } = await import('gsap');
      // Only animate cards that just appeared (index >= prevCount)
      const children = gridRef.current.children;
      const newCards = Array.from(children).slice(prevCount);
      if (newCards.length > 0) {
        gsap.fromTo(newCards,
          { opacity: 0, y: 60, scale: 0.95 },
          {
            opacity: 1, y: 0, scale: 1,
            duration: 0.7, stagger: 0.1, ease: 'power3.out'
          }
        );
      }
    };
    loadGSAP();
  }, [displayProjects.length]);

  // Modal navigation
  const openProject = useCallback((idx) => setSelectedIndex(idx), []);
  const closeModal = useCallback(() => setSelectedIndex(null), []);
  const goPrev = useCallback(() => setSelectedIndex((i) => (i > 0 ? i - 1 : i)), []);
  const goNext = useCallback(() => setSelectedIndex((i) => (i < displayProjects.length - 1 ? i + 1 : i)), [displayProjects.length]);

  const selectedProject = selectedIndex !== null ? displayProjects[selectedIndex] : null;

  return (
    <section id="projects" className="section-padding" ref={sectionRef}>
      <div className="container-main">
        {/* Section Header */}
        <div className="mb-14">
          <p className="text-brand-orange font-mono text-xs tracking-[0.3em] uppercase mb-4">
            Selected Works
          </p>
          <div className="flex items-end gap-6 mb-6">
            <h2
              ref={titleRef}
              className="text-section-title font-display text-text-primary"
              style={{ opacity: 0 }}
            >
              精选项目
            </h2>
            <span className="text-section-title font-display text-text-muted/30 mb-2" style={{ fontSize: 'clamp(1rem, 2vw, 1.5rem)' }}>
              PROJECTS
            </span>
          </div>
          <div ref={glowLineRef} className="glow-line w-24" style={{ width: 0, opacity: 0 }} />

          {/* Filters Row: Category Tabs + Sort */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-8">
            {/* Category Tabs */}
            <div ref={tabsRef} className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-5 py-2 rounded-full text-sm font-medium tracking-wider transition-all duration-300 ${
                    activeCategory === cat
                      ? 'bg-brand-orange text-white shadow-[0_0_20px_rgba(255,107,0,0.3)]'
                      : 'bg-surface-card border border-surface-border text-text-secondary hover:text-text-primary hover:border-text-muted/40'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Sort Toggle */}
            <div className="flex items-center gap-1 bg-surface-card border border-surface-border rounded-full p-1 shrink-0">
              <button
                onClick={() => setSortBy('time')}
                className={`px-4 py-1.5 rounded-full text-xs font-mono tracking-wider transition-all duration-300 ${
                  sortBy === 'time' ? 'bg-brand-orange text-white' : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                时间
              </button>
              <button
                onClick={() => setSortBy('category')}
                className={`px-4 py-1.5 rounded-full text-xs font-mono tracking-wider transition-all duration-300 ${
                  sortBy === 'category' ? 'bg-brand-orange text-white' : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                类型
              </button>
            </div>
          </div>
        </div>

        {/* Project Grid */}
        <div
          ref={gridRef}
          className={`grid ${gridCols} gap-5`}
          key={`${activeCategory}-${sortBy}`}
        >
          {displayProjects.map((project, idx) => (
            <ProjectCard
              key={project.id}
              project={project}
              showDate={sortBy === 'time'}
              onClick={() => openProject(idx)}
            />
          ))}
        </div>

        {/* Load More — show all remaining at once */}
        {hasMore && (
          <div className="mt-10 flex justify-center">
            <button
              onClick={() => setVisibleCount(filteredProjects.length)}
              className="group flex items-center gap-2 px-8 py-3 border border-surface-border text-text-secondary text-sm font-medium tracking-wider uppercase rounded-full hover:border-brand-orange hover:text-brand-orange transition-all duration-300"
            >
              <span>加载更多</span>
              <span className="text-lg leading-none transition-transform duration-300 group-hover:translate-y-0.5">↓</span>
            </button>
          </div>
        )}
      </div>

      {/* Project Detail Modal */}
      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          projects={displayProjects}
          currentIndex={selectedIndex}
          onClose={closeModal}
          onPrev={goPrev}
          onNext={goNext}
        />
      )}
    </section>
  );
}

// Project Card with image reveal effect
function ProjectCard({ project, showDate, onClick }) {
  const cardRef = useRef(null);
  const imageRef = useRef(null);
  const overlayRef = useRef(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    let stModule = null;
    const loadGSAP = async () => {
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      stModule = ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);

      if (overlayRef.current) {
        gsap.fromTo(overlayRef.current,
          { clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)' },
          {
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)',
            duration: 1.2, ease: 'power3.inOut',
            scrollTrigger: { trigger: cardRef.current, start: 'top 85%', toggleActions: 'play none none reverse' }
          }
        );
      }

      if (imageRef.current && window.innerWidth >= 768) {
        gsap.fromTo(imageRef.current,
          { y: -30 },
          {
            y: 30, ease: 'none',
            scrollTrigger: { trigger: cardRef.current, start: 'top bottom', end: 'bottom top', scrub: 1 }
          }
        );
      }
    };
    loadGSAP();
    return () => { stModule?.getAll().forEach(st => st.kill()); };
  }, []);

  return (
    <SpotlightCard
      ref={cardRef}
      spotlightColor="rgba(255, 107, 0, 0.15)"
      className="p-0 group cursor-pointer"
      onClick={onClick}
    >
      <div ref={imageRef} className="relative aspect-[16/10] bg-surface-card-hover overflow-hidden">
        {/* Cover image (优先封面图 → 回退画廊第一张) with error fallback */}
        {(project.image || project.gallery?.[0]?.image) && !imgError ? (
          <img
            src={project.image || project.gallery[0].image}
            alt={project.title}
            className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="text-center">
              <span className="text-4xl opacity-20">{'⬡'}</span>
              <p className="text-text-muted text-xs font-mono mt-3">{project.category}</p>
              <p className="text-text-muted/50 text-[10px] font-mono mt-1">作品图片占位</p>
            </div>
          </div>
        )}
        <div
          ref={overlayRef}
          className="absolute inset-0 z-20 bg-surface-base"
          style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-base/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-30" />
        <div className="absolute top-4 left-4 z-30">
          <span className="px-3 py-1.5 bg-surface-base/80 backdrop-blur-sm border border-surface-border rounded-full text-text-secondary text-xs font-mono">
            {project.category}
          </span>
        </div>
        {showDate && project.date && (
          <div className="absolute top-4 right-4 z-30">
            <span className="px-2.5 py-1 bg-surface-base/80 backdrop-blur-sm border border-surface-border rounded-full text-text-muted text-[10px] font-mono">
              {project.date}
            </span>
          </div>
        )}
      </div>
      <div className="p-6 relative z-10">
        <h3 className="font-display text-xl font-semibold text-text-primary mb-2 group-hover:text-brand-orange transition-colors">
          {project.title}
        </h3>
        <p className="text-text-secondary text-sm leading-relaxed mb-4">
          {project.description}
        </p>
        <div className="flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 bg-surface-card-hover border border-surface-border rounded-md text-text-muted text-[11px] font-mono"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </SpotlightCard>
  );
}
