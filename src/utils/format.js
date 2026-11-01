export const formatRupiah = (val) => {
  const number = Number(val) || 0;
  return 'Rp ' + number.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

export const formatDate = (timestamp) => {
  if (!timestamp) return '-';
  const date = new Date(timestamp);
  return date.toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).replace(/\./g, ':');
};

export const formatShortDate = (timestamp) => {
  if (!timestamp) return '-';
  return new Date(timestamp).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: '2-digit' });
};

export const generateTransactionId = () => {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const rand = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
  return `TRX-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}-${rand}`;
};
