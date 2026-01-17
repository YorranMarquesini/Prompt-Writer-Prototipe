const promptText = document.getElementById("prompt-text");
const generateBtn = document.getElementById("generate-btn");
const historyList = document.getElementById("history-list");
const likeBtn = document.querySelector(".like");
const dislikeBtn = document.querySelector(".dislike");
let lastContext = null;
let lastContinuationTemplate = null;

const recent = {
  genero: null,
  tema: null,
  tom: null
};

let narrativeState = {
  ativo: false,
  genero: null,
  temas: [],
  tom: null,
  tensao: 0.3
};

const generos = [
  { id: "fantasia", texto: "fantasia", peso: 1.0 },
  { id: "terror", texto: "terror", peso: 1.0 },
  { id: "sci_fi", texto: "ficção científica", peso: 1.0 }
];

const temas = [
  { id: "traicao", texto: "uma traição", peso: 1.0 },
  { id: "segredo", texto: "um segredo perigoso", peso: 1.0 },
  { id: "perda", texto: "uma perda irreversível", peso: 1.0 }
];

const tons = [
  { id: "melancolico", texto: "melancólico", peso: 1.0 },
  { id: "tenso", texto: "tenso", peso: 1.0 },
  { id: "introspectivo", texto: "introspectivo", peso: 1.0 }
];

const restricoes = [
  { texto: "Evite diálogos diretos." },
  { texto: "Não revele o conflito principal." },
  { texto: "Mostre o conflito apenas por ações." }
];

const templates = [
  "Escreva uma cena de {genero} com tom {tom}, explorando {tema}. {restricao}",
  "Crie um momento {tom} em uma história de {genero}, onde surge {tema}. {restricao}",
  "Descreva uma cena de {genero} em clima {tom}. Algo relacionado a {tema} acontece. {restricao}"
];

const continuationTemplates = [
  "Continue a história em tom {tom}. As consequências de {tema} começam a afetar algo importante.",
  "A tensão aumenta. Em meio ao clima {tom}, algo relacionado a {tema} se complica.",
  "Sem resolver o conflito, a situação se intensifica. Mostre isso através de ações e reações."
];

function pickRandom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function shouldContinue() {
  return narrativeState.ativo && Math.random() < 0.5;
}

function pickWeighted(array, recentItem) {
  const totalPeso = array.reduce((sum, item) => {
    const pesoEfetivo = item === recentItem ? item.peso * 0.3 : item.peso;
    return sum + pesoEfetivo;
  }, 0);

  let r = Math.random() * totalPeso;

  for (const item of array) {
    const pesoEfetivo = item === recentItem ? item.peso * 0.3 : item.peso;
    if (r < pesoEfetivo) return item;
    r -= pesoEfetivo;
  }
}

let currentPrompt = null;

function generatePrompt() {
  let prompt;
  let genero, tema, tom;

  if (shouldContinue()) {
    genero = narrativeState.genero;
    tom = narrativeState.tom;
    tema = pickRandom(narrativeState.temas);

    const template = pickTemplateWithCooldown(
      continuationTemplates,
      lastContinuationTemplate);

      lastContinuationTemplate = template;
      
    prompt = template
      .replace("{tom}", tom.texto)
      .replace("{tema}", tema.texto);

    narrativeState.tensao = Math.min(1, narrativeState.tensao + 0.1);
  } else {
    genero = pickWeighted(generos, recent.genero);
    tema = pickWeighted(temas, recent.tema);
    tom = pickWeighted(tons, recent.tom);
    const restricao = pickRandom(restricoes);
    const template = pickRandom(templates);

    prompt = template
      .replace("{genero}", genero.texto)
      .replace("{tom}", tom.texto)
      .replace("{tema}", tema.texto)
      .replace("{restricao}", restricao.texto);

    narrativeState = {
      ativo: true,
      genero,
      temas: [tema],
      tom,
      tensao: 0.3
    };
  }

  recent.genero = genero;
  recent.tema = tema;
  recent.tom = tom;

  lastContext = { genero, tema, tom };
  currentPrompt = prompt;

  promptText.textContent = prompt;
  addToHistory(prompt);
}

function pickTemplateWithCooldown(templates, lastTemplate) {
  if (!lastTemplate) return pickRandom(templates);

  const filtered = templates.filter(t => t !== lastTemplate);
  return filtered.length
    ? pickRandom(filtered)
    : pickRandom(templates);
}

function addToHistory(text) {
  const li = document.createElement("li");
  li.textContent = text;
  historyList.prepend(li);
}

generateBtn.addEventListener("click", generatePrompt);

if (likeBtn) {
  likeBtn.addEventListener("click", () => {
    if (!currentPrompt) return;
    alert("👍 Prompt curtido");
  });
}

if (dislikeBtn) {
  dislikeBtn.addEventListener("click", () => {
    if (!currentPrompt) return;
    alert("👎 Prompt rejeitado");
  });
}

function ajustarPeso(item, delta) {
  item.peso = Math.min(2.0, Math.max(0.5, item.peso + delta));
}

if (likeBtn) {
  likeBtn.addEventListener("click", () => {
    if (!lastContext) return;

    ajustarPeso(lastContext.genero, 0.1);
    ajustarPeso(lastContext.tema, 0.2);
    ajustarPeso(lastContext.tom, 0.2);
  });
}

if (dislikeBtn) {
  dislikeBtn.addEventListener("click", () => {
    if (!lastContext) return;

    ajustarPeso(lastContext.genero, -0.1);
    ajustarPeso(lastContext.tema, -0.2);
    ajustarPeso(lastContext.tom, -0.2);
  });
}