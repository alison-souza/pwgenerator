// DOM elementos
const lengthInput = document.getElementById("length");
const lengthValue = document.getElementById("lengthValue");
const upper = document.getElementById("upper");
const lower = document.getElementById("lower");
const digits = document.getElementById("digits");
const symbols = document.getElementById("symbols");
const generateBtn = document.getElementById("generateBtn");
const copyBtn = document.getElementById("copyBtn");
const passwordOutput = document.getElementById("passwordOutput");
const strengthFill = document.getElementById("strengthFill");
const strengthLabel = document.getElementById("strengthLabel");
const darkToggle = document.getElementById("darkToggle");

// carrega preferências do localStorage
function loadPreferences() {
  const prefs = JSON.parse(localStorage.getItem("pwPrefs") || "{}");
  if (prefs.length) {
    lengthInput.value = prefs.length;
    lengthValue.textContent = prefs.length;
  }
  if (prefs.dark) {
    document.documentElement.classList.add("dark");
    darkToggle.checked = true;
  }
}
loadPreferences();

// atualiza label do slider
lengthInput.addEventListener("input", () => {
  lengthValue.textContent = lengthInput.value;
});

// dark mode toggle
darkToggle.addEventListener("change", () => {
  if (darkToggle.checked) {
    document.documentElement.classList.add("dark");
    savePrefs({ dark: true });
  } else {
    document.documentElement.classList.remove("dark");
    savePrefs({ dark: false });
  }
});

// salva preferências simples no localStorage (mescla)
function savePrefs(obj) {
  const prev = JSON.parse(localStorage.getItem("pwPrefs") || "{}");
  const merged = { ...prev, ...obj };
  localStorage.setItem("pwPrefs", JSON.stringify(merged));
}

// função para estimar força (simples)
function estimateStrength(pwd) {
  let score = 0;
  if (!pwd) return { score: 0, label: "—" };
  if (pwd.length >= 8) score++;
  if (pwd.length >= 12) score++;
  const categories = [
    /[a-z]/.test(pwd),
    /[A-Z]/.test(pwd),
    /[0-9]/.test(pwd),
    /[^A-Za-z0-9]/.test(pwd),
  ].filter(Boolean).length;
  if (categories >= 2) score++;
  if (categories >= 3 && pwd.length >= 12) score++;
  const labels = ["Muito Fraca", "Fraca", "Média", "Forte", "Muito Forte"];
  return { score, label: labels[score] || labels[labels.length - 1] };
}

// atualiza UI da barra de força
function updateStrengthUI(str) {
  const percent = (str.score / 4) * 100;
  strengthFill.style.width = percent + "%";
  strengthLabel.textContent = str.label;
  // cor da barra dependendo do score
  if (str.score <= 1)
    strengthFill.style.background = "linear-gradient(90deg,#fa7b7b,#ef4444)";
  else if (str.score === 2)
    strengthFill.style.background = "linear-gradient(90deg,#f6d365,#fda085)";
  else strengthFill.style.background = "linear-gradient(90deg,#9fd3c7,#2b7a78)";
}

// requisição para gerar senha no backend
async function fetchPassword() {
  const payload = {
    length: parseInt(lengthInput.value),
    upper: upper.checked,
    lower: lower.checked,
    digits: digits.checked,
    symbols: symbols.checked,
  };
  // salva preferências que valem a pena
  savePrefs({ length: payload.length });

  generateBtn.disabled = true;
  generateBtn.textContent = "Gerando...";

  try {
    const res = await fetch("/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Erro na requisição");
    const data = await res.json();
    passwordOutput.value = data.password || "";
    updateStrengthUI(estimateStrength(passwordOutput.value));
    copyBtn.disabled = !passwordOutput.value;
  } catch (err) {
    console.error(err);
    passwordOutput.value = "Erro ao gerar";
    updateStrengthUI({ score: 0, label: "Erro" });
    copyBtn.disabled = true;
  } finally {
    generateBtn.disabled = false;
    generateBtn.textContent = "Gerar Senha";
  }
}

// copiar
copyBtn.addEventListener("click", async () => {
  if (!passwordOutput.value) return;
  try {
    await navigator.clipboard.writeText(passwordOutput.value);
    copyBtn.textContent = "Copiado!";
    setTimeout(() => (copyBtn.textContent = "Copiar"), 1200);
  } catch (err) {
    console.error("Copy failed", err);
    alert("Falha ao copiar");
  }
});

// evento do botão gerar
generateBtn.addEventListener("click", fetchPassword);

// inicia com preferências e força zerada
updateStrengthUI({ score: 0, label: "—" });
