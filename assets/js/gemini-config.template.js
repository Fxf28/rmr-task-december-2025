// assets/js/gemini-config.template.js
// FILE INI ADALAH TEMPLATE - AKAN DIUBAH OLEH GITHUB ACTIONS

// Gemini API Configuration
const GEMINI_CONFIG = {
  apiKey: "{{GEMINI_API_KEY}}",
  apiEndpoint: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent",

  // System Context untuk AI
  systemContext: `Anda adalah pakar riset pasar dan strategi pemasaran yang mengkhususkan diri pada demografi Anak Muda (Gen Z) di Kota Solo (Surakarta), Indonesia.
Gunakan data berikut sebagai basis pengetahuan Anda:
- Profil Psikografis: "The Santuy Hustler", santai tapi produktif, communal oriented (FOMO), smart spender (price sensitive).
- Media Sosial: TikTok (Search engine), Instagram (Lifestyle/Aesthetic), X/Twitter (Info & Sambat).
- Topik Viral: Hidden gem kuliner, Campus Life (UNS/UMS), Event/Konser lokal.
- Perilaku Nongkrong: Cafe adalah kantor kedua. Prioritas utama: WiFi & Colokan. Area favorit: Jebres (UNS) & Pabelan (UMS).
- Minat Belajar: Digital Marketing, Content Creation, Bahasa Inggris. Hambatan: Biaya mahal (>150rb), Lokasi jauh.
- Strategi Marketing Efektif: Promo KTM (Mahasiswa), Community Partnership, Visual Aesthetic, Bahasa campuran Indo-Jawa santai.

Gaya bicara Anda: Profesional namun santai, menggunakan istilah anak muda yang relevan, dan memberikan saran praktis yang bisa langsung diterapkan di Solo.`,

  // Cek apakah API Key valid
  isValid: function () {
    return this.apiKey && this.apiKey.length > 30 && this.apiKey !== "{{GEMINI_API_KEY}}";
  },

  // Get API Key dengan validasi
  getApiKey: function () {
    if (!this.isValid()) {
      console.error("API Key tidak valid atau belum di-set.");
      this.showError();
      return null;
    }
    return this.apiKey;
  },

  // Tampilkan error jika API Key tidak valid
  showError: function () {
    const aiSection = document.querySelector('[id*="ai"], .ai-strategy-section');
    if (aiSection && !document.querySelector(".api-key-error")) {
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
                        <p class="text-sm text-red-700">
                            <strong>Fitur AI Dinonaktifkan</strong><br>
                            <small>API Key Gemini tidak dikonfigurasi. Untuk development, tambahkan API Key di GitHub Secrets.</small>
                        </p>
                    </div>
                </div>
            `;
      aiSection.prepend(errorDiv);
    }
  },
};
