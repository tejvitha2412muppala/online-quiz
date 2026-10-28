const quizzes = [
  {id:'science',title:'The Science of You',category:'Science',description:'Discover the amazing systems that make your body work.',icon:'🧬',duration:6,questions:5,difficulty:'Easy',rating:'4.8',tone:'science',questionsList:[
    {text:'Which organ pumps blood around the human body?',options:['Lungs','Heart','Liver','Kidneys'],answer:1},
    {text:'What is the largest organ in the human body?',options:['Brain','Liver','Skin','Lungs'],answer:2},
    {text:'Which gas do plants absorb from the atmosphere?',options:['Oxygen','Nitrogen','Carbon dioxide','Hydrogen'],answer:2},
    {text:'How many bones are in the adult human body?',options:['106','206','306','406'],answer:1},
    {text:'What is the center of an atom called?',options:['Electron','Molecule','Nucleus','Cell'],answer:2}
  ]},
  {id:'web',title:'Web Dev: The Basics',category:'Technology',description:'HTML, CSS, and the building blocks of the web.',icon:'⌘',duration:8,questions:5,difficulty:'Medium',rating:'4.9',tone:'tech',questionsList:[
    {text:'What does HTML stand for?',options:['Hyper Trainer Marking Language','HyperText Markup Language','High Text Machine Language','Hyperlink and Text Management Language'],answer:1},
    {text:'Which CSS property changes text color?',options:['font-style','background','color','text-decoration'],answer:2},
    {text:'Which HTML tag is used for the largest heading?',options:['<head>','<h6>','<heading>','<h1>'],answer:3},
    {text:'What does CSS primarily describe?',options:['The structure of a webpage','The appearance of a webpage','A database query','A web address'],answer:1},
    {text:'Which language adds interactivity to a web page?',options:['JavaScript','SQL','XML','Bash'],answer:0}
  ]},
  {id:'design',title:'Design Thinking 101',category:'Design',description:'Learn how great ideas turn into thoughtful solutions.',icon:'✳',duration:5,questions:5,difficulty:'Easy',rating:'4.7',tone:'design',questionsList:[
    {text:'What is the first step in the design thinking process?',options:['Prototype','Test','Empathize','Launch'],answer:2},
    {text:'Why do designers create prototypes?',options:['To test ideas quickly','To finish the final product','To avoid user feedback','To write marketing copy'],answer:0},
    {text:'What should a good design solve?',options:['The designer’s favorite problem','A real user need','Every possible problem','A technical problem only'],answer:1},
    {text:'When is it useful to test a design?',options:['Only after launch','Early and often','Never, if it looks good','Only with other designers'],answer:1},
    {text:'What is the purpose of brainstorming?',options:['Choose the first idea','Generate many possible ideas','Criticize unfinished ideas','Plan a budget'],answer:1}
  ]},
  {id:'critical',title:'Critical Thinking',category:'Thinking',description:'Sharpen your reasoning with fun logic puzzles.',icon:'◈',duration:10,questions:5,difficulty:'Medium',rating:'5.0',tone:'thinking',questionsList:[
    {text:'All roses are flowers. Some flowers fade quickly. Which statement must be true?',options:['All roses fade quickly','Some roses fade quickly','Roses are flowers','No roses fade quickly'],answer:2},
    {text:'What comes next in the sequence: 2, 4, 8, 16, ...?',options:['20','24','30','32'],answer:3},
    {text:'If today is Wednesday, what day will it be 10 days from now?',options:['Friday','Saturday','Sunday','Monday'],answer:1},
    {text:'A book and a pen cost $11 total. The book costs $10 more than the pen. How much is the pen?',options:['$0.50','$1.00','$1.50','$2.00'],answer:0},
    {text:'Which word does not belong: triangle, square, circle, cube?',options:['Triangle','Square','Circle','Cube'],answer:3}
  ]},
  {id:'space',title:'A Tour of Our Solar System',category:'Science',description:'From rocky planets to icy comets, explore our neighborhood.',icon:'🪐',duration:7,questions:5,difficulty:'Easy',rating:'4.9',tone:'science',questionsList:[
    {text:'Which planet is closest to the Sun?',options:['Venus','Mercury','Earth','Mars'],answer:1},
    {text:'Which planet is known as the Red Planet?',options:['Jupiter','Saturn','Mars','Neptune'],answer:2},
    {text:'Which is the largest planet in our solar system?',options:['Earth','Saturn','Jupiter','Neptune'],answer:2},
    {text:'What is the name of Earth’s natural satellite?',options:['Europa','The Moon','Titan','Phobos'],answer:1},
    {text:'Which planet has the most prominent ring system?',options:['Mars','Venus','Saturn','Mercury'],answer:2}
  ]},
  {id:'colors',title:'Color & Composition',category:'Design',description:'Explore the visual language behind memorable design.',icon:'◉',duration:6,questions:5,difficulty:'Easy',rating:'4.8',tone:'design',questionsList:[
    {text:'Which pair are complementary colors?',options:['Blue and orange','Blue and green','Red and orange','Yellow and orange'],answer:0},
    {text:'What is the visual center of a composition?',options:['The exact center only','The area that attracts attention first','The largest object','The brightest color'],answer:1},
    {text:'What does whitespace in design help create?',options:['More content','Visual breathing room','Extra decoration','Lower contrast'],answer:1},
    {text:'Which color model is commonly used for screens?',options:['CMYK','RGB','Pantone only','HSL only'],answer:1},
    {text:'What does visual hierarchy guide?',options:['The reading order of content','The file size','The page loading speed','The image format'],answer:0}
  ]},
  {id:'internet',title:'How the Internet Works',category:'Technology',description:'Get to know browsers, servers, and the connections between them.',icon:'⌁',duration:8,questions:5,difficulty:'Advanced',rating:'4.8',tone:'tech',questionsList:[
    {text:'What does DNS help a browser do?',options:['Style a webpage','Find the IP address for a domain name','Encrypt every image','Store website passwords'],answer:1},
    {text:'What is a web server responsible for?',options:['Requesting pages from visitors','Responding to requests with web content','Drawing browser windows','Creating domain names'],answer:1},
    {text:'What does HTTPS add to HTTP?',options:['A larger screen','An encrypted connection','A faster keyboard','A new programming language'],answer:1},
    {text:'Which status code usually means a page was found successfully?',options:['200','301','404','500'],answer:0},
    {text:'What is the browser cache used for?',options:['Remembering files to speed up repeat visits','Managing website accounts','Writing server code','Replacing the internet connection'],answer:0}
  ]}
];

const STORAGE_KEY = 'quizly-demo-results-v1';
let activeQuiz = null;
let currentQuestion = 0;
let selectedAnswer = null;
let answersCorrect = 0;
let activeFilter = 'All';
let toastTimer;

const $ = (selector, root=document) => root.querySelector(selector);
const $$ = (selector, root=document) => [...root.querySelectorAll(selector)];

function loadResults(){
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(stored) ? stored.filter(item => item && typeof item.title === 'string' && Number.isFinite(item.score)) : [];
  } catch { return []; }
}
function saveResult(result){
  const results = loadResults();
  results.unshift(result);
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(results.slice(0,100))); }
  catch { showToast('Your browser could not save this result.'); }
}
function escapeHtml(value){
  return String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}
function makeQuizCard(quiz){
  return `<article class="quiz-card">
    <div class="quiz-cover cover-${quiz.tone}"><span class="quiz-tag">${escapeHtml(quiz.category)}</span><span class="cover-orb"></span><span class="cover-icon" aria-hidden="true">${escapeHtml(quiz.icon)}</span></div>
    <div class="quiz-card-body"><h3>${escapeHtml(quiz.title)}</h3><p class="quiz-description">${escapeHtml(quiz.description)}</p>
      <div class="quiz-details"><span>◷ ${quiz.duration} min</span><span>▤ ${quiz.questions} questions</span><span class="rating">★ ${quiz.rating}</span></div>
      <div class="quiz-bottom"><span class="difficulty ${quiz.difficulty.toLowerCase()}"><i></i>${escapeHtml(quiz.difficulty)}</span><button class="start-link" data-start="${escapeHtml(quiz.id)}">Start quiz →</button></div>
    </div></article>`;
}
function renderQuizGrids(){
  $('#dashboardQuizGrid').innerHTML = quizzes.slice(0,3).map(makeQuizCard).join('');
  renderLibrary();
}
function renderLibrary(){
  const term = $('#quizSearch').value.trim().toLowerCase();
  const filtered = quizzes.filter(quiz => (activeFilter === 'All' || quiz.category === activeFilter) && `${quiz.title} ${quiz.description} ${quiz.category}`.toLowerCase().includes(term));
  $('#libraryQuizGrid').innerHTML = filtered.map(makeQuizCard).join('');
  $('#emptyQuizzes').classList.toggle('hidden', filtered.length > 0);
  $('#quizCountLabel').textContent = `${filtered.length} ${filtered.length === 1 ? 'quiz' : 'quizzes'}${activeFilter === 'All' ? '' : ` in ${activeFilter}`}`;
}
function renderStats(){
  const results = loadResults();
  const average = results.length ? Math.round(results.reduce((sum, item) => sum + item.score, 0) / results.length) : null;
  $('#completedCount').textContent = results.length;
  $('#averageScore').innerHTML = average === null ? '—<small>%</small>' : `${average}<small>%</small>`;
  $('#resultSummary').innerHTML = `<article class="result-stat"><span>Quizzes completed</span><strong>${results.length}</strong></article><article class="result-stat"><span>Average score</span><strong>${average === null ? '—' : `${average}%`}</strong></article><article class="result-stat"><span>Best score</span><strong>${results.length ? `${Math.max(...results.map(item => item.score))}%` : '—'}</strong></article>`;
  const list = $('#resultsList');
  list.innerHTML = results.map(result => {
    const quiz = quizzes.find(item => item.id === result.quizId);
    const tone = quiz ? quiz.tone : 'thinking';
    const icon = quiz ? quiz.icon : '✦';
    const date = new Date(result.completedAt);
    const dateLabel = Number.isNaN(date.getTime()) ? 'Recently' : date.toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'});
    return `<div class="result-row"><div class="result-quiz"><span class="result-thumb cover-${tone}">${escapeHtml(icon)}</span>${escapeHtml(result.title)}</div><span>${escapeHtml(dateLabel)}</span><span class="score-pill ${result.score < 60 ? 'needs-practice' : ''}">${result.score}%</span><span class="status-text">${result.score >= 80 ? 'Great work!' : result.score >= 60 ? 'Nice effort' : 'Keep practicing'}</span></div>`;
  }).join('');
  $('#emptyResults').classList.toggle('hidden', results.length > 0);
}
function showView(view){
  const target = ['dashboard','quizzes','results'].includes(view) ? view : 'dashboard';
  $$('.page-view').forEach(section => section.classList.toggle('active', section.id === `${target}View`));
  $$('.nav-item').forEach(button => button.classList.toggle('active', button.dataset.view === target));
  $('#breadcrumbTitle').textContent = target === 'dashboard' ? 'Overview' : target === 'quizzes' ? 'Explore quizzes' : 'My results';
  $('#sidebar').classList.remove('open');
  if(target === 'results') renderStats();
  window.scrollTo({top:0,behavior:'smooth'});
}
function showToast(message){
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'),2600);
}
function openQuiz(id){
  activeQuiz = quizzes.find(quiz => quiz.id === id);
  if(!activeQuiz) return;
  currentQuestion = 0;
  selectedAnswer = null;
  answersCorrect = 0;
  $('#quizOverlay').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  renderQuizIntro();
  $('#closeQuiz').focus();
}
function renderQuizIntro(){
  $('#quizContent').innerHTML = `<div class="quiz-intro"><span class="quiz-intro-icon cover-${activeQuiz.tone}">${escapeHtml(activeQuiz.icon)}</span><p class="eyebrow">${escapeHtml(activeQuiz.category)} QUIZ</p><h2 id="quizTitle">${escapeHtml(activeQuiz.title)}</h2><p>${escapeHtml(activeQuiz.description)} Take your time and choose the best answer for each question.</p><div class="quiz-intro-details"><span>◷ ${activeQuiz.duration} min</span><span>▤ ${activeQuiz.questions} questions</span><span>● ${escapeHtml(activeQuiz.difficulty)}</span></div><button class="button button-primary" id="beginQuiz">Let's begin <span>→</span></button></div>`;
  $('#beginQuiz').addEventListener('click',renderQuestion);
}
function renderQuestion(){
  const question = activeQuiz.questionsList[currentQuestion];
  selectedAnswer = null;
  const letters = ['A','B','C','D'];
  $('#quizContent').innerHTML = `<div class="quiz-question"><div class="question-meta"><span>QUESTION ${currentQuestion+1} OF ${activeQuiz.questionsList.length}</span><span>${Math.round(currentQuestion/activeQuiz.questionsList.length*100)}% complete</span></div><div class="question-progress"><span style="width:${(currentQuestion+1)/activeQuiz.questionsList.length*100}%"></span></div><h2 id="quizTitle">${escapeHtml(question.text)}</h2><div class="answer-list">${question.options.map((option,index) => `<button class="answer-option" data-answer="${index}"><span class="answer-letter">${letters[index]}</span>${escapeHtml(option)}</button>`).join('')}</div><div class="question-actions"><span class="question-hint">Choose one answer to continue</span><button class="button button-primary" id="nextQuestion" disabled>${currentQuestion === activeQuiz.questionsList.length-1 ? 'Finish quiz' : 'Next question'} <span>→</span></button></div></div>`;
  $$('.answer-option').forEach(button => button.addEventListener('click',() => {
    selectedAnswer = Number(button.dataset.answer);
    $$('.answer-option').forEach(option => option.classList.toggle('selected',option === button));
    $('#nextQuestion').disabled = false;
    $('.question-hint').textContent = 'Answer selected';
  }));
  $('#nextQuestion').addEventListener('click',() => {
    if(selectedAnswer === null) return;
    if(selectedAnswer === question.answer) answersCorrect++;
    if(currentQuestion < activeQuiz.questionsList.length-1){currentQuestion++;renderQuestion();}
    else finishQuiz();
  });
}
function finishQuiz(){
  const score = Math.round(answersCorrect / activeQuiz.questionsList.length * 100);
  saveResult({quizId:activeQuiz.id,title:activeQuiz.title,score,correct:answersCorrect,total:activeQuiz.questionsList.length,completedAt:new Date().toISOString()});
  renderStats();
  const message = score >= 80 ? 'Brilliant work! You really know your stuff.' : score >= 60 ? 'Nice effort! A little review will take you further.' : 'Every attempt helps you learn. Give it another go!';
  $('#quizContent').innerHTML = `<div class="quiz-complete"><div class="complete-badge">✓</div><p class="eyebrow">QUIZ COMPLETE</p><h2>Look at you go!</h2><p>${escapeHtml(message)}</p><div class="score-big">${score}%</div><div class="score-label">${answersCorrect} correct out of ${activeQuiz.questionsList.length} questions</div><div class="complete-actions"><button class="button button-secondary" id="reviewResults">View my results</button><button class="button button-primary" id="doneQuiz">Done <span>✓</span></button></div></div>`;
  $('#reviewResults').addEventListener('click',() => {closeQuiz();showView('results');});
  $('#doneQuiz').addEventListener('click',() => closeQuiz());
}
function closeQuiz(){
  $('#quizOverlay').classList.add('hidden');
  document.body.style.overflow = '';
}

document.addEventListener('click',event => {
  const nav = event.target.closest('[data-view]');
  if(nav){showView(nav.dataset.view);return;}
  const goto = event.target.closest('[data-go]');
  if(goto){showView(goto.dataset.go);return;}
  const start = event.target.closest('[data-start]');
  if(start){openQuiz(start.dataset.start);return;}
  const filter = event.target.closest('[data-filter]');
  if(filter){activeFilter=filter.dataset.filter;$$('.filter-chip').forEach(chip=>chip.classList.toggle('active',chip===filter));renderLibrary();}
});
$('#quizSearch').addEventListener('input',renderLibrary);
$('#menuToggle').addEventListener('click',() => $('#sidebar').classList.toggle('open'));
$('#closeQuiz').addEventListener('click',closeQuiz);
$('#quizOverlay').addEventListener('click',event => {if(event.target === $('#quizOverlay')) closeQuiz();});
document.addEventListener('keydown',event => {if(event.key === 'Escape' && !$('#quizOverlay').classList.contains('hidden')) closeQuiz();});
$('#todayDate').textContent = new Date().toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric'});
renderQuizGrids();
renderStats();
