(function () {
  'use strict';

  document.documentElement.classList.add('js');

  // Always return to the real top immediately. This avoids long animated
  // anchor scrolling and also makes the sticky header's Home target reliable.
  document.querySelectorAll('a[href="#top"]').forEach(function (link) {
    link.addEventListener('click', function (event) {
      event.preventDefault();
      document.documentElement.style.scrollBehavior = 'auto';
      document.body.style.scrollBehavior = 'auto';
      window.scrollTo(0, 0);
      if (window.location.hash) {
        history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    });
  });

  const menuButton = document.querySelector('.menu-toggle');
  const siteNav = document.querySelector('.site-nav');

  function closeMenu(returnFocus) {
    if (!menuButton || !siteNav) return;
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.querySelector('.sr-only').textContent = 'Open navigation';
    siteNav.classList.remove('is-open');
    document.body.style.overflow = '';
    if (returnFocus) menuButton.focus();
  }

  if (menuButton && siteNav) {
    menuButton.addEventListener('click', function () {
      const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!isOpen));
      menuButton.querySelector('.sr-only').textContent = isOpen ? 'Open navigation' : 'Close navigation';
      siteNav.classList.toggle('is-open', !isOpen);
      document.body.style.overflow = isOpen ? '' : 'hidden';
    });

    siteNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () { closeMenu(false); });
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && siteNav.classList.contains('is-open')) closeMenu(true);
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth >= 900) closeMenu(false);
    });
  }

  const filterButtons = document.querySelectorAll('.filter-button');
  const storyCards = document.querySelectorAll('.story-card');

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      const filter = button.dataset.filter;

      filterButtons.forEach(function (item) {
        const active = item === button;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-pressed', String(active));
      });

      storyCards.forEach(function (card) {
        card.hidden = filter !== 'all' && card.dataset.category !== filter;
      });
    });
  });

  const subjectSelect = document.querySelector('#subject');
  document.querySelectorAll('.subject-link').forEach(function (link) {
    link.addEventListener('click', function () {
      if (subjectSelect && link.dataset.subject) {
        subjectSelect.value = link.dataset.subject;
      }
    });
  });

  const form = document.querySelector('#contact-form');
  const copyButton = document.querySelector('#copy-message');
  const formStatus = document.querySelector('#form-status');
  const fields = form ? Array.from(form.querySelectorAll('input, select, textarea')) : [];

  function getError(field) {
    const value = field.value.trim();
    if (!value) return 'Please complete this field.';
    if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return 'Enter a valid email address.';
    }
    return '';
  }

  function validateField(field) {
    const error = getError(field);
    const errorElement = document.querySelector('#' + field.id + '-error');
    field.setAttribute('aria-invalid', String(Boolean(error)));
    if (errorElement) errorElement.textContent = error;
    return !error;
  }

  function validateForm() {
    let firstInvalid = null;
    fields.forEach(function (field) {
      if (!validateField(field) && !firstInvalid) firstInvalid = field;
    });
    if (firstInvalid) firstInvalid.focus();
    return !firstInvalid;
  }

  function buildMessage() {
    const name = form.elements.name.value.trim();
    const email = form.elements.email.value.trim();
    const subject = form.elements.subject.value.trim();
    const message = form.elements.message.value.trim();
    return {
      subject: '[FilAus website] ' + subject,
      body: 'Name: ' + name + '\nEmail: ' + email + '\nSubject: ' + subject + '\n\n' + message
    };
  }

  if (form) {
    fields.forEach(function (field) {
      field.addEventListener('blur', function () { validateField(field); });
      field.addEventListener('input', function () {
        if (field.getAttribute('aria-invalid') === 'true') validateField(field);
      });
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      formStatus.textContent = '';
      if (!validateForm()) {
        formStatus.textContent = 'Please check the highlighted fields.';
        return;
      }

      const content = buildMessage();
      const mailto = 'mailto:info@filaus.com?subject=' + encodeURIComponent(content.subject) + '&body=' + encodeURIComponent(content.body);
      formStatus.textContent = 'Your email app should open now. Review the message there, then send it when ready.';
      window.location.href = mailto;
    });
  }

  if (copyButton && form) {
    copyButton.addEventListener('click', async function () {
      formStatus.textContent = '';
      if (!validateForm()) {
        formStatus.textContent = 'Please complete the form before copying the message.';
        return;
      }

      const content = buildMessage();
      const text = 'To: info@filaus.com\nSubject: ' + content.subject + '\n\n' + content.body;

      try {
        await navigator.clipboard.writeText(text);
        formStatus.textContent = 'Message copied. Paste it into your email app and send it to info@filaus.com.';
      } catch (error) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.setAttribute('readonly', '');
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        const copied = document.execCommand('copy');
        document.body.removeChild(textArea);
        formStatus.textContent = copied
          ? 'Message copied. Paste it into your email app and send it to info@filaus.com.'
          : 'Copying was blocked. Select the form text manually and paste it into your email app.';
      }
    });
  }

  const year = document.querySelector('#current-year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
