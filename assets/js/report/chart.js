// assets/js/report/chart.js
// ReportCharts — mobile-first, lazy-load, priority, animation tweaks, chart:ready dispatch
// Requires: Chart.js already loaded on page

class ReportCharts {
  constructor({ lazyLoad = true, eager = false, animationDuration = 400 } = {}) {
    if (typeof Chart === "undefined") {
      console.warn("Chart.js not found — ReportCharts will not initialize charts.");
      return;
    }

    // color tokens
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

    // runtime state
    this.charts = {}; // keyed by canvas id
    this.observers = {}; // intersection and resize observers
    this.lazyLoad = !!lazyLoad;
    this.eager = !!eager;
    this.animationDuration = typeof animationDuration === "number" ? animationDuration : 400;

    // responsive flags
    this.breakpoint = this.getBreakpoint();
    this.isMobile = this.breakpoint === "mobile";
    this.isTablet = this.breakpoint === "tablet";
    this.isDesktop = this.breakpoint === "desktop";

    // registry mapping (id -> factory)
    this.chartRegistry = {
      "platform-usage-chart": () => this.buildPlatformUsageConfig(),
      "country-distribution-chart": () => this.buildCountryDistributionConfig(),
      "motivation-chart": () => this.buildMotivationConfig(),
      "decision-journey-chart": () => this.buildDecisionJourneyConfig(),
      "concerns-chart": () => this.buildConcernsConfig(),
      "timeline-chart": () => this.buildTimelineConfig(),
      "demographic-chart": () => this.buildDemographicConfig(),
      "scholarship-interest-chart": () => this.buildScholarshipConfig(),
    };

    // bind
    this.handleResize = this.handleResize.bind(this);

    // lifecycle init
    window.addEventListener("resize", this.handleResize);
    if (this.eager || !this.lazyLoad) {
      // create all right away
      this.forceInitializeAllCharts();
    } else {
      this.setupObservers();
    }
  }

  /* ===== responsive helpers ===== */
  getBreakpoint() {
    const w = window.innerWidth;
    if (w < 768) return "mobile";
    if (w < 1024) return "tablet";
    return "desktop";
  }

  updateResponsiveFlags() {
    const newBp = this.getBreakpoint();
    if (newBp !== this.breakpoint) {
      this.breakpoint = newBp;
      this.isMobile = newBp === "mobile";
      this.isTablet = newBp === "tablet";
      this.isDesktop = newBp === "desktop";
      // rebuild charts so they adopt new sizes/labels
      this.rebuildAllCharts();
    }
  }

  handleResize() {
    // debounce lightly
    if (this._resizeTimer) clearTimeout(this._resizeTimer);
    this._resizeTimer = setTimeout(() => {
      this.updateResponsiveFlags();
      // attempt to call resize on existing charts
      Object.values(this.charts).forEach((c) => {
        try {
          c.resize();
          c.update("none");
        } catch (e) {}
      });
    }, 120);
  }

  destroy() {
    window.removeEventListener("resize", this.handleResize);
    Object.values(this.charts).forEach((c) => {
      try {
        c.destroy();
      } catch (e) {}
    });
    this.charts = {};

    Object.values(this.observers).forEach((o) => {
      try {
        o.disconnect();
      } catch (e) {}
    });
    this.observers = {};
  }

  rebuildAllCharts() {
    // destroy all and re-register observers
    Object.values(this.charts).forEach((c) => {
      try {
        c.destroy();
      } catch (e) {}
    });
    this.charts = {};
    Object.values(this.observers).forEach((o) => {
      try {
        o.disconnect();
      } catch (e) {}
    });
    this.observers = {};
    // re-setup
    if (this.lazyLoad && !this.eager) {
      this.setupObservers();
    } else {
      this.forceInitializeAllCharts();
    }
  }

  /* ===== utilities ===== */
  hexToRgba(hex, alpha = 1) {
    if (!hex || hex[0] !== "#") return hex;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  getResponsiveOptions() {
    return {
      fontSizes: {
        title: this.isMobile ? 16 : this.isTablet ? 18 : 20,
        legend: this.isMobile ? 14 : this.isTablet ? 16 : 18,
        ticks: this.isMobile ? 13 : this.isTablet ? 15 : 17,
        tooltip: this.isMobile ? 14 : this.isTablet ? 16 : 18,
      },
      legendPosition: this.isMobile ? "top" : "right",
      pointRadius: this.isMobile ? 6 : 7,
      borderWidth: this.isMobile ? 3 : 4,
      cutout: this.isMobile ? "50%" : "65%",
      animationDuration: this.animationDuration,
    };
  }

  /* ===== registry & lazy-load ===== */
  setupObservers() {
    // observe each registered chart id
    Object.keys(this.chartRegistry).forEach((id) => {
      // If chart already created in DOM (canvas exists and container marked priority), create directly
      const container = document.querySelector(`[data-chart-id="${id}"]`);
      const canvas = document.getElementById(id) || (container && container.querySelector("canvas"));

      // If container has explicit priority, create immediately
      if (container && container.dataset.chartPriority === "high") {
        this.createChartById(id);
        return;
      }

      // If canvas exists, use intersection observer on canvas; else observe container if exists
      const targetEl = canvas || container;
      if (!targetEl) {
        // nothing to observe in DOM now — skip, maybe injected later by report-content.js
        return;
      }

      const io = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting || entry.intersectionRatio > 0) {
              this.createChartById(id);
              try {
                obs.unobserve(entry.target);
              } catch (e) {}
            }
          });
        },
        { root: null, rootMargin: "0px 0px -10% 0px", threshold: 0.08 }
      );

      io.observe(targetEl);
      this.observers[`io-${id}`] = io;
    });

    // Also watch for dynamic injection into a parent charts container
    const chartsRoot = document.getElementById("charts-container");
    if (chartsRoot && !this.observers["mut"]) {
      const mut = new MutationObserver(() => {
        // re-run setup for any newly added canvases
        Object.keys(this.chartRegistry).forEach((id) => {
          if (!this.charts[id]) {
            const container = document.querySelector(`[data-chart-id="${id}"]`);
            const canvas = document.getElementById(id) || (container && container.querySelector("canvas"));
            if (canvas) {
              // if priority, create now
              if (container && container.dataset.chartPriority === "high") {
                this.createChartById(id);
              } else {
                // ensure an observer exists (avoid duplicates)
                if (!this.observers[`io-${id}`]) {
                  const io = new IntersectionObserver(
                    (entries, obs) => {
                      entries.forEach((entry) => {
                        if (entry.isIntersecting || entry.intersectionRatio > 0) {
                          this.createChartById(id);
                          try {
                            obs.unobserve(entry.target);
                          } catch (e) {}
                        }
                      });
                    },
                    { root: null, rootMargin: "0px 0px -10% 0px", threshold: 0.08 }
                  );
                  io.observe(canvas);
                  this.observers[`io-${id}`] = io;
                }
              }
            }
          }
        });
      });
      mut.observe(chartsRoot, { childList: true, subtree: true });
      this.observers["mut"] = mut;
    }
  }

  forceInitializeAllCharts() {
    Object.keys(this.chartRegistry).forEach((id) => this.createChartById(id));
  }

  createChartById(id) {
    // safety
    if (!this.chartRegistry[id]) return;

    // avoid double-creating
    if (this.charts[id]) return;

    const canvas = document.getElementById(id) || document.querySelector(`[data-chart-id="${id}"] canvas`);
    const container = document.querySelector(`[data-chart-id="${id}"]`) || (canvas && canvas.parentElement);

    if (!canvas) return;

    // build config from factory
    const cfg = this.chartRegistry[id]();

    // ensure animation duration & mobile adjustment
    cfg.options = cfg.options || {};
    cfg.options.animation = cfg.options.animation || {};
    cfg.options.animation.duration = cfg.options.animation.duration ?? this.getResponsiveOptions().animationDuration;
    // shorten animations on mobile slightly
    if (this.isMobile) cfg.options.animation.duration = Math.min(cfg.options.animation.duration, 300);

    // create chart instance
    try {
      const chart = new Chart(canvas, cfg);
      this.charts[id] = chart;

      // ensure container flagged ready so skeleton logic elsewhere can hide overlays
      if (container) {
        try {
          container.dataset.chartReady = "1";
        } catch (e) {}
      }

      // dispatch "chart:ready"
      try {
        document.dispatchEvent(new CustomEvent("chart:ready", { detail: { id } }));
      } catch (e) {}

      // add resize observer to keep chart responsive if container size changes
      this.addChartResizeObserver(chart, id);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to initialize chart:", id, err);
    }
  }

  addChartResizeObserver(chart, chartId) {
    try {
      const canvas = document.getElementById(chartId);
      const container = document.querySelector(`[data-chart-id="${chartId}"]`) || (canvas && canvas.parentElement);
      if (!container) return;

      const ro = new ResizeObserver(() => {
        try {
          if (chart && typeof chart.resize === "function") {
            chart.resize();
            chart.update("none");
          }
        } catch (e) {}
      });

      ro.observe(container);
      this.observers[`ro-${chartId}`] = ro;
    } catch (e) {
      // noop
    }
  }

  /* ====== chart config factories (mobile-aware) ====== */
  buildPlatformUsageConfig() {
    const opts = this.getResponsiveOptions();
    const isMobile = this.isMobile;
    const labels = ["Keterlibatan", "Konten Visual", "Interaksi", "Kecepatan", "Keakuratan"];

    return {
      type: "radar",
      data: {
        labels,
        datasets: [
          {
            label: "Instagram",
            data: [95, 90, 85, 75, 70],
            borderColor: this.colors.instagram,
            backgroundColor: this.hexToRgba(this.colors.instagram, 0.12),
            pointBackgroundColor: this.colors.instagram,
            pointRadius: opts.pointRadius,
            borderWidth: opts.borderWidth,
          },
          {
            label: "TikTok",
            data: [98, 95, 90, 85, 65],
            borderColor: this.colors.tiktok,
            backgroundColor: this.hexToRgba(this.colors.tiktok, 0.12),
            pointBackgroundColor: this.colors.tiktok,
            pointRadius: opts.pointRadius,
            borderWidth: opts.borderWidth,
          },
          {
            label: "Facebook",
            data: [45, 60, 70, 65, 85],
            borderColor: this.colors.facebook,
            backgroundColor: this.hexToRgba(this.colors.facebook, 0.12),
            pointBackgroundColor: this.colors.facebook,
            pointRadius: opts.pointRadius,
            borderWidth: opts.borderWidth,
          },
          {
            label: "Twitter/X",
            data: [32, 40, 55, 80, 75],
            borderColor: this.colors.twitter,
            backgroundColor: this.hexToRgba(this.colors.twitter, 0.12),
            pointBackgroundColor: this.colors.twitter,
            pointRadius: opts.pointRadius,
            borderWidth: opts.borderWidth,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: !isMobile,
        aspectRatio: isMobile ? 1.2 : 1.8,
        scales: {
          r: {
            angleLines: { display: true, lineWidth: 1, color: "rgba(0,0,0,0.05)" },
            suggestedMin: 0,
            suggestedMax: 100,
            ticks: {
              display: true,
              stepSize: 20,
              font: { size: isMobile ? 12 : opts.fontSizes.ticks, family: "'Poppins', sans-serif" },
              callback: (v) => `${v}%`,
            },
            pointLabels: {
              font: { size: isMobile ? 12 : opts.fontSizes.ticks, family: "'Poppins', sans-serif" },
              color: "#374151",
            },
          },
        },
        plugins: {
          legend: {
            position: isMobile ? "top" : "bottom",
            labels: { font: { size: isMobile ? 13 : opts.fontSizes.legend }, usePointStyle: true, boxWidth: isMobile ? 12 : 14 },
          },
          tooltip: {
            callbacks: { label: (ctx) => `${ctx.dataset.label}: ${ctx.raw}%` },
            bodyFont: { size: opts.fontSizes.tooltip, family: "'Poppins', sans-serif" },
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            borderColor: "#E5E7EB",
            borderWidth: 1,
          },
        },
      },
    };
  }

  buildCountryDistributionConfig() {
    const opts = this.getResponsiveOptions();
    const isMobile = this.isMobile;
    const dataArr = [28, 22, 18, 15, 8, 5, 3, 1];
    const labels = ["Australia", "Singapura", "Jepang", "Amerika Serikat", "Inggris", "Korea Selatan", "Jerman", "Lainnya"];

    return {
      type: "doughnut",
      data: {
        labels,
        datasets: [
          {
            data: dataArr,
            backgroundColor: ["#3B82F6", "#10B981", "#EF4444", "#8B5CF6", "#F59E0B", "#EC4899", "#6366F1", "#94A3B8"],
            borderColor: "#FFFFFF",
            borderWidth: isMobile ? 3 : opts.borderWidth,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: !isMobile,
        aspectRatio: isMobile ? 1 : 1.2,
        cutout: isMobile ? "55%" : "65%",
        plugins: {
          legend: { position: isMobile ? "bottom" : "right", labels: { font: { size: isMobile ? 13 : opts.fontSizes.legend } } },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const label = ctx.label || "";
                const value = ctx.parsed;
                const total = dataArr.reduce((a, b) => a + b, 0);
                const pct = Math.round((value / total) * 100);
                return `${label}: ${pct}% (${value})`;
              },
            },
            bodyFont: { size: opts.fontSizes.tooltip, family: "'Poppins', sans-serif" },
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            borderColor: "#E5E7EB",
            borderWidth: 1,
          },
        },
      },
    };
  }

  buildMotivationConfig() {
    const opts = this.getResponsiveOptions();
    const isMobile = this.isMobile;
    const labels = isMobile
      ? ["Kualitas Pendidikan", "Peluang Karir", "Pengalaman Internasional", "Prestise", "Biaya Terjangkau", "Lingkungan Riset"]
      : ["Kualitas Pendidikan", "Peluang Karir", "Pengalaman Internasional", "Prestise", "Biaya Lebih Terjangkau", "Lingkungan Riset"];
    const dataValues = [95, 88, 82, 65, 42, 38];

    const base = {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Tingkat Kepentingan (%)",
            data: dataValues,
            backgroundColor: [
              this.hexToRgba(this.colors.primary, 0.9),
              this.hexToRgba(this.colors.secondary, 0.9),
              this.hexToRgba(this.colors.accent, 0.9),
              this.hexToRgba(this.colors.info, 0.9),
              this.hexToRgba(this.colors.warning, 0.9),
              this.hexToRgba(this.colors.danger, 0.9),
            ],
            borderColor: [this.colors.primary, this.colors.secondary, this.colors.accent, this.colors.info, this.colors.warning, this.colors.danger],
            borderWidth: opts.borderWidth,
            borderRadius: isMobile ? 8 : 10,
            borderSkipped: false,
          },
        ],
      },
      options: {
        indexAxis: isMobile ? "y" : "x",
        responsive: true,
        maintainAspectRatio: !isMobile,
        aspectRatio: isMobile ? 1.4 : 2,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: ${ctx.raw}%` } },
        },
        scales: {},
      },
    };

    if (isMobile) {
      base.options.scales = {
        x: {
          beginAtZero: true,
          max: 100,
          ticks: {
            font: { size: 13, family: "'Poppins', sans-serif" },
            callback: (value) => (value % 20 === 0 ? value + "%" : null),
          },
          grid: { display: true, drawBorder: false },
        },
        y: {
          ticks: { autoSkip: false, font: { size: 13, family: "'Poppins', sans-serif" } },
          grid: { display: false },
        },
      };
    } else {
      base.options.scales = {
        x: { ticks: { autoSkip: false, font: { size: opts.fontSizes.ticks, family: "'Poppins', sans-serif" } }, grid: { display: false } },
        y: { beginAtZero: true, max: 100, ticks: { font: { size: opts.fontSizes.ticks, family: "'Poppins', sans-serif" }, callback: (v) => `${v}%` }, grid: { display: true } },
      };
    }

    return base;
  }

  buildDecisionJourneyConfig() {
    const opts = this.getResponsiveOptions();
    const isMobile = this.isMobile;

    return {
      type: "line",
      data: {
        labels: ["Bulan 1-2", "Bulan 3-4", "Bulan 5-6", "Bulan 7-8", "Bulan 9-10", "Bulan 11-12"],
        datasets: [
          { label: "Kesadaran & Inspirasi", data: [85, 90, 75, 50, 30, 20], borderColor: this.colors.primary, backgroundColor: this.hexToRgba(this.colors.primary, 0.08), fill: true, tension: 0.4, pointRadius: opts.pointRadius },
          { label: "Pencarian Informasi", data: [20, 75, 95, 85, 60, 40], borderColor: this.colors.secondary, backgroundColor: this.hexToRgba(this.colors.secondary, 0.08), fill: true, tension: 0.4, pointRadius: opts.pointRadius },
          { label: "Persiapan & Aplikasi", data: [5, 30, 60, 85, 95, 80], borderColor: this.colors.accent, backgroundColor: this.hexToRgba(this.colors.accent, 0.08), fill: true, tension: 0.4, pointRadius: opts.pointRadius },
          { label: "Keputusan & Realisasi", data: [0, 10, 25, 45, 70, 85], borderColor: this.colors.danger, backgroundColor: this.hexToRgba(this.colors.danger, 0.08), fill: true, tension: 0.4, pointRadius: opts.pointRadius },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: !isMobile,
        aspectRatio: isMobile ? 1.4 : 2,
        interaction: { intersect: false, mode: "index" },
        scales: { y: { beginAtZero: true, max: 100, ticks: { callback: (v) => `${v}%`, font: { size: opts.fontSizes.ticks } } } },
        plugins: {
          legend: { position: "top", labels: { font: { size: opts.fontSizes.legend } } },
          tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y}%` } },
        },
      },
    };
  }

  buildConcernsConfig() {
    const opts = this.getResponsiveOptions();
    const isMobile = this.isMobile;
    const isTablet = this.isTablet;
    const isDesktop = this.isDesktop;

    const labels = isMobile
      ? ["Biaya Hidup", "Biaya Kuliah", "Bahasa", "Visa", "Kultur", "Dukungan", "Karir"]
      : isTablet
      ? ["Biaya Hidup", "Biaya Kuliah", "Persyaratan Bahasa", "Proses Visa", "Kultur & Adaptasi", "Dukungan Keluarga", "Prospek Karir"]
      : ["Biaya Hidup", "Biaya Kuliah", "Persyaratan Bahasa", "Proses Visa", "Kultur & Adaptasi", "Dukungan Keluarga", "Prospek Karir Pasca Studi"];

    return {
      type: "polarArea",
      data: {
        labels,
        datasets: [
          {
            data: [95, 90, 85, 80, 75, 70, 65],
            backgroundColor: [
              this.hexToRgba(this.colors.danger, 0.85),
              this.hexToRgba(this.colors.warning, 0.85),
              this.hexToRgba(this.colors.accent, 0.85),
              this.hexToRgba(this.colors.info, 0.85),
              this.hexToRgba(this.colors.primary, 0.85),
              this.hexToRgba(this.colors.secondary, 0.85),
              this.hexToRgba("#8B5CF6", 0.85),
            ],
            borderColor: "#ffffff",
            borderWidth: isMobile ? 3 : opts.borderWidth,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        aspectRatio: isMobile ? 1 : isTablet ? 1.2 : 1.5,
        animation: { animateRotate: true, animateScale: true, duration: Math.min(1000, this.animationDuration * 2), easing: "easeOutQuart" },
        plugins: {
          legend: {
            position: isMobile ? "top" : isDesktop ? "right" : "bottom",
            labels: { font: { size: isMobile ? 13 : opts.fontSizes.legend }, color: "#374151", usePointStyle: true },
          },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const value = ctx.parsed?.r ?? 0;
                return `${ctx.label}: ${value}%`;
              },
            },
            bodyFont: {
              size: opts.fontSizes.tooltip,
              family: "'Poppins', sans-serif",
            },
            backgroundColor: "rgba(0, 0, 0, 0.8)",
          },
        },
        scales: {
          r: {
            beginAtZero: true,
            min: 0,
            max: 100,
            ticks: { stepSize: 20, callback: (v) => `${v}%`, font: { size: isMobile ? 12 : opts.fontSizes.ticks } },
          },
        },
      },
    };
  }

  buildTimelineConfig() {
    const opts = this.getResponsiveOptions();
    const isMobile = this.isMobile;
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    const engagementData = [45, 52, 58, 62, 68, 75, 82, 88, 85, 78, 70, 65];
    const applicationData = [10, 15, 25, 35, 45, 55, 65, 70, 75, 80, 85, 90];

    return {
      type: "line",
      data: {
        labels: months,
        datasets: [
          { label: "Engagement Media Sosial", data: engagementData, borderColor: this.colors.primary, backgroundColor: this.hexToRgba(this.colors.primary, 0.08), fill: true, tension: 0.4, pointRadius: opts.pointRadius },
          { label: "Aplikasi Beasiswa", data: applicationData, borderColor: this.colors.secondary, backgroundColor: this.hexToRgba(this.colors.secondary, 0.08), fill: true, tension: 0.4, pointRadius: opts.pointRadius },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: !isMobile,
        aspectRatio: isMobile ? 1.4 : 2,
        scales: { y: { beginAtZero: true, max: 100, ticks: { callback: (v) => `${v}%`, font: { size: opts.fontSizes.ticks } } } },
        plugins: { legend: { position: "top" }, tooltip: { bodyFont: { size: opts.fontSizes.tooltip } } },
      },
    };
  }

  buildDemographicConfig() {
    const opts = this.getResponsiveOptions();
    const isMobile = this.isMobile;
    const labels = isMobile ? ["SMA", "S1", "Fresh Grad", "Pro <5th", "Pro >5th"] : ["SMA/Sederajat", "Mahasiswa S1", "Fresh Graduate", "Profesional <5th", "Profesional >5th"];

    return {
      type: "bar",
      data: {
        labels,
        datasets: [
          { label: "Usia 17-19", data: [85, 10, 3, 1, 1], backgroundColor: this.hexToRgba(this.colors.primary, 0.9), borderRadius: isMobile ? 6 : 8 },
          { label: "Usia 20-22", data: [15, 70, 10, 3, 2], backgroundColor: this.hexToRgba(this.colors.secondary, 0.9), borderRadius: isMobile ? 6 : 8 },
          { label: "Usia 23-25", data: [0, 15, 60, 20, 5], backgroundColor: this.hexToRgba(this.colors.accent, 0.9), borderRadius: isMobile ? 6 : 8 },
          { label: "Usia 26+", data: [0, 5, 27, 50, 18], backgroundColor: this.hexToRgba(this.colors.info, 0.9), borderRadius: isMobile ? 6 : 8 },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: !isMobile,
        aspectRatio: isMobile ? 1.4 : 2,
        scales: { x: { stacked: true }, y: { stacked: true, ticks: { callback: (v) => `${v}%`, font: { size: opts.fontSizes.ticks } } } },
        plugins: { legend: { position: "top" } },
      },
    };
  }

  buildScholarshipConfig() {
    const opts = this.getResponsiveOptions();
    const isMobile = this.isMobile;
    const labels = isMobile ? ["Penuh", "Parsial", "Pinjaman", "Mandiri", "Sponsor"] : ["Beasiswa Penuh", "Beasiswa Parsial", "Pinjaman Pendidikan", "Biaya Mandiri", "Sponsor Perusahaan"];
    const data = [65, 20, 10, 3, 2];

    return {
      type: "pie",
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: [this.hexToRgba(this.colors.primary, 0.9), this.hexToRgba(this.colors.secondary, 0.9), this.hexToRgba(this.colors.accent, 0.9), this.hexToRgba(this.colors.info, 0.9), this.hexToRgba(this.colors.danger, 0.9)],
            borderColor: "#FFF",
            borderWidth: isMobile ? 3 : opts.borderWidth,
          },
        ],
      },
      options: { responsive: true, maintainAspectRatio: !isMobile, aspectRatio: isMobile ? 1 : 1.2, plugins: { legend: { position: isMobile ? "bottom" : "right", labels: { font: { size: isMobile ? 13 : opts.fontSizes.legend } } } } },
    };
  }

  /* ===== public helpers ===== */
  initializeAllCharts() {
    // If lazyLoad disabled, create all now. Otherwise ensure observers set.
    if (!this.lazyLoad) {
      this.forceInitializeAllCharts();
    } else {
      this.setupObservers();
    }
  }

  createAllNow() {
    this.forceInitializeAllCharts();
  }
}

/* ===== AUTO INIT ===== */
document.addEventListener("DOMContentLoaded", () => {
  // instantiate with sensible defaults for your report
  const reportCharts = new ReportCharts({ lazyLoad: true, eager: false, animationDuration: 300 });

  // expose for debug / manual control
  window.reportCharts = reportCharts;

  // initialize all (observers are already set in constructor). Keep a safe deferred call
  // to ensure any dynamically injected DOM has time to appear.
  setTimeout(() => {
    try {
      reportCharts.initializeAllCharts();
    } catch (e) {}
  }, 350);

  // teardown on unload
  window.addEventListener("beforeunload", () => reportCharts.destroy());
});
