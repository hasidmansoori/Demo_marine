import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

/*
  IMAGE PATHS: use public folder so process.env.PUBLIC_URL is correct after build.
  The uploaded session files were copied into public/images during ZIP creation.
*/
const LETTERHEAD_URL = process.env.PUBLIC_URL + "/images/LETTER_HEAD.png";
const SIGNATURE_URL = process.env.PUBLIC_URL + "/images/signature_owner.png";

/**
 * fetch ArrayBuffer
 */
async function fetchArrayBuffer(url){
  const r = await fetch(url);
  if(!r.ok) throw new Error("Failed to load: "+url+" status:"+r.status);
  return await r.arrayBuffer();
}

function wrapText(text,font,size,maxWidth){
  if(!text) return [];
  const words = String(text).split(/\s+/);
  const lines = [];
  let line = "";
  for(const w of words){
    const test = line? line + " " + w : w;
    const width = font.widthOfTextAtSize(test,size);
    if(width <= maxWidth) line = test; else { if(line) lines.push(line); line = w; }
  }
  if(line) lines.push(line);
  return lines;
}

export default async function generatePdf(data, images=[]){
  const [lhBuf, sigBuf] = await Promise.all([
    fetchArrayBuffer(LETTERHEAD_URL),
    fetchArrayBuffer(SIGNATURE_URL).catch(()=>null)
  ]);

  const pdfDoc = await PDFDocument.create();
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const lhImage = await pdfDoc.embedPng(lhBuf);
  const lhDims = lhImage.scale(1);
  const pageWidth = lhDims.width;
  const pageHeight = lhDims.height;

  const TOP_START = 150;
  const BOTTOM_LIMIT = 40;
  const LEFT = 50;
  const RIGHT = 50;
  const usableWidth = pageWidth - LEFT - RIGHT;
  const lineHeight = 12;

  function createPage(){
    const page = pdfDoc.addPage([pageWidth,pageHeight]);
    page.drawImage(lhImage,{x:0,y:0,width:pageWidth,height:pageHeight});
    return page;
  }

  let page = createPage();
  let cursorY = pageHeight - TOP_START;

  function ensureSpace(required = lineHeight){
    if(cursorY - required < BOTTOM_LIMIT){
      page = createPage();
      cursorY = pageHeight - TOP_START;
    }
  }

  function drawLine(text,x,y,opts={}){
    const {font=helvetica,size=8,color=rgb(0,0,0)} = opts;
    page.drawText(text,{x,y: y - size,size,font,color});
  }

  // title
  const title = "EMPTY CONTAINER SURVEY REPORT";
  const titleSize = 12;
  const titleWidth = helveticaBold.widthOfTextAtSize(title,titleSize);
  ensureSpace(titleSize+6);
  drawLine(title,(pageWidth - titleWidth)/2,cursorY,{font:helveticaBold,size:titleSize});
  cursorY -= titleSize + 8;

  // intro
  const intro = "THIS IS TO CERTIFY, WE THE UNDERSIGNED MARINE SURVEYORS DID AT THE REQUEST OF";
  const introLines = wrapText(intro,helvetica,8,usableWidth);
  for(const ln of introLines){ ensureSpace(lineHeight); drawLine(ln,LEFT,cursorY,{font:helvetica,size:8}); cursorY -= lineHeight; }
  cursorY -= 6;

  // details
  const details = [
    ["CONTAINER NO.", data.container_no || ""],
    ["SET TEMP / HUMIDITY", data.set_temp || ""],
    ["BKG NO, M/LINE", data.bkg_no || ""],
    ["MFG DATE", data.mfg_date || ""],
    ["SURVEY DATE", data.survey_date || ""]
  ];
  for (const [label, value] of details) {
  if (!value || value.trim() === "") continue;  // ⛔ skip empty fields

  ensureSpace(lineHeight);
  const labelText = label + " ";
  const wLabel = helveticaBold.widthOfTextAtSize(labelText, 8);

  drawLine(labelText, LEFT, cursorY, { font: helveticaBold, size: 8 });
  drawLine(String(value), LEFT + wLabel, cursorY, { font: helvetica, size: 8 });

  cursorY -= lineHeight;
}

  cursorY -= 6;

// --------------------------------------------------
// TABLE: SURVEY OBSERVATION (WITH FULL DIVIDERS)
// --------------------------------------------------
ensureSpace(lineHeight + 10);
drawLine("SURVEY OBSERVATION :-", LEFT, cursorY, {
  font: helveticaBold,
  size: 10
});
cursorY -= lineHeight + 10;

// TABLE DIMENSIONS
const col1W = 30;     // SL NO
const col2W = 300;    // Observation Label
const col3W = 140;    // Status
const rowH = 18;

// HEADER DRAW FUNCTION
function drawTableHeader() {
  ensureSpace(rowH);

  // full header box
  page.drawRectangle({
    x: LEFT,
    y: cursorY - rowH,
    width: col1W + col2W + col3W,
    height: rowH,
    borderColor: rgb(0, 0, 0),
    borderWidth: 1
  });

  // vertical dividers
  page.drawLine({
    start: { x: LEFT + col1W, y: cursorY },
    end: { x: LEFT + col1W, y: cursorY - rowH },
    thickness: 1,
    color: rgb(0, 0, 0)
  });

  page.drawLine({
    start: { x: LEFT + col1W + col2W, y: cursorY },
    end: { x: LEFT + col1W + col2W, y: cursorY - rowH },
    thickness: 1,
    color: rgb(0, 0, 0)
  });

  // header text
  page.drawText("SL", {
    x: LEFT + 5,
    y: cursorY - 12,
    size: 8,
    font: helveticaBold
  });

  page.drawText("OBSERVATION", {
    x: LEFT + col1W + 5,
    y: cursorY - 12,
    size: 8,
    font: helveticaBold
  });

  page.drawText("STATUS", {
    x: LEFT + col1W + col2W + 5,
    y: cursorY - 12,
    size: 8,
    font: helveticaBold
  });

  cursorY -= rowH;
}

drawTableHeader();

let rowIndex = 1;

for (let i = 0; i < data.observations.length; i++) {
  const o = data.observations[i];

  // Skip completely blank rows
  if (!o.status && !o.label) continue;

  const leftLines = wrapText(o.label, helvetica, 8, col2W - 10);
  const statusLines = wrapText(o.status || "", helveticaBold, 8, col3W - 10);

  const maxLines = Math.max(leftLines.length, statusLines.length);
  const blockHeight = maxLines * rowH;

  // PAGE BREAK
  if (cursorY - blockHeight < BOTTOM_LIMIT) {
    page = createPage();
    cursorY = pageHeight - TOP_START;
    drawTableHeader();
  }

  // ---- OUTER ROW RECTANGLE ----
  page.drawRectangle({
    x: LEFT,
    y: cursorY - blockHeight,
    width: col1W + col2W + col3W,
    height: blockHeight,
    borderColor: rgb(0, 0, 0),
    borderWidth: 1
  });

  // ---- VERTICAL LINES ----
  page.drawLine({
    start: { x: LEFT + col1W, y: cursorY },
    end: { x: LEFT + col1W, y: cursorY - blockHeight },
    thickness: 1,
    color: rgb(0, 0, 0)
  });

  page.drawLine({
    start: { x: LEFT + col1W + col2W, y: cursorY },
    end: { x: LEFT + col1W + col2W, y: cursorY - blockHeight },
    thickness: 1,
    color: rgb(0, 0, 0)
  });

  // ---- SL NUMBER ----
  page.drawText(String(rowIndex), {
    x: LEFT + 5,
    y: cursorY - 12,
    size: 8,
    font: helvetica
  });

  // ---- OBSERVATION LABEL (multi-line) ----
  leftLines.forEach((line, li) => {
    page.drawText(line, {
      x: LEFT + col1W + 5,
      y: cursorY - 12 - li * rowH,
      size: 8,
      font: helvetica
    });
  });

  // ---- STATUS (multi-line, bold) ----
  statusLines.forEach((line, li) => {
    page.drawText(line, {
      x: LEFT + col1W + col2W + 5,
      y: cursorY - 12 - li * rowH,
      size: 8,
      font: helveticaBold
    });
  });

  cursorY -= blockHeight;
  rowIndex++;
}



  // remarks
  cursorY -= 6;
  ensureSpace(lineHeight);
  drawLine("REMARK:-",LEFT,cursorY,{font:helveticaBold,size:8});
  cursorY -= lineHeight;
  const remarkLines = wrapText(String(data.remarks || ""),helvetica,8,usableWidth);
  for(const ln of remarkLines){ ensureSpace(lineHeight); drawLine(ln,LEFT,cursorY,{font:helvetica,size:8}); cursorY -= lineHeight; }
  cursorY -= 8;

  // footer
  // FOOTER SECTION
const issuedFor = data.issued_for || "";

// Shipper
if (data.shipper && data.shipper.trim() !== "") {
  ensureSpace(lineHeight);
  drawLine(`Shipper: ${data.shipper}`, LEFT, cursorY, { size: 8, font: helvetica });
  cursorY -= lineHeight;
}



// Issued Without Prejudice
ensureSpace(lineHeight);
drawLine("Issued Without Prejudice", LEFT, cursorY, { size: 8, font: helvetica });
cursorY -= lineHeight;

// ISSUED FOR (Bold + Big)
if (issuedFor.trim() !== "") {
  ensureSpace(18);
  drawLine(issuedFor, LEFT, cursorY, { size: 12, font: helveticaBold });
  cursorY -= 18;
}


  // signature
  const sigW = 180; const sigH = 90;
  if(cursorY - sigH < BOTTOM_LIMIT){ page = createPage(); cursorY = pageHeight - TOP_START; }
  if(sigBuf){
    const sigImage = await pdfDoc.embedPng(sigBuf);
    const sigX = LEFT;
    const sigY = cursorY - sigH;
    page.drawImage(sigImage,{x:sigX,y:sigY,width:sigW,height:sigH});
    // overlapping authorized signature text (smaller)
    const authText = "Authorized Signature";
    const authSize = 8;
    const textWidth = helveticaBold.widthOfTextAtSize(authText,authSize);
    page.drawText(authText,{x: sigX + sigW/2 - textWidth/2, y: sigY + sigH/2 - 4, size: authSize, font: helveticaBold, color: rgb(0,0,0)});
    cursorY = sigY - 30;
  } else {
    ensureSpace(lineHeight); drawLine("Authorized Signature",LEFT,cursorY,{font:helveticaBold,size:8}); cursorY -= lineHeight;
  }

  // image grid unlimited
// ----------------------------
// 🔥 UNLIMITED IMAGES — 2 PER ROW — WORKING PERFECTLY
// ----------------------------
const IMG_W = 160;
const IMG_H = 120;
const GAP_X = 20;
const GAP_Y = 35;
const COLS = 2;

if (images.length > 0) {
  let col = 0; // column index (0 or 1)

  for (let i = 0; i < images.length; i++) {
    const imgObj = images[i];
    const imgTitle = imgObj.title || "";

    // If starting new row (col == 0) AND not first image → move down
    if (col === 0 && i !== 0) {
      cursorY -= IMG_H + GAP_Y;
    }

    // Page break logic BEFORE drawing images of new row
    if (cursorY - IMG_H < BOTTOM_LIMIT) {
      page = createPage();
      cursorY = pageHeight - TOP_START;
      col = 0; // reset to first column
    }

    // Compute image position
    const xPos = LEFT + col * (IMG_W + GAP_X);
    const yPos = cursorY - IMG_H;

    // Draw image
    try {
      const ab = await imgObj.file.arrayBuffer();
      let emb;
      try {
        emb = await pdfDoc.embedPng(ab);
      } catch {
        emb = await pdfDoc.embedJpg(ab);
      }

      page.drawImage(emb, {
        x: xPos,
        y: yPos,
        width: IMG_W,
        height: IMG_H,
      });

      // Draw title above image
      if (imgTitle.trim() !== "") {
        page.drawText(imgTitle, {
          x: xPos,
          y: yPos + IMG_H + 6,
          size: 8,
          font: helveticaBold,
          color: rgb(0, 0, 0),
        });
      }
    } catch (err) {
      console.warn("Image embed failed:", err);
    }

    // NEXT COLUMN
    col++;

    // After 2 columns, reset to next row
    if (col >= COLS) {
      col = 0;
    }
  }

  // Move cursor after last row
  cursorY -= IMG_H + 20;
}




  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes],{type:"application/pdf"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `empty_container_survey_${(data.container_no||"report").replace(/\s+/g,"_")}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
