// Navigation, the blue band, the scanner's motion controls and the demo form. No dependencies.
(() => {
  const OPEN_DELAY = 90;
  const CLOSE_DELAY = 220;
  const items = [...document.querySelectorAll('.has-menu')];

  const closeAll = (except) => {
    items.forEach((item) => {
      if (item === except) return;
      item.classList.remove('is-open');
      item.dataset.pinned = '';
      item.querySelector('.nav-top').setAttribute('aria-expanded', 'false');
    });
  };

  const openItem = (item) => {
    closeAll(item);
    item.classList.add('is-open');
    item.querySelector('.nav-top').setAttribute('aria-expanded', 'true');
  };

  const closeItem = (item) => {
    item.classList.remove('is-open');
    item.dataset.pinned = '';
    item.querySelector('.nav-top').setAttribute('aria-expanded', 'false');
  };

  items.forEach((item) => {
    const button = item.querySelector('.nav-top');
    const links = () => [...item.querySelectorAll('.menu a')];
    let timer;

    // Hover opens after a short wait and closes after a longer one, so a diagonal move does not lose the menu.
    item.addEventListener('pointerenter', (event) => {
      if (event.pointerType !== 'mouse') return;
      clearTimeout(timer);
      timer = setTimeout(() => openItem(item), OPEN_DELAY);
    });
    item.addEventListener('pointerleave', (event) => {
      if (event.pointerType !== 'mouse') return;
      clearTimeout(timer);
      if (item.dataset.pinned === 'true') return;
      timer = setTimeout(() => closeItem(item), CLOSE_DELAY);
    });

    // A click pins an open menu, or closes a pinned one.
    button.addEventListener('click', () => {
      clearTimeout(timer);
      const isOpen = item.classList.contains('is-open');
      if (isOpen && item.dataset.pinned === 'true') {
        closeItem(item);
      } else {
        openItem(item);
        item.dataset.pinned = 'true';
      }
    });

    button.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        openItem(item);
        item.dataset.pinned = 'true';
        links()[0]?.focus();
      }
    });

    item.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && item.classList.contains('is-open')) {
        event.stopPropagation();
        closeItem(item);
        button.focus();
        return;
      }
      if (!event.target.closest('.menu')) return;
      const list = links();
      const at = list.indexOf(event.target);
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        list[(at + 1) % list.length].focus();
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        if (at === 0) button.focus();
        else list[at - 1].focus();
      } else if (event.key === 'Home') {
        event.preventDefault();
        list[0].focus();
      } else if (event.key === 'End') {
        event.preventDefault();
        list[list.length - 1].focus();
      }
    });

    // Moving the focus out of the menu closes it.
    item.addEventListener('focusout', (event) => {
      if (event.relatedTarget && !item.contains(event.relatedTarget)) closeItem(item);
    });
  });

  document.addEventListener('click', (event) => {
    if (!event.target.closest('.has-menu')) closeAll();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeAll();
  });

  // ---------- The drawer ----------
  const drawer = document.getElementById('drawer');
  const scrim = document.querySelector('.drawer-scrim');
  const toggle = document.querySelector('.drawer-toggle');
  const closeButton = document.querySelector('.drawer-close');
  const background = () => [document.querySelector('.site-head'), document.getElementById('main'), document.querySelector('.site-foot')];

  const focusable = () => [...drawer.querySelectorAll('a[href], button:not([disabled])')].filter((el) => el.offsetParent !== null);

  function openDrawer() {
    drawer.hidden = false;
    scrim.hidden = false;
    document.body.classList.add('drawer-open');
    toggle.setAttribute('aria-expanded', 'true');
    background().forEach((el) => el && el.setAttribute('inert', ''));
    // A frame later, so the slide starts from its closed place.
    requestAnimationFrame(() => {
      drawer.classList.add('is-open');
      closeButton.focus();
    });
  }

  function closeDrawer() {
    drawer.classList.remove('is-open');
    scrim.hidden = true;
    document.body.classList.remove('drawer-open');
    toggle.setAttribute('aria-expanded', 'false');
    background().forEach((el) => el && el.removeAttribute('inert'));
    const done = () => {
      drawer.hidden = true;
    };
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) done();
    else setTimeout(done, 260);
    toggle.focus();
  }

  toggle?.addEventListener('click', openDrawer);
  closeButton?.addEventListener('click', closeDrawer);
  scrim?.addEventListener('click', closeDrawer);

  drawer?.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeDrawer();
      return;
    }
    if (event.key !== 'Tab') return;
    const list = focusable();
    const first = list[0];
    const last = list[list.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  drawer?.querySelectorAll('.drawer-group > .drawer-top').forEach((button) => {
    button.addEventListener('click', () => {
      const sub = document.getElementById(button.getAttribute('aria-controls'));
      const open = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!open));
      sub.hidden = open;
    });
  });

  // A link inside the drawer may lead to a section of this same page.
  drawer?.addEventListener('click', (event) => {
    if (event.target.closest('a')) closeDrawer();
  });

  matchMedia('(min-width: 992px)').addEventListener('change', (event) => {
    if (event.matches && drawer && !drawer.hidden) closeDrawer();
  });

  // ---------- The blue band: stuck state and the current section ----------
  const band = document.querySelector('.band');
  const sentinel = document.querySelector('.band-sentinel');
  if (band && sentinel && 'IntersectionObserver' in window) {
    const stuck = new IntersectionObserver(([entry]) => {
      band.classList.toggle('is-stuck', !entry.isIntersecting && entry.boundingClientRect.top < 0);
    });
    stuck.observe(sentinel);

    const pageLinks = [...band.querySelectorAll('.band-links a')].filter((a) => a.pathname === location.pathname && a.hash);
    const sections = pageLinks.map((a) => document.querySelector(a.hash)).filter(Boolean);
    if (sections.length) {
      const spy = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            pageLinks.forEach((a) => {
              if (a.hash === `#${entry.target.id}`) a.setAttribute('aria-current', 'true');
              else a.removeAttribute('aria-current');
            });
          });
        },
        { rootMargin: '-30% 0px -60% 0px' }
      );
      sections.forEach((section) => spy.observe(section));
    }
  }

  // ---------- The band on narrow screens: fade the edge with more behind it, and a button to reach it ----------
  const bandLinks = band && band.querySelector('.band-links');
  const bandMore = band && band.querySelector('.band-more');
  if (bandLinks) {
    const updateBand = () => {
      const max = bandLinks.scrollWidth - bandLinks.clientWidth;
      band.classList.toggle('can-left', bandLinks.scrollLeft > 4);
      band.classList.toggle('can-right', max > 4 && bandLinks.scrollLeft < max - 4);
    };
    bandLinks.addEventListener('scroll', updateBand, { passive: true });
    window.addEventListener('resize', updateBand);
    updateBand();
    bandMore?.addEventListener('click', () => {
      const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      bandLinks.scrollBy({ left: bandLinks.clientWidth * 0.7, behavior: reduced ? 'auto' : 'smooth' });
    });
  }

  // ---------- The scanner: pauses off screen, on request and for reduced motion ----------
  const scanner = document.querySelector('[data-scanner]');
  if (scanner) {
    const button = scanner.querySelector('[data-scanner-toggle]');
    const label = scanner.querySelector('[data-scanner-label]');
    let userPaused = false;
    let offScreen = false;
    let hidden = document.hidden;
    const apply = () => scanner.classList.toggle('is-paused', userPaused || offScreen || hidden);

    button.addEventListener('click', () => {
      userPaused = !userPaused;
      button.setAttribute('aria-pressed', String(userPaused));
      label.textContent = userPaused ? 'Play animation' : 'Pause animation';
      apply();
    });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => {
        offScreen = !entry.isIntersecting;
        apply();
      }).observe(scanner);
    }

    document.addEventListener('visibilitychange', () => {
      hidden = document.hidden;
      apply();
    });
    apply();
  }

  // ---------- The demo form ----------
  const form = document.querySelector('[data-demo-form]');
  if (form) {
    // With JavaScript the page checks the fields itself; without it the browser's own checks stay on.
    form.noValidate = true;
    const status = form.querySelector('[data-form-status]');
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const rules = {
      name: (v) => (v.length < 2 ? 'Enter your name.' : ''),
      // Also refuses two dots in a row, a dot at the end and letters outside a to z.
      email: (v) => (!v ? 'Enter your work email.' : emailPattern.test(v) && !/\.\.|\.$|[^\x21-\x7e]/.test(v) ? '' : 'Enter an email address like name@company.com.'),
      company: (v) => (!v ? 'Enter your company name.' : ''),
      message: (v) => (v.length < 10 ? 'Tell us a little about your documents, in a sentence or two.' : '')
    };

    const check = (field) => {
      const error = rules[field.name](field.value.trim());
      const slot = document.getElementById(`${field.id}-error`);
      slot.textContent = error;
      if (error) field.setAttribute('aria-invalid', 'true');
      else field.removeAttribute('aria-invalid');
      return !error;
    };

    const fields = Object.keys(rules).map((name) => form.elements[name]);
    let tried = false;

    fields.forEach((field) => {
      field.addEventListener('blur', () => {
        if (tried || field.value.trim()) check(field);
      });
      field.addEventListener('input', () => {
        if (field.getAttribute('aria-invalid') === 'true') check(field);
      });
    });

    const send = form.querySelector('[data-send]');
    const contact = form.dataset.contact;
    // The live site address (site.config.json siteUrl). Once set, it is sent as _url, which FormSubmit
    // shows as the form's page in each email (browsers only send the bare domain as the Referer).
    const site = form.dataset.site || '';
    let sending = false;

    // Shows the note under the button: a bold first line, then the details, built as text (never as HTML).
    const say = (ok, title, text, withEmail) => {
      status.replaceChildren();
      const strong = document.createElement('strong');
      strong.textContent = title;
      status.append(strong, text);
      if (withEmail) {
        const link = document.createElement('a');
        link.href = `mailto:${contact}`;
        link.textContent = contact;
        status.append(link, '.');
      }
      status.classList.toggle('is-error', !ok);
      status.hidden = false;
      status.focus();
    };

    // The request is emailed to the team straight from the page through FormSubmit (formsubmit.co),
    // a free form-to-email service, so the site needs no server code. FormSubmit needs a one-time
    // "Activate form" click in the inbox at go-live. "Thanks" shows only when FormSubmit confirms.
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (sending) return;
      tried = true;
      status.hidden = true;
      const results = fields.map(check);
      const firstBad = fields[results.indexOf(false)];
      if (firstBad) {
        firstBad.focus();
        return;
      }
      sending = true;
      send.disabled = true;
      send.setAttribute('aria-busy', 'true');
      const value = (name) => form.elements[name].value.trim();
      const email = value('email');
      const body = {
        name: value('name'),
        email,
        company: value('company'),
        message: value('message'),
        _subject: `Peaplexa demo request: ${value('name')} (${value('company')})`,
        _replyto: email,
        _template: 'table',
        _captcha: 'false',
        _honey: form.elements._honey.value
      };
      if (site) body._url = site;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 15000);
      let ok = false;
      try {
        const response = await fetch(`https://formsubmit.co/ajax/${contact}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(body),
          // The browser's normal Referer header stays on: FormSubmit refuses requests without it.
          signal: controller.signal
        });
        const answer = await response.json().catch(() => null);
        // FormSubmit answers {"success": "true"}; anything else, including "needs activation", is not sent.
        ok = response.ok && Boolean(answer) && String(answer.success) === 'true';
      } catch {
        ok = false;
      } finally {
        clearTimeout(timer);
      }
      sending = false;
      send.disabled = false;
      send.removeAttribute('aria-busy');
      if (ok) {
        form.reset();
        tried = false;
        say(true, 'Thanks, your request was sent.', `The Peaplexa team will write back to ${email}.`);
      } else {
        say(false, 'Your request was not sent.', 'Please try again in a moment, or write to us at ', true);
      }
    });
  }
})();
