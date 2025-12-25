/**
 * assets/js/gemini.js
 * Gemini AI integration using marked + DOMPurify
 * Safe, clean, production-ready
 */

/* ----------------------------------
   MARKDOWN CONFIG
---------------------------------- */
if (window.marked) {
  marked.setOptions({
    gfm: true,
    breaks: true,
    headerIds: false,
    mangle: false,
  });
}

/* ----------------------------------
   UI HELPERS
---------------------------------- */
function createBannerIfDisabled() {
  if (!window.GEMINI_CONFIG || GEMINI_CONFIG.isEnabled()) return;
  if (document.querySelector(".api-key-error")) return;

  const container = document.querySelector('[id*="ai"], .ai-strategy-section') || document.body;

  const banner = document.createElement("div");
  banner.className = "api-key-error bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg";

  banner.innerHTML = `
    <div class="flex">
      <div class="flex-shrink-0">
        <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293z" clip-rule="evenodd"/>
        </svg>
      </div>
      <div class="ml-3">
        <p class="text-sm text-red-700 font-semibold">
          Fitur AI Dinonaktifkan
        </p>
        <p class="text-xs text-red-600 mt-1">
          GEMINI_API_KEY belum dikonfigurasi di GitHub Secrets.
        </p>
      </div>
    </div>
  `;

  container.prepend(banner);
}

function showAPIError(elementId, message) {
  const el = document.getElementById(elementId);
  if (!el) return alert(message);

  el.innerHTML = `
    <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
      <p class="text-sm text-red-700">${message}</p>
    </div>
  `;
  el.classList.remove("hidden");
}

function handleAPIError(error, elementId) {
  const raw = String(error?.message || error);
  let msg = "Terjadi kesalahan.";

  if (/quota/i.test(raw)) msg = "Kuota API Gemini habis. Coba lagi besok.";
  else if (/key|invalid/i.test(raw)) msg = "API Key Gemini tidak valid.";
  else if (/network|failed/i.test(raw)) msg = "Masalah jaringan. Periksa koneksi Anda.";
  else msg = raw;

  showAPIError(elementId, msg);
}

/* ----------------------------------
   MARKDOWN RENDERER (CORE)
---------------------------------- */
function renderMarkdown(markdown) {
  if (!markdown) return "";

  const unsafeHtml = marked.parse(markdown);
  return DOMPurify.sanitize(unsafeHtml, {
    USE_PROFILES: { html: true },
  });
}

/* ----------------------------------
   GEMINI CORE
---------------------------------- */
function ensureGeminiEnabled(resultId) {
  if (!window.GEMINI_CONFIG) {
    showAPIError(resultId, "GEMINI_CONFIG tidak ditemukan.");
    return false;
  }
  if (!GEMINI_CONFIG.isEnabled()) {
    createBannerIfDisabled();
    showAPIError(resultId, "Fitur AI belum aktif. API Key belum dikonfigurasi.");
    return false;
  }
  return true;
}

async function callGemini(prompt, resultId, loaderId) {
  const resultEl = document.getElementById(resultId);
  const loader = document.getElementById(loaderId);

  if (!prompt.trim()) return alert("Input tidak boleh kosong.");
  if (!ensureGeminiEnabled(resultId)) return;

  resultEl?.classList.add("hidden");
  loader?.classList.remove("hidden");

  try {
    const res = await fetch(`${GEMINI_CONFIG.apiEndpoint}?key=${GEMINI_CONFIG.apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        systemInstruction: {
          parts: [{ text: GEMINI_CONFIG.systemContext }],
        },
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data?.error?.message || res.status);

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!text) throw new Error("Response kosong dari Gemini.");

    resultEl.innerHTML = renderMarkdown(text);
    resultEl.classList.remove("hidden");
    resultEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
  } catch (err) {
    console.error(err);
    handleAPIError(err, resultId);
  } finally {
    loader?.classList.add("hidden");
  }
}

/* ----------------------------------
   FEATURE TRIGGERS
---------------------------------- */
function generateStrategy() {
  const product = document.getElementById("productInput")?.value.trim();
  if (!product) return alert("Masukkan produk atau bisnis.");

  callGemini(
    `Buatkan strategi pemasaran untuk "${product}" yang menargetkan anak muda Solo.
Gunakan markdown, tabel jika perlu, dan poin yang jelas.`,
    "strategyResult",
    "loaderStrategy"
  );
}

function askInsight() {
  const q = document.getElementById("questionInput")?.value.trim();
  if (!q) return alert("Masukkan pertanyaan.");

  callGemini(`Jawab pertanyaan ini berdasarkan riset anak muda Solo:\n"${q}"`, "insightResult", "loaderInsight");
}

/* ----------------------------------
   INIT
---------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  createBannerIfDisabled();

  document.getElementById("productInput")?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") generateStrategy();
  });

  document.getElementById("questionInput")?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") askInsight();
  });

  console.log("✅ Gemini + marked initialized");
});
