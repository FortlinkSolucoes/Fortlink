// Contact form: accessible validation, light BR phone mask and hand-off to
// WhatsApp (wa.me) or e-mail (mailto). No backend — without JS the form posts
// to its mailto: action natively.
import { site, whatsappLink } from '@/data/site';

type Channel = 'whatsapp' | 'email';
type Control = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const digits = (v: string) => v.replace(/\D/g, '');

/** (45) 7400-8279 · (45) 99999-9999 */
export function formatPhoneBR(value: string): string {
  const d = digits(value).slice(0, 11);
  if (!d) return '';
  if (d.length <= 2) return `(${d}`;
  const ddd = d.slice(0, 2);
  const rest = d.slice(2);
  if (rest.length <= 4) return `(${ddd}) ${rest}`;
  const split = d.length === 11 ? 5 : 4;
  return `(${ddd}) ${rest.slice(0, split)}-${rest.slice(split)}`;
}

function validate(el: Control): string {
  const value = el.value.trim();
  const data = el.dataset;
  if (el.required && !value) return data.errorRequired ?? 'Campo obrigatório.';
  if (!value) return '';
  if (el instanceof HTMLTextAreaElement && el.minLength > 0 && value.length < el.minLength) {
    return data.errorShort ?? `Use pelo menos ${el.minLength} caracteres.`;
  }
  if (el.type === 'email' && !EMAIL_RE.test(value)) return data.errorFormat ?? 'Formato inválido.';
  if ('phone' in data) {
    const n = digits(value).length;
    if (n < 10 || n > 11) return data.errorFormat ?? 'Formato inválido.';
  }
  return '';
}

function setError(el: Control, message: string) {
  const errorId = `${el.id}-error`;
  const errorEl = document.getElementById(errorId);
  if (errorEl) errorEl.textContent = message;

  const described = (el.getAttribute('aria-describedby') ?? '').split(/\s+/).filter((id) => id && id !== errorId);
  if (message) {
    el.setAttribute('aria-invalid', 'true');
    described.push(errorId);
  } else {
    el.removeAttribute('aria-invalid');
  }
  if (described.length) el.setAttribute('aria-describedby', described.join(' '));
  else el.removeAttribute('aria-describedby');
}

function buildMessage(form: HTMLFormElement) {
  const get = (name: string) => {
    const el = form.elements.namedItem(name) as Control | null;
    return el?.value.trim() ?? '';
  };
  const fields = {
    nome: get('nome'),
    empresa: get('empresa'),
    email: get('email'),
    telefone: get('telefone'),
    servico: get('servico') || 'A definir',
    mensagem: get('mensagem'),
  };

  const lines = [`Nome: ${fields.nome}`, `Empresa: ${fields.empresa}`];
  if (fields.email) lines.push(`E-mail: ${fields.email}`);
  if (fields.telefone) lines.push(`Telefone: ${fields.telefone}`);
  lines.push(`Serviço de interesse: ${fields.servico}`, '', 'Mensagem:', fields.mensagem);

  return { fields, lines };
}

function buildWhatsApp(form: HTMLFormElement) {
  const { lines } = buildMessage(form);
  const text = ['Olá, FortLink! Vim pelo site e gostaria de um orçamento.', '', ...lines].join('\n');
  return whatsappLink(text);
}

function buildMailto(form: HTMLFormElement) {
  const { fields, lines } = buildMessage(form);
  const subject = `Orçamento pelo site: ${fields.empresa}`;
  const body = ['Olá, equipe FortLink!', '', ...lines].join('\n');
  return `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function initOne(panel: HTMLElement) {
  const form = panel.querySelector<HTMLFormElement>('[data-contact-form]');
  const success = panel.querySelector<HTMLElement>('[data-contact-success]');
  if (!form || !success || form.dataset.ready) return;
  form.dataset.ready = 'true';
  form.noValidate = true; // JS takes over validation messages.

  const summary = form.querySelector<HTMLElement>('[data-form-summary]');
  const controls = Array.from(form.querySelectorAll<Control>('.field__control'));
  const successTitle = success.querySelector<HTMLElement>('[data-success-title]');
  const successText = success.querySelector<HTMLElement>('[data-success-text]');
  const successLink = success.querySelector<HTMLAnchorElement>('[data-success-link]');
  const reset = success.querySelector<HTMLButtonElement>('[data-contact-reset]');
  let attempted = false;

  // Phone mask — skip while deleting so the user can erase separators freely.
  form.querySelectorAll<HTMLInputElement>('[data-phone]').forEach((input) => {
    input.addEventListener('input', (e) => {
      if ((e as InputEvent).inputType?.startsWith('delete')) return;
      input.value = formatPhoneBR(input.value);
    });
    input.addEventListener('blur', () => {
      input.value = formatPhoneBR(input.value);
    });
  });

  controls.forEach((el) => {
    // Validate on blur once the user has touched the field; live-correct after a failed submit.
    el.addEventListener('blur', () => {
      if (attempted || el.value.trim()) setError(el, validate(el));
    });
    el.addEventListener('input', () => {
      if (el.getAttribute('aria-invalid') === 'true') setError(el, validate(el));
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    attempted = true;

    const invalid = controls.filter((el) => {
      const msg = validate(el);
      setError(el, msg);
      return Boolean(msg);
    });

    if (invalid.length) {
      if (summary) {
        summary.textContent =
          invalid.length === 1
            ? 'Há 1 campo para corrigir antes de enviar.'
            : `Há ${invalid.length} campos para corrigir antes de enviar.`;
      }
      invalid[0].focus();
      return;
    }
    if (summary) summary.textContent = '';

    const submitter = (e as SubmitEvent).submitter;
    const channel: Channel =
      submitter?.closest<HTMLElement>('[data-channel]')?.dataset.channel === 'email' ? 'email' : 'whatsapp';

    if (channel === 'whatsapp') {
      const url = buildWhatsApp(form);
      window.open(url, '_blank', 'noopener');
      showSuccess(channel, url);
    } else {
      const url = buildMailto(form);
      window.location.href = url;
      showSuccess(channel, url);
    }
  });

  function showSuccess(channel: Channel, url: string) {
    if (successText) {
      successText.textContent =
        channel === 'whatsapp'
          ? 'Abrimos o WhatsApp com a sua mensagem já formatada. É só tocar em enviar que nossa equipe responde por lá.'
          : 'Abrimos o seu aplicativo de e-mail com a mensagem pronta. É só enviar que nossa equipe retorna em breve.';
    }
    if (successLink) {
      successLink.href = url;
      if (channel === 'whatsapp') {
        successLink.target = '_blank';
        successLink.rel = 'noopener noreferrer';
      } else {
        successLink.removeAttribute('target');
        successLink.removeAttribute('rel');
      }
    }
    panel.dataset.state = 'success';
    success!.hidden = false;
    successTitle?.focus({ preventScroll: true });
  }

  reset?.addEventListener('click', () => {
    form!.reset();
    controls.forEach((el) => setError(el, ''));
    attempted = false;
    success!.hidden = true;
    panel.dataset.state = 'idle';
    controls[0]?.focus();
  });
}

export function initContactForm() {
  document.querySelectorAll<HTMLElement>('[data-contact-panel]').forEach(initOne);
}
