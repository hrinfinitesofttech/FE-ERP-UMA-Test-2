/**
 * UMA ERP - Universal Document & Report Print Utility
 * 
 * Provides isolated printing for purchase orders, inquiry letters, invoices,
 * vouchers, certificates, challans, reports, and data tables.
 * 
 * Uses an isolated hidden iframe with all active stylesheets and @page rules.
 * This guarantees:
 * 1. Zero clipping by parent modals or overflow scroll containers.
 * 2. Zero blank pages caused by premature DOM class cleanup timers.
 * 3. Exact 100% full-page rendering matching official Uma Technofab formats.
 */

export interface PrintOptions {
  title?: string;
  orientation?: 'portrait' | 'landscape';
  autoPageBreak?: boolean;
}

export function printContent(
  target: string | HTMLElement | null,
  options?: PrintOptions
): void {
  if (typeof window === 'undefined') return;

  // 1. Resolve target element
  let element: HTMLElement | null = null;
  if (typeof target === 'string') {
    element = document.getElementById(target) || document.querySelector(target);
  } else {
    element = target;
  }

  if (!element) {
    window.print();
    return;
  }

  try {
    // 2. Create isolated print iframe
    const iframeId = 'erp-isolated-print-frame';
    const oldFrame = document.getElementById(iframeId);
    if (oldFrame && oldFrame.parentNode) {
      oldFrame.parentNode.removeChild(oldFrame);
    }

    const iframe = document.createElement('iframe');
    iframe.id = iframeId;
    iframe.style.position = 'fixed';
    iframe.style.top = '-9999px';
    iframe.style.left = '-9999px';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = '0px';
    iframe.style.opacity = '0';
    iframe.setAttribute('aria-hidden', 'true');
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    // 3. Extract and transfer all styles (Tailwind, fonts, custom rules)
    let stylesHtml = '';
    document.querySelectorAll('link[rel="stylesheet"], style').forEach((node) => {
      stylesHtml += node.outerHTML;
    });

    const isLandscape = options?.orientation === 'landscape';
    const docTitle = options?.title || document.title || 'UMA ERP Document';

    // 4. Populate iframe with isolated document
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>${docTitle}</title>
          ${stylesHtml}
          <style>
            @page {
              size: ${isLandscape ? 'A4 landscape' : 'A4 portrait'};
              margin: 6mm 8mm;
            }
            html, body {
              background: #ffffff !important;
              color: #000000 !important;
              margin: 0 !important;
              padding: 0 !important;
              overflow: visible !important;
              width: 100% !important;
              height: auto !important;
            }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .print\\:hidden,
            .no-print,
            [data-print-hide],
            button,
            nav {
              display: none !important;
            }
            #printable-purchase-order,
            #printable-rfq-letter {
              box-shadow: none !important;
              margin: 0 auto !important;
              width: 100% !important;
              max-width: 100% !important;
            }
          </style>
        </head>
        <body>
          <div style="width: 100%; max-width: 100%; margin: 0 auto; padding: 0;">
            ${element.outerHTML}
          </div>
        </body>
      </html>
    `);
    doc.close();

    // 5. Trigger print after iframe renders styles & assets
    iframe.contentWindow?.focus();
    setTimeout(() => {
      try {
        iframe.contentWindow?.print();
      } catch (printErr) {
        console.error('Iframe print error, falling back to window.print():', printErr);
        window.print();
      } finally {
        // Cleanup iframe after user dismisses print dialog
        window.addEventListener(
          'focus',
          () => {
            setTimeout(() => {
              if (iframe.parentNode) {
                iframe.parentNode.removeChild(iframe);
              }
            }, 1500);
          },
          { once: true }
        );
      }
    }, 300);
  } catch (err) {
    console.error('Isolated print initialization failed, falling back to window.print():', err);
    window.print();
  }
}

export const printElement = printContent;
