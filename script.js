const QUESTION_COUNT = 5;
const QUESTION_TIME = 20;
const HIGH_SCORE_KEY = "quizlet-high-score";

const questionBank = [
  {
    category: "Sains",
    text: "Planet manakah yang dikenal sebagai Planet Merah?",
    options: ["Venus", "Mars", "Jupiter", "Merkurius"],
    answer: 1,
  },
  {
    category: "Geografi",
    text: "Apa ibu kota negara Jepang?",
    options: ["Seoul", "Beijing", "Tokyo", "Bangkok"],
    answer: 2,
  },
  {
    category: "Teknologi",
    text: "Kepanjangan dari HTML adalah ...",
    options: [
      "HyperText Markup Language",
      "High Transfer Machine Link",
      "HyperTool Multi Language",
      "Home Text Markup Link",
    ],
    answer: 0,
  },
  {
    category: "Sains",
    text: "Proses tumbuhan membuat makanan dengan bantuan cahaya matahari disebut ...",
    options: ["Evaporasi", "Fotosintesis", "Kondensasi", "Fermentasi"],
    answer: 1,
  },
  {
    category: "Sejarah",
    text: "Pada tanggal berapa Indonesia memproklamasikan kemerdekaan?",
    options: ["1 Juni 1945", "10 November 1945", "17 Agustus 1945", "20 Mei 1908"],
    answer: 2,
  },
  {
    category: "Matematika",
    text: "Berapakah hasil dari 12 × 8?",
    options: ["84", "92", "96", "108"],
    answer: 2,
  },
  {
    category: "Geografi",
    text: "Samudra terbesar di dunia adalah ...",
    options: ["Samudra Hindia", "Samudra Pasifik", "Samudra Atlantik", "Samudra Arktik"],
    answer: 1,
  },
  {
    category: "Sains",
    text: "Simbol kimia untuk air adalah ...",
    options: ["CO₂", "O₂", "NaCl", "H₂O"],
    answer: 3,
  },
  {
    category: "Seni",
    text: "Siapa pelukis terkenal yang menciptakan Mona Lisa?",
    options: ["Vincent van Gogh", "Leonardo da Vinci", "Pablo Picasso", "Claude Monet"],
    answer: 1,
  },
  {
    category: "Teknologi",
    text: "Bagian komputer yang sering disebut sebagai 'otak' komputer adalah ...",
    options: ["Monitor", "Keyboard", "CPU", "Mouse"],
    answer: 2,
  },
];

const app = document.querySelector("#app");
const themeToggle = document.querySelector("#theme-toggle");
let questions = [];
let currentQuestion = 0;
let score = 0;
let secondsLeft = QUESTION_TIME;
let timerId = null;
let hasAnswered = false;

function readHighScore() {
  const storedScore = Number(localStorage.getItem(HIGH_SCORE_KEY));
  return Number.isFinite(storedScore) && storedScore > 0 ? storedScore : 0;
}

function createElement(tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function shuffle(items) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }
  return shuffled;
}

function makeButton(className, text, onClick) {
  const button = createElement("button", className, text);
  button.type = "button";
  button.addEventListener("click", onClick);
  return button;
}

function renderWelcome() {
  clearTimer();
  app.replaceChildren();

  const card = createElement("section", "welcome-card");
  const eyebrow = createElement("div", "eyebrow");
  eyebrow.append(createElement("span", "eyebrow-line"), document.createTextNode("LATIHAN HARI INI"));
  const title = createElement("h1");
  title.append("Asah pengetahuanmu,", document.createElement("br"));
  title.append(createElement("span", "", "satu soal dalam satu waktu."));

  const intro = createElement(
    "p",
    "intro-copy",
    "Jawab 5 pertanyaan pilihan ganda. Kumpulkan skor terbaikmu dan tantang diri lagi!",
  );
  const stats = createElement("div", "welcome-stats");
  stats.setAttribute("aria-label", "Informasi kuis");
  stats.append(
    createStat("◷", "stat-icon", "20 detik", "per pertanyaan"),
    createElement("span", "stat-divider"),
    createStat("✦", "stat-icon stat-icon-pink", "5 pertanyaan", "pilihan ganda"),
    createElement("span", "stat-divider"),
    createStat("♛", "stat-icon stat-icon-yellow", `${readHighScore()} poin`, "skor tertinggi"),
  );
  const startButton = makeButton("primary-button start-button", "", startQuiz);
  startButton.append("Mulai kuis ", createElement("span", "", "→"));
  const note = createElement("p", "small-note", "Tidak perlu mendaftar. Langsung mulai bermain.");

  card.append(eyebrow, title, intro, stats, startButton, note);
  app.replaceChildren(card, createFooter());
}

function createStat(icon, iconClass, value, label) {
  const item = createElement("div", "stat-item");
  item.append(
    createElement("span", iconClass, icon),
    createElement("span", "", ""),
  );
  const text = item.lastElementChild;
  text.append(createElement("strong", "", value), createElement("small", "", label));
  return item;
}

function createFooter() {
  const footer = createElement("footer", "page-footer");
  footer.append("BELAJAR JADI LEBIH SERU ", createElement("span", "", "✦"));
  return footer;
}

function startQuiz() {
  questions = shuffle(questionBank).slice(0, QUESTION_COUNT);
  currentQuestion = 0;
  score = 0;
  renderQuestion();
}

function renderQuestion() {
  clearTimer();
  hasAnswered = false;
  secondsLeft = QUESTION_TIME;
  const question = questions[currentQuestion];
  app.replaceChildren();

  const layout = createElement("section", "quiz-layout");
  layout.setAttribute("aria-label", "Kuis interaktif");

  const topline = createElement("div", "quiz-topline");
  topline.append(
    createElement("span", "", "PERTANYAAN"),
    createElement("strong", "", `${currentQuestion + 1} / ${QUESTION_COUNT}`),
  );
  const progressTrack = createElement("div", "progress-track");
  progressTrack.setAttribute("role", "progressbar");
  progressTrack.setAttribute("aria-label", "Progres kuis");
  progressTrack.setAttribute("aria-valuemin", "0");
  progressTrack.setAttribute("aria-valuemax", String(QUESTION_COUNT));
  progressTrack.setAttribute("aria-valuenow", String(currentQuestion));
  const progressFill = createElement("div", "progress-fill");
  progressFill.style.width = `${(currentQuestion / QUESTION_COUNT) * 100}%`;
  progressTrack.append(progressFill);

  const card = createElement("div", "quiz-card");
  const meta = createElement("div", "question-meta");
  const category = createElement("span", "category-pill", question.category.toUpperCase());
  const timer = createElement("div", "timer");
  timer.setAttribute("aria-label", "Sisa waktu");
  const timerNumber = createElement("span", "timer-number", `${secondsLeft}s`);
  const timerTrack = createElement("span", "timer-track");
  const timerFill = createElement("span", "timer-fill");
  timerFill.style.width = "100%";
  timerTrack.append(timerFill);
  timer.append(createElement("span", "", "◷"), timerNumber, timerTrack);
  meta.append(category, timer);

  const title = createElement("h1", "question-title", question.text);
  title.id = "question-title";
  const answers = createElement("div", "answers");
  answers.setAttribute("aria-labelledby", title.id);
  answers.addEventListener("click", handleAnswerClick);

  question.options.forEach((option, index) => {
    const button = createElement("button", "answer-option");
    button.type = "button";
    button.dataset.answerIndex = String(index);
    button.append(
      createElement("span", "answer-letter", String.fromCharCode(65 + index)),
      createElement("span", "answer-text", option),
    );
    answers.append(button);
  });

  const bottom = createElement("div", "quiz-bottom");
  const feedback = createElement("p", "feedback", "Pilih jawaban yang menurutmu benar.");
  feedback.setAttribute("aria-live", "polite");
  const nextButton = makeButton("primary-button next-button", "", goToNextQuestion);
  nextButton.hidden = true;
  bottom.append(feedback, nextButton);
  card.append(meta, title, answers, bottom);
  layout.append(topline, progressTrack, card);
  app.replaceChildren(layout, createFooter());
  startTimer(timerNumber, timerFill, timer);
}

function startTimer(timerNumber, timerFill, timer) {
  timerId = window.setInterval(() => {
    secondsLeft -= 1;
    timerNumber.textContent = `${secondsLeft}s`;
    timerFill.style.width = `${(secondsLeft / QUESTION_TIME) * 100}%`;
    timer.classList.toggle("is-low", secondsLeft <= 5);
    if (secondsLeft <= 0) {
      clearTimer();
      revealAnswer(false);
    }
  }, 1000);
}

function clearTimer() {
  if (timerId !== null) {
    window.clearInterval(timerId);
    timerId = null;
  }
}

function handleAnswerClick(event) {
  const answerButton = event.target.closest("button[data-answer-index]");
  if (!answerButton || hasAnswered) return;
  revealAnswer(true, Number(answerButton.dataset.answerIndex));
}

function revealAnswer(wasAnswered, selectedIndex) {
  if (hasAnswered) return;
  hasAnswered = true;
  clearTimer();
  const question = questions[currentQuestion];
  const answers = app.querySelector(".answers");
  const feedback = app.querySelector(".feedback");
  const nextButton = app.querySelector(".next-button");

  answers.querySelectorAll(".answer-option").forEach((button) => {
    const answerIndex = Number(button.dataset.answerIndex);
    button.disabled = true;
    if (answerIndex === question.answer) button.classList.add("is-correct");
    if (wasAnswered && answerIndex === selectedIndex && answerIndex !== question.answer) {
      button.classList.add("is-wrong");
    }
  });

  if (wasAnswered && selectedIndex === question.answer) {
    score += 1;
    feedback.textContent = "Tepat sekali! Jawabanmu benar.";
    feedback.classList.add("is-correct");
  } else if (!wasAnswered) {
    feedback.textContent = `Waktu habis! Jawaban yang benar: ${question.options[question.answer]}.`;
    feedback.classList.add("is-wrong");
  } else {
    feedback.textContent = "Belum tepat. Jawaban yang benar ditandai warna hijau.";
    feedback.classList.add("is-wrong");
  }

  nextButton.textContent = currentQuestion === QUESTION_COUNT - 1 ? "Lihat hasil" : "Soal berikutnya";
  nextButton.hidden = false;
}

function goToNextQuestion() {
  if (!hasAnswered) return;
  currentQuestion += 1;
  if (currentQuestion === QUESTION_COUNT) {
    renderResults();
    return;
  }
  renderQuestion();
}

function renderResults() {
  clearTimer();
  const previousHighScore = readHighScore();
  const isNewHighScore = score > previousHighScore;
  if (isNewHighScore) {
    localStorage.setItem(HIGH_SCORE_KEY, String(score));
  }

  const card = createElement("section", "result-card");
  card.append(
    createElement("div", "result-icon", "♛"),
    createElement("p", "result-kicker", isNewHighScore ? "REKOR BARU!" : "KUIS SELESAI"),
    createElement("h2", "", getResultTitle()),
    createElement("p", "result-copy", getResultMessage()),
  );

  const scorePanel = createElement("div", "score-panel");
  scorePanel.append(
    createScoreStat(`${score} / ${QUESTION_COUNT}`, "Skor kamu"),
    createScoreStat(`${Math.round((score / QUESTION_COUNT) * 100)}%`, "Jawaban benar"),
  );

  const actions = createElement("div", "result-actions");
  actions.append(
    makeButton("primary-button", "Main lagi", startQuiz),
    makeButton("secondary-button", "Kembali ke awal", renderWelcome),
  );
  card.append(scorePanel, actions);
  app.replaceChildren(card, createFooter());
}

function createScoreStat(value, label) {
  const stat = createElement("div", "score-stat");
  stat.append(createElement("span", "score-value", value), createElement("span", "score-label", label));
  return stat;
}

function getResultTitle() {
  if (score === QUESTION_COUNT) return "Sempurna!";
  if (score >= 3) return "Kerja bagus!";
  if (score > 0) return "Terus berlatih!";
  return "Coba sekali lagi!";
}

function getResultMessage() {
  if (score === QUESTION_COUNT) return "Kamu menjawab semua pertanyaan dengan benar. Hebat!";
  if (score >= 3) return "Pengetahuanmu keren. Sedikit lagi menuju nilai sempurna!";
  if (score > 0) return "Setiap percobaan bikin kamu makin jago. Yuk, coba lagi!";
  return "Jangan menyerah! Ulangi kuis dan raih skor yang lebih tinggi.";
}

themeToggle.addEventListener("click", () => {
  const isLight = document.documentElement.classList.toggle("light-theme");
  themeToggle.querySelector(".theme-icon").textContent = isLight ? "☾" : "☼";
  themeToggle.querySelector(".theme-label").textContent = isLight ? "Mode gelap" : "Mode terang";
  themeToggle.setAttribute("aria-label", isLight ? "Aktifkan mode gelap" : "Aktifkan mode terang");
});

document.querySelector(".brand").addEventListener("click", (event) => {
  event.preventDefault();
  renderWelcome();
});

renderWelcome();
