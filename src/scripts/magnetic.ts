// Magnetic elements: [data-magnetic] leans toward the pointer and eases back.
// Optional: data-magnetic="0.5" (strength, default 0.35) and a child [data-magnetic-inner]
// that travels further for a parallax "depth" feel.
// Motion is written to the individual CSS `translate` property (not `transform`), so it never
// fights with a component's own hover transforms (scale, etc.).
import { gsap, prefersReducedMotion, isTouch, MOTION } from '@/scripts/motion';

const bound = new WeakSet<HTMLElement>();

interface Proxy {
  x: number;
  y: number;
}

function bind(el: HTMLElement) {
  if (bound.has(el)) return;
  bound.add(el);

  const strength = Number.parseFloat(el.dataset.magnetic || '') || 0.35;
  const inner = el.querySelector<HTMLElement>('[data-magnetic-inner]');
  const p: Proxy = { x: 0, y: 0 };

  const apply = () => {
    el.style.translate = `${p.x.toFixed(2)}px ${p.y.toFixed(2)}px`;
    if (inner) inner.style.translate = `${(p.x * 0.6).toFixed(2)}px ${(p.y * 0.6).toFixed(2)}px`;
  };

  const xTo = gsap.quickTo(p, 'x', { duration: 0.6, ease: 'power3.out', onUpdate: apply });
  const yTo = gsap.quickTo(p, 'y', { duration: 0.6, ease: 'power3.out', onUpdate: apply });
  let release: gsap.core.Tween | null = null;

  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    release?.kill();
    release = null;
    const r = el.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    // Cap the pull so large elements don't fly away.
    const max = Math.min(28, Math.max(r.width, r.height) * 0.35);
    xTo(gsap.utils.clamp(-max, max, dx * strength), p.x);
    yTo(gsap.utils.clamp(-max, max, dy * strength), p.y);
  };

  const onLeave = () => {
    xTo.tween.pause();
    yTo.tween.pause();
    release = gsap.to(p, { x: 0, y: 0, duration: 0.9, ease: MOTION.ease, onUpdate: apply });
  };

  el.addEventListener('pointermove', onMove);
  el.addEventListener('pointerleave', onLeave);
  el.addEventListener('blur', onLeave, true);
}

/** Binds every [data-magnetic] element. Safe to call more than once. */
export function initMagnetic(root: ParentNode = document) {
  if (prefersReducedMotion() || isTouch()) return;
  root.querySelectorAll<HTMLElement>('[data-magnetic]').forEach(bind);
}
