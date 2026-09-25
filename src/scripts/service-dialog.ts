// Service detail modal (Alfa #3): one native <dialog> filled on demand from the JSON
// that ServiceDialog.astro serializes out of `services` in site.ts.
// Opens from any [data-svc-open="slug"] button or /servicos/?abrir=slug.
import { getLenis, onMotionReady, prefersReducedMotion } from '@/scripts/motion';

export interface ServiceDialogItem {
  slug: string;
  num: string;
  title: string;
  summary: string;
  details: string[];
  cta: string;
  href: string;
  /** /contato/?servico=slug: pre-selects the service in the contact form. */
  form: string;
}

const OPEN_PARAM = 'abrir';

export function initServiceDialog() {
  const dialog = document.querySelector<HTMLDialogElement>('[data-svc-dialog]');
  const json = dialog?.querySelector('[data-sdlg-data]')?.textContent;
  if (!dialog || !json || typeof dialog.showModal !== 'function') return;

  const items = new Map((JSON.parse(json) as ServiceDialogItem[]).map((s) => [s.slug, s]));
  const $ = <T extends Element = HTMLElement>(sel: string) => dialog.querySelector<T>(sel);
  const panel = $('[data-sdlg-panel]');
  const title = $('[data-sdlg-title]');
  const summary = $('[data-sdlg-summary]');
  const num = $('[data-sdlg-num]');
  const details = $<HTMLUListElement>('[data-sdlg-details]');
  const cta = $<HTMLAnchorElement>('[data-sdlg-cta]');
  const ctaLabel = $('[data-sdlg-cta-label]');
  const formLink = $<HTMLAnchorElement>('[data-sdlg-form]');
  const icons = [...dialog.querySelectorAll<HTMLElement>('[data-sdlg-icon]')];

  let opener: HTMLElement | null = null;
  let fromDeepLink = false;
  let closeTimer = 0;

  function fill(item: ServiceDialogItem) {
    if (title) title.textContent = item.title;
    if (summary) summary.textContent = item.summary;
    if (num) num.textContent = item.num;
    if (ctaLabel) ctaLabel.textContent = item.cta;
    if (cta) cta.href = item.href;
    if (formLink) formLink.href = item.form;
    icons.forEach((el) => (el.hidden = el.dataset.sdlgIcon !== item.slug));
    details?.replaceChildren(
      ...item.details.map((d) => {
        const li = document.createElement('li');
        li.textContent = d;
        return li;
      }),
    );
  }

  function open(slug: string, from: HTMLElement | null, deepLink = false) {
    const item = items.get(slug);
    if (!item || !dialog) return;
    window.clearTimeout(closeTimer);
    dialog.removeAttribute('data-closing');
    fill(item);
    opener = from;
    fromDeepLink = deepLink;
    dialog.dataset.slug = slug;
    if (!dialog.open) {
      getLenis()?.stop();
      dialog.showModal();
      // Deep links open before initMotion() creates Lenis (this script runs earlier in
      // document order), so stop it again once motion is ready.
      onMotionReady(() => {
        if (dialog.open) getLenis()?.stop();
      });
    }
  }

  // Animated close; the native `close` event does the cleanup, so a forced close
  // (e.g. a second Esc during the animation) still restores everything.
  function requestClose() {
    if (!dialog?.open || dialog.hasAttribute('data-closing')) return;
    if (prefersReducedMotion() || !panel) {
      dialog.close();
      return;
    }
    dialog.setAttribute('data-closing', '');
    const done = () => {
      panel.removeEventListener('animationend', onEnd);
      if (dialog.open) dialog.close();
    };
    const onEnd = (e: AnimationEvent) => e.target === panel && done();
    panel.addEventListener('animationend', onEnd);
    closeTimer = window.setTimeout(done, 400); // fallback if no animation ran
  }

  dialog.addEventListener('close', () => {
    window.clearTimeout(closeTimer);
    dialog.removeAttribute('data-closing');
    getLenis()?.start();

    const slug = dialog.dataset.slug ?? '';
    const card = opener?.closest<HTMLElement>('[data-svc]') ?? (slug ? document.getElementById(slug) : null);
    if (fromDeepLink) {
      // Opened from ?abrir=slug: drop the param so a reload doesn't reopen the modal…
      const url = new URL(location.href);
      url.searchParams.delete(OPEN_PARAM);
      history.replaceState(null, '', url);
      // …and bring the card into view when there is one.
      if (card) {
        const lenis = getLenis();
        if (lenis) lenis.scrollTo(card, { offset: -window.innerHeight / 4, immediate: true });
        else card.scrollIntoView({ block: 'center' });
        card.dispatchEvent(new CustomEvent('svc:open'));
      }
    }
    // Focus back to the opener; without one, to the card (tabindex=-1) or the main content.
    const focusTarget = opener ?? card ?? document.getElementById('conteudo');
    focusTarget?.focus({ preventScroll: true });
    opener = null;
    fromDeepLink = false;
  });

  dialog.addEventListener('cancel', (e) => {
    e.preventDefault();
    requestClose();
  });

  // The dialog box is the full-viewport scrim; the panel sits inside it.
  // Only a press that also started on the scrim counts (a text selection dragged out of
  // the panel ends with a click on the dialog, which must not close it).
  let downOnScrim = false;
  dialog.addEventListener('pointerdown', (e) => {
    downOnScrim = e.target === dialog;
  });
  dialog.addEventListener('click', (e) => {
    if (downOnScrim && e.target === dialog) requestClose();
    downOnScrim = false;
  });

  dialog.querySelectorAll('[data-sdlg-close]').forEach((btn) => btn.addEventListener('click', requestClose));

  document.addEventListener('click', (e) => {
    const btn = (e.target as Element | null)?.closest<HTMLElement>('[data-svc-open]');
    if (!btn) return;
    e.preventDefault();
    open(btn.dataset.svcOpen ?? '', btn);
  });

  const deepSlug = new URLSearchParams(location.search).get(OPEN_PARAM);
  if (deepSlug && items.has(deepSlug)) {
    const btn = document.querySelector<HTMLElement>(`[data-svc-open="${CSS.escape(deepSlug)}"]`);
    open(deepSlug, btn, true);
  }
}
