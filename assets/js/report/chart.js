// assets/js/report/chart.js
class ReportCharts {
  constructor() {
    this.colors = {
      primary: "#4F46E5",
      secondary: "#10B981",
      accent: "#F59E0B",
      danger: "#EF4444",
      warning: "#F59E0B",
      info: "#3B82F6",
      facebook: "#1877F2",
      instagram: "#E4405F",
      tiktok: "#000000",
      twitter: "#1DA1F2",
    };

    this.charts = {};
  }

  initializeAllCharts() {
    this.createPlatformUsageChart();
    this.createCountryDistributionChart();
    this.createMotivationChart();
    this.createDecisionJourneyChart();
    this.createConcernsChart();
    this.createTimelineChart();
    this.createDemographicChart();
    this.createScholarshipInterestChart();
  }

  createPlatformUsageChart() {
    const ctx = document.getElementById("platform-usage-chart");
    if (!ctx) return;

    this.charts.platformUsage = new Chart(ctx, {
      type: "radar",
      data: {
        labels: ["Keterlibatan Gen Z", "Konten Visual", "Interaksi", "Kecepatan Info", "Keakuratan"],
        datasets: [
          {
            label: "Instagram",
            data: [95, 90, 85, 75, 70],
            borderColor: this.colors.instagram,
            backgroundColor: this.hexToRgba(this.colors.instagram, 0.2),
            borderWidth: 3,
            pointBackgroundColor: this.colors.instagram,
          },
          {
            label: "TikTok",
            data: [98, 95, 90, 85, 65],
            borderColor: this.colors.tiktok,
            backgroundColor: this.hexToRgba(this.colors.tiktok, 0.2),
            borderWidth: 3,
            pointBackgroundColor: this.colors.tiktok,
          },
          {
            label: "Facebook",
            data: [45, 60, 70, 65, 85],
            borderColor: this.colors.facebook,
            backgroundColor: this.hexToRgba(this.colors.facebook, 0.2),
            borderWidth: 3,
            pointBackgroundColor: this.colors.facebook,
          },
          {
            label: "Twitter/X",
            data: [32, 40, 55, 80, 75],
            borderColor: this.colors.twitter,
            backgroundColor: this.hexToRgba(this.colors.twitter, 0.2),
            borderWidth: 3,
            pointBackgroundColor: this.colors.twitter,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          r: {
            angleLines: {
              display: true,
            },
            suggestedMin: 0,
            suggestedMax: 100,
            ticks: {
              display: false,
            },
          },
        },
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              padding: 20,
              usePointStyle: true,
            },
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                return `${context.dataset.label}: ${context.raw}%`;
              },
            },
          },
        },
      },
    });
  }

  createCountryDistributionChart() {
    const ctx = document.getElementById("country-distribution-chart");
    if (!ctx) return;

    this.charts.countryDistribution = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Australia", "Singapura", "Jepang", "Amerika Serikat", "Inggris", "Korea Selatan", "Jerman", "Lainnya"],
        datasets: [
          {
            data: [28, 22, 18, 15, 8, 5, 3, 1],
            backgroundColor: ["#3B82F6", "#10B981", "#EF4444", "#8B5CF6", "#F59E0B", "#EC4899", "#6366F1", "#94A3B8"],
            borderWidth: 3,
            borderColor: "#FFFFFF",
          },
        ],
      },
      options: {
        responsive: true,
        cutout: "60%",
        plugins: {
          legend: {
            position: "right",
            labels: {
              padding: 20,
              generateLabels: function (chart) {
                const data = chart.data;
                if (data.labels.length && data.datasets.length) {
                  return data.labels.map((label, i) => {
                    const value = data.datasets[0].data[i];
                    const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                    const percentage = Math.round((value / total) * 100);

                    return {
                      text: `${label}: ${percentage}%`,
                      fillStyle: data.datasets[0].backgroundColor[i],
                      strokeStyle: data.datasets[0].borderColor,
                      lineWidth: 0,
                      hidden: false,
                      index: i,
                    };
                  });
                }
                return [];
              },
            },
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const label = context.label || "";
                const value = context.parsed;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = Math.round((value / total) * 100);
                return `${label}: ${value}% (${percentage}% dari total)`;
              },
            },
          },
        },
      },
    });
  }

  createMotivationChart() {
    const ctx = document.getElementById("motivation-chart");
    if (!ctx) return;

    this.charts.motivation = new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["Kualitas Pendidikan", "Peluang Karir", "Pengalaman Internasional", "Prestise", "Biaya Lebih Terjangkau", "Lingkungan Riset"],
        datasets: [
          {
            label: "Tingkat Kepentingan (%)",
            data: [95, 88, 82, 65, 42, 38],
            backgroundColor: [
              this.hexToRgba(this.colors.primary, 0.8),
              this.hexToRgba(this.colors.secondary, 0.8),
              this.hexToRgba(this.colors.accent, 0.8),
              this.hexToRgba(this.colors.info, 0.8),
              this.hexToRgba(this.colors.warning, 0.8),
              this.hexToRgba(this.colors.danger, 0.8),
            ],
            borderColor: [this.colors.primary, this.colors.secondary, this.colors.accent, this.colors.info, this.colors.warning, this.colors.danger],
            borderWidth: 2,
            borderRadius: 8,
          },
        ],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        scales: {
          x: {
            beginAtZero: true,
            max: 100,
            ticks: {
              callback: function (value) {
                return value + "%";
              },
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
        },
      },
    });
  }

  createDecisionJourneyChart() {
    const ctx = document.getElementById("decision-journey-chart");
    if (!ctx) return;

    this.charts.decisionJourney = new Chart(ctx, {
      type: "line",
      data: {
        labels: ["Bulan 1-2", "Bulan 3-4", "Bulan 5-6", "Bulan 7-8", "Bulan 9-10", "Bulan 11-12"],
        datasets: [
          {
            label: "Kesadaran & Inspirasi",
            data: [85, 90, 75, 50, 30, 20],
            borderColor: this.colors.primary,
            backgroundColor: this.hexToRgba(this.colors.primary, 0.1),
            borderWidth: 3,
            tension: 0.4,
            fill: true,
          },
          {
            label: "Pencarian Informasi",
            data: [20, 75, 95, 85, 60, 40],
            borderColor: this.colors.secondary,
            backgroundColor: this.hexToRgba(this.colors.secondary, 0.1),
            borderWidth: 3,
            tension: 0.4,
            fill: true,
          },
          {
            label: "Persiapan & Aplikasi",
            data: [5, 30, 60, 85, 95, 80],
            borderColor: this.colors.accent,
            backgroundColor: this.hexToRgba(this.colors.accent, 0.1),
            borderWidth: 3,
            tension: 0.4,
            fill: true,
          },
          {
            label: "Keputusan & Realisasi",
            data: [0, 10, 25, 45, 70, 85],
            borderColor: this.colors.danger,
            backgroundColor: this.hexToRgba(this.colors.danger, 0.1),
            borderWidth: 3,
            tension: 0.4,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        interaction: {
          intersect: false,
          mode: "index",
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              callback: function (value) {
                return value + "%";
              },
            },
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function (context) {
                return `${context.dataset.label}: ${context.parsed.y}%`;
              },
            },
          },
        },
      },
    });
  }

  createConcernsChart() {
    const ctx = document.getElementById("concerns-chart");
    if (!ctx) return;

    this.charts.concerns = new Chart(ctx, {
      type: "polarArea",
      data: {
        labels: ["Biaya Hidup", "Biaya Kuliah", "Persyaratan Bahasa", "Proses Visa", "Kultur & Adaptasi", "Dukungan Keluarga", "Prospek Karir Pasca Studi"],
        datasets: [
          {
            data: [95, 90, 85, 80, 75, 70, 65],
            backgroundColor: [
              this.hexToRgba(this.colors.danger, 0.7),
              this.hexToRgba(this.colors.warning, 0.7),
              this.hexToRgba(this.colors.accent, 0.7),
              this.hexToRgba(this.colors.info, 0.7),
              this.hexToRgba(this.colors.primary, 0.7),
              this.hexToRgba(this.colors.secondary, 0.7),
              this.hexToRgba("#8B5CF6", 0.7),
            ],
            borderWidth: 3,
            borderColor: "#FFFFFF",
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "right",
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                return `Tingkat Kekhawatiran: ${context.parsed}%`;
              },
            },
          },
        },
        scales: {
          r: {
            ticks: {
              display: false,
            },
          },
        },
      },
    });
  }

  createTimelineChart() {
    const ctx = document.getElementById("timeline-chart");
    if (!ctx) return;

    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    const engagementData = [45, 52, 58, 62, 68, 75, 82, 88, 85, 78, 70, 65];
    const applicationData = [10, 15, 25, 35, 45, 55, 65, 70, 75, 80, 85, 90];

    this.charts.timeline = new Chart(ctx, {
      type: "line",
      data: {
        labels: months,
        datasets: [
          {
            label: "Engagement Media Sosial",
            data: engagementData,
            borderColor: this.colors.primary,
            backgroundColor: this.hexToRgba(this.colors.primary, 0.1),
            borderWidth: 3,
            fill: true,
            tension: 0.4,
          },
          {
            label: "Aplikasi Beasiswa",
            data: applicationData,
            borderColor: this.colors.secondary,
            backgroundColor: this.hexToRgba(this.colors.secondary, 0.1),
            borderWidth: 3,
            fill: true,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              callback: function (value) {
                return value + "%";
              },
            },
          },
        },
      },
    });
  }

  createDemographicChart() {
    const ctx = document.getElementById("demographic-chart");
    if (!ctx) return;

    this.charts.demographic = new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["SMA/Sederajat", "Mahasiswa S1", "Fresh Graduate", "Profesional <5th", "Profesional >5th"],
        datasets: [
          {
            label: "Usia 17-19",
            data: [85, 10, 3, 1, 1],
            backgroundColor: this.hexToRgba(this.colors.primary, 0.8),
            borderRadius: 4,
          },
          {
            label: "Usia 20-22",
            data: [15, 70, 10, 3, 2],
            backgroundColor: this.hexToRgba(this.colors.secondary, 0.8),
            borderRadius: 4,
          },
          {
            label: "Usia 23-25",
            data: [0, 15, 60, 20, 5],
            backgroundColor: this.hexToRgba(this.colors.accent, 0.8),
            borderRadius: 4,
          },
          {
            label: "Usia 26+",
            data: [0, 5, 27, 50, 18],
            backgroundColor: this.hexToRgba(this.colors.info, 0.8),
            borderRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          x: {
            stacked: true,
          },
          y: {
            stacked: true,
            ticks: {
              callback: function (value) {
                return value + "%";
              },
            },
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function (context) {
                return `${context.dataset.label}: ${context.parsed.y}%`;
              },
            },
          },
        },
      },
    });
  }

  createScholarshipInterestChart() {
    const ctx = document.getElementById("scholarship-interest-chart");
    if (!ctx) return;

    this.charts.scholarshipInterest = new Chart(ctx, {
      type: "pie",
      data: {
        labels: ["Beasiswa Penuh", "Beasiswa Parsial", "Pinjaman Pendidikan", "Biaya Mandiri", "Sponsor Perusahaan"],
        datasets: [
          {
            data: [65, 20, 10, 3, 2],
            backgroundColor: [this.colors.primary, this.colors.secondary, this.colors.accent, this.colors.info, this.colors.danger],
            borderWidth: 3,
            borderColor: "#FFFFFF",
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "bottom",
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const label = context.label || "";
                const value = context.parsed;
                return `${label}: ${value}%`;
              },
            },
          },
        },
      },
    });
  }

  hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
}

// Initialize charts when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  const reportCharts = new ReportCharts();
  reportCharts.initializeAllCharts();

  // Store instance globally for debugging
  window.reportCharts = reportCharts;
});
