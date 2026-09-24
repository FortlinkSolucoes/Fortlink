// Masked text reveals for headings.
//   [data-split]          → lines slide up from behind a mask (default)
//   [data-split="chars"]  → characters rise in with a short "decoding" scramble
// Optional: data-split-delay="0.2" (seconds).
// autoSplit re-splits on resize/font load; returning the tween from onSplit lets SplitText
// carry progress over to the new split, so finished headings stay finished.
import { SplitText } from 'gsap/SplitText';
import { gsap, prefersReducedMotion, MOTION } from '@/scripts/motion';

gsap.registerPlugin(SplitText);

const GLYPHS = '01<>/\\{}[]#$%&*+=?ABCDEFGHKLMNPRSTXZ';
const done = new WeakSet<HTMLElement>();

function scramble(char: Element, duration: number, delay: number) {
  const original = char.textContent ?? '';
  if (!original.trim()) return null;
  const state = { p: 0 };
  let last = -1;
  return gsap.to(state, {
    p: 1,
    duration,
    delay,
    ease: 'none',
    onUpdate() {
      // Swap glyph ~every 3 frames until 75% through, then settle on the real char.
      const step = Math.floor(state.p * 12);
      if (state.p >= 0.75) {
        if (char.textContent !== original) char.textContent = original;
        return;
      }
      if (step !== last) {
        last = step;
        char.textContent = GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
    },
    onComplete() {
      char.textContent = original;
    },
    onInterrupt() {
      char.textContent = original;
    },
  });
}

function splitLines(el: HTMLElement, delay: number) {
  SplitText.create(el, {
    type: 'lines',
    mask: 'lines',
    linesClass: 'split-line',
    autoSplit: true,
    onSplit(self: SplitText) {
      el.classList.add('is-split');
      return gsap.from(self.lines, {
        yPercent: 115,
        rotate: 2.5,
        transformOrigin: '0% 100%',
        duration: MOTION.dur,
        delay,
        stagger: MOTION.stagger,
        ease: MOTION.ease,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      });
    },
  });
}

function splitChars(el: HTMLElement, delay: number) {
  SplitText.create(el, {
    type: 'lines,words,chars',
    mask: 'lines',
    linesClass: 'split-line',
    charsClass: 'split-char',
    autoSplit: true,
    onSplit(self: SplitText) {
      el.classList.add('is-split');
      const chars = self.chars;
      const tl = gsap.timeline({
        delay,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      });
      tl.from(chars, {
        yPercent: 100,
        opacity: 0,
        duration: MOTION.dur * 0.8,
        ease: MOTION.ease,
        stagger: { each: 0.028, from: 'start' },
      });
      // Scramble only on the first pass; a re-split after resize just lands on the final state.
      if (!done.has(el)) {
        chars.forEach((c, i) => {
          const s = scramble(c, 0.55, i * 0.028);
          if (s) tl.add(s, 0);
        });
        tl.eventCallback('onComplete', () => done.add(el));
      }
      return tl;
    },
  });
}

/** Splits and reveals every [data-split] element inside `root`. No-op under reduced motion. */
export function initSplitHeadings(root: ParentNode = document) {
  if (prefersReducedMotion()) return;
  const run = () => {
    root.querySelectorAll<HTMLElement>('[data-split]:not(.is-split)').forEach((el) => {
      const delay = Number(el.dataset.splitDelay || 0);
      if (el.dataset.split === 'chars') splitChars(el, delay);
      else splitLines(el, delay);
    });
  };
  // Prefer final font metrics (fewer re-splits), but never hold a heading back more than 600ms:
  // autoSplit re-splits cleanly if a font swaps in later.
  if (!document.fonts || document.fonts.status === 'loaded') {
    run();
    return;
  }
  let ran = false;
  const once = () => {
    if (ran) return;
    ran = true;
    run();
  };
  document.fonts.ready.then(once, once);
  window.setTimeout(once, 600);
}
