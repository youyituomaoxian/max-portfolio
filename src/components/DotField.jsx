import { useEffect, useRef, useCallback } from 'react';

export default function DotField({
  dotRadius = 1.5,
  dotSpacing = 14,
  cursorRadius = 500,
  cursorForce = 0.1,
  bulgeOnly = true,
  bulgeStrength = 67,
  glowRadius = 160,
  gradientFrom = 'rgba(168, 85, 247, 0.35)',
  gradientTo = 'rgba(180, 151, 207, 0.25)',
  glowColor = '#120F17',
  dotColor = 'rgba(255, 255, 255, 0.15)',
}) {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const rafRef = useRef(null);
  const dotsRef = useRef([]);
  const resizeTimerRef = useRef(null);

  const buildDots = useCallback((w, h) => {
    const dots = [];
    const rows = Math.ceil(h / dotSpacing) + 1;
    const cols = Math.ceil(w / dotSpacing) + 1;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        dots.push({
          baseX: c * dotSpacing,
          baseY: r * dotSpacing,
          x: c * dotSpacing,
          y: r * dotSpacing,
        });
      }
    }
    return dots;
  }, [dotSpacing]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { width: w, height: h } = canvas;
    const mx = mouseRef.current.x;
    const my = mouseRef.current.y;

    ctx.clearRect(0, 0, w, h);

    /* ---- Batched dot draw: single path + single fill ---- */
    const dots = dotsRef.current;
    const force = cursorForce;
    const cr2 = cursorRadius * cursorRadius;

    // Phase 1: Update positions
    for (let i = 0; i < dots.length; i++) {
      const d = dots[i];
      const dx = d.baseX - mx;
      const dy = d.baseY - my;
      const dist2 = dx * dx + dy * dy;

      if (dist2 < cr2 && dist2 > 0) {
        const dist = Math.sqrt(dist2);
        const t = 1 - dist / cursorRadius;
        const strength = Math.pow(t, 2) * force * bulgeStrength;
        if (bulgeOnly) {
          d.x = d.baseX + (dx / dist) * strength;
          d.y = d.baseY + (dy / dist) * strength;
        } else {
          d.x = d.baseX + dx * strength * 0.01;
          d.y = d.baseY + dy * strength * 0.01;
        }
      } else {
        d.x += (d.baseX - d.x) * 0.12;
        d.y += (d.baseY - d.y) * 0.12;
      }
    }

    // Phase 2: Batch render all dots in one path
    ctx.beginPath();
    for (let i = 0; i < dots.length; i++) {
      const d = dots[i];
      ctx.moveTo(d.x + dotRadius, d.y);
      ctx.arc(d.x, d.y, dotRadius, 0, Math.PI * 2);
    }
    ctx.fillStyle = dotColor;
    ctx.fill();

    /* ---- Glow around cursor ---- */
    if (mx > 0 && my > 0 && mx < w && my < h) {
      const glow = ctx.createRadialGradient(mx, my, 0, mx, my, glowRadius);
      glow.addColorStop(0, glowColor);
      glow.addColorStop(0.5, 'rgba(0,0,0,0.3)');
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);
    }

    /* ---- Global radial gradient overlay ---- */
    const grad = ctx.createRadialGradient(
      mx > 0 ? mx : w / 2, my > 0 ? my : h / 2, 0,
      mx > 0 ? mx : w / 2, my > 0 ? my : h / 2,
      Math.max(w, h) * 0.5
    );
    grad.addColorStop(0, 'transparent');
    grad.addColorStop(0.5, 'transparent');
    grad.addColorStop(1, gradientTo);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    rafRef.current = requestAnimationFrame(draw);
  }, [dotRadius, cursorRadius, cursorForce, bulgeOnly, bulgeStrength, glowRadius, glowColor, dotColor, gradientTo]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);
      dotsRef.current = buildDots(rect.width, rect.height);
    };

    // Debounced resize
    const onResize = () => {
      if (resizeTimerRef.current) clearTimeout(resizeTimerRef.current);
      resizeTimerRef.current = setTimeout(resize, 150);
    };

    const onMouse = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const onLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 };
    };

    resize();
    window.addEventListener('resize', onResize);
    canvas.parentElement?.addEventListener('mousemove', onMouse);
    canvas.parentElement?.addEventListener('mouseleave', onLeave);

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', onResize);
      canvas.parentElement?.removeEventListener('mousemove', onMouse);
      canvas.parentElement?.removeEventListener('mouseleave', onLeave);
      if (resizeTimerRef.current) clearTimeout(resizeTimerRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [buildDots, draw]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0"
      style={{ pointerEvents: 'none' }}
    />
  );
}
