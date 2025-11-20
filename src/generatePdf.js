// src/generatePdf.js
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

/*
  Default image paths (use the uploaded files from this session).
  If you move images into your app's public/images, change to:
    const LETTERHEAD_URL = process.env.PUBLIC_URL + "/images/LETTER_HEAD.png";
*/
const LETTERHEAD_URL = process.env.PUBLIC_URL + "/images/LETTER_HEAD.png";
const SIGNATURE_URL  = process.env.PUBLIC_URL + "/images/signature_owner.png";

/**
 * helper: fetch ArrayBuffer from url
 */
async function fetchArrayBuffer(url) {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error("Failed to load: " + url + " status:" + resp.status);
  return await resp.arrayBuffer();
}

/**
 * Wrap text into lines given font, size and max width
 */
function wrapText(text, font, size, maxWidth) {
  if (!text) return [];
  const words = String(text).split(/\s+/);
  const lines = [];
  let line = "";
  for (let w of words) {
    const test = line ? line + " " + w : w;
    const width = font.widthOfTextAtSize(test, size);
    if (width <= maxWidth) {
      line = test;
    } else {
      if (line) lines.push(line);
      line = w;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/**
 * Main generator: data, optional imageFiles (File objects or dataURLs)
 *
 * data = { container_no, set_temp, bkg_no, mfg_date, survey_date,
 *          shipper, ac, issued_for, remarks, observations: [{label,status}, ...] }
 *
 * images: array of file objects or dataURLs for image grid (optional)
 */
export default async function generatePdf(data, images = []) {
  // load letterhead and signature
  const [lhBuf, sigBuf] = await Promise.all([
    fetchArrayBuffer(LETTERHEAD_URL).catch(err => { throw new Error("Letterhead load failed: " + err.message); }),
    fetchArrayBuffer(SIGNATURE_URL).catch(() => null)
  ]);

  const pdfDoc = await PDFDocument.create();
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // embed letterhead image
  const lhImage = await pdfDoc.embedPng(lhBuf);
  const lhDims = lhImage.scale(1); // gives width,height (in PDF points)
  const pageWidth = lhDims.width;
  const pageHeight = lhDims.height;

  // We'll use a fixed TOP_START similar to your python code
  const TOP_START = 150;
  const BOTTOM_LIMIT = 10;
  const LEFT = 50;
  const RIGHT = 50;
  const usableWidth = pageWidth - LEFT - RIGHT;

  // helper to create page with background letterhead
  function createPage() {
    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    page.drawImage(lhImage, { x: 0, y: 0, width: pageWidth, height: pageHeight });
    return page;
  }

  // create first page
  let page = createPage();
  let cursorY = pageHeight - TOP_START; // pdf-lib origin is bottom-left, so use direct y

  const lineHeight =12;

  // helper to ensure we have enough vertical space, otherwise create a new page
  function ensureSpace(required = lineHeight) {
    if (cursorY - required < BOTTOM_LIMIT) {
      page = createPage();
      cursorY = pageHeight - TOP_START;
    }
  }

  // helper to draw single line with font
  function drawLine(text, x, y, opts = {}) {
    const { font = helvetica, size = 11, color = rgb(0,0,0) } = opts;
    page.drawText(text, { x, y: y - size, size, font, color });
  }

  // draw centered title
  const title = "EMPTY CONTAINER SURVEY REPORT";
  const titleSize = 10;
  const titleWidth = helveticaBold.widthOfTextAtSize(title, titleSize);
  ensureSpace(titleSize + 6);
  drawLine(title, (pageWidth - titleWidth) / 2, cursorY, { font: helveticaBold, size: titleSize });
  cursorY -= titleSize + 8;

  // intro
  const intro = "THIS IS TO CERTIFY, WE THE UNDERSIGNED MARINE SURVEYORS DID AT THE REQUEST OF";
  const introLines = wrapText(intro, helvetica, 10, usableWidth);
  for (const ln of introLines) {
    ensureSpace(lineHeight);
    drawLine(ln, LEFT, cursorY, { font: helvetica, size: 10 });
    cursorY -= lineHeight;
  }
  cursorY -= 6;

  // details block (left column style)
  const details = [
    ["CONTAINER NO.", data.container_no || ""],
    ["CON PAYLOAD ", data.survey_date || ""],
    ["SET TEMP / HUMIDITY", data.set_temp || ""],
    ["BKG NO, M/LINE", data.bkg_no || ""],
    ["MFG DATE", data.mfg_date || ""]
    
  ];

  for (const [label, value] of details) {
    ensureSpace(lineHeight);
    // label bold then value inline
    const labelText = label + " ";
    const wLabel = helveticaBold.widthOfTextAtSize(labelText, 10);
    drawLine(labelText, LEFT, cursorY, { font: helveticaBold, size: 10 });
    drawLine(String(value), LEFT + wLabel, cursorY, { font: helvetica, size: 10 });
    cursorY -= lineHeight;
  }
  cursorY -= 6;

  // SURVEY OBSERVATION heading
  ensureSpace(lineHeight);
  drawLine("SURVEY OBSERVATION :-", LEFT, cursorY, { font: helveticaBold, size: 11 });
  cursorY -= lineHeight;

  // observation rows (use left label and right-aligned status)
  for (let i = 0; i < (data.observations || []).length; i++) {
    const o = data.observations[i];
    const leftText = `${i + 1}. ${o.label}`;
    const rightText = o.status || "";
    const leftLines = wrapText(leftText, helvetica, 10, usableWidth * 0.65);

    for (let li = 0; li < leftLines.length; li++) {
      ensureSpace(lineHeight);
      drawLine(leftLines[li], LEFT, cursorY, { font: helvetica, size: 10 });
      if (li === 0 && rightText) {
        const sw = helveticaBold.widthOfTextAtSize(rightText, 10);
        drawLine(rightText, pageWidth - RIGHT - sw, cursorY, { font: helveticaBold, size: 10 });
      }
      cursorY -= lineHeight;
    }
  }

  // REMARKS
  cursorY -= 6;
  ensureSpace(lineHeight);
  drawLine("REMARK:-", LEFT, cursorY, { font: helveticaBold, size: 10 });
  cursorY -= lineHeight;
  const remarkLines = wrapText(String(data.remarks || ""), helvetica, 10, usableWidth);
  for (const ln of remarkLines) {
    ensureSpace(lineHeight);
    drawLine(ln, LEFT, cursorY, { font: helvetica, size: 10 });
    cursorY -= lineHeight;
  }

  cursorY -= 8;

  // SHIPPER / A/C / ISSUED
  const footBlock = [
    `Shipper: ${data.shipper || ""}`,
    `A/C: ${data.ac || ""}`,
    `Issued Without Prejudice`,
    `${data.issued_for || ""}`
  ];
  for (const t of footBlock) {
    ensureSpace(lineHeight);
    drawLine(t, LEFT, cursorY, { font: helvetica, size: 10 });
    cursorY -= lineHeight;
  }

  // PLACE signature - attempt to put on current page; if not enough space, make new page
  const sigW = 180;
  const sigH = 90;
  // If not enough space for signature on this page, create new page
  if (cursorY - sigH < BOTTOM_LIMIT) {
    page = createPage();
    cursorY = pageHeight - TOP_START;
  }


  // draw signature if available
  // SIGNATURE (with overlapping text)
if (sigBuf) {
  const sigImage = await pdfDoc.embedPng(sigBuf);

  const sigX = LEFT;
  const sigY = cursorY - sigH;

  // Draw signature image
  page.drawImage(sigImage, {
    x: sigX,
    y: sigY,
    width: sigW,
    height: sigH
  });

  // ---- Overlapping "Authorized Signature" text (center on signature) ----
  const authText = "Authorized Signature";
  const textWidth = helveticaBold.widthOfTextAtSize(authText, 12);

  page.drawText(authText, {
    x: sigX + sigW / 2 - textWidth / 2,
    y: sigY + sigH / 2 - 6,     // ← TOP HALF OF SIGNATURE IMAGE
    size: 12,
    font: helveticaBold,
    color: rgb(0, 0, 0)
  });
  // ------------------------------------------------------------------------

  // Move cursor JUST BELOW signature image
  cursorY = sigY - 30;
} else {
  // No signature image case
  ensureSpace(lineHeight);
  drawLine("Authorized Signature", LEFT, cursorY, {
    font: helveticaBold,
    size: 12
  });
  cursorY -= lineHeight;
}


  // IMAGE GRID: draw user-supplied images (images[] may be File objects or dataURLs)
  // We'll accept both File objects (from input) and data URLs (strings)
  // grid: 3 columns x 2 rows, each image size IMG_W x IMG_H with GAP
  const IMG_W = 140;
  const IMG_H = 100;
  const GAP_X = 20;
  const GAP_Y = 20;
  const cols = 3;

  // If images provided as File objects in browser, convert to arrayBuffers
  const imageBufs = [];
  for (const img of images) {
    try {
      if (typeof img === "string") {
        // data URL or URL: fetch it
        if (img.startsWith("data:")) {
          // convert dataURL to arrayBuffer
          const base64 = img.split(",")[1];
          const bytes = atob(base64);
          const buf = new Uint8Array(bytes.length);
          for (let i = 0; i < bytes.length; i++) buf[i] = bytes.charCodeAt(i);
          imageBufs.push(buf);
        } else {
          // remote/public URL
          const ab = await fetchArrayBuffer(img);
          imageBufs.push(ab);
        }
      } else if (img instanceof File) {
        const ab = await img.arrayBuffer();
        imageBufs.push(ab);
      } else {
        // skip
      }
    } catch (err) {
      console.warn("Skipping image:", err);
    }
  }

  // if there are images, compute required height for grid (2 rows default)
  if (imageBufs.length > 0) {
    const rowsNeeded = Math.ceil(imageBufs.length / cols);
    const gridHeight = rowsNeeded * IMG_H + (rowsNeeded - 1) * GAP_Y + 20;

    if (cursorY - gridHeight < BOTTOM_LIMIT) {
      // new page
      page = createPage();
      cursorY = pageHeight - TOP_START;
    }

    // start drawing grid
    const startY = cursorY;
    for (let idx = 0; idx < imageBufs.length; idx++) {
      const row = Math.floor(idx / cols);
      const col = idx % cols;
      const xPos = LEFT + col * (IMG_W + GAP_X);
      const yPos = startY - row * (IMG_H + GAP_Y) - IMG_H;

      // embed image
      try {
        const emb = await pdfDoc.embedPng(imageBufs[idx]);
        page.drawImage(emb, { x: xPos, y: yPos, width: IMG_W, height: IMG_H });
      } catch (err) {
        // try jpeg
        try {
          const emb = await pdfDoc.embedJpg(imageBufs[idx]);
          page.drawImage(emb, { x: xPos, y: yPos, width: IMG_W, height: IMG_H });
        } catch (e) {
          console.warn("Image embed failed", e);
        }
      }
    }
    // move cursor below grid
    cursorY = startY - rowsNeeded * (IMG_H + GAP_Y) - 20;
  }

  // finalize and download
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `empty_container_survey_${(data.container_no || "report").replace(/\s+/g, "_")}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
