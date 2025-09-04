const form = document.getElementById("exam-form");
const historyList = document.getElementById("exam-history");
const clearBtn = document.getElementById("clear-history");
const themeBtn = document.getElementById("theme-toggle");
const exportExcelBtn = document.getElementById("export-excel");
const exportPdfBtn = document.getElementById("export-pdf");
const ctx = document.getElementById("examChart").getContext("2d");

let exams = JSON.parse(localStorage.getItem("exams")) || [];
let chart;

// ================= tema claro/escuro =================
function loadTheme() {
  const theme = localStorage.getItem("theme") || "light";
  document.body.classList.toggle("dark", theme === "dark");
}
themeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
  updateChart(exams);
});
loadTheme();

// ================= histórico =================
function renderHistory() {
  historyList.innerHTML = "";
  exams.forEach(ex => {
    const li = document.createElement("li");

    let colIcon = "✅";
    if (ex.chol > 240) colIcon = "🚨";
    else if (ex.chol > 200) colIcon = "⚠️";

    let trigIcon = "✅";
    if (ex.trig > 200) trigIcon = "🚨";
    else if (ex.trig > 150) trigIcon = "⚠️";

    li.innerHTML = `
      📅 ${ex.date} <br>
      🩸 Colesterol: ${ex.chol} mg/dL ${colIcon} <br>
      🧪 Triglicerídeos: ${ex.trig} mg/dL ${trigIcon}
    `;
    historyList.appendChild(li);
  });
}

// ================= gráfico =================
function updateChart(history) {
  const labels = history.map(ex => ex.date);
  const cholValues = history.map(ex => parseFloat(ex.chol));
  const trigValues = history.map(ex => parseFloat(ex.trig));

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Colesterol",
          data: cholValues,
          borderColor: "#2f81f7",
          backgroundColor: "#2f81f733",
          tension: 0.3,
          fill: true,
          yAxisID: "yColesterol"
        },
        {
          label: "Triglicerídeos",
          data: trigValues,
          borderColor: "#f778ba",
          backgroundColor: "#f778ba33",
          tension: 0.3,
          fill: true,
          yAxisID: "yTriglicerideos"
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color: getComputedStyle(document.body).getPropertyValue("--text") } },
        annotation: {
          annotations: {
            colVerde: { type: 'box', yScaleID: 'yColesterol', yMin: 0, yMax: 200, backgroundColor: 'rgba(34,197,94,0.1)' },
            colAmarelo: { type: 'box', yScaleID: 'yColesterol', yMin: 200, yMax: 240, backgroundColor: 'rgba(245,158,11,0.1)' },
            colVermelho: { type: 'box', yScaleID: 'yColesterol', yMin: 240, yMax: 400, backgroundColor: 'rgba(239,68,68,0.1)' },
            trigVerde: { type: 'box', yScaleID: 'yTriglicerideos', yMin: 0, yMax: 150, backgroundColor: 'rgba(34,197,94,0.1)' },
            trigAmarelo: { type: 'box', yScaleID: 'yTriglicerideos', yMin: 150, yMax: 200, backgroundColor: 'rgba(245,158,11,0.1)' },
            trigVermelho: { type: 'box', yScaleID: 'yTriglicerideos', yMin: 200, yMax: 400, backgroundColor: 'rgba(239,68,68,0.1)' }
          }
        }
      },
      scales: {
        x: { ticks: { color: getComputedStyle(document.body).getPropertyValue("--text") } },
        yColesterol: { position: "left", title: { display: true, text: "Colesterol (mg/dL)" }, ticks: { color: getComputedStyle(document.body).getPropertyValue("--text") }, min: 0, max: 400 },
        yTriglicerideos: { position: "right", title: { display: true, text: "Triglicerídeos (mg/dL)" }, ticks: { color: getComputedStyle(document.body).getPropertyValue("--text") }, min: 0, max: 400, grid: { drawOnChartArea: false } }
      }
    }
  });
}

// ================= eventos =================
form.addEventListener("submit", e => {
  e.preventDefault();
  const date = document.getElementById("exam-date").value;
  const chol = document.getElementById("cholesterol").value;
  const trig = document.getElementById("triglycerides").value;

  if (date && chol && trig) {
    exams.push({ date, chol, trig });
    localStorage.setItem("exams", JSON.stringify(exams));
    renderHistory();
    updateChart(exams);
    form.reset();
  }
});

clearBtn.addEventListener("click", () => {
  if (confirm("Deseja realmente limpar todo o histórico?")) {
    exams = [];
    localStorage.removeItem("exams");
    renderHistory();
    updateChart(exams);
  }
});

// ================= exportar Excel =================
exportExcelBtn.addEventListener("click", () => {
  if (exams.length === 0) return alert("Não há exames para exportar.");
  const ws_data = [["Data","Colesterol","Triglicerídeos"]];
  exams.forEach(ex => ws_data.push([ex.date, ex.chol, ex.trig]));
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(ws_data);
  XLSX.utils.book_append_sheet(wb, ws, "Exames");
  XLSX.writeFile(wb, "CARDIOLOG_Exames.xlsx");
});

// ================= exportar PDF =================
exportPdfBtn.addEventListener("click", () => {
  if (exams.length === 0) return alert("Não há exames para exportar.");
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.setFontSize(12);
  doc.text("CARDIOLOG - Histórico de Exames", 14, 20);
  let y = 30;
  exams.forEach(ex => {
    doc.text(`📅 ${ex.date} | Colesterol: ${ex.chol} mg/dL | Triglicerídeos: ${ex.trig} mg/dL`, 14, y);
    y += 10;
  });
  doc.save("CARDIOLOG_Exames.pdf");
});

// inicialização
renderHistory();
updateChart(exams);
