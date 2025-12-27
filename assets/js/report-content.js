// assets/js/report-content.js
// ReportContent — loads report HTML fragments into the page.
// NOTE: This file now only defines the class. Do NOT auto-initialize here.
// Initialization should happen from the main HTML (one place only).

class ReportContent {
  constructor() {
    // order of fragments (charts-container should be first so canvases exist)
    this.sections = ["report/charts-container", "report/executive-summary", "report/methodology", "report/platform-analysis", "report/demographics", "report/behavior", "report/insights", "report/footnotes"];
    this.basePath = "components"; // folder where components live
    this.initialized = false;
  }

  async fetchFragment(path) {
    try {
      const resp = await fetch(`${this.basePath}/${path}.html`);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      return await resp.text();
    } catch (err) {
      console.warn(`Failed to fetch ${path}:`, err);
      return null;
    }
  }

  async loadComponents({ onProgress } = {}) {
    if (this.initialized) return;
    this.initialized = true;

    const chartsContainer = document.getElementById("charts-container");
    const reportSections = document.getElementById("report-sections");

    if (!chartsContainer || !reportSections) {
      console.warn("Missing target containers for report content.");
      return;
    }

    for (const section of this.sections) {
      try {
        const html = await this.fetchFragment(section);
        if (!html) continue;

        if (section === "report/charts-container") {
          chartsContainer.innerHTML = html;
        } else {
          // append to report sections — keep existing content
          reportSections.insertAdjacentHTML("beforeend", html);
        }

        // optional callback for progress (useful for showing loading state)
        if (typeof onProgress === "function") {
          onProgress(section);
        }
      } catch (error) {
        console.error(`Error loading ${section}:`, error);
      }
    }

    // after DOM fragments injected, give chart system a short moment to setup observers
    // prefer calling reportCharts.initializeAllCharts() (if already created) to start lazy observers
    setTimeout(() => {
      if (window.reportCharts && typeof window.reportCharts.initializeAllCharts === "function") {
        window.reportCharts.initializeAllCharts();
      } else if (window.reportCharts && typeof window.reportCharts.createAllNow === "function") {
        // fallback API
        window.reportCharts.createAllNow();
      }
    }, 250);
  }
}

// Export to global so HTML inline scripts can instantiate
window.ReportContent = ReportContent;

// <<-- IMPORTANT: NO auto-init here. Call from HTML (single place) like:
// const rc = new ReportContent(); rc.loadComponents();
