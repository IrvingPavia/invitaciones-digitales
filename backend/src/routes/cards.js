const router = require('express').Router();
const { getDB } = require('../models/database');
const auth = require('../middleware/auth');
const QRCode = require('qrcode');

router.get('/:eventId', auth, async (req, res) => {
  try {
    const [rows] = await getDB().query('SELECT * FROM card_templates WHERE event_id = ?', [req.params.eventId]);
    if (!rows[0]) return res.json({ front_config: {}, back_config: {} });
    res.json({
      ...rows[0],
      front_config: JSON.parse(rows[0].front_config || '{}'),
      back_config: JSON.parse(rows[0].back_config || '{}')
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:eventId', auth, async (req, res) => {
  try {
    const { front_config, back_config } = req.body;
    const [existing] = await getDB().query('SELECT id FROM card_templates WHERE event_id = ?', [req.params.eventId]);
    if (existing.length) {
      await getDB().query(
        'UPDATE card_templates SET front_config=?, back_config=? WHERE event_id=?',
        [JSON.stringify(front_config), JSON.stringify(back_config), req.params.eventId]
      );
    } else {
      await getDB().query(
        'INSERT INTO card_templates (event_id, front_config, back_config) VALUES (?, ?, ?)',
        [req.params.eventId, JSON.stringify(front_config), JSON.stringify(back_config)]
      );
    }
    res.json({ message: 'Plantilla guardada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:eventId/pdf', auth, async (req, res) => {
  try {
    const [events] = await getDB().query('SELECT * FROM events WHERE id = ?', [req.params.eventId]);
    if (!events[0]) return res.status(404).json({ error: 'Evento no encontrado' });
    const event = events[0];

    const [templates] = await getDB().query('SELECT * FROM card_templates WHERE event_id = ?', [req.params.eventId]);
    const frontConfig = templates[0] ? JSON.parse(templates[0].front_config || '{}') : {};
    const backConfig = templates[0] ? JSON.parse(templates[0].back_config || '{}') : {};

    const layout = frontConfig.pdfLayout || { orientation: 'portrait', cardsPerPage: 6, showCutMarks: true, margin: 10 };
    const cardWidth = frontConfig.width || 90;
    const cardHeight = frontConfig.height || 50;

    let html;

    if (event.event_mode === 'open') {
      html = await generateGenericCardsHTML(event, frontConfig, backConfig, layout, cardWidth, cardHeight);
    } else {
      const [guests] = await getDB().query('SELECT * FROM guests WHERE event_id = ?', [req.params.eventId]);
      if (!guests.length) return res.status(400).json({ error: 'No hay invitados para generar tarjetas' });
      html = await generateCardsHTML(event, guests, frontConfig, backConfig, layout, cardWidth, cardHeight);
    }

    const puppeteer = require('puppeteer');
    const browser = await puppeteer.launch({
      headless: 'new',
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 });

    const pageSizeMap = { letter: 'Letter', a4: 'A4', legal: 'Legal' };
    const pdfFormat = pageSizeMap[layout.pageSize] || 'Letter';

    const pdfBuffer = await page.pdf({
      format: pdfFormat,
      landscape: layout.orientation === 'landscape',
      printBackground: true,
      margin: { top: '0mm', bottom: '0mm', left: '0mm', right: '0mm' }
    });

    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="tarjetas_${event.name}.pdf"`);
    res.send(pdfBuffer);
  } catch (err) {
    console.error('PDF generation error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Preview: generate only first page, return inline (no download)
router.get('/:eventId/pdf/preview', auth, async (req, res) => {
  try {
    const [events] = await getDB().query('SELECT * FROM events WHERE id = ?', [req.params.eventId]);
    if (!events[0]) return res.status(404).json({ error: 'Evento no encontrado' });
    const event = events[0];

    const [templates] = await getDB().query('SELECT * FROM card_templates WHERE event_id = ?', [req.params.eventId]);
    const frontConfig = templates[0] ? JSON.parse(templates[0].front_config || '{}') : {};
    const backConfig = templates[0] ? JSON.parse(templates[0].back_config || '{}') : {};

    const layout = frontConfig.pdfLayout || { orientation: 'portrait', cardsPerPage: 6, showCutMarks: true, margin: 10 };
    const cardWidth = frontConfig.width || 90;
    const cardHeight = frontConfig.height || 50;

    let html;

    if (event.event_mode === 'open') {
      html = await generateGenericCardsHTML(event, frontConfig, backConfig, layout, cardWidth, cardHeight, true);
    } else {
      let [guests] = await getDB().query('SELECT * FROM guests WHERE event_id = ? LIMIT 4', [req.params.eventId]);
      if (!guests.length) {
        guests = [
          { id: 0, family_name: 'Familia García', guest_names: 'Juan, María', unique_code: 'DEMO01', guest_type: 'family', max_companions: 2 },
          { id: 0, family_name: 'Pedro López', guest_names: 'Pedro López', unique_code: 'DEMO02', guest_type: 'individual', max_companions: 0 }
        ];
      }
      html = await generateCardsHTML(event, guests, frontConfig, backConfig, layout, cardWidth, cardHeight);
    }

    const puppeteer = require('puppeteer');
    const browser = await puppeteer.launch({
      headless: 'new',
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 });

    const pageSizeMap = { letter: 'Letter', a4: 'A4', legal: 'Legal' };
    const pdfFormat = pageSizeMap[layout.pageSize] || 'Letter';

    const pdfBuffer = await page.pdf({
      format: pdfFormat,
      landscape: layout.orientation === 'landscape',
      printBackground: true,
      margin: { top: '0mm', bottom: '0mm', left: '0mm', right: '0mm' },
      pageRanges: '1'
    });

    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline');
    res.send(pdfBuffer);
  } catch (err) {
    console.error('PDF preview error:', err);
    res.status(500).json({ error: err.message });
  }
});


// ============================================================
// GENERATE CARDS HTML — Private events (per-guest)
// ============================================================
async function generateCardsHTML(event, guests, frontConfig, backConfig, layout, cardWidth, cardHeight) {
  const cardsPerPage = layout.cardsPerPage || 6;
  const margin = layout.margin || 10;
  const showCutMarks = layout.showCutMarks !== false;
  const gap = layout.gap !== undefined ? layout.gap : 3;
  const frontOnly = layout.sides === 'front-only';

  const pageSizes = { letter: [216, 279], a4: [210, 297], legal: [216, 356] };
  const [baseW, baseH] = pageSizes[layout.pageSize] || pageSizes['letter'];
  const pageW = layout.orientation === 'landscape' ? baseH : baseW;
  const pageH = layout.orientation === 'landscape' ? baseW : baseH;
  const usableW = pageW - margin * 2;
  const usableH = pageH - margin * 2;

  if (frontOnly) {
    if (cardWidth > usableW) cardWidth = usableW;
    if (cardHeight > usableH) cardHeight = usableH;
  } else {
    const maxW = Math.floor(usableW / 2 - gap);
    if (cardWidth > maxW) cardWidth = maxW;
    if (cardHeight > usableH) cardHeight = usableH;
  }

  let sideBySide = false;
  let pairW, pairH;
  if (frontOnly) {
    pairW = cardWidth;
    pairH = cardHeight;
  } else {
    const pairWidthSideBySide = cardWidth * 2 + gap;
    sideBySide = pairWidthSideBySide <= usableW;
    if (sideBySide) { pairW = pairWidthSideBySide; pairH = cardHeight; }
    else { pairW = cardWidth; pairH = cardHeight * 2 + gap; }
  }

  const cols = Math.floor((usableW + gap) / (pairW + gap)) || 1;
  const rows = Math.floor((usableH + gap) / (pairH + gap)) || 1;
  const actualPerPage = Math.min(cols * rows, cardsPerPage);

  let pages = '';
  for (let i = 0; i < guests.length; i += actualPerPage) {
    const pageGuests = guests.slice(i, i + actualPerPage);
    let cardsHtml = '';
    for (const guest of pageGuests) {
      const vars = getVariables(event, guest);
      const frontHtml = await renderCardSide(frontConfig, vars, cardWidth, cardHeight, event, guest);
      if (frontOnly) {
        cardsHtml += `<div class="card-pair"><div class="card-front">${frontHtml}</div></div>`;
      } else {
        const backHtml = await renderBackSide(backConfig, vars, cardWidth, cardHeight, event, guest);
        cardsHtml += `<div class="card-pair"><div class="card-front">${frontHtml}</div><div class="card-back">${backHtml}</div></div>`;
      }
    }
    pages += `<div class="page">${cardsHtml}</div>`;
  }

  const pairDirection = sideBySide ? 'row' : 'column';
  return buildHTMLWrapper(pages, pageW, pageH, margin, gap, cardWidth, cardHeight, showCutMarks, pairDirection);
}


// ============================================================
// GENERATE GENERIC CARDS HTML — Open events (no guests)
// Supports: full-page mode (flyer) and multi-copy mini cards
// ============================================================
async function generateGenericCardsHTML(event, frontConfig, backConfig, layout, cardWidth, cardHeight, previewOnly = false) {
  const margin = layout.margin || 10;
  const showCutMarks = layout.showCutMarks !== false;
  const gap = layout.gap !== undefined ? layout.gap : 3;
  const frontOnly = layout.sides === 'front-only';
  const genericMode = layout.genericMode || 'multiple'; // 'single-page' or 'multiple'
  const copyCount = layout.copyCount || 10;

  const pageSizes = { letter: [216, 279], a4: [210, 297], legal: [216, 356] };
  const [baseW, baseH] = pageSizes[layout.pageSize] || pageSizes['letter'];
  const pageW = layout.orientation === 'landscape' ? baseH : baseW;
  const pageH = layout.orientation === 'landscape' ? baseW : baseH;
  const usableW = pageW - margin * 2;
  const usableH = pageH - margin * 2;

  const vars = getGenericVariables(event);

  // MODE: Single page (flyer/folleto) — one card centered on page, size configurable
  if (genericMode === 'single-page') {
    // Clamp card dimensions to usable area
    let cw = cardWidth > usableW ? usableW : cardWidth;
    let ch = cardHeight > usableH ? usableH : cardHeight;

    const frontHtml = await renderGenericCardSide(frontConfig, vars, cw, ch, event);
    let pages;
    if (frontOnly) {
      pages = `<div class="page"><div class="card-pair"><div class="card-front">${frontHtml}</div></div></div>`;
    } else {
      const backHtml = await renderGenericBackSide(backConfig, vars, cw, ch, event);
      pages = `<div class="page"><div class="card-pair"><div class="card-front">${frontHtml}</div></div></div>`;
      pages += `<div class="page"><div class="card-pair"><div class="card-front">${backHtml}</div></div></div>`;
    }
    return buildHTMLWrapper(pages, pageW, pageH, margin, 0, cw, ch, false, 'row');
  }

  // MODE: Multiple copies (mini cards) — maximize cards per page
  if (frontOnly) {
    if (cardWidth > usableW) cardWidth = usableW;
    if (cardHeight > usableH) cardHeight = usableH;
  } else {
    const maxW = Math.floor(usableW / 2 - gap);
    if (cardWidth > maxW) cardWidth = maxW;
    if (cardHeight > usableH) cardHeight = usableH;
  }

  let sideBySide = false;
  let pairW, pairH;
  if (frontOnly) {
    pairW = cardWidth;
    pairH = cardHeight;
  } else {
    const pairWidthSideBySide = cardWidth * 2 + gap;
    sideBySide = pairWidthSideBySide <= usableW;
    if (sideBySide) { pairW = pairWidthSideBySide; pairH = cardHeight; }
    else { pairW = cardWidth; pairH = cardHeight * 2 + gap; }
  }

  // Calculate maximum cards that fit per page (no artificial limit for generic)
  const cols = Math.floor((usableW + gap) / (pairW + gap)) || 1;
  const rows = Math.floor((usableH + gap) / (pairH + gap)) || 1;
  const maxPerPage = cols * rows;

  const totalCopies = previewOnly ? Math.min(maxPerPage, copyCount) : copyCount;

  // Generate the card HTML once (it's the same for all copies)
  const frontHtml = await renderGenericCardSide(frontConfig, vars, cardWidth, cardHeight, event);
  let backHtml = '';
  if (!frontOnly) {
    backHtml = await renderGenericBackSide(backConfig, vars, cardWidth, cardHeight, event);
  }

  let pages = '';
  for (let i = 0; i < totalCopies; i += maxPerPage) {
    const count = Math.min(maxPerPage, totalCopies - i);
    let cardsHtml = '';
    for (let j = 0; j < count; j++) {
      if (frontOnly) {
        cardsHtml += `<div class="card-pair"><div class="card-front">${frontHtml}</div></div>`;
      } else {
        cardsHtml += `<div class="card-pair"><div class="card-front">${frontHtml}</div><div class="card-back">${backHtml}</div></div>`;
      }
    }
    pages += `<div class="page">${cardsHtml}</div>`;
  }

  const pairDirection = sideBySide ? 'row' : 'column';
  return buildHTMLWrapper(pages, pageW, pageH, margin, gap, cardWidth, cardHeight, showCutMarks, pairDirection);
}


// ============================================================
// HTML WRAPPER — shared by both generators
// ============================================================
function buildHTMLWrapper(pages, pageW, pageH, margin, gap, cardWidth, cardHeight, showCutMarks, pairDirection) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Lato:wght@300;400;700&family=Great+Vibes&family=Montserrat:wght@300;400;600;700&family=Raleway:wght@300;400;600&family=Cinzel:wght@400;700&family=Dancing+Script:wght@400;700&family=Cormorant+Garamond:wght@300;400;600&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  @page { margin: 0; size: ${pageW}mm ${pageH}mm; }
  body { font-family: 'Lato', sans-serif; }
  .page {
    width: ${pageW}mm; height: ${pageH}mm;
    padding: ${margin}mm;
    display: flex; flex-wrap: wrap;
    align-content: center; justify-content: center;
    gap: ${gap}mm;
    page-break-after: always;
  }
  .page:last-child { page-break-after: auto; }
  .card-pair { display: flex; flex-direction: ${pairDirection}; gap: ${gap}mm; }
  .card-front, .card-back {
    width: ${cardWidth}mm; height: ${cardHeight}mm;
    border-radius: 2mm; overflow: hidden; position: relative;
    ${showCutMarks ? 'outline: 0.2mm dashed #ccc;' : ''}
  }
</style>
</head><body>${pages}</body></html>`;
}


// ============================================================
// VARIABLES
// ============================================================
function getVariables(event, guest) {
  const guestName = guest.family_name || guest.guest_names;
  const asistentes = guest.guest_type === 'family'
    ? guest.guest_names.split(',').length
    : guest.max_companions + 1;
  return {
    '{nombre}': guestName,
    '{familia}': guest.family_name || '',
    '{invitados}': guest.guest_names,
    '{codigo}': guest.unique_code,
    '{evento}': event.name,
    '{fecha}': new Date(event.event_date).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }),
    '{tipo}': event.event_type,
    '{asistentes}': String(asistentes)
  };
}

function getGenericVariables(event) {
  return {
    '{nombre}': '',
    '{familia}': '',
    '{invitados}': '',
    '{codigo}': '',
    '{evento}': event.name,
    '{fecha}': new Date(event.event_date).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }),
    '{tipo}': event.event_type,
    '{asistentes}': ''
  };
}

function replaceVars(text, vars) {
  if (!text) return '';
  let result = text;
  for (const [key, val] of Object.entries(vars)) {
    result = result.replace(new RegExp(key.replace(/[{}]/g, '\\$&'), 'g'), val);
  }
  return result;
}


// ============================================================
// UTILITY FUNCTIONS
// ============================================================
function rgbaToHex(color) {
  if (!color || color === 'transparent') return '#00000000';
  if (color.startsWith('#')) return color;
  const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (!match) return color;
  const r = parseInt(match[1]).toString(16).padStart(2, '0');
  const g = parseInt(match[2]).toString(16).padStart(2, '0');
  const b = parseInt(match[3]).toString(16).padStart(2, '0');
  const a = match[4] !== undefined ? Math.round(parseFloat(match[4]) * 255).toString(16).padStart(2, '0') : 'ff';
  return `#${r}${g}${b}${a}`;
}

function getFontFamily(key) {
  const map = {
    sans: "'Lato', sans-serif", serif: "'Playfair Display', serif",
    script: "'Great Vibes', cursive", montserrat: "'Montserrat', sans-serif",
    raleway: "'Raleway', sans-serif", cinzel: "'Cinzel', serif",
    cormorant: "'Cormorant Garamond', serif", dancing: "'Dancing Script', cursive"
  };
  return map[key] || map.sans;
}


// ============================================================
// RENDER CARD SIDE — Private events (with guest/QR personal)
// ============================================================
async function renderCardSide(config, vars, width, height, event, guest) {
  const bgColor = config.bgColor || '#fff8f0';
  const bgColor2 = config.bgColor2 || '';
  const bgImage = config.bgImage || '';
  const borderColor = config.borderColor || 'transparent';
  const borderWidth = config.borderWidth || 0;
  const borderRadius = config.borderRadius || 2;

  let bgStyle = '';
  if (bgImage) {
    const imgUrl = bgImage.startsWith('/uploads/') ? `http://localhost:3000${bgImage}` : bgImage.startsWith('/') ? `${process.env.BASE_URL}${bgImage}` : bgImage;
    bgStyle = `background-image:url('${imgUrl}');background-size:cover;background-position:center;`;
  } else if (bgColor2) {
    const intensity = config.bgGradientIntensity || 50;
    bgStyle = `background:linear-gradient(${config.bgGradientAngle || 135}deg, ${bgColor} ${100 - intensity}%, ${bgColor2} ${intensity}%);`;
  } else {
    bgStyle = `background:${bgColor};`;
  }

  let elementsHtml = '';
  if (config.elements && config.elements.length) {
    for (const el of config.elements) {
      const posStyle = `position:absolute;left:${el.x}%;top:${el.y}%;width:${el.width}%;${el.height ? `height:${el.height}%;` : ''}`;

      if (el.type === 'text') {
        const text = replaceVars(el.content || '', vars);
        elementsHtml += `<div style="${posStyle}font-family:${getFontFamily(el.fontFamily)};font-size:${el.fontSize || 12}px;font-weight:${el.fontWeight || 400};color:${el.color || '#333'};text-align:${el.textAlign || 'center'};">${text}</div>`;
      } else if (el.type === 'image' && el.imageUrl) {
        const imgUrl = el.imageUrl.startsWith('/uploads/') ? `http://localhost:3000${el.imageUrl}` : el.imageUrl;
        elementsHtml += `<div style="${posStyle}"><img src="${imgUrl}" style="width:100%;height:100%;object-fit:${el.objectFit || 'contain'};"></div>`;
      } else if (el.type === 'qr' && event && guest) {
        const url = `${process.env.BASE_URL}/invitacion/${event.slug}?t=${guest.unique_code}`;
        const qrColor = el.qrColor || '#000000';
        const qrBg = el.qrBgColor || 'transparent';
        const qrSvg = await QRCode.toString(url, { type: 'svg', width: 200, margin: 1, color: { dark: rgbaToHex(qrColor), light: qrBg === 'transparent' ? '#00000000' : rgbaToHex(qrBg) } });
        const qrDataUrl = `data:image/svg+xml;base64,${Buffer.from(qrSvg).toString('base64')}`;
        const showLabel = el.showLabel !== false;
        const labelColor = el.labelColor || '#999';
        elementsHtml += `<div style="${posStyle}display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2%;">
          <img src="${qrDataUrl}" style="width:auto;height:${showLabel ? '80' : '95'}%;aspect-ratio:1;border-radius:3px;max-width:50mm;max-height:50mm;">
          ${showLabel ? `<div style="font-size:7px;color:${labelColor};margin-top:2px;letter-spacing:0.5px;">${vars['{codigo}']}</div>` : ''}
        </div>`;
      } else if (el.type === 'separator') {
        const lineStyle = el.lineStyle || 'solid';
        const lineWidth = el.lineWidth || 2;
        const lineColor = el.shapeColor || '#d4a017';
        if (lineStyle === 'gradient') {
          elementsHtml += `<div style="${posStyle}height:${lineWidth}px;background:linear-gradient(90deg, transparent, ${lineColor}, transparent);"></div>`;
        } else {
          elementsHtml += `<div style="${posStyle}border-top:${lineWidth}px ${lineStyle} ${lineColor};"></div>`;
        }
      }
    }
  } else {
    elementsHtml = `<div style="position:relative;z-index:1;padding:4mm;height:100%;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;">
      <div style="font-size:3mm;color:${config.textColor || '#333'};opacity:0.7;text-transform:uppercase;letter-spacing:0.5mm;">${vars['{evento}']}</div>
      <div style="font-size:4.5mm;font-weight:700;color:${config.textColor || '#333'};margin-top:2mm;">${vars['{nombre}']}</div>
      <div style="font-size:2.5mm;color:${config.textColor || '#333'};opacity:0.7;margin-top:1.5mm;">${vars['{asistentes}']} asistente(s)</div>
      ${config.footerText ? `<div style="font-size:2.5mm;color:${config.textColor || '#333'};opacity:0.6;margin-top:auto;">${config.footerText}</div>` : ''}
    </div>`;
  }

  return `<div style="position:absolute;inset:0;${bgStyle}border:${borderWidth}px solid ${borderColor};border-radius:${Math.min(borderRadius * 0.4, 8)}mm;overflow:hidden;">
    ${bgImage && config.bgImageOpacity && config.bgImageOpacity < 1 ? `<div style="position:absolute;inset:0;background:rgba(0,0,0,${1 - config.bgImageOpacity});"></div>` : ''}
  </div>${elementsHtml}`;
}


// ============================================================
// RENDER BACK SIDE — Private events (with guest/QR personal)
// ============================================================
async function renderBackSide(config, vars, width, height, event, guest) {
  const bgColor = config.bgColor || '#ffffff';
  const bgColor2 = config.bgColor2 || '';
  const borderColor = config.borderColor || 'transparent';
  const borderWidth = config.borderWidth || 0;
  const borderRadius = config.borderRadius || 2;

  let bgStyle = '';
  if (config.bgImage) {
    const imgUrl = config.bgImage.startsWith('/') ? `${process.env.BASE_URL}${config.bgImage}` : config.bgImage;
    bgStyle = `background-image:url('${imgUrl}');background-size:cover;background-position:center;`;
  } else if (bgColor2) {
    const intensity = config.bgGradientIntensity || 50;
    bgStyle = `background:linear-gradient(${config.bgGradientAngle || 135}deg, ${bgColor} ${100 - intensity}%, ${bgColor2} ${intensity}%);`;
  } else {
    bgStyle = `background:${bgColor};`;
  }

  const url = `${process.env.BASE_URL}/invitacion/${event.slug}?t=${guest.unique_code}`;
  const defaultQrColor = '#000000';

  let elementsHtml = '';
  if (config.elements && config.elements.length) {
    for (const el of config.elements) {
      const posStyle = `position:absolute;left:${el.x}%;top:${el.y}%;width:${el.width}%;${el.height ? `height:${el.height}%;` : ''}`;

      if (el.type === 'text') {
        elementsHtml += `<div style="${posStyle}font-family:${getFontFamily(el.fontFamily)};font-size:${el.fontSize || 10}px;font-weight:${el.fontWeight || 400};color:${el.color || '#666'};text-align:${el.textAlign || 'center'};">${replaceVars(el.content || '', vars)}</div>`;
      } else if (el.type === 'qr') {
        const qrColor = el.qrColor || defaultQrColor;
        const qrBg = el.qrBgColor || 'transparent';
        const qrSvg = await QRCode.toString(url, { type: 'svg', width: 200, margin: 1, color: { dark: rgbaToHex(qrColor), light: qrBg === 'transparent' ? '#00000000' : rgbaToHex(qrBg) } });
        const qrDataUrl = `data:image/svg+xml;base64,${Buffer.from(qrSvg).toString('base64')}`;
        const showLabel = el.showLabel !== false;
        const labelColor = el.labelColor || '#999';
        elementsHtml += `<div style="${posStyle}display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2%;">
          <img src="${qrDataUrl}" style="width:auto;height:${showLabel ? '80' : '95'}%;aspect-ratio:1;border-radius:3px;max-width:50mm;max-height:50mm;">
          ${showLabel ? `<div style="font-size:7px;color:${labelColor};margin-top:2px;letter-spacing:0.5px;">${vars['{codigo}']}</div>` : ''}
        </div>`;
      } else if (el.type === 'separator') {
        const lineStyle = el.lineStyle || 'solid';
        const lineWidth = el.lineWidth || 2;
        const lineColor = el.shapeColor || '#d4a017';
        if (lineStyle === 'gradient') {
          elementsHtml += `<div style="${posStyle}height:${lineWidth}px;background:linear-gradient(90deg, transparent, ${lineColor}, transparent);"></div>`;
        } else {
          elementsHtml += `<div style="${posStyle}border-top:${lineWidth}px ${lineStyle} ${lineColor};"></div>`;
        }
      } else if (el.type === 'image' && el.imageUrl) {
        const imgUrl = el.imageUrl.startsWith('/uploads/') ? `http://localhost:3000${el.imageUrl}` : el.imageUrl;
        elementsHtml += `<div style="${posStyle}"><img src="${imgUrl}" style="width:100%;height:100%;object-fit:contain;"></div>`;
      }
    }
  } else {
    const qrSvg = await QRCode.toString(url, { type: 'svg', width: 200, margin: 1, color: { dark: rgbaToHex(config.qrColor || defaultQrColor), light: '#00000000' } });
    const qrDataUrl = `data:image/svg+xml;base64,${Buffer.from(qrSvg).toString('base64')}`;
    elementsHtml = `<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2mm;padding:3mm;">
      ${config.topText ? `<div style="font-size:2.5mm;color:#666;text-align:center;">${replaceVars(config.topText, vars)}</div>` : ''}
      <img src="${qrDataUrl}" style="height:60%;aspect-ratio:1;max-width:50mm;max-height:50mm;">
      <div style="font-size:2mm;color:#999;">${vars['{codigo}']}</div>
    </div>`;
  }

  return `<div style="position:absolute;inset:0;${bgStyle}border:${borderWidth}px solid ${borderColor};border-radius:${Math.min(borderRadius * 0.4, 8)}mm;overflow:hidden;"></div>${elementsHtml}`;
}


// ============================================================
// RENDER GENERIC CARD SIDE — Open events (QR points to landing without ?t=code)
// ============================================================
async function renderGenericCardSide(config, vars, width, height, event) {
  const bgColor = config.bgColor || '#fff8f0';
  const bgColor2 = config.bgColor2 || '';
  const bgImage = config.bgImage || '';
  const borderColor = config.borderColor || 'transparent';
  const borderWidth = config.borderWidth || 0;
  const borderRadius = config.borderRadius || 2;

  let bgStyle = '';
  if (bgImage) {
    const imgUrl = bgImage.startsWith('/uploads/') ? `http://localhost:3000${bgImage}` : bgImage.startsWith('/') ? `${process.env.BASE_URL}${bgImage}` : bgImage;
    bgStyle = `background-image:url('${imgUrl}');background-size:cover;background-position:center;`;
  } else if (bgColor2) {
    const intensity = config.bgGradientIntensity || 50;
    bgStyle = `background:linear-gradient(${config.bgGradientAngle || 135}deg, ${bgColor} ${100 - intensity}%, ${bgColor2} ${intensity}%);`;
  } else {
    bgStyle = `background:${bgColor};`;
  }

  let elementsHtml = '';
  if (config.elements && config.elements.length) {
    for (const el of config.elements) {
      const posStyle = `position:absolute;left:${el.x}%;top:${el.y}%;width:${el.width}%;${el.height ? `height:${el.height}%;` : ''}`;

      if (el.type === 'text') {
        const text = replaceVars(el.content || '', vars);
        elementsHtml += `<div style="${posStyle}font-family:${getFontFamily(el.fontFamily)};font-size:${el.fontSize || 12}px;font-weight:${el.fontWeight || 400};color:${el.color || '#333'};text-align:${el.textAlign || 'center'};">${text}</div>`;
      } else if (el.type === 'image' && el.imageUrl) {
        const imgUrl = el.imageUrl.startsWith('/uploads/') ? `http://localhost:3000${el.imageUrl}` : el.imageUrl;
        elementsHtml += `<div style="${posStyle}"><img src="${imgUrl}" style="width:100%;height:100%;object-fit:${el.objectFit || 'contain'};"></div>`;
      } else if (el.type === 'qr') {
        // QR for open events points to the generic landing (no ?t=code)
        const url = `${process.env.BASE_URL}/invitacion/${event.slug}`;
        const qrColor = el.qrColor || '#000000';
        const qrBg = el.qrBgColor || 'transparent';
        const qrSvg = await QRCode.toString(url, { type: 'svg', width: 200, margin: 1, color: { dark: rgbaToHex(qrColor), light: qrBg === 'transparent' ? '#00000000' : rgbaToHex(qrBg) } });
        const qrDataUrl = `data:image/svg+xml;base64,${Buffer.from(qrSvg).toString('base64')}`;
        elementsHtml += `<div style="${posStyle}display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2%;">
          <img src="${qrDataUrl}" style="width:auto;height:95%;aspect-ratio:1;border-radius:3px;max-width:50mm;max-height:50mm;">
        </div>`;
      } else if (el.type === 'separator') {
        const lineStyle = el.lineStyle || 'solid';
        const lineWidth = el.lineWidth || 2;
        const lineColor = el.shapeColor || '#d4a017';
        if (lineStyle === 'gradient') {
          elementsHtml += `<div style="${posStyle}height:${lineWidth}px;background:linear-gradient(90deg, transparent, ${lineColor}, transparent);"></div>`;
        } else {
          elementsHtml += `<div style="${posStyle}border-top:${lineWidth}px ${lineStyle} ${lineColor};"></div>`;
        }
      }
    }
  } else {
    elementsHtml = `<div style="position:relative;z-index:1;padding:4mm;height:100%;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;">
      <div style="font-size:4.5mm;font-weight:700;color:${config.textColor || '#333'};">${vars['{evento}']}</div>
      <div style="font-size:3mm;color:${config.textColor || '#333'};opacity:0.7;margin-top:2mm;">${vars['{fecha}']}</div>
    </div>`;
  }

  return `<div style="position:absolute;inset:0;${bgStyle}border:${borderWidth}px solid ${borderColor};border-radius:${Math.min(borderRadius * 0.4, 8)}mm;overflow:hidden;">
    ${bgImage && config.bgImageOpacity && config.bgImageOpacity < 1 ? `<div style="position:absolute;inset:0;background:rgba(0,0,0,${1 - config.bgImageOpacity});"></div>` : ''}
  </div>${elementsHtml}`;
}


// ============================================================
// RENDER GENERIC BACK SIDE — Open events
// ============================================================
async function renderGenericBackSide(config, vars, width, height, event) {
  const bgColor = config.bgColor || '#ffffff';
  const bgColor2 = config.bgColor2 || '';
  const borderColor = config.borderColor || 'transparent';
  const borderWidth = config.borderWidth || 0;
  const borderRadius = config.borderRadius || 2;

  let bgStyle = '';
  if (config.bgImage) {
    const imgUrl = config.bgImage.startsWith('/') ? `${process.env.BASE_URL}${config.bgImage}` : config.bgImage;
    bgStyle = `background-image:url('${imgUrl}');background-size:cover;background-position:center;`;
  } else if (bgColor2) {
    const intensity = config.bgGradientIntensity || 50;
    bgStyle = `background:linear-gradient(${config.bgGradientAngle || 135}deg, ${bgColor} ${100 - intensity}%, ${bgColor2} ${intensity}%);`;
  } else {
    bgStyle = `background:${bgColor};`;
  }

  let elementsHtml = '';
  if (config.elements && config.elements.length) {
    for (const el of config.elements) {
      const posStyle = `position:absolute;left:${el.x}%;top:${el.y}%;width:${el.width}%;${el.height ? `height:${el.height}%;` : ''}`;

      if (el.type === 'text') {
        elementsHtml += `<div style="${posStyle}font-family:${getFontFamily(el.fontFamily)};font-size:${el.fontSize || 10}px;font-weight:${el.fontWeight || 400};color:${el.color || '#666'};text-align:${el.textAlign || 'center'};">${replaceVars(el.content || '', vars)}</div>`;
      } else if (el.type === 'qr') {
        const url = `${process.env.BASE_URL}/invitacion/${event.slug}`;
        const qrColor = el.qrColor || '#000000';
        const qrBg = el.qrBgColor || 'transparent';
        const qrSvg = await QRCode.toString(url, { type: 'svg', width: 200, margin: 1, color: { dark: rgbaToHex(qrColor), light: qrBg === 'transparent' ? '#00000000' : rgbaToHex(qrBg) } });
        const qrDataUrl = `data:image/svg+xml;base64,${Buffer.from(qrSvg).toString('base64')}`;
        elementsHtml += `<div style="${posStyle}display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2%;">
          <img src="${qrDataUrl}" style="width:auto;height:95%;aspect-ratio:1;border-radius:3px;max-width:50mm;max-height:50mm;">
        </div>`;
      } else if (el.type === 'separator') {
        const lineStyle = el.lineStyle || 'solid';
        const lineWidth = el.lineWidth || 2;
        const lineColor = el.shapeColor || '#d4a017';
        if (lineStyle === 'gradient') {
          elementsHtml += `<div style="${posStyle}height:${lineWidth}px;background:linear-gradient(90deg, transparent, ${lineColor}, transparent);"></div>`;
        } else {
          elementsHtml += `<div style="${posStyle}border-top:${lineWidth}px ${lineStyle} ${lineColor};"></div>`;
        }
      } else if (el.type === 'image' && el.imageUrl) {
        const imgUrl = el.imageUrl.startsWith('/uploads/') ? `http://localhost:3000${el.imageUrl}` : el.imageUrl;
        elementsHtml += `<div style="${posStyle}"><img src="${imgUrl}" style="width:100%;height:100%;object-fit:contain;"></div>`;
      }
    }
  } else {
    // Default: QR centered pointing to generic landing
    const url = `${process.env.BASE_URL}/invitacion/${event.slug}`;
    const qrSvg = await QRCode.toString(url, { type: 'svg', width: 200, margin: 1, color: { dark: rgbaToHex(config.qrColor || '#000000'), light: '#00000000' } });
    const qrDataUrl = `data:image/svg+xml;base64,${Buffer.from(qrSvg).toString('base64')}`;
    elementsHtml = `<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2mm;padding:3mm;">
      <img src="${qrDataUrl}" style="height:60%;aspect-ratio:1;max-width:50mm;max-height:50mm;">
      <div style="font-size:2.5mm;color:#666;">Escanea para registrarte</div>
    </div>`;
  }

  return `<div style="position:absolute;inset:0;${bgStyle}border:${borderWidth}px solid ${borderColor};border-radius:${Math.min(borderRadius * 0.4, 8)}mm;overflow:hidden;"></div>${elementsHtml}`;
}

module.exports = router;
