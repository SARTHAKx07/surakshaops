// Builds and downloads branded PDF reports with jsPDF.
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export type ReportData = {
  title: string; from: string; to: string; site: string;
  head: string[]; body: (string | number)[][];
  totals: [string, string | number][];
};

export function downloadReport(r: ReportData) {
  const doc = new jsPDF({ orientation: r.head.length > 6 ? "landscape" : "portrait" });
  const w = doc.internal.pageSize.getWidth();
  doc.setFillColor(22, 32, 54);
  doc.rect(0, 0, w, 26, "F");
  doc.setTextColor(245, 166, 35);
  doc.setFontSize(18); doc.setFont("helvetica", "bold");
  doc.text("SurakshaOps", 14, 12);
  doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(220, 220, 220);
  doc.text("Coal Mine Productivity & Safety Management System — Safer Mines. Smarter Operations.", 14, 19);

  doc.setTextColor(20, 20, 20);
  doc.setFontSize(15); doc.setFont("helvetica", "bold");
  doc.text(r.title, 14, 36);
  doc.setFontSize(9); doc.setFont("helvetica", "normal");
  doc.text(`Site: ${r.site}`, 14, 43);
  doc.text(`Date range: ${r.from || "beginning"} to ${r.to || "today"}`, 14, 48);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 53);

  let y = 60;
  doc.setFont("helvetica", "bold"); doc.text("Summary", 14, y);
  doc.setFont("helvetica", "normal");
  r.totals.forEach(([k, v]) => { y += 5; doc.text(`${k}: ${v}`, 14, y); });

  autoTable(doc, {
    startY: y + 6, head: [r.head], body: r.body.length ? r.body : [["No records in this date range"]],
    styles: { fontSize: 8, cellPadding: 2 }, headStyles: { fillColor: [22, 32, 54], textColor: [245, 166, 35] },
  });

  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i); doc.setFontSize(8); doc.setTextColor(120);
    doc.text(`SurakshaOps prototype report — page ${i} of ${pages}`, 14, doc.internal.pageSize.getHeight() - 8);
  }
  doc.save(`SurakshaOps_${r.title.replace(/\W+/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`);
}
