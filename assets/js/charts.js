// Chart Configuration and Initialization
document.addEventListener("DOMContentLoaded", function () {
  // Wait for components to load
  setTimeout(initializeCharts, 100);
});

function initializeCharts() {
  // Check if chart containers exist
  if (!document.getElementById("socialMediaChart") || !document.getElementById("hangoutChart") || !document.getElementById("educationChart")) {
    console.log("Charts not ready yet, retrying...");
    setTimeout(initializeCharts, 200);
    return;
  }

  createSocialMediaChart();
  createHangoutChart();
  createEducationChart();
}

// Common Chart Options
const commonOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        font: { family: "Poppins", size: 12 },
        color: "#292F36",
        padding: 15,
      },
    },
    tooltip: {
      backgroundColor: "rgba(41, 47, 54, 0.95)",
      titleFont: { family: "Poppins", size: 13 },
      bodyFont: { family: "Poppins", size: 12 },
      padding: 12,
      cornerRadius: 8,
      displayColors: true,
    },
  },
};

// Helper function for label wrapping
function wrapLabels(labels, maxChars = 20) {
  return labels.map((label) => {
    if (label.length > maxChars) {
      const words = label.split(" ");
      const lines = [];
      let currentLine = words[0];

      for (let i = 1; i < words.length; i++) {
        if ((currentLine + " " + words[i]).length < maxChars) {
          currentLine += " " + words[i];
        } else {
          lines.push(currentLine);
          currentLine = words[i];
        }
      }
      lines.push(currentLine);
      return lines;
    }
    return label;
  });
}

// 1. Social Media Chart
function createSocialMediaChart() {
  const ctxSocial = document.getElementById("socialMediaChart").getContext("2d");
  new Chart(ctxSocial, {
    type: "doughnut",
    data: {
      labels: wrapLabels(["TikTok (Search & Ent)", "Instagram (Lifestyle)", "X/Twitter (Info & Rant)", "YouTube (Long form)"]),
      datasets: [
        {
          data: [45, 30, 15, 10],
          backgroundColor: ["#FF6B6B", "#4ECDC4", "#FFE66D", "#292F36"],
          borderWidth: 0,
          hoverOffset: 15,
        },
      ],
    },
    options: {
      ...commonOptions,
      cutout: "55%",
      plugins: {
        ...commonOptions.plugins,
        legend: {
          position: "bottom",
          labels: {
            ...commonOptions.plugins.legend.labels,
            boxWidth: 15,
            padding: 20,
          },
        },
      },
    },
  });
}

// 2. Hangout Priority Chart
function createHangoutChart() {
  const ctxHangout = document.getElementById("hangoutChart").getContext("2d");
  new Chart(ctxHangout, {
    type: "bar",
    data: {
      labels: wrapLabels(["Kecepatan WiFi", "Harga Terjangkau", "Colokan Listrik", "Suasana/Vibe", "Rasa Makanan"], 15),
      datasets: [
        {
          label: "Tingkat Prioritas (%)",
          data: [90, 85, 80, 65, 50],
          backgroundColor: "#4ECDC4",
          borderRadius: 6,
          borderSkipped: false,
        },
      ],
    },
    options: {
      ...commonOptions,
      indexAxis: "y",
      plugins: {
        ...commonOptions.plugins,
        legend: { display: false },
      },
      scales: {
        x: {
          beginAtZero: true,
          max: 100,
          grid: {
            display: true,
            color: "rgba(0,0,0,0.05)",
          },
          ticks: {
            callback: function (value) {
              return value + "%";
            },
            font: { size: 11 },
          },
        },
        y: {
          grid: {
            display: false,
          },
          ticks: {
            font: { size: 12 },
          },
        },
      },
    },
  });
}

// 3. Education Barriers Chart
function createEducationChart() {
  const ctxEdu = document.getElementById("educationChart").getContext("2d");
  new Chart(ctxEdu, {
    type: "bar",
    data: {
      labels: wrapLabels(["Biaya Terlalu Mahal", "Jadwal Bentrok", "Lokasi Jauh", "Tidak Ada Teman", "Kurang Info"], 15),
      datasets: [
        {
          label: "Faktor Penghambat (%)",
          data: [85, 70, 60, 45, 40],
          backgroundColor: ["#FF6B6B", "#FF6B6B", "#FFE66D", "#FFE66D", "#4ECDC4"],
          borderRadius: 6,
          borderSkipped: false,
        },
      ],
    },
    options: {
      ...commonOptions,
      plugins: {
        ...commonOptions.plugins,
        legend: { display: false },
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          grid: {
            display: true,
            color: "rgba(0,0,0,0.05)",
          },
          ticks: {
            callback: function (value) {
              return value + "%";
            },
            font: { size: 11 },
          },
        },
        x: {
          grid: {
            display: false,
          },
          ticks: {
            font: { size: 11 },
            maxRotation: 45,
          },
        },
      },
    },
  });
}
