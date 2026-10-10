'use strict';
const grid = document.querySelector('#project-grid');
const dialog = document.querySelector('#project-dialog');
const dialogContent = document.querySelector('#dialog-content');
const menu = document.querySelector('#navigation');
const menuToggle = document.querySelector('.menu-toggle');
const languageToggle = document.querySelector('.language-toggle');
let projects = [];
let currentFilter = 'all';
let lastProjectTrigger = null;
let activeProjectId = null;
let localizedContent = {};
let language = readLanguage();

function readLanguage() {
  const requested = new URL(location.href).searchParams.get('lang');
  if (['tr','en'].includes(requested)) return requested;
  try { return localStorage.getItem('portfolio-language') === 'en' ? 'en' : 'tr'; }
  catch { return 'tr'; }
}
function t(key) { return uiText[language][key]; }
function setLanguage(next, save = false) {
  if (!['tr','en'].includes(next)) return;
  language = next;
  if (save) {
    try { localStorage.setItem('portfolio-language',language); } catch {}
    const url = new URL(location.href);
    url.searchParams.set('lang',language);
    history.replaceState(history.state,'',url);
  }
  document.documentElement.lang = language;
  document.querySelectorAll('[data-i18n-html]').forEach(node => { node.innerHTML = t(node.dataset.i18nHtml); });
  document.querySelectorAll('[data-i18n]').forEach(node => { node.textContent = t(node.dataset.i18n); });
  document.querySelectorAll('[data-i18n-aria]').forEach(node => { node.setAttribute('aria-label',t(node.dataset.i18nAria)); });
  languageToggle.textContent = language === 'tr' ? 'EN' : 'TR';
  languageToggle.lang = language === 'tr' ? 'en' : 'tr';
  const switchLabel = language === 'tr' ? 'Switch to English' : 'Türkçeye geç';
  languageToggle.setAttribute('aria-label',switchLabel);
  languageToggle.title = switchLabel;
  menuToggle.setAttribute('aria-label',t(menu.classList.contains('open') ? 'menuClose' : 'menuOpen'));
  document.querySelector('meta[property="og:description"]').content = t('ogDescription');
  const content = localizedContent[language];
  if (!content) return;
  projects = content.projects;
  applyProfile(content.profile);
  const count = String(projects.length).padStart(2,'0');
  document.querySelector('.nav-number').textContent = count;
  document.querySelector('.filter-count').textContent = count;
  document.querySelector('.demo-note').hidden = !projects.some(project => project.isExample);
  document.querySelector('.project-disclaimer').hidden = !(projects.length > 0 && projects.every(project => project.isExample));
  renderProjects(currentFilter);
  if (dialog.open && activeProjectId) {
    const project = projects.find(item => item.id === activeProjectId);
    if (project) {
      lastProjectTrigger = Array.from(grid.querySelectorAll('.project-title-button')).find(button => button.dataset.projectId === activeProjectId);
      renderProjectDetails(project);
    }
  }
}
languageToggle.addEventListener('click',() => setLanguage(language === 'tr' ? 'en' : 'tr',true));

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
function safeUrl(value) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : null;
  } catch { return null; }
}
function visual(project) {
  const kind = project.visual;
  const node = element('div', 'project-visual visual-' + (['dashboard','sql','python'].includes(kind) ? kind : 'dashboard'));
  const imagePath = typeof project.image === 'string' && /^assets\/[a-zA-Z0-9_./-]+$/.test(project.image) && !project.image.includes('..') ? project.image : null;
  if (imagePath) {
    const frame = element('div','project-image-frame');
    const image = element('img','project-image');
    image.src = imagePath;
    image.alt = project.imageAlt || `${project.title} — ${t('projectImage')}`;
    image.loading = 'lazy';
    frame.append(image);
    node.append(frame);
    return node;
  }
  node.setAttribute('aria-hidden','true');
  // These fixed mockups are illustrative. Project and profile text uses textContent.
  const templates = {
    dashboard: `<div class="dashboard-mock"><div class="dash-sidebar"><span class="dash-logo">◈</span><span class="dash-nav-active">▥</span><span>▤</span><span>◇</span><span>⊞</span></div><div class="dash-main"><div class="dash-header"><span>${t('salesOverview')}</span><small>${t('sampleData')}</small></div><div class="dash-stats"><div class="dash-stat"><small>${t('totalSales')}</small><strong>₺128.400</strong></div><div class="dash-stat"><small>${t('orders')}</small><strong>864</strong></div><div class="dash-stat"><small>${t('averageBasket')}</small><strong>₺148,61</strong></div></div><div class="dash-chart"><div class="mini-panel"><span>${t('monthlySales')}</span><div class="bar-chart"><i style="--h:36%"></i><i style="--h:55%"></i><i style="--h:43%"></i><i style="--h:71%"></i><i style="--h:62%"></i><i style="--h:92%"></i><i style="--h:77%"></i></div></div><div class="mini-panel"><span>${t('categories')}</span><div class="donut"></div></div></div></div></div>`,
    sql: `<div class="code-mock"><div class="code-top"><span class="window-dots"><i></i><i></i><i></i></span><span>customer_segments.sql</span><span>SQL</span></div><div class="code-lines"><b>SELECT</b> customer_id,\n  <b>COUNT</b>(order_id) <b>AS</b> frequency,\n  <b>SUM</b>(amount) <b>AS</b> monetary\n<b>FROM</b> <em>orders</em>\n<b>GROUP BY</b> customer_id;</div><div class="code-bottom"><i></i> ${t('sqlCaption')}</div></div>`,
    python: `<div class="notebook-mock"><div class="notebook-top"><span class="notebook-logo">◌</span>data_exploration.ipynb</div><div class="notebook-cell"><span class="cell-number">[1]:</span><div class="notebook-code"><b>import</b> pandas <b>as</b> pd\n\ndf = pd.read_csv(<b>'data.csv'</b>)\ndf.head()</div></div><table class="data-table"><tr><th></th><th>date</th><th>category</th><th>value</th></tr><tr><td>0</td><td>2026-01-01</td><td>A</td><td>120</td></tr><tr><td>1</td><td>2026-01-02</td><td>B</td><td>85</td></tr><tr><td>2</td><td>2026-01-03</td><td>A</td><td>142</td></tr></table><div class="notebook-result">${t('notebookCaption')}</div></div>`
  };
  node.innerHTML = templates[kind] || templates.dashboard;
  if (project.previewCode && kind === 'sql') {
    node.querySelector('.code-lines').textContent = project.previewCode;
    node.querySelector('.code-top span:nth-child(2)').textContent = project.previewFilename || 'analysis.sql';
  }
  return node;
}
function toolsList(tools = []) {
  const list = element('div','tools');
  tools.forEach(tool => list.append(element('span','tool',tool)));
  return list;
}
function makeCard(project, index) {
  const card = element('article','project-card' + (index === 0 ? ' featured' : ''));
  const imageButton = element('button','project-open');
  imageButton.type = 'button';
  imageButton.setAttribute('aria-label',project.title + ' — ' + t('viewDetails'));
  imageButton.append(visual(project));
  imageButton.addEventListener('click',() => openProject(project,imageButton));
  const meta = element('div','project-meta');
  const kicker = element('div','project-kicker',project.type);
  if (project.isExample) kicker.append(element('span','example-badge',t('exampleProject')));
  const titleButton = element('button','project-title-button');
  titleButton.type = 'button';
  titleButton.dataset.projectId = project.id;
  titleButton.append(element('h3',null,project.title));
  const arrow = element('span',null,'↗'); arrow.setAttribute('aria-hidden','true'); titleButton.append(arrow);
  titleButton.addEventListener('click',() => openProject(project,titleButton));
  meta.append(kicker,titleButton,element('p','project-summary',project.summary),toolsList(project.tools));
  card.append(imageButton,meta);
  return card;
}
function renderProjects(filter = 'all') {
  const selected = projects.filter(project => filter === 'all' || (project.categories || [project.category]).includes(filter));
  grid.replaceChildren(...selected.map(makeCard));
  document.querySelector('#empty-state').hidden = selected.length > 0;
}
function addExternalLink(parent,label,url,className) {
  const validated = safeUrl(url);
  if (!validated) return;
  const link = element('a',className,label);
  link.href = validated; link.target = '_blank'; link.rel = 'noopener noreferrer';
  link.setAttribute('aria-label',label + ' (' + t('newTab') + ')');
  const arrow = element('span',null,'↗'); arrow.setAttribute('aria-hidden','true'); link.append(arrow);
  parent.append(link);
}
function renderProjectDetails(project) {
  dialogContent.replaceChildren();
  const kicker = element('div','project-kicker',project.type);
  if (project.isExample) kicker.append(element('span','example-badge',t('exampleProject')));
  const title = element('h2','dialog-title',project.title); title.id = 'dialog-title';
  const picture = element('div','dialog-visual'); picture.append(visual(project));
  dialogContent.append(kicker,title,element('p','dialog-subtitle',project.subtitle),toolsList(project.tools),picture);
  if (project.isExample) dialogContent.append(element('p','dialog-demo-notice',t('demoNotice')));
  for (const key of ['question','approach','result']) {
    if (!project[key]) continue;
    const section = element('div','dialog-section'); section.append(element('h3',null,t(key)),element('p',null,project[key])); dialogContent.append(section);
  }
  const actions = element('div','dialog-actions');
  addExternalLink(actions,t('viewProject'),project.demoUrl,'button button-dark');
  addExternalLink(actions,t('viewGitHub'),project.sourceUrl,'button button-dark');
  if (actions.children.length) dialogContent.append(actions);
}
function openProject(project,trigger) {
  lastProjectTrigger = trigger;
  activeProjectId = project.id;
  renderProjectDetails(project);
  document.body.classList.add('dialog-open');
  dialog.showModal();
  dialog.scrollTop = 0;
  document.querySelector('.dialog-close').focus();
}
function closeProject() { dialog.close(); }
document.querySelector('.dialog-close').addEventListener('click',closeProject);
dialog.addEventListener('close',() => { document.body.classList.remove('dialog-open'); activeProjectId = null; lastProjectTrigger?.focus(); });
dialog.addEventListener('click',event => {
  if (event.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closeProject();
});
document.querySelectorAll('.filter').forEach(button => button.addEventListener('click',() => {
  document.querySelectorAll('.filter').forEach(item => { const active = item === button; item.classList.toggle('active',active); item.setAttribute('aria-pressed',String(active)); });
  currentFilter = button.dataset.filter;
  renderProjects(currentFilter);
}));
function closeMenu() { menu.classList.remove('open'); menuToggle.setAttribute('aria-expanded','false'); menuToggle.setAttribute('aria-label',t('menuOpen')); }
menuToggle.addEventListener('click',() => {
  const open = menuToggle.getAttribute('aria-expanded') !== 'true';
  menu.classList.toggle('open',open); menuToggle.setAttribute('aria-expanded',String(open)); menuToggle.setAttribute('aria-label',t(open ? 'menuClose' : 'menuOpen'));
});
menu.querySelectorAll('a').forEach(link => link.addEventListener('click',closeMenu));
document.addEventListener('keydown',event => { if (event.key === 'Escape' && menu.classList.contains('open')) { closeMenu(); menuToggle.focus(); } });
matchMedia('(min-width: 621px)').addEventListener('change',event => { if (event.matches) closeMenu(); });
document.querySelector('#current-year').textContent = new Date().getFullYear();
function applyProfile(profile) {
  document.querySelectorAll('[data-profile]').forEach(node => { const text = profile[node.dataset.profile]; if (typeof text === 'string') node.textContent = text; });
  document.title = `${profile.name} — ${profile.role}`;
  document.querySelector('.brand').setAttribute('aria-label',`${profile.name}, ${t('start')}`);
  document.querySelector('meta[property="og:title"]').content = document.title;
  document.querySelector('meta[name="description"]').content = `${profile.name} — ${profile.role}. ${t('metaDescription')}`;
  const contact = element('div','contact-links');
  const email = typeof profile.email === 'string' ? profile.email.trim() : '';
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && !/[?&#]/.test(email)) {
    const link = element('a',null,email); link.href = 'mailto:' + encodeURIComponent(email); const arrow = element('span',null,'↗'); arrow.setAttribute('aria-hidden','true'); link.append(arrow); contact.append(link);
  }
  if (Array.isArray(profile.links)) profile.links.forEach(link => addExternalLink(contact,link.label,link.url));
  if (contact.children.length) document.querySelector('#contact-content').replaceChildren(contact);
}
async function loadContent() {
  try {
    const entries = await Promise.all([['tr','content.json'],['en','content.en.json']].map(async ([locale,path]) => {
      const response = await fetch(path);
      if (!response.ok) throw new Error('Content unavailable');
      const data = await response.json();
      if (!data.profile || !Array.isArray(data.projects)) throw new Error('Invalid content');
      return [locale,data];
    }));
    localizedContent = Object.fromEntries(entries);
    setLanguage(language);
  } catch (error) { document.querySelector('#load-error').hidden = false; }
}
setLanguage(language);
loadContent();
