import { formatRupiah, formatDate } from './format';

export const printReceipt = (transaction) => {
  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'position:absolute;width:0;height:0;border:none;';
  document.body.appendChild(iframe);
  const doc = iframe.contentWindow.document;
  
  const itemsHTML = transaction.items.map(item => {
    const displayName = item.variantName && item.variantName !== 'Custom' ? `${item.name} (${item.variantName})` : item.name;
    return `<div class="item-row"><div class="item-name">${displayName}</div><div class="item-details"><span>${item.qty} x ${formatRupiah(item.price)}</span><span>${formatRupiah(item.price * item.qty)}</span></div></div>`;
  }).join('');

  const customerHTML = transaction.customerName 
    ? `<div style="font-size:10px;font-weight:bold;margin-top:4px;border-top:1px dotted #000;padding-top:4px;">Pembeli: ${transaction.customerName}</div>`
    : '';

  doc.open();
  doc.write(`<!DOCTYPE html><html><head><title>Struk - KIOS BU SRIBEKTI</title><style>*{box-sizing:border-box}body{font-family:'Courier New',monospace;font-size:12px;line-height:1.4;margin:0;padding:8px;color:#000;width:58mm}.text-center{text-align:center}.bold{font-weight:bold}.divider{border-top:1px dashed #000;margin:6px 0}.item-row{margin-bottom:4px}.item-name{font-weight:bold;word-break:break-all}.item-details{display:flex;justify-content:space-between;padding-left:8px;font-size:11px}.total-row{display:flex;justify-content:space-between;margin-bottom:2px}@media print{body{width:100%}@page{margin:0}}</style></head><body><div class="text-center"><div class="bold" style="font-size:14px">KIOS BU SRIBEKTI</div><div style="font-size:10px">${formatDate(transaction.timestamp)}</div><div style="font-size:10px">ID: ${transaction.id}</div>${customerHTML}</div><div class="divider"></div>${itemsHTML}<div class="divider"></div><div class="total-row"><span>TOTAL</span><span class="bold">${formatRupiah(transaction.total)}</span></div><div class="total-row"><span>BAYAR</span><span>${formatRupiah(transaction.payment)}</span></div><div class="total-row"><span>KEMBALI</span><span class="bold">${formatRupiah(transaction.change)}</span></div><div class="divider"></div><div class="text-center" style="font-size:10px;margin-top:8px">Terima Kasih! Selamat Berbelanja 🙏</div><script>window.onload=function(){window.print();setTimeout(function(){window.frameElement&&window.frameElement.remove()},1000)}<\/script></body></html>`);
  doc.close();
};

export const downloadReceipt = (transaction) => {
  const { formatRupiah: fR, formatDate: fD } = { formatRupiah, formatDate };
  const itemsHTML = transaction.items.map(item => {
    const displayName = item.variantName && item.variantName !== 'Custom' ? `${item.name} (${item.variantName})` : item.name;
    return `<div class="item-row"><div class="item-name">${displayName}</div><div class="item-details"><span>${item.qty} x ${fR(item.price)}</span><span>${fR(item.price * item.qty)}</span></div></div>`;
  }).join('');

  const customerHTML = transaction.customerName 
    ? `<div style="font-size:11px;font-weight:bold;margin-top:6px;border-top:1px dotted #000;padding-top:4px;">Pembeli: ${transaction.customerName}</div>`
    : '';

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Struk ${transaction.id}</title><style>*{box-sizing:border-box}body{font-family:'Courier New',monospace;font-size:13px;line-height:1.5;padding:16px;max-width:300px;margin:0 auto;color:#000}.text-center{text-align:center}.bold{font-weight:bold}.divider{border-top:1px dashed #000;margin:8px 0}.item-row{margin-bottom:6px}.item-name{font-weight:bold}.item-details{display:flex;justify-content:space-between;padding-left:8px;font-size:12px;color:#333}.total-row{display:flex;justify-content:space-between;margin-bottom:3px}</style></head><body><div class="text-center"><div class="bold" style="font-size:16px">KIOS BU SRIBEKTI</div><div>${fD(transaction.timestamp)}</div><div style="font-size:11px">ID: ${transaction.id}</div>${customerHTML}</div><div class="divider"></div>${itemsHTML}<div class="divider"></div><div class="total-row"><span>TOTAL</span><span class="bold">${fR(transaction.total)}</span></div><div class="total-row"><span>BAYAR</span><span>${fR(transaction.payment)}</span></div><div class="total-row bold"><span>KEMBALI</span><span>${fR(transaction.change)}</span></div><div class="divider"></div><div class="text-center">Terima Kasih! Selamat Berbelanja 🙏</div></body></html>`;
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Struk-${transaction.id}.html`;
  a.click();
  URL.revokeObjectURL(url);
};
