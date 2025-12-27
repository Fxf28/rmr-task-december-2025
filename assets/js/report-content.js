// assets/js/report-content.js
class ReportContent {
  constructor() {
    this.sections = ["report/charts-container", "report/executive-summary", "report/methodology", "report/platform-analysis", "report/demographics", "report/behavior", "report/insights", "report/footnotes"];
  }

  async loadComponents() {
    const chartsContainer = document.getElementById("charts-container");
    const reportSections = document.getElementById("report-sections");

    for (const section of this.sections) {
      try {
        const response = await fetch(`components/${section}.html`);
        if (response.ok) {
          const html = await response.text();

          if (section === "report/charts-container") {
            chartsContainer.innerHTML = html;
          } else {
            reportSections.innerHTML += html;
          }
        } else {
          console.warn(`File not found: components/${section}.html`);
        }
      } catch (error) {
        console.error(`Error loading ${section}:`, error);
      }
    }

    // Initialize charts after content is loaded
    setTimeout(() => {
      if (window.reportCharts) {
        window.reportCharts.initializeAllCharts();
      }
    }, 500);
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  const reportContent = new ReportContent();
  reportContent.loadComponents();
});
