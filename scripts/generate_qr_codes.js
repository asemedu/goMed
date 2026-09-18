import fs from "fs";
import path from "path";
import QRCode from "qrcode";

const stations = [
  { id: "siguranta_baze", name: "Siguranță, Legislație și Baze", category: "legal", color: "#4F46E5" },
  { id: "apel_112_abc", name: "Apelul la 112 și Evaluarea ABC", category: "emergency", color: "#DC2626" },
  { id: "rcp_adulti", name: "Resuscitarea Cardio-Pulmonară - Adulți", category: "cpr", color: "#3D6B2A" },
  { id: "aed", name: "Defibrilatorul Extern Automat", category: "aed", color: "#0284C7" },
  { id: "pls", name: "Poziția Laterală de Siguranță", category: "safety", color: "#0D9488" },
  { id: "dezobstructie", name: "Dezobstrucția Căilor Aeriene", category: "airway", color: "#D97706" },
  { id: "urgente_medicale_1", name: "Urgențe Medicale 1", category: "medical", color: "#2563EB" },
  { id: "traume_hemoragii", name: "Traume și Hemoragii", category: "trauma", color: "#C0384E" },
  { id: "arsuri", name: "Arsuri", category: "burns", color: "#EA580C" },
  { id: "urgente_mediu_intoxicatii", name: "Urgențe de Mediu și Intoxicații", category: "toxicology", color: "#7C3AED" },
];

const targetDirs = [
  path.resolve("./qr-stations"),
  path.resolve("./public/qr-stations"),
];

targetDirs.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

async function generateAll() {
  console.log("Generating QR codes for Treasure Hunt stations...");

  const cardsHtml = [];

  for (const station of stations) {
    const qrData = `GOMED:STATION:${station.id}`;
    const filename = `station_${station.id}.png`;

    for (const dir of targetDirs) {
      const filePath = path.join(dir, filename);
      await QRCode.toFile(filePath, qrData, {
        width: 600,
        margin: 2,
        color: {
          dark: "#1A2816",
          light: "#FFFFFF",
        },
      });
    }

    console.log(`Generated: ${filename} -> "${qrData}"`);

    const dataUrl = await QRCode.toDataURL(qrData, {
      width: 400,
      margin: 1,
      color: { dark: "#1A2816", light: "#FFFFFF" },
    });

    cardsHtml.push(`
      <div class="card">
        <div class="header">
          <div class="brand">goMed · Vânătoare de Comori</div>
          <div class="category">${station.category.toUpperCase()}</div>
        </div>
        <div class="title">${station.name}</div>
        <div class="qr-box">
          <img src="${dataUrl}" alt="${station.name}" />
        </div>
        <div class="code-badge">COD: ${station.id.toUpperCase()}</div>
        <div class="footer">Scanează cu aplicația goMed pentru a debloca întrebările</div>
      </div>
    `);
  }

  const printSheetHtml = `<!DOCTYPE html>
<html lang="ro">
<head>
  <meta charset="UTF-8" />
  <title>Fișe QR Stații — Vânătoare de Comori goMed</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', -apple-system, sans-serif; background: #f0f4ee; padding: 20px; color: #1a2816; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; max-width: 1200px; margin: 0 auto; }
    .card { background: white; border-radius: 20px; border: 2px solid #b3d59f; padding: 20px; text-align: center; page-break-inside: avoid; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .brand { font-size: 11px; font-weight: 800; color: #3d6b2a; text-transform: uppercase; letter-spacing: 0.5px; }
    .category { font-size: 9px; font-weight: 800; background: #e8f5e2; color: #3d6b2a; padding: 2px 8px; border-radius: 6px; }
    .title { font-size: 17px; font-weight: 800; color: #1a2816; margin-bottom: 15px; min-height: 44px; display: flex; align-items: center; justify-content: center; }
    .qr-box { background: #f7fbf5; border: 2px dashed #b3d59f; border-radius: 16px; padding: 12px; margin: 0 auto 12px; width: 200px; height: 200px; display: flex; align-items: center; justify-content: center; }
    .qr-box img { width: 100%; height: 100%; object-fit: contain; }
    .code-badge { font-family: monospace; font-size: 12px; font-weight: 700; color: #3d6b2a; background: #f0f8ec; padding: 4px 10px; border-radius: 8px; display: inline-block; margin-bottom: 10px; letter-spacing: 1px; }
    .footer { font-size: 11px; color: #6b7c6b; line-height: 1.3; }
    @media print {
      body { background: white; padding: 0; }
      .grid { grid-template-columns: repeat(2, 1fr); gap: 15px; }
      .card { border: 2px solid #3d6b2a; box-shadow: none; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div style="max-width: 1200px; margin: 0 auto 20px; display: flex; justify-content: space-between; align-items: center;" class="no-print">
    <div>
      <h1 style="font-size: 24px; font-weight: 800; color: #1a2816;">Fișe QR — Vânătoare de Comori</h1>
      <p style="color: #6b7c6b; font-size: 14px;">10 Stații de Prim Ajutor pentru amplasat în școală</p>
    </div>
    <button onclick="window.print()" style="background: #b3d59f; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 800; font-size: 14px; color: #1a3312; cursor: pointer;">
      🖨️ Printează Fișele
    </button>
  </div>
  <div class="grid">
    ${cardsHtml.join("")}
  </div>
</body>
</html>`;

  targetDirs.forEach((dir) => {
    fs.writeFileSync(path.join(dir, "print_stations.html"), printSheetHtml);
  });

  console.log("All QR station codes and print sheet generated successfully!");
}

generateAll().catch(console.error);
