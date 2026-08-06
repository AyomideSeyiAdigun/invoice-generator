import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import React, { useRef, useState } from "react";
import InvoiceFooter from "../components/InvoiceFooter";
import InvoiceHeader from "../components/InvoiceHeader";
import InvoiceTable from "../components/InvoiceTable";
import InvoiceTerms from "../components/InvoiceTerms";
import "./InvoicePage.css";

// Wait for the next two paints so React has actually committed & painted
// the printable layout before we hand the DOM to html2canvas.
const waitForPaint = () =>
  new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });

// Logos/badges load asynchronously; html2canvas snapshots whatever is in
// the DOM at call time, so an unloaded <img> renders as blank in the PDF.
const waitForImages = (container: HTMLElement) => {
  const images = Array.from(container.querySelectorAll("img"));
  return Promise.all(
    images.map((img) =>
      img.complete
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            img.addEventListener("load", () => resolve(), { once: true });
            img.addEventListener("error", () => resolve(), { once: true });
          })
    )
  );
};

const InvoicePage: React.FC = () => {
  const [isPrintable, setIsPrintable] = useState<boolean>(false);
  const invoiceRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    setIsPrintable(true);
    await waitForPaint();

    if (!invoiceRef.current) return;
    const node = invoiceRef.current;

    // Hide controls
    const buttons = node.querySelectorAll(".no-print");
    buttons.forEach((btn) => ((btn as HTMLElement).style.display = "none"));

    await waitForImages(node);

    // A page footer has to be redrawn on every page, but html2canvas only
    // gives us one flat image of the whole document that we then slice into
    // page-sized chunks — an element is just pixels wherever it happened to
    // land, so it only ever shows up once. Capture the footer on its own,
    // hide it, capture the rest of the content as the sliceable body, then
    // composite the footer onto the bottom of every page. The top-right
    // header cluster stays a small corner overlay (no reserved space
    // needed, unlike the full-width footer) redrawn at the same spot on
    // every page, on top of whatever body content is already there.
    const footer = node.querySelector<HTMLElement>(".invoice-footer");
    // .boq-header-top is a flex row with justify-content:flex-end, so its
    // own box spans the full available width even though its content
    // (logo + date) hugs the right edge — cropping that box would drag in
    // whatever sits to the left (the decorative background mark). Use the
    // union of the two actual visible children instead.
    const logoLockup = node.querySelector<HTMLElement>(".boq-logo-lockup");
    const dateBlock = node.querySelector<HTMLElement>(".boq-date-block");

    let footerCanvas: HTMLCanvasElement | null = null;
    if (footer) {
      footerCanvas = await html2canvas(footer, { scale: 1.5, useCORS: true });
      footer.style.display = "none";
    }

    // px -> mm using the live, unscaled DOM so it lines up regardless of
    // the html2canvas capture scale.
    const nodeRectLive = node.getBoundingClientRect();
    let headerRectLive: DOMRect | null = null;
    if (logoLockup && dateBlock) {
      const a = logoLockup.getBoundingClientRect();
      const b = dateBlock.getBoundingClientRect();
      const left = Math.min(a.left, b.left);
      const top = Math.min(a.top, b.top);
      const right = Math.max(a.right, b.right);
      const bottom = Math.max(a.bottom, b.bottom);
      headerRectLive = new DOMRect(left, top, right - left, bottom - top);
    }

    const bodyCanvas = await html2canvas(node, { scale: 1.5, useCORS: true });

    if (footer) {
      footer.style.display = "";
    }

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pdfWidth;
    const bodyImgHeight = (bodyCanvas.height * imgWidth) / bodyCanvas.width;
    const bodyImgData = bodyCanvas.toDataURL("image/jpeg", 0.7);

    let footerImgHeight = 0;
    let footerImgData: string | null = null;
    if (footerCanvas) {
      footerImgHeight = (footerCanvas.height * imgWidth) / footerCanvas.width;
      footerImgData = footerCanvas.toDataURL("image/png");
    }

    // Crop the header straight out of the already-rendered body canvas
    // rather than running html2canvas on it separately — a second capture
    // of an element sharing an asset (the logo SVG, reused in the page's
    // large decorative background mark) with content still to be captured
    // corrupts that later render.
    let headerImgData: string | null = null;
    let headerXMm = 0;
    let headerYMm = 0;
    let headerWidthMm = 0;
    let headerHeightMm = 0;
    if (headerRectLive) {
      const mmPerPxLive = 210 / nodeRectLive.width; // A4 width in mm
      headerXMm = (headerRectLive.left - nodeRectLive.left) * mmPerPxLive;
      headerYMm = (headerRectLive.top - nodeRectLive.top) * mmPerPxLive;
      headerWidthMm = headerRectLive.width * mmPerPxLive;
      headerHeightMm = headerRectLive.height * mmPerPxLive;

      const scaleX = bodyCanvas.width / nodeRectLive.width;
      const scaleY = bodyCanvas.height / nodeRectLive.height;
      const srcX = (headerRectLive.left - nodeRectLive.left) * scaleX;
      const srcY = (headerRectLive.top - nodeRectLive.top) * scaleY;
      const srcW = headerRectLive.width * scaleX;
      const srcH = headerRectLive.height * scaleY;

      const cropCanvas = document.createElement("canvas");
      cropCanvas.width = srcW;
      cropCanvas.height = srcH;
      const ctx = cropCanvas.getContext("2d");
      ctx?.drawImage(bodyCanvas, srcX, srcY, srcW, srcH, 0, 0, srcW, srcH);
      headerImgData = cropCanvas.toDataURL("image/png");
    }

    // Body text should break ~16px above the footer, not run flush into it.
    const footerGapMm = (16 / 96) * 25.4;
    const footerReserve = footerImgData ? footerImgHeight + footerGapMm : 0;
    const pageContentHeight = pdfHeight - footerReserve;

    let heightLeft = bodyImgHeight;
    let position = 0;
    let pageIndex = 0;

    while (heightLeft > 0 || pageIndex === 0) {
      if (pageIndex > 0) pdf.addPage();
      // The body image is placed at a rising negative offset each page so
      // only the current slice falls within the page bounds — content past
      // the edges simply isn't drawn.
      pdf.addImage(bodyImgData, "JPEG", 0, -position, imgWidth, bodyImgHeight);
      if (headerImgData) {
        // Mask whatever body content bled into the header's footprint, then
        // draw the running header on top of it, at the same spot it
        // occupies on the first page.
        pdf.setFillColor(255, 255, 255);
        pdf.rect(headerXMm, headerYMm, headerWidthMm, headerHeightMm, "F");
        pdf.addImage(headerImgData, "PNG", headerXMm, headerYMm, headerWidthMm, headerHeightMm);
      }
      if (footerImgData) {
        pdf.addImage(footerImgData, "PNG", 0, pdfHeight - footerImgHeight, imgWidth, footerImgHeight);
      }
      position += pageContentHeight;
      heightLeft -= pageContentHeight;
      pageIndex++;
    }

    pdf.save("invoice.pdf");

    // Restore controls
    buttons.forEach((btn) => ((btn as HTMLElement).style.display = "block"));
    setIsPrintable(false);
  };
  return (
    <div className="invoice-container">
      <div className="invoice-watermark">Panto Interiors</div>

        <div className="print-button no-print"><button className="pdf-button" onClick={handleDownload}>Download pdf</button></div>

      <div className="my-invoice" ref={invoiceRef}>
        {/* Header */}
           <InvoiceHeader  isPrintable={isPrintable}/>

        {/* Dynamic Table */}
        <InvoiceTable isPrintable={isPrintable} />

        {/* Terms */}
        <InvoiceTerms isPrintable={isPrintable}  />

        {/* Footer */}
        <InvoiceFooter isPrintable={isPrintable} />
      </div>
    </div>
  );
};

export default InvoicePage;
