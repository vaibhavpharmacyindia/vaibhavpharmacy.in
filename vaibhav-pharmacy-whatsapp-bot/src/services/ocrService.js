const Tesseract = require("tesseract.js");
const sharp = require("sharp");

// ─── Pre-process image for better OCR results ─────────────────
async function preprocessImage(imageBuffer) {
  try {
    return await sharp(imageBuffer)
      .grayscale()
      .normalize()
      .sharpen()
      .resize({ width: 2000, withoutEnlargement: true })
      .toBuffer();
  } catch (err) {
    console.error("Image preprocessing error:", err.message);
    return imageBuffer; // Fall back to original
  }
}

// ─── Extract text from prescription image ─────────────────────
async function extractTextFromImage(imageBuffer) {
  try {
    const processed = await preprocessImage(imageBuffer);

    const { data } = await Tesseract.recognize(processed, "eng", {
      logger: (info) => {
        if (info.status === "recognizing text") {
          process.stdout.write(`\rOCR Progress: ${(info.progress * 100).toFixed(0)}%`);
        }
      },
    });

    console.log("\n✅ OCR complete");
    return data.text;
  } catch (err) {
    console.error("OCR error:", err.message);
    return null;
  }
}

// ─── Parse medicine names from OCR text ───────────────────────
function parseMedicines(ocrText) {
  if (!ocrText) return [];

  const lines = ocrText
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 2);

  const medicines = [];

  // Common patterns in prescriptions:
  // - Tab/Tab. MedicineName Dosage
  // - Cap/Cap. MedicineName Dosage
  // - Syp/Syp. MedicineName Dosage
  // - Inj/Inj. MedicineName Dosage
  const rxPatterns = [
    /(?:Tab\.?|Tablet)\s+([A-Za-z][A-Za-z0-9\-\s]+?)(?:\s+\d|$)/i,
    /(?:Cap\.?|Capsule)\s+([A-Za-z][A-Za-z0-9\-\s]+?)(?:\s+\d|$)/i,
    /(?:Syp\.?|Syrup)\s+([A-Za-z][A-Za-z0-9\-\s]+?)(?:\s+\d|$)/i,
    /(?:Inj\.?|Injection)\s+([A-Za-z][A-Za-z0-9\-\s]+?)(?:\s+\d|$)/i,
    /(?:Oint\.?|Ointment)\s+([A-Za-z][A-Za-z0-9\-\s]+?)(?:\s+\d|$)/i,
    /(?:Drop\.?|Drops)\s+([A-Za-z][A-Za-z0-9\-\s]+?)(?:\s+\d|$)/i,
  ];

  // Dosage patterns: 1-0-1, BD, OD, TDS, etc.
  const dosagePattern = /(\d[\-\/]\d[\-\/]\d|[Oo][Dd]|[Bb][Dd]|[Tt][Dd][Ss]|[Qq][Ii][Dd]|[Ss][Oo][Ss]|[Hh][Ss])/;

  for (const line of lines) {
    for (const pattern of rxPatterns) {
      const match = line.match(pattern);
      if (match) {
        const name = match[1].trim();
        const dosageMatch = line.match(dosagePattern);

        medicines.push({
          name,
          type: line.match(/Tab|Tablet/i) ? "Tablet" :
                line.match(/Cap|Capsule/i) ? "Capsule" :
                line.match(/Syp|Syrup/i) ? "Syrup" :
                line.match(/Inj|Injection/i) ? "Injection" :
                line.match(/Oint|Ointment/i) ? "Ointment" :
                "Drops",
          dosage: dosageMatch ? dosageMatch[1] : null,
          rawLine: line,
        });
        break;
      }
    }
  }

  return medicines;
}

module.exports = { extractTextFromImage, parseMedicines };
