import { useEffect, useRef, useState } from 'react';
import { lockBodyScroll, unlockBodyScroll } from '../utils/bodyScrollLock';

export default function ProjectModal({ project, projects, currentIndex, onClose, onPrev, onNext }) {
  const overlayRef = useRef(null);
  const contentRef = useRef(null);

  // Stable keyboard handling via ref (avoids effect re-run on callback changes)
  const callbacksRef = useRef({ onClose, onPrev, onNext });
  callbacksRef.current = { onClose, onPrev, onNext };

  useEffect(() => {
    lockBodyScroll();
    const handleKey = (e) => {
      if (e.key === 'Escape') { if (zoomScaleRef.current > 1) setZoomScale(1); else if (zoomRef.current) setZoomedImage(null); else callbacksRef.current.onClose(); }
      if (e.key === 'ArrowLeft') callbacksRef.current.onPrev();
      if (e.key === 'ArrowRight') callbacksRef.current.onNext();
    };
    window.addEventListener('keydown', handleKey);
    return () => {
      unlockBodyScroll();
      window.removeEventListener('keydown', handleKey);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadGSAP = async () => {
      const { gsap } = await import('gsap');
      if (cancelled) return;
      if (overlayRef.current) gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: 'power2.out' });
      if (contentRef.current) {
        const items = contentRef.current.querySelectorAll('.animate-item');
        gsap.fromTo(items, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out', delay: 0.15 });
      }
    };
    loadGSAP();
    return () => { cancelled = true; };
  }, [project.id]);

  if (!project) return null;

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < projects.length - 1;
  const hasGallery = Array.isArray(project.gallery) && project.gallery.length > 0;

  // 图片点击放大（Lightbox）状态
  const [zoomedImage, setZoomedImage] = useState(null);
  const zoomRef = useRef(null);
  zoomRef.current = zoomedImage;
  const [zoomScale, setZoomScale] = useState(1);
  const zoomScaleRef = useRef(1);
  zoomScaleRef.current = zoomScale;
  const lightboxRef = useRef(null);
  const openZoom = (src) => { setZoomedImage(src); setZoomScale(1); };

  // 滚轮缩放（非被动监听，阻止背景滚动）
  useEffect(() => {
    const el = lightboxRef.current;
    if (!el || !zoomedImage) return;
    const onWheel = (e) => {
      e.preventDefault();
      setZoomScale((s) => Math.min(5, Math.max(0.5, s + (e.deltaY < 0 ? 0.15 : -0.15))));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [zoomedImage]);

  return (
    <div ref={overlayRef} className="fixed inset-0 z-[100] overflow-y-auto no-scrollbar" onClick={onClose}>
      <div className="fixed inset-0 bg-surface-base" />
      <div
        className="fixed inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.8) 1px, transparent 0)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Top bar: back (mobile) + close + prev/next (desktop) */}
      <div className="fixed top-0 inset-x-0 z-[110] flex items-center justify-between px-3 md:px-6 py-3 pointer-events-none">
        {/* Mobile back button + title */}
        <div className="flex items-center gap-3 pointer-events-auto md:hidden">
          <button onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-card/90 border border-surface-border backdrop-blur-sm text-text-muted hover:text-text-primary transition-all duration-300"
            aria-label="返回">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <span className="text-text-muted text-xs font-mono truncate max-w-[200px]">{project.title}</span>
        </div>

        {/* Right: prev/next (desktop) + close */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="hidden md:flex items-center gap-2">
            <button disabled={!hasPrev} onClick={(e) => { e.stopPropagation(); onPrev(); }}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-surface-card/80 border border-surface-border backdrop-blur-sm text-text-muted hover:text-text-primary hover:border-brand-orange/40 disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-300"
              aria-label="上一个项目">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <button disabled={!hasNext} onClick={(e) => { e.stopPropagation(); onNext(); }}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-surface-card/80 border border-surface-border backdrop-blur-sm text-text-muted hover:text-text-primary hover:border-brand-orange/40 disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-300"
              aria-label="下一个项目">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          </div>
          <div className="w-px h-6 bg-surface-border hidden md:block" />
          <button onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-card/90 border border-surface-border backdrop-blur-sm text-text-muted hover:text-text-primary transition-all duration-300"
            aria-label="关闭">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>
      </div>

      {/* ===== Main Content — single aligned column ===== */}
      <div
        ref={contentRef}
        className="relative z-10 max-w-4xl mx-auto px-4 md:px-10 pt-14 md:pt-20 pb-24 md:pb-32"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ---- Header ---- */}
        <header className="animate-item mb-6 md:mb-8">
          <p className="text-brand-orange font-mono text-xs tracking-[0.25em] uppercase mb-2 md:mb-3">{project.category}</p>
          <h1 className="font-display text-2xl md:text-5xl font-bold text-text-primary leading-tight mb-3">{project.title}</h1>
          {project.date && (
            <p className="text-text-muted text-sm font-mono">{project.date}</p>
          )}
        </header>

        {/* ---- 项目说明 + 标签（说明在上、标签在下，左对齐） ---- */}
        {(project.description || (Array.isArray(project.tags) && project.tags.length > 0)) && (
          <section className="animate-item mb-12 md:mb-16">
            {project.description && (
              <>
                <h2 className="text-lg md:text-xl font-display text-text-primary mb-4 md:mb-5">项目说明</h2>
                <p className="text-text-secondary text-[14px] md:text-[15px] leading-relaxed">{project.description}</p>
              </>
            )}
            {Array.isArray(project.tags) && project.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-6 md:mt-8 pt-5 md:pt-6 border-t border-surface-border">
                {project.tags.map((tag) => (
                  <span key={tag} className="px-2.5 md:px-3 py-1 md:py-1.5 bg-surface-card border border-surface-border rounded-full text-text-secondary text-[11px] md:text-xs font-mono hover:border-brand-orange/30 transition-colors duration-300">{tag}</span>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ---- Gallery: 图片 + 视频混排 ---- */}
        {hasGallery && (
          <div className="space-y-10 md:space-y-16">
            {project.gallery.map((item, idx) => (
              <GalleryItem key={idx} item={item} projectTitle={project.title} onZoom={openZoom} />
            ))}
          </div>
        )}

        {/* Mobile prev/next — fixed bottom */}
        <div className="fixed bottom-0 inset-x-0 z-[110] flex items-center justify-center gap-4 p-4 md:hidden pointer-events-none"
          style={{ background: 'linear-gradient(transparent, var(--tw-bg-surface-base, #0A0A0A) 60%)' }}>
          <button disabled={!hasPrev} onClick={(e) => { e.stopPropagation(); onPrev(); }}
            className="pointer-events-auto w-12 h-12 flex items-center justify-center rounded-full bg-surface-card/90 border border-surface-border backdrop-blur-sm text-text-primary hover:border-brand-orange/40 disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-300"
            aria-label="上一个">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <span className="pointer-events-auto text-text-muted text-xs font-mono">{currentIndex + 1} / {projects.length}</span>
          <button disabled={!hasNext} onClick={(e) => { e.stopPropagation(); onNext(); }}
            className="pointer-events-auto w-12 h-12 flex items-center justify-center rounded-full bg-surface-card/90 border border-surface-border backdrop-blur-sm text-text-primary hover:border-brand-orange/40 disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-300"
            aria-label="下一个">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
        </div>
      </div>

      {/* ===== 图片放大预览（Lightbox） ===== */}
      {zoomedImage && (
        <div
          ref={lightboxRef}
          className="fixed inset-0 z-[300] flex items-center justify-center p-4 md:p-12 bg-black/92 backdrop-blur-md overflow-hidden"
          onClick={(e) => { e.stopPropagation(); setZoomedImage(null); }}
        >
          <img
            src={zoomedImage}
            alt="放大预览"
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl select-none"
            onClick={(e) => e.stopPropagation()}
            style={{ cursor: zoomScale > 1 ? 'zoom-out' : 'default', transform: `scale(${zoomScale})`, transformOrigin: 'center center', transition: 'transform 0.12s ease-out' }}
          />
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-text-muted text-xs font-mono pointer-events-none bg-surface-base/60 px-3 py-1.5 rounded-full backdrop-blur-sm whitespace-nowrap">
            点击图片以外区域关闭 · 滚轮缩放（{Math.round(zoomScale * 100)}%）
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * 单个画廊项：自动判断图片 / 视频，竖版视频带模糊背景
 */
function GalleryItem({ item, projectTitle, onZoom }) {
  const isVideo = !!item.video;
  const isPortrait = item.aspect === 'portrait';

  // 竖版内容需要模糊背景填充容器
  if (isPortrait) {
    return (
      <figure className="animate-item">
        <div className="relative w-full rounded-xl overflow-hidden bg-surface-card">
          {/* 模糊背景层 */}
          <MediaElement
            item={item}
            projectTitle={projectTitle}
            onZoom={onZoom}
            className="absolute inset-0 w-full h-full object-cover scale-110 blur-xl opacity-30"
          />
          {/* 前景清晰内容 */}
          <MediaElement
            item={item}
            projectTitle={projectTitle}
            className="relative w-full max-w-sm md:max-w-md mx-auto block"
            style={{ maxHeight: '70vh', objectFit: 'contain' }}
          />
        </div>
        {item.caption && (
          <figcaption className="mt-4 text-text-secondary text-sm leading-relaxed">
            {item.caption}
          </figcaption>
        )}
      </figure>
    );
  }

  /* 横版默认布局 */
  return (
    <figure className="animate-item">
      <div className="relative rounded-xl overflow-hidden group">
        <MediaElement
          item={item}
          projectTitle={projectTitle}
          onZoom={onZoom}
          className="w-full h-auto"
          style={{ maxHeight: '70vh', objectFit: 'contain' }}
        />
        {item.image && onZoom && (
          <div className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center rounded-full bg-surface-base/70 backdrop-blur-sm text-text-muted opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" aria-hidden>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          </div>
        )}
      </div>
      {item.caption && (
        <figcaption className="mt-4 text-text-secondary text-sm leading-relaxed">
          {item.caption}
        </figcaption>
      )}
    </figure>
  );
}

/**
 * 渲染图片或视频元素
 */
function MediaElement({ item, projectTitle, className, style, onZoom }) {
  if (item.video) {
    return (
      <video
        src={item.video}
        poster={item.image}
        className={className}
        style={style}
        controls
        loop
        playsInline
        preload="metadata"
      >
        您的浏览器不支持视频播放。
      </video>
    );
  }

  if (!item.image) {
    return (
      <div className={className} style={style}>
        <div className="aspect-video bg-surface-card flex items-center justify-center rounded-xl">
          <span className="text-text-muted text-sm font-mono">暂无预览</span>
        </div>
      </div>
    );
  }

  return (
    <img
      src={item.image}
      alt={item.caption || projectTitle}
      className={`${className} ${onZoom ? 'cursor-zoom-in' : ''}`}
      style={style}
      loading="lazy"
      onClick={onZoom ? (e) => { e.stopPropagation(); onZoom(item.image); } : undefined}
    />
  );
}
