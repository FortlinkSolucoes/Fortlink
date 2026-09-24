// Motion core: smooth scroll (Lenis) + GSAP/ScrollTrigger + generic reveals.
// Every animation module must:
//   1. check `prefersReducedMotion()` and bail out (content must already be visible),
//   2. register itself via `onMotionReady(fn)` so it runs after Lenis/GSAP are wired.
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };

const reducedQuery =
  typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;

export const prefersReducedMotion = () => reducedQuery?.matches ?? false;

export const isTouch = () =>
  typeof window !== 'undefined' && window.matchMedia('(hover: none), (pointer: coarse)').matches;

let lenis: Lenis | null = null;
export const getLenis = () => lenis;

type ReadyFn = () => void;
const queue: ReadyFn[] = [];
let ready = false;

export function onMotionReady(fn: ReadyFn) {
  if (ready) fn();
  else queue.push(fn);
}

function initReveals() {
  const items = gsap.utils.toArray<HTMLElement>('[data-reveal]');
  items.forEach((el) => {
    const kind = el.dataset.reveal || 'up';
    const delay = Number(el.dataset.revealDelay || 0);
    const from: gsap.TweenVars =
      kind === 'fade'
        ? { opacity: 0 }
        : kind === 'scale'
          ? { opacity: 0, scale: 0.94 }
          : kind === 'left'
            ? { opacity: 0, x: -48 }
            : kind === 'right'
              ? { opacity: 0, x: 48 }
              : { opacity: 0, y: 48 };
    gsap.fromTo(el, from, {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      duration: 1.1,
      delay,
      ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });

  // Staggered children: <ul data-stagger> → each direct child animates in sequence.
  gsap.utils.toArray<HTMLElement>('[data-stagger]').forEach((group) => {
    gsap.fromTo(
      group.children,
      { opacity: 0, y: 32 },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: 'expo.out',
        stagger: 0.08,
        scrollTrigger: { trigger: group, start: 'top 85%', once: true },
      },
    );
  });
}

export function initMotion() {
  const root = document.documentElement;
  root.classList.add('js');

  if (prefersReducedMotion()) {
    root.classList.add('reduced-motion');
    ready = true;
    queue.splice(0).forEach((fn) => fn());
    return;
  }

  lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis?.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // Anchor links go through Lenis.
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      lenis?.scrollTo(target as HTMLElement, { offset: -80 });
    });
  });

  initReveals();
  ready = true;
  queue.splice(0).forEach((fn) => fn());
  window.addEventListener('load', () => ScrollTrigger.refresh());
}
