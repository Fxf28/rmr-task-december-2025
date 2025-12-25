// assets/js/gemini.js
// Main Gemini API Functions

// Initialize Gemini Functions
document.addEventListener("DOMContentLoaded", function () {
  setTimeout(initializeAIFunctions, 500);
});

// Call Gemini API
async function callGemini(userPrompt, resultElementId, loaderId) {
  const resultDiv = document.getElementById(resultElementId);
  const loader = document.getElementById(loaderId);

  if (!userPrompt.trim()) {
    alert("Mohon isi kolom input terlebih dahulu.");
    return;
  }

  // Cek dan ambil API Key
  const apiKey = GEMINI_CONFIG.getApiKey();
  if (!apiKey) {
    resultDiv.classList.remove("hidden");
    resultDiv.innerHTML = `
            <div class="text-red-300 text-center p-4">
                <p>⚠️ Fitur AI dinonaktifkan karena konfigurasi API Key.</p>
                <p class="text-sm mt-2">Untuk menggunakan fitur ini, hubungi administrator.</p>
            </div>
        `;
    return;
  }

  resultDiv.classList.add("hidden");
  loader.classList.remove("hidden");

  try {
    const response = await fetch(`${GEMINI_CONFIG.apiEndpoint}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: userPrompt,
              },
            ],
          },
        ],
        systemInstruction: {
          parts: [
            {
              text: GEMINI_CONFIG.systemContext,
            },
          ],
        },
      }),
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    const aiText = data.candidates[0].content.parts[0].text;
    const formattedText = formatAIText(aiText);

    resultDiv.innerHTML = formattedText;
    resultDiv.classList.remove("hidden");

    // Scroll ke hasil
    resultDiv.scrollIntoView({ behavior: "smooth", block: "nearest" });
  } catch (error) {
    console.error("Error:", error);

    let errorMessage = "Maaf, terjadi kesalahan.";
    if (error.message.includes("quota")) {
      errorMessage = "Kuota API telah habis. Silakan coba lagi besok.";
    } else if (error.message.includes("API key")) {
      errorMessage = "API Key tidak valid. Silakan periksa konfigurasi.";
    } else if (error.message.includes("network")) {
      errorMessage = "Koneksi jaringan bermasalah. Silakan cek koneksi internet Anda.";
    }

    resultDiv.innerHTML = `<span class="text-red-300">${errorMessage}</span>`;
    resultDiv.classList.remove("hidden");
  } finally {
    loader.classList.add("hidden");
  }
}

// Format AI Text Response
function formatAIText(aiText) {
  return aiText
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-solo-yellow">$1</strong>')
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/\n\n/g, '</p><p class="mt-3">')
    .replace(/\n/g, "<br>")
    .replace(/### (.*?)(\n|$)/g, '<h4 class="font-bold text-solo-teal text-lg mt-4 mb-2">$1</h4>')
    .replace(/## (.*?)(\n|$)/g, '<h3 class="font-bold text-xl mt-4 mb-3 text-solo-yellow">$1</h3>')
    .replace(/- (.*?)(\n|$)/g, '<li class="ml-4 mb-1">$1</li>')
    .replace(/(\d\.) (.*?)(\n|$)/g, '<li class="ml-4 mb-1"><strong>$1</strong> $2</li>');
}

// Generate Marketing Strategy
function generateStrategy() {
  const product = document.getElementById("productInput").value;
  const prompt = `Buatkan strategi pemasaran singkat dan *punchy* untuk produk/bisnis "${product}" yang menargetkan anak muda Solo. 
        Sertakan:
        1. Headline/Tagline yang "Solo banget".
        2. Ide konten TikTok/IG Reels (3 ide spesifik).
        3. Lokasi promosi yang cocok (pilih area Solo yang relevan).
        4. Jenis promo yang menarik bagi mereka.
        5. Rekomendasi kolaborasi dengan influencer lokal (jika ada).
        
        Berikan dalam format yang mudah dibaca dengan poin-poin penting ditebalkan.`;

  callGemini(prompt, "strategyResult", "loaderStrategy");
}

// Ask Data Insight
function askInsight() {
  const question = document.getElementById("questionInput").value;
  const prompt = `Jawab pertanyaan ini berdasarkan data riset anak muda Solo: "${question}". 
        Jelaskan alasannya berdasarkan perilaku atau data yang ada, dan berikan contoh konkret jika memungkinkan.`;

  callGemini(prompt, "insightResult", "loaderInsight");
}

// Initialize AI Functions
function initializeAIFunctions() {
  // Add event listeners
  const productInput = document.getElementById("productInput");
  const questionInput = document.getElementById("questionInput");

  if (productInput) {
    productInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        generateStrategy();
      }
    });
  }

  if (questionInput) {
    questionInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        askInsight();
      }
    });
  }

  // Cek API Key saat initialize
  if (GEMINI_CONFIG && !GEMINI_CONFIG.isValid()) {
    console.warn("GEMINI_API_KEY belum dikonfigurasi.");
  }
}
