// assets/js/gemini.js
// Main Gemini API Functions

// Initialize Gemini Functions
document.addEventListener("DOMContentLoaded", function () {
  console.log("🔧 Initializing AI functions...");
  setTimeout(initializeAIFunctions, 500);
});

// Call Gemini API
async function callGemini(userPrompt, resultElementId, loaderId) {
  console.log("📤 Gemini API call initiated");

  const resultDiv = document.getElementById(resultElementId);
  const loader = document.getElementById(loaderId);

  // Validate input
  if (!userPrompt.trim()) {
    alert("Mohon isi kolom input terlebih dahulu.");
    return;
  }

  // Get and validate API Key
  const apiKey = GEMINI_CONFIG.getApiKey();
  if (!apiKey) {
    showAPIError(resultElementId, "Fitur AI dinonaktifkan karena konfigurasi API Key tidak valid.");
    return;
  }

  // Show loading state
  resultDiv.classList.add("hidden");
  loader.classList.remove("hidden");

  try {
    // Make API request
    const response = await fetch(`${GEMINI_CONFIG.apiEndpoint}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: userPrompt }] }],
        systemInstruction: { parts: [{ text: GEMINI_CONFIG.systemContext }] },
      }),
    });

    // Handle response
    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message || "API Error");
    }

    // Format and display result
    const aiText = data.candidates[0].content.parts[0].text;
    const formattedText = formatAIText(aiText);

    resultDiv.innerHTML = formattedText;
    resultDiv.classList.remove("hidden");

    // Scroll to result
    resultDiv.scrollIntoView({ behavior: "smooth", block: "nearest" });
  } catch (error) {
    console.error("API Error:", error);
    handleAPIError(error, resultElementId);
  } finally {
    loader.classList.add("hidden");
  }
}

// Format AI Text Response with Tailwind classes
function formatAIText(aiText) {
  return aiText
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-solo-yellow font-semibold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
    .replace(/^### (.*)$/gm, '<h3 class="text-xl font-bold text-solo-teal mt-6 mb-3">$1</h3>')
    .replace(/^## (.*)$/gm, '<h2 class="text-2xl font-bold text-solo-red mt-8 mb-4">$1</h2>')
    .replace(/^(\d+\.)\s+(.*)$/gm, '<li class="ml-6 mb-2"><span class="font-bold text-solo-dark">$1</span> $2</li>')
    .replace(/^-\s+(.*)$/gm, '<li class="ml-6 mb-2 flex items-start"><span class="mr-2">•</span> $1</li>')
    .replace(/\n\n/g, '</p><p class="mt-3">')
    .replace(/\n/g, "<br>");
}

// Generate Marketing Strategy
function generateStrategy() {
  const product = document.getElementById("productInput").value.trim();
  if (!product) {
    alert("Masukkan produk atau bisnis terlebih dahulu.");
    return;
  }

  const prompt = `Buatkan strategi pemasaran singkat dan *punchy* untuk produk/bisnis "${product}" yang menargetkan anak muda Solo.
    
Sertakan:
1. **Headline/Tagline** yang "Solo banget"
2. **Ide konten TikTok/IG Reels** (3 ide spesifik)
3. **Lokasi promosi** yang cocok (pilih area Solo yang relevan)
4. **Jenis promo** yang menarik bagi mereka
5. **Rekomendasi kolaborasi** dengan influencer lokal (jika ada)

Berikan dalam format yang mudah dibaca dengan poin-poin penting ditebalkan.`;

  callGemini(prompt, "strategyResult", "loaderStrategy");
}

// Ask Data Insight
function askInsight() {
  const question = document.getElementById("questionInput").value.trim();
  if (!question) {
    alert("Masukkan pertanyaan terlebih dahulu.");
    return;
  }

  const prompt = `Jawab pertanyaan ini berdasarkan data riset anak muda Solo: "${question}".
    
Jelaskan alasannya berdasarkan perilaku atau data yang ada, dan berikan contoh konkret jika memungkinkan.`;

  callGemini(prompt, "insightResult", "loaderInsight");
}

// Initialize AI Functions
function initializeAIFunctions() {
  console.log("⚡ Setting up AI function listeners");

  // Setup Enter key listeners
  const productInput = document.getElementById("productInput");
  const questionInput = document.getElementById("questionInput");

  if (productInput) {
    productInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        generateStrategy();
        e.preventDefault();
      }
    });
  }

  if (questionInput) {
    questionInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        askInsight();
        e.preventDefault();
      }
    });
  }

  // Check API Key status
  if (GEMINI_CONFIG) {
    console.log("🔑 API Key status:", GEMINI_CONFIG.isValid() ? "Valid" : "Invalid");
  }
}

// Error handling helper functions
function showAPIError(elementId, message) {
  const resultDiv = document.getElementById(elementId);
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
                    <p class="text-xs text-red-600 mt-1">Untuk developer: Pastikan GEMINI_API_KEY sudah di-set di GitHub Secrets.</p>
                </div>
            </div>
        </div>
    `;
  resultDiv.classList.remove("hidden");
}

function handleAPIError(error, elementId) {
  const resultDiv = document.getElementById(elementId);
  let errorMessage = "Maaf, terjadi kesalahan.";

  if (error.message.includes("quota")) {
    errorMessage = "Kuota API telah habis. Silakan coba lagi besok.";
  } else if (error.message.includes("API key")) {
    errorMessage = "API Key tidak valid. Silakan periksa konfigurasi.";
  } else if (error.message.includes("network")) {
    errorMessage = "Koneksi jaringan bermasalah. Silakan cek koneksi internet Anda.";
  }

  resultDiv.innerHTML = `
        <div class="bg-yellow-50 border-l-4 border-yellow-500 p-4">
            <div class="flex">
                <div class="flex-shrink-0">
                    <svg class="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                    </svg>
                </div>
                <div class="ml-3">
                    <p class="text-sm text-yellow-700">${errorMessage}</p>
                </div>
            </div>
        </div>
    `;
  resultDiv.classList.remove("hidden");
}
