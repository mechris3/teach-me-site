/* ===========================
   Teach Me — Common Scripts
   Shared across all courses
   =========================== */

// --- Theme toggle ---
function getPreferredTheme() {
  const stored = localStorage.getItem('lesson-theme');
  if (stored) return stored;
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('lesson-theme', theme);
  const icon = document.querySelector('.theme-toggle');
  if (icon) icon.textContent = theme === 'dark' ? '\u2600\uFE0F' : '\uD83C\uDF19';
}
function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  applyTheme(current === 'dark' ? 'light' : 'dark');
}
applyTheme(getPreferredTheme());

// --- Copy button ---
function copyCode(btn) {
  const code = btn.parentElement.querySelector('code').textContent;
  navigator.clipboard.writeText(code).then(() => {
    btn.textContent = 'Copied!';
    btn.classList.add('copied');
    setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 1500);
  });
}

// --- Quiz ---
// Keyboard support for quiz options (role="button" needs Enter/Space handling)
document.addEventListener('keydown', function(e) {
  if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('quiz-option')) {
    e.preventDefault();
    e.target.click();
  }
});

function checkAnswer(el, correct) {
  const quiz = el.closest('.quiz');
  // If already answered correctly, lock the quiz
  if (quiz.dataset.answered === 'correct') return;

  // Clear previous attempt styling
  const options = quiz.querySelectorAll('.quiz-option');
  options.forEach(opt => {
    opt.classList.remove('correct', 'incorrect');
    opt.style.pointerEvents = '';
  });

  const feedback = quiz.querySelector('.quiz-feedback');
  if (correct) {
    el.classList.add('correct');
    quiz.dataset.answered = 'correct';
    feedback.textContent = '\u2713 Correct!';
    feedback.style.color = 'var(--quiz-correct-text)';
  } else {
    el.classList.add('incorrect');
    quiz.dataset.answered = 'incorrect';
    feedback.textContent = '\u2717 Not quite. Try again!';
    feedback.style.color = 'var(--quiz-incorrect-text)';
  }
}

// --- Sidebar TOC auto-generation ---
(function() {
  const tocList = document.getElementById('toc-list');
  if (!tocList) return;
  const headings = document.querySelectorAll('.main-content h2, .main-content h3');
  headings.forEach((h, i) => {
    if (!h.id) h.id = 'section-' + i;
    const li = document.createElement('li');
    if (h.tagName === 'H2') li.classList.add('toc-h2');
    if (h.tagName === 'H3') li.classList.add('toc-h3');
    const a = document.createElement('a');
    a.href = '#' + h.id;
    a.textContent = h.textContent;
    li.appendChild(a);
    tocList.appendChild(li);
  });

  // Scroll spy: highlight current section in TOC
  const tocLinks = tocList.querySelectorAll('a');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        tocLinks.forEach(l => l.classList.remove('toc-active'));
        const activeLink = tocList.querySelector('a[href="#' + entry.target.id + '"]');
        if (activeLink) activeLink.classList.add('toc-active');
      }
    });
  }, { rootMargin: '-20% 0px -70% 0px' });

  headings.forEach(h => observer.observe(h));
})();

// --- Quiz accessibility: add role, tabindex, and keyboard support ---
(function() {
  const options = document.querySelectorAll('.quiz-option');
  options.forEach(opt => {
    opt.setAttribute('role', 'button');
    opt.setAttribute('tabindex', '0');
    opt.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        opt.click();
      }
    });
  });

  // Make quiz feedback a live region for screen readers
  const feedbacks = document.querySelectorAll('.quiz-feedback');
  feedbacks.forEach(fb => {
    fb.setAttribute('aria-live', 'polite');
    fb.setAttribute('role', 'status');
  });
})();
