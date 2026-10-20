/**
 * UMA ERP - Universal Document & Report Print Utility
 * 
 * Provides isolated printing for invoices, purchase orders, vouchers,
 * certificates, challans, reports, and data tables.
 * 
 * Ensures sidebars, navigation headers, control toolbars, action buttons,
 * and dialog backdrops are hidden, printing ONLY the target document cleanly.
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

  // 1. Resolve element
  let element: HTMLElement | null = null;
  if (typeof target === 'string') {
    element = document.getElementById(target) || document.querySelector(target);
  } else {
    element = target;
  }

  // Save current document title if a custom print title is requested
  const originalTitle = document.title;
  if (options?.title) {
    document.title = options.title;
  }

  if (element) {
    // Tag the target element and body
    element.classList.add('erp-print-target');
    document.body.classList.add('erp-printing-active');

    if (options?.orientation === 'landscape') {
      document.body.classList.add('erp-print-landscape');
    }

    const cleanup = () => {
      document.body.classList.remove('erp-printing-active', 'erp-print-landscape');
      if (element) {
        element.classList.remove('erp-print-target');
      }
      if (options?.title) {
        document.title = originalTitle;
      }
      window.removeEventListener('afterprint', cleanup);
    };

    window.addEventListener('afterprint', cleanup);

    // Give browser brief tick to paint visibility classes before print dialog opens
    requestAnimationFrame(() => {
      window.print();
    });

    // Fallback cleanup in case afterprint does not fire in certain browser contexts
    setTimeout(cleanup, 2500);
  } else {
    // If no target element found, fallback to standard clean page print
    window.print();
  }
}

export const printElement = printContent;
