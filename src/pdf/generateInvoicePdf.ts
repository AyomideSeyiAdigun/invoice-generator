import jsPDF from "jspdf";
import cdpcLogoUrl from "../assets/cdpc-logo.png";
import designHealthLogoUrl from "../assets/design-health-logo.png";
import idanLogoUrl from "../assets/idan-logo.png";
import pantoMarkUrl from "../assets/panto-mark.svg";
import type { FooterData, HeaderData, Section, Term } from "../types/invoice";
import { formatToNairaPdf, grandTotal as calcGrandTotal, rowTotal, sectionSubtotal } from "../utils/invoiceCalc";
import { EMAIL_ICON_SVG, FACEBOOK_ICON_SVG, INSTAGRAM_ICON_SVG, PHONE_ICON_SVG } from "./footerIcons";
import { rasterizeSvg, rasterizeUrl, type RasterImage } from "./rasterize";

export interface InvoiceData {
  header: HeaderData;
  sections: Section[];
  showTimeline: boolean;
  terms: Term[];
  footer: FooterData;
}

// ---------------------------------------------------------------------------
// Layout constants (mm — the document's own unit, so these read directly as
// the physical page measurements they represent)
// ---------------------------------------------------------------------------
const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN_X = 15;
const CONTENT_W = PAGE_W - MARGIN_X * 2;
const CONTENT_RIGHT = PAGE_W - MARGIN_X;

const HEADER_Y = 12;
const HEADER_LOGO_SIZE = 8;
const HEADER_LEFT_ICON_SIZE = 20;
const BODY_START_Y = 37;

const FOOTER_HEIGHT = 20;
const FOOTER_GAP = (16 / 96) * 25.4; // ~16px, matching the on-screen spacing
const BODY_BOTTOM = PAGE_H - FOOTER_HEIGHT - FOOTER_GAP;

const GOLD: [number, number, number] = [212, 175, 55];
const BLACK: [number, number, number] = [17, 17, 17];
const GRAY: [number, number, number] = [51, 51, 51];

const ROW_LINE_HEIGHT = 4.2;
const ROW_PADDING = 1.6;
const MIN_ROW_HEIGHT = 7;

// ---------------------------------------------------------------------------
// Assets — every image placed in the PDF has to be a raster (PNG/JPEG); the
// SVGs are rasterized once up front and reused on every page.
// ---------------------------------------------------------------------------
interface Assets {
  logo: RasterImage;
  phoneIcon: RasterImage;
  emailIcon: RasterImage;
  igIcon: RasterImage;
  fbIcon: RasterImage;
  idanLogo: RasterImage;
  designHealthLogo: RasterImage;
  cdpcLogo: RasterImage;
}

async function loadAssets(): Promise<Assets> {
  const [logo, phoneIcon, emailIcon, igIcon, fbIcon, idanLogo, designHealthLogo, cdpcLogo] =
    await Promise.all([
      rasterizeUrl(pantoMarkUrl, 256),
      rasterizeSvg(PHONE_ICON_SVG),
      rasterizeSvg(EMAIL_ICON_SVG),
      rasterizeSvg(INSTAGRAM_ICON_SVG),
      rasterizeSvg(FACEBOOK_ICON_SVG),
      rasterizeUrl(idanLogoUrl, 256),
      rasterizeUrl(designHealthLogoUrl, 256),
      rasterizeUrl(cdpcLogoUrl, 256),
    ]);
  return { logo, phoneIcon, emailIcon, igIcon, fbIcon, idanLogo, designHealthLogo, cdpcLogo };
}

const formatDate = (isoDate: string) => {
  if (!isoDate) return "";
  const d = new Date(`${isoDate}T00:00:00`);
  if (isNaN(d.getTime())) return "";
  return d
    .toLocaleDateString("en-US", { month: "long", day: "2-digit", year: "numeric" })
    .toUpperCase();
};

// ---------------------------------------------------------------------------
// Header / footer — redrawn identically on every page
// ---------------------------------------------------------------------------
function addHeader(doc: jsPDF, assets: Assets, dateText: string) {
  // Left brand mark. This mirrors the decorative accent shown in the
  // on-screen editor (InvoiceHeader.tsx's .boq-brand-accent) — it's part of
  // the same rasterized logo asset already loaded for the right-hand
  // cluster below, so it's guaranteed to be resolved before addImage runs.
  const leftIconH = HEADER_LEFT_ICON_SIZE * assets.logo.aspect;
  doc.addImage(assets.logo.dataUrl, "PNG", MARGIN_X, HEADER_Y, HEADER_LEFT_ICON_SIZE, leftIconH);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  const pantoWidth = doc.getTextWidth("panto");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  const interiorsWidth = doc.getTextWidth("INTERIORS") + 4; // allowance for letter spacing
  const textBlockWidth = Math.max(pantoWidth, interiorsWidth);
  const clusterWidth = HEADER_LOGO_SIZE + 2 + textBlockWidth;
  const startX = CONTENT_RIGHT - clusterWidth;

  const logoH = HEADER_LOGO_SIZE * assets.logo.aspect;
  doc.addImage(assets.logo.dataUrl, "PNG", startX, HEADER_Y, HEADER_LOGO_SIZE, logoH);

  const textX = startX + HEADER_LOGO_SIZE + 2;
  doc.setTextColor(...BLACK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("panto", textX, HEADER_Y + 4.5);
  doc.setTextColor(...GOLD);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.text("INTERIORS", textX, HEADER_Y + 8, { charSpace: 0.6 });

  if (dateText) {
    doc.setTextColor(...BLACK);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    const dateWidth = doc.getTextWidth(dateText);
    doc.text(dateText, CONTENT_RIGHT - dateWidth, HEADER_Y + HEADER_LOGO_SIZE + 6);
  }
}

function addFooter(doc: jsPDF, assets: Assets, footer: FooterData) {
  const footerTop = PAGE_H - FOOTER_HEIGHT;
  const iconSize = 3.6;
  const lineGap = 6;
  const textOffset = iconSize + 1.6;

  const drawIconLine = (x: number, y: number, icon: RasterImage, text: string) => {
    const h = iconSize * icon.aspect;
    doc.addImage(icon.dataUrl, "PNG", x, y - iconSize + 1, iconSize, h);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...GRAY);
    doc.text(text, x + textOffset, y);
  };

  const colAx = MARGIN_X;
  const colBx = MARGIN_X + CONTENT_W * 0.42;
  const rowY1 = footerTop + 6;
  const rowY2 = rowY1 + lineGap;

  drawIconLine(colAx, rowY1, assets.phoneIcon, `${footer.phone1}   |   ${footer.phone2}`);
  drawIconLine(colAx, rowY2, assets.emailIcon, footer.email);

  drawIconLine(colBx, rowY1, assets.igIcon, footer.instagram);
  drawIconLine(colBx, rowY2, assets.fbIcon, footer.facebook);

  // Partner logos: same horizontal band as the contact block, positioned
  // after it (further right), evenly spaced, and vertically centered on
  // the contact text's own vertical span rather than the whole footer —
  // so they read as one line, not a separate stacked row.
  //
  // rowY1/rowY2 are text *baselines*, which sit near the bottom of the
  // glyphs, not their visual center — centering on the raw baseline
  // midpoint reads as noticeably low (biased toward the second line).
  // Nudge up by roughly the cap-height of the 8.5pt contact text to land
  // on the block's actual visual center.
  const logos = [assets.idanLogo, assets.designHealthLogo, assets.cdpcLogo];
  const logoH = 7;
  const gap = 4;
  const widths = logos.map((l) => logoH / l.aspect);
  const totalWidth = widths.reduce((a, b) => a + b, 0) + gap * (logos.length - 1);
  let x = CONTENT_RIGHT - totalWidth;
  const capHeightOffset = 1.5;
  const contactCenterY = (rowY1 + rowY2) / 2 - capHeightOffset;
  const logoY = contactCenterY - logoH / 2;
  logos.forEach((logo, i) => {
    doc.addImage(logo.dataUrl, "PNG", x, logoY, widths[i], logoH);
    x += widths[i] + gap;
  });
}

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------
interface Ctx {
  doc: jsPDF;
  y: number;
  assets: Assets;
  footer: FooterData;
  dateText: string;
}

function newPage(ctx: Ctx) {
  ctx.doc.addPage();
  // Only the first page's header carries the date — repeat pages show just
  // the brand marks, no date.
  addHeader(ctx.doc, ctx.assets, "");
  addFooter(ctx.doc, ctx.assets, ctx.footer);
  ctx.y = BODY_START_Y;
}

function ensureSpace(ctx: Ctx, needed: number, onNewPage?: () => void) {
  if (ctx.y + needed > BODY_BOTTOM) {
    newPage(ctx);
    onNewPage?.();
  }
}

// ---------------------------------------------------------------------------
// Body: client/title block (page 1 only — it isn't part of the repeating
// header, just the first thing the body flow draws)
// ---------------------------------------------------------------------------
function drawClientBlock(ctx: Ctx, header: HeaderData) {
  const { doc } = ctx;
  const centerX = PAGE_W / 2;

  doc.setTextColor(...BLACK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  const label = "CLIENT: ";
  const clientText = header.clientName || "";
  const combinedWidth = doc.getTextWidth(label) + doc.getTextWidth(clientText);
  let x = centerX - combinedWidth / 2;
  doc.text(label, x, ctx.y);
  x += doc.getTextWidth(label);
  doc.setFont("helvetica", "normal");
  doc.text(clientText, x, ctx.y);
  ctx.y += 5;

  if (header.projectType) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    const projText = `(${header.projectType})`;
    const w = doc.getTextWidth(projText);
    doc.text(projText, centerX - w / 2, ctx.y);
    ctx.y += 5;
  }

  ctx.y += 2;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  const titleLines: string[] = doc.splitTextToSize(header.documentTitle || "", CONTENT_W - 20);
  titleLines.forEach((line) => {
    const w = doc.getTextWidth(line);
    const lx = centerX - w / 2;
    doc.text(line, lx, ctx.y);
    doc.setDrawColor(...BLACK);
    doc.setLineWidth(0.3);
    doc.line(lx, ctx.y + 1, lx + w, ctx.y + 1);
    ctx.y += 5.5;
  });

  ctx.y += 3;
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.2);
  doc.line(MARGIN_X, ctx.y, CONTENT_RIGHT, ctx.y);
  ctx.y += 6;
}

// ---------------------------------------------------------------------------
// Body: table
// ---------------------------------------------------------------------------
type ColKey = "description" | "qty" | "unitRate" | "totalRate" | "timeline";

function getColumnWidths(showTimeline: boolean): Record<ColKey, number> {
  if (showTimeline) {
    return {
      description: CONTENT_W * 0.34,
      qty: CONTENT_W * 0.12,
      unitRate: CONTENT_W * 0.18,
      totalRate: CONTENT_W * 0.18,
      timeline: CONTENT_W * 0.18,
    };
  }
  return {
    description: CONTENT_W * 0.4,
    qty: CONTENT_W * 0.16,
    unitRate: CONTENT_W * 0.22,
    totalRate: CONTENT_W * 0.22,
    timeline: 0,
  };
}

function columnXPositions(cols: Record<ColKey, number>, showTimeline: boolean): number[] {
  const order: ColKey[] = showTimeline
    ? ["description", "qty", "unitRate", "totalRate", "timeline"]
    : ["description", "qty", "unitRate", "totalRate"];
  const xs = [MARGIN_X];
  order.forEach((key) => xs.push(xs[xs.length - 1] + cols[key]));
  return xs;
}

function textCentered(doc: jsPDF, text: string, xStart: number, xEnd: number, y: number) {
  const w = doc.getTextWidth(text);
  doc.text(text, xStart + (xEnd - xStart - w) / 2, y);
}

function textRight(doc: jsPDF, text: string, xEnd: number, y: number, paddingRight = 2) {
  const w = doc.getTextWidth(text);
  doc.text(text, xEnd - w - paddingRight, y);
}

// Full box border (all 4 sides), optionally with a heavier top rule — used
// for the table header and total rows. Column dividers are handled
// separately by drawColumnDividers, spanning a whole section rather than a
// single row.
function drawFullBorderRow(ctx: Ctx, height: number, topLineWidth?: number) {
  const { doc } = ctx;
  doc.setDrawColor(...BLACK);
  doc.setLineWidth(0.3);
  doc.rect(MARGIN_X, ctx.y, CONTENT_W, height);
  if (topLineWidth) {
    doc.setLineWidth(topLineWidth);
    doc.line(MARGIN_X, ctx.y, CONTENT_RIGHT, ctx.y);
    doc.setLineWidth(0.3);
  }
}

// A horizontal rule under a row (e.g. a section subtotal) — no left/right
// strokes, since the outer frame is covered by the section-wide dividers.
function drawBottomRule(ctx: Ctx, height: number) {
  const { doc } = ctx;
  doc.setDrawColor(...BLACK);
  doc.setLineWidth(0.3);
  doc.line(MARGIN_X, ctx.y + height, CONTENT_RIGHT, ctx.y + height);
}

// Vertical column separators (including the outer left/right frame) drawn
// as one continuous stroke per divider, spanning the full height of a table
// section — not redrawn per row. `xs` includes both outer edges plus every
// internal column boundary, so this single pass produces the frame and all
// the column dividers together.
function drawColumnDividers(ctx: Ctx, xs: number[], top: number, bottom: number) {
  const { doc } = ctx;
  doc.setDrawColor(...BLACK);
  doc.setLineWidth(0.3);
  xs.forEach((x) => doc.line(x, top, x, bottom));
}

function drawTable(ctx: Ctx, sections: Section[], showTimeline: boolean) {
  const { doc } = ctx;
  const cols = getColumnWidths(showTimeline);
  const xs = columnXPositions(cols, showTimeline);

  // Tracks the top of the current page's table segment (header through the
  // last subtotal row drawn so far) so the column dividers for that segment
  // can be drawn as one continuous line once its extent is known.
  let segmentTop = ctx.y;

  const drawHeaderRow = () => {
    const h = 9;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...BLACK);
    drawFullBorderRow(ctx, h);
    const labels = showTimeline
      ? ["DESCRIPTION", "QTY", "UNIT RATE", "TOTAL RATE", "TIMELINE"]
      : ["DESCRIPTION", "QTY", "UNIT RATE", "TOTAL RATE"];
    labels.forEach((label, i) => {
      // Wrap defensively so a label can never bleed into the next column,
      // even if a narrow column (e.g. Qty) is given a longer word later.
      const colWidth = xs[i + 1] - xs[i] - 3;
      const lines: string[] = doc.splitTextToSize(label, colWidth);
      const startY = ctx.y + h / 2 + 1.2 - ((lines.length - 1) * 3) / 2;
      lines.forEach((line, li) => doc.text(line, xs[i] + 2, startY + li * 3));
    });
    ctx.y += h;
  };

  // Closes out the current page's segment with its full-height dividers,
  // then starts a fresh segment (new page, redrawn header row).
  const breakToNewPage = () => {
    drawColumnDividers(ctx, xs, segmentTop, ctx.y);
    newPage(ctx);
    segmentTop = ctx.y;
    drawHeaderRow();
  };

  const ensureRow = (height: number) => {
    if (ctx.y + height > BODY_BOTTOM) breakToNewPage();
  };

  drawHeaderRow();

  sections.forEach((section) => {
    const titleHeight = 7;
    ensureRow(titleHeight);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...BLACK);
    doc.text(section.title.toUpperCase(), MARGIN_X + 2, ctx.y + titleHeight / 2 + 1);
    ctx.y += titleHeight;

    section.rows.forEach((row) => {
      const descLines: string[] = doc.splitTextToSize(row.description || "", cols.description - 4);
      const rowHeight = Math.max(
        MIN_ROW_HEIGHT,
        descLines.length * ROW_LINE_HEIGHT + ROW_PADDING * 2
      );
      ensureRow(rowHeight);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(...BLACK);
      const firstLineY = ctx.y + ROW_PADDING + ROW_LINE_HEIGHT - 1;
      descLines.forEach((line, i) => {
        doc.text(line, xs[0] + 2, firstLineY + i * ROW_LINE_HEIGHT);
      });

      const midY = ctx.y + rowHeight / 2 + 1.2;
      textCentered(doc, row.qty, xs[1], xs[2], midY);
      textCentered(doc, formatToNairaPdf(row.unitRate), xs[2], xs[3], midY);
      textCentered(doc, formatToNairaPdf(rowTotal(row).toString()), xs[3], xs[4], midY);
      if (showTimeline) {
        textCentered(doc, row.timeline, xs[4], xs[5], midY);
      }

      ctx.y += rowHeight;
    });

    const subH = 8;
    ensureRow(subH);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...BLACK);
    const subMidY = ctx.y + subH / 2 + 1.2;
    textRight(doc, "Subtotal", xs[3], subMidY);
    textCentered(doc, formatToNairaPdf(sectionSubtotal(section).toString()), xs[3], xs[4], subMidY);
    if (showTimeline && section.timeline) {
      textCentered(doc, section.timeline, xs[4], xs[5], subMidY);
    }
    drawBottomRule(ctx, subH);
    ctx.y += subH;
  });

  // Close out the final segment's dividers now that its extent (down to the
  // last subtotal row) is known. The TOTAL row below is a distinct block
  // with its own full border and no internal columns, so it's excluded.
  drawColumnDividers(ctx, xs, segmentTop, ctx.y);

  const totalH = 9;
  ensureSpace(ctx, totalH);
  drawFullBorderRow(ctx, totalH, 0.7);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...BLACK);
  const totalMidY = ctx.y + totalH / 2 + 1.5;
  doc.text("TOTAL", MARGIN_X + 2, totalMidY);
  textCentered(doc, formatToNairaPdf(calcGrandTotal(sections).toString()), xs[3], xs[4], totalMidY);
  ctx.y += totalH + 6;
}

// ---------------------------------------------------------------------------
// Body: terms
// ---------------------------------------------------------------------------
function drawTerms(ctx: Ctx, terms: Term[]) {
  const { doc } = ctx;

  terms.forEach((term) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    const bodyLines: string[] = doc.splitTextToSize(term.text || "", CONTENT_W);
    const titleHeight = term.title ? 5 : 0;
    const bodyHeight = bodyLines.length * 4.2;
    const blockHeight = titleHeight + bodyHeight + 4;

    ensureSpace(ctx, blockHeight);

    if (term.title) {
      doc.setTextColor(...GOLD);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.text(term.title.toUpperCase(), MARGIN_X, ctx.y);
      ctx.y += titleHeight;
    }
    doc.setTextColor(...BLACK);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    bodyLines.forEach((line) => {
      doc.text(line, MARGIN_X, ctx.y);
      ctx.y += 4.2;
    });
    ctx.y += 4;
  });
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------
export async function generateInvoicePdf(data: InvoiceData): Promise<jsPDF> {
  const assets = await loadAssets();
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const dateText = formatDate(data.header.date);

  const ctx: Ctx = { doc, y: BODY_START_Y, assets, footer: data.footer, dateText };

  addHeader(doc, assets, dateText);
  addFooter(doc, assets, data.footer);

  drawClientBlock(ctx, data.header);
  drawTable(ctx, data.sections, data.showTimeline);
  drawTerms(ctx, data.terms);

  return doc;
}
