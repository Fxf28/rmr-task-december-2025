/**
 * assets/js/gemini.js
 * Main logic: initialization, UI helpers, API calls, formatting, error handling.
 */

/* -----------------------------
   UI / Error helpers
   ----------------------------- */
function createBannerIfDisabled() {
  try {
    const container = document.querySelector('[id*="ai"], .ai-strategy-section') || document.body;
    if (!container) return;

    if (!window.GEMINI_CONFIG || !GEMINI_CONFIG.isEnabled()) {
      if (document.querySelector(".api-key-error")) return; // already shown

      const errorDiv = document.createElement("div");
      errorDiv.className = "api-key-error bg-red-50 border-l-4 border-red-500 p-4 mb-4";
      errorDiv.innerHTML = `
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-red-700"><strong>Fitur AI Dinonaktifkan</strong></p>
            <p class="text-xs text-red-600 mt-1">GEMINI_API_KEY belum dikonfigurasi. Tambahkan di GitHub Secrets untuk enable AI.</p>
          </div>
        </div>
      `;
      container.prepend(errorDiv);
    }
  } catch (e) {
    // non-fatal
    console.warn("createBannerIfDisabled error", e);
  }
}

function showAPIError(elementId, message) {
  const resultDiv = document.getElementById(elementId);
  if (!resultDiv) {
    alert(message);
    return;
  }
  resultDiv.innerHTML = `
    <div class="bg-red-50 border-l-4 border-red-500 p-4">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-red-700">${message}</p>
          <p class="text-xs text-red-600 mt-1">Untuk developer: pastikan GEMINI_API_KEY sudah di-set di GitHub Secrets.</p>
        </div>
      </div>
    </div>
  `;
  resultDiv.classList.remove("hidden");
}

function handleAPIError(error, elementId) {
  const raw = String(error?.message || error);
  let message = "Maaf, terjadi kesalahan.";

  if (/quota/i.test(raw)) {
    message = "Kuota API telah habis. Silakan coba lagi besok.";
  } else if (/API key|invalid/i.test(raw)) {
    message = "API Key tidak valid. Silakan periksa konfigurasi.";
  } else if (/network|failed/i.test(raw)) {
    message = "Koneksi jaringan bermasalah. Periksa koneksi Anda.";
  } else {
    message = raw;
  }

  showAPIError(elementId, message);
}

/* -----------------------------
   Formatting helpers
   ----------------------------- */
function escapeHtml(str) {
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function formatAIText(aiText) {
  if (!aiText) return "";
  let out = escapeHtml(aiText);

  // Markdown-like formatting -> Tailwind-friendly HTML
  out = out
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-solo-yellow font-semibold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
    .replace(/^### (.*)$/gm, '<h3 class="text-xl font-bold text-solo-teal mt-6 mb-3">$1</h3>')
    .replace(/^## (.*)$/gm, '<h2 class="text-2xl font-bold text-solo-red mt-8 mb-4">$1</h2>')
    .replace(/^(\d+)\.\s+(.*)$/gm, '<li class="ml-6 mb-2"><span class="font-bold text-solo-dark">$1.</span> $2</li>')
    .replace(/^- \s+(.*)$/gm, '<li class="ml-6 mb-2 flex items-start"><span class="mr-2">•</span> $1</li>')
    .replace(/\n\n/g, '</p><p class="mt-3">')
    .replace(/\n/g, "<br>");

  // wrap loose paragraphs
  if (!out.startsWith("<p")) {
    out = '<p class="mt-2">' + out + "</p>";
  }
  return out;
}

/* -----------------------------
   API call & orchestration
   ----------------------------- */
function ensureGeminiEnabled(resultElementId) {
  if (!window.GEMINI_CONFIG) {
    showAPIError(resultElementId, "GEMINI_CONFIG tidak ditemukan.");
    return false;
  }
  if (!GEMINI_CONFIG.isEnabled()) {
    showAPIError(resultElementId, "Fitur AI belum aktif. GEMINI_API_KEY belum dikonfigurasi.");
    createBannerIfDisabled();
    return false;
  }
  return true;
}

async function callGemini(userPrompt, resultElementId, loaderId) {
  const resultDiv = document.getElementById(resultElementId);
  const loader = document.getElementById(loaderId);

  if (!resultDiv) {
    console.warn("Result element not found:", resultElementId);
  }

  if (!userPrompt || !userPrompt.trim()) {
    alert("Mohon isi kolom input terlebih dahulu.");
    return;
  }

  if (!ensureGeminiEnabled(resultElementId)) return;

  // show loader
  if (resultDiv) resultDiv.classList.add("hidden");
  if (loader) loader.classList.remove("hidden");

  try {
    const apiKey = GEMINI_CONFIG.apiKey;
    const payload = {
      contents: [{ parts: [{ text: userPrompt }] }],
      systemInstruction: { parts: [{ text: GEMINI_CONFIG.systemContext }] },
    };

    const resp = await fetch(`${GEMINI_CONFIG.apiEndpoint}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await resp.json().catch(() => {
      throw new Error("Invalid JSON response from Gemini");
    });

    if (!resp.ok) {
      const msg = data?.error?.message || `HTTP ${resp.status}`;
      throw new Error(msg);
    }

    // defensive extraction
    const candidate = (data && data.candidates && data.candidates[0]) || null;
    const aiText = (candidate && candidate.content && candidate.content.parts && candidate.content.parts[0] && candidate.content.parts[0].text) || (data && data.output && data.output[0] && data.output[0].text) || "";

    if (!aiText) {
      throw new Error("Empty response from Gemini");
    }

    const formatted = formatAIText(aiText);

    if (resultDiv) {
      resultDiv.innerHTML = formatted;
      resultDiv.classList.remove("hidden");
      resultDiv.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  } catch (err) {
    console.error("Gemini call error:", err);
    handleAPIError(err, resultElementId);
  } finally {
    if (loader) loader.classList.add("hidden");
  }
}

/* -----------------------------
   Feature helpers (UI triggers)
   ----------------------------- */
function generateStrategy() {
  const productEl = document.getElementById("productInput");
  const product = productEl ? productEl.value.trim() : "";

  if (!product) {
    alert("Masukkan produk atau bisnis terlebih dahulu.");
    return;
  }

  const prompt = `Buatkan strategi pemasaran singkat dan punchy untuk produk/bisnis "${product}" yang menargetkan anak muda Solo.
Sertakan:
1) Headline/Tagline yang "Solo banget"
2) 3 ide konten TikTok/IG Reels (spesifik)
3) Lokasi promosi (pilih area Solo yang relevan)
4) Jenis promo yang menarik mahasiswa
5) Rekomendasi kolaborasi influencer lokal

Gunakan gaya: profesional namun santai, ringkas, actionable.`;

  callGemini(prompt, "strategyResult", "loaderStrategy");
}

function askInsight() {
  const qEl = document.getElementById("questionInput");
  const question = qEl ? qEl.value.trim() : "";

  if (!question) {
    alert("Masukkan pertanyaan terlebih dahulu.");
    return;
  }

  const prompt = `Jawab pertanyaan ini berdasarkan data riset anak muda Solo: "${question}".
Jelaskan alasan dan berikan contoh konkret jika memungkinkan.`;

  callGemini(prompt, "insightResult", "loaderInsight");
}

/* -----------------------------
   Initialization
   ----------------------------- */
function initializeAIFunctions() {
  console.log("⚡ Initializing AI functions");

  // Show banner if disabled
  createBannerIfDisabled();

  // Attach Enter listeners
  const productInput = document.getElementById("productInput");
  const questionInput = document.getElementById("questionInput");

  if (productInput) {
    productInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        generateStrategy();
      }
    });
  }
  if (questionInput) {
    questionInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        askInsight();
      }
    });
  }

  // Debug: status
  if (window.GEMINI_CONFIG) {
    console.log("🔑 Gemini Status:", GEMINI_CONFIG.getStatus());
  } else {
    console.warn("GEMINI_CONFIG not found");
  }
}

document.addEventListener("DOMContentLoaded", function () {
  // small delay to ensure DOM is ready
  setTimeout(initializeAIFunctions, 250);
});
