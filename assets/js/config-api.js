// assets/js/config-api.js
// File ini akan digenerate otomatis oleh GitHub Actions

// API Key akan di-inject oleh GitHub Actions
window.GEMINI_API_KEY = '{{GEMINI_API_KEY}}';

// Cek jika API Key tersedia
window.isAPIKeyAvailable = function() {
    return window.GEMINI_API_KEY && window.GEMINI_API_KEY !== '{{GEMINI_API_KEY}}' && window.GEMINI_API_KEY.length > 20;
};

// Error handling untuk API Key
window.getGeminiAPIKey = function() {
    if (!window.isAPIKeyAvailable()) {
        console.error('API Key tidak tersedia. Pastikan GEMINI_API_KEY sudah di-set di GitHub Secrets.');
        showAPIKeyError();
        return null;
    }
    return window.GEMINI_API_KEY;
};

// Tampilkan error jika API Key tidak tersedia
function showAPIKeyError() {
    // Cari elemen AI section
    const aiSection = document.querySelector('#ai-strategy-container') || 
                      document.querySelector('.ai-strategy-section');
    
    if (aiSection) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'bg-red-50 border-l-4 border-red-500 p-4 mb-4';
        errorDiv.innerHTML = `
            <div class="flex">
                <div class="flex-shrink-0">
                    <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                    </svg>
                </div>
                <div class="ml-3">
                    <p class="text-sm text-red-700">
                        API Key Gemini tidak tersedia. Fitur AI tidak dapat digunakan.
                        <br>
                        <small>Jika Anda adalah developer, pastikan GEMINI_API_KEY sudah di-set di GitHub Secrets.</small>
                    </p>
                </div>
            </div>
        `;
        
        // Sisipkan error message di awal section AI
        aiSection.insertBefore(errorDiv, aiSection.firstChild);
    }
}

// Export untuk testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { isAPIKeyAvailable, getGeminiAPIKey };
}
