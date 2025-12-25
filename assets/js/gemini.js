// Gemini API Configuration
// Mengambil API Key dari config-api.js yang di-inject oleh GitHub Actions

// Main Gemini API Call Function
async function callGemini(userPrompt, resultElementId, loaderId) {
    const resultDiv = document.getElementById(resultElementId);
    const loader = document.getElementById(loaderId);

    if (!userPrompt.trim()) {
        alert("Mohon isi kolom input terlebih dahulu.");
        return;
    }

    // Cek API Key
    const apiKey = window.getGeminiAPIKey();
    if (!apiKey) {
        resultDiv.classList.remove("hidden");
        resultDiv.innerHTML = `
            <div class="text-red-300 text-center p-4">
                <p>⚠️ Fitur AI tidak tersedia karena konfigurasi API Key.</p>
                <p class="text-sm mt-2">Silakan hubungi administrator atau coba lagi nanti.</p>
            </div>
        `;
        return;
    }

    resultDiv.classList.add("hidden");
    loader.classList.remove("hidden");

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
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
                            text: systemContext,
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

        // Format markdown to HTML
        const formattedText = formatAIText(aiText);

        resultDiv.innerHTML = formattedText;
        resultDiv.classList.remove("hidden");
        
        // Scroll to result
        resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } catch (error) {
        console.error("Error:", error);
        
        // Handle specific error types
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

// System Context tetap sama...
const systemContext = `Anda adalah pakar riset pasar dan strategi pemasaran yang mengkhususkan diri pada demografi Anak Muda (Gen Z) di Kota Solo (Surakarta), Indonesia.
Gunakan data berikut sebagai basis pengetahuan Anda:
- Profil Psikografis: "The Santuy Hustler", santai tapi produktif, communal oriented (FOMO), smart spender (price sensitive).
- Media Sosial: TikTok (Search engine), Instagram (Lifestyle/Aesthetic), X/Twitter (Info & Sambat).
- Topik Viral: Hidden gem kuliner, Campus Life (UNS/UMS), Event/Konser lokal.
- Perilaku Nongkrong: Cafe adalah kantor kedua. Prioritas utama: WiFi & Colokan. Area favorit: Jebres (UNS) & Pabelan (UMS).
- Minat Belajar: Digital Marketing, Content Creation, Bahasa Inggris. Hambatan: Biaya mahal (>150rb), Lokasi jauh.
- Strategi Marketing Efektif: Promo KTM (Mahasiswa), Community Partnership, Visual Aesthetic, Bahasa campuran Indo-Jawa santai.

Gaya bicara Anda: Profesional namun santai, menggunakan istilah anak muda yang relevan, dan memberikan saran praktis yang bisa langsung diterapkan di Solo.

Format respons: Gunakan poin-poin jelas, tebal untuk istilah penting, dan akhiri dengan rekomendasi konkret.`;

// Format AI Text Response
function formatAIText(aiText) {
    return aiText
        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-solo-yellow">$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n\n/g, '</p><p class="mt-3">')
        .replace(/\n/g, '<br>')
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

// Initialize AI Functions when components are loaded
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initializeAIFunctions, 500);
});

function initializeAIFunctions() {
    // Add event listeners for AI features
    const productInput = document.getElementById('productInput');
    const questionInput = document.getElementById('questionInput');
    
    if (productInput) {
        productInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                generateStrategy();
            }
        });
    }
    
    if (questionInput) {
        questionInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                askInsight();
            }
        });
    }
    
    // Cek API Key saat initialize
    if (window.isAPIKeyAvailable && !window.isAPIKeyAvailable()) {
        console.warn('GEMINI_API_KEY tidak tersedia atau belum di-set.');
    }
}
