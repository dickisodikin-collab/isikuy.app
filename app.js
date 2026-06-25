const { useState, useEffect, useMemo, useRef } = React;

/* =========================================================
   HELPERS
   ========================================================= */
const rupiah = (n) => 'Rp' + Math.round(n).toLocaleString('id-ID');
const uid = () => Math.random().toString(36).slice(2, 10).toUpperCase();
const nowStr = () => {
  const d = new Date();
  return d.toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

function detectOperator(phone) {
  const p = phone.replace(/\D/g, '');
  const prefix3 = p.slice(0, 4);
  const table = [
    { test: ['0812', '0813', '0821', '0822', '0823', '0851', '0852', '0853'], name: 'Telkomsel', color: '#E4002B' },
    { test: ['0817', '0818', '0819', '0859', '0877', '0878'], name: 'XL', color: '#1A5DD9' },
    { test: ['0814', '0815', '0816', '0855', '0856', '0857', '0858'], name: 'Indosat Ooredoo', color: '#FFD200' },
    { test: ['0895', '0896', '0897', '0898', '0899'], name: 'Tri (3)', color: '#8C2BFF' },
    { test: ['0831', '0832', '0833', '0838'], name: 'Axis', color: '#8E44AD' },
    { test: ['0881', '0882', '0883', '0884', '0885', '0886', '0887', '0888', '0889'], name: 'Smartfren', color: '#E2001A' },
  ];
  for (const row of table) if (row.test.includes(prefix3)) return row;
  return null;
}

/* =========================================================
   ICONS (lucide-style inline svg, stroke based)
   ========================================================= */
const I = {
  wifi: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13a10 10 0 0 1 14 0" /><path d="M8.5 16.5a5 5 0 0 1 7 0" /><path d="M2 9a15 15 0 0 1 20 0" /><circle cx="12" cy="20" r="1" fill="currentColor" /></svg>,
  phoneCall: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13.5 2A1.5 1.5 0 0 1 15 3.5v.879a1.5 1.5 0 0 1-1.5 1.5H7v13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V8" /><rect x="7" y="2" width="10" height="20" rx="2" /></svg>,
  bolt: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z" /></svg>,
  wallet: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" /><path d="M3 5v14a2 2 0 0 0 2 2h16v-5" /><path d="M18 12a2 2 0 0 0 0 4h4v-4Z" /></svg>,
  gamepad: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="6" y1="12" x2="10" y2="12" /><line x1="8" y1="10" x2="8" y2="14" /><circle cx="15" cy="13" r="1" fill="currentColor" /><circle cx="18" cy="11" r="1" fill="currentColor" /><rect x="2" y="6" width="20" height="12" rx="6" /></svg>,
  bpjs: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" /></svg>,
  water: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.69s-5 6-5 10a5 5 0 0 0 10 0c0-4-5-10-5-10Z" /></svg>,
  tv: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>,
  more: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="5" cy="12" r="1.5" fill="currentColor" /><circle cx="12" cy="12" r="1.5" fill="currentColor" /><circle cx="19" cy="12" r="1.5" fill="currentColor" /></svg>,
  bell: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 1 1 12 0c0 3.5 1 5 2 6H4c1-1 2-2.5 2-6Z" /><path d="M10 19a2 2 0 0 0 4 0" /></svg>,
  eye: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>,
  eyeOff: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2 2 20 20" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c6.5 0 10 7 10 7a13.6 13.6 0 0 1-2.7 3.66m-3.3 1.94A9.6 9.6 0 0 1 12 18c-6.5 0-10-7-10-7a13.3 13.3 0 0 1 3.4-4.6" /><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" /></svg>,
  plus: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
  history: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /><path d="M12 7v5l3 3" /></svg>,
  chevronRight: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 6 15 12 9 18" /></svg>,
  chevronLeft: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 6 9 12 15 18" /></svg>,
  home: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 11 9-8 9 8" /><path d="M5 10v10a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V10" /></svg>,
  grid: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>,
  receipt: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 3h14v18l-2.5-1.5L14 21l-2.5-1.5L9 21l-2.5-1.5L4 21V3Z" /><line x1="8" y1="8" x2="16" y2="8" /><line x1="8" y1="12" x2="16" y2="12" /></svg>,
  user: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4.5 5-6.5 8-6.5s6.5 2 8 6.5" /></svg>,
  search: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.5" y2="16.5" /></svg>,
  filter: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="4 4 20 4 14 12 14 19 10 21 10 12 4 4" /></svg>,
  check: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
  checkCircle: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.8 11A10 10 0 1 1 17 4" /><polyline points="22 4 12 14.5 8 10.5" /></svg>,
  clock: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 16 14" /></svg>,
  x: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
  download: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12" /><polyline points="7 11 12 16 17 11" /><line x1="4" y1="20" x2="20" y2="20" /></svg>,
  share: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.6" y1="13.5" x2="15.4" y2="17.5" /><line x1="15.4" y1="6.5" x2="8.6" y2="10.5" /></svg>,
  alertTriangle: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.3 3.86 1.8 18a1 1 0 0 0 .9 1.5h18.6a1 1 0 0 0 .9-1.5L13.7 3.86a1 1 0 0 0-1.7 0Z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12" y2="17.01" /></svg>,
  qr: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><line x1="14" y1="14" x2="14" y2="18" /><line x1="18" y1="14" x2="18" y2="14.01" /><line x1="14" y1="21" x2="18" y2="21" /><line x1="21" y1="14" x2="21" y2="21" /></svg>,
  bank: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="21" x2="21" y2="21" /><line x1="5" y1="21" x2="5" y2="10" /><line x1="19" y1="21" x2="19" y2="10" /><polygon points="12 3 21 8 3 8" /><line x1="9" y1="21" x2="9" y2="10" /><line x1="15" y1="21" x2="15" y2="10" /></svg>,
  store: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9 5 3h14l2 6" /><path d="M3 9v11a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V9" /><path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" /></svg>,
  shield: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2 4 5v6c0 5 3.5 8.5 8 11 4.5-2.5 8-6 8-11V5l-8-3Z" /></svg>,
  headset: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 14v-2a9 9 0 0 1 18 0v2" /><path d="M21 15a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2h3v4Z" /><path d="M3 15a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2H3v4Z" /></svg>,
  gift: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="8" width="18" height="13" rx="1" /><line x1="12" y1="8" x2="12" y2="21" /><path d="M3 13h18" /><path d="M12 8C9 8 7 6.5 7 4.5A2.5 2.5 0 0 1 9.5 2C11.5 2 12 5 12 8Z" /><path d="M12 8c3 0 5-1.5 5-3.5A2.5 2.5 0 0 0 14.5 2C12.5 2 12 5 12 8Z" /></svg>,
  edit: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>,
  logout: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>,
  star: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.1 8.6 22 9.3 17 14.1 18.2 21 12 17.6 5.8 21 7 14.1 2 9.3 8.9 8.6 12 2" /></svg>,
  inbox: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12" /><path d="M5.5 5h13l3.5 7v7a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-7l3.5-7Z" /></svg>,
};

/* =========================================================
   PRODUCT DATA
   ========================================================= */
const CATEGORIES = [
  { id: 'pulsa', label: 'Pulsa', icon: I.phoneCall },
  { id: 'data', label: 'Paket Data', icon: I.wifi },
  { id: 'listrik', label: 'Token PLN', icon: I.bolt },
  { id: 'ewallet', label: 'E-Wallet', icon: I.wallet },
  { id: 'game', label: 'Top Up Game', icon: I.gamepad },
  { id: 'bpjs', label: 'BPJS', icon: I.bpjs },
  { id: 'pdam', label: 'PDAM', icon: I.water },
  { id: 'tv', label: 'TV Kabel', icon: I.tv },
];

const PULSA_NOMINAL = [
  { id: 'p5', label: '5.000', value: 5000, price: 6500 },
  { id: 'p10', label: '10.000', value: 10000, price: 11500 },
  { id: 'p15', label: '15.000', value: 15000, price: 16000, badge: 'Hemat' },
  { id: 'p20', label: '20.000', value: 20000, price: 20500 },
  { id: 'p25', label: '25.000', value: 25000, price: 25500 },
  { id: 'p50', label: '50.000', value: 50000, price: 49500, badge: 'Promo' },
  { id: 'p100', label: '100.000', value: 100000, price: 98500 },
  { id: 'p150', label: '150.000', value: 150000, price: 147500 },
];

const DATA_NOMINAL = [
  { id: 'd1', label: '1GB / 3 Hari', value: '1GB', price: 13000 },
  { id: 'd2', label: '2GB / 7 Hari', value: '2GB', price: 22000 },
  { id: 'd3', label: '5GB / 30 Hari', value: '5GB', price: 45000, badge: 'Populer' },
  { id: 'd4', label: '8GB / 30 Hari', value: '8GB', price: 62000 },
  { id: 'd5', label: '15GB / 30 Hari', value: '15GB', price: 89000, badge: 'Hemat' },
  { id: 'd6', label: '25GB / 30 Hari', value: '25GB', price: 119000 },
  { id: 'd7', label: '40GB / 30 Hari', value: '40GB', price: 149000 },
  { id: 'd8', label: 'Unlimited / 30 Hari', value: 'Unlimited', price: 199000 },
];

const PLN_NOMINAL = [
  { id: 'l20', label: 'Token 20.000', value: 20000, price: 22500 },
  { id: 'l50', label: 'Token 50.000', value: 50000, price: 52500 },
  { id: 'l100', label: 'Token 100.000', value: 100000, price: 102500, badge: 'Populer' },
  { id: 'l200', label: 'Token 200.000', value: 200000, price: 202500 },
  { id: 'l500', label: 'Token 500.000', value: 500000, price: 502500 },
  { id: 'l1000', label: 'Token 1.000.000', value: 1000000, price: 1002500 },
];

const EWALLET_PRODUCTS = [
  { id: 'gopay', name: 'GoPay', color: '#00AA13' },
  { id: 'ovo', name: 'OVO', color: '#4C3494' },
  { id: 'dana', name: 'DANA', color: '#118EEA' },
  { id: 'shopeepay', name: 'ShopeePay', color: '#EE4D2D' },
  { id: 'linkaja', name: 'LinkAja', color: '#E2231A' },
  { id: 'isaku', name: 'i.saku', color: '#F37021' },
];
const EWALLET_NOMINAL = [
  { id: 'e10', label: '10.000', value: 10000, price: 11000 },
  { id: 'e20', label: '20.000', value: 20000, price: 21000 },
  { id: 'e50', label: '50.000', value: 50000, price: 51000, badge: 'Populer' },
  { id: 'e100', label: '100.000', value: 100000, price: 101000 },
  { id: 'e200', label: '200.000', value: 200000, price: 201500 },
  { id: 'e500', label: '500.000', value: 500000, price: 503000 },
];

const GAME_PRODUCTS = [
  { id: 'mobilelegends', name: 'Mobile Legends', sub: 'Diamonds · Isi User ID & Server', color: '#1A2980' },
  { id: 'freefire', name: 'Free Fire', sub: 'Diamonds · Isi User ID', color: '#FF6A00' },
  { id: 'pubgm', name: 'PUBG Mobile', sub: 'UC · Isi User ID', color: '#F2A900' },
  { id: 'genshin', name: 'Genshin Impact', sub: 'Genesis Crystal · Isi UID & Server', color: '#1E3A5F' },
  { id: 'valorant', name: 'Valorant', sub: 'VP Points · Isi Riot ID', color: '#FF4655' },
  { id: 'cod', name: 'Call of Duty Mobile', sub: 'CP · Isi User ID', color: '#3D3D3D' },
];
const GAME_NOMINAL = {
  mobilelegends: [
    { id: 'm1', label: '86 Diamonds', value: '86 DM', price: 21000 },
    { id: 'm2', label: '172 Diamonds', value: '172 DM', price: 41000 },
    { id: 'm3', label: '257 Diamonds', value: '257 DM', price: 61000, badge: 'Populer' },
    { id: 'm4', label: '344 Diamonds', value: '344 DM', price: 81000 },
    { id: 'm5', label: '706 Diamonds', value: '706 DM', price: 161000 },
    { id: 'm6', label: 'Weekly Pass', value: 'WP', price: 29000 },
  ],
  freefire: [
    { id: 'f1', label: '70 Diamonds', value: '70 DM', price: 11000 },
    { id: 'f2', label: '140 Diamonds', value: '140 DM', price: 21000 },
    { id: 'f3', label: '355 Diamonds', value: '355 DM', price: 51000, badge: 'Populer' },
    { id: 'f4', label: '720 Diamonds', value: '720 DM', price: 101000 },
    { id: 'f5', label: 'Member Mingguan', value: 'MM', price: 28000 },
    { id: 'f6', label: 'Member Bulanan', value: 'MB', price: 149000 },
  ],
  pubgm: [
    { id: 'u1', label: '60 UC', value: '60 UC', price: 14000 },
    { id: 'u2', label: '325 UC', value: '325 UC', price: 71000, badge: 'Populer' },
    { id: 'u3', label: '660 UC', value: '660 UC', price: 141000 },
    { id: 'u4', label: '1800 UC', value: '1800 UC', price: 371000 },
  ],
  genshin: [
    { id: 'g1', label: '60 Genesis Crystal', value: '60 GC', price: 16000 },
    { id: 'g2', label: '300+30 Genesis Crystal', value: '330 GC', price: 79000, badge: 'Populer' },
    { id: 'g3', label: '980+110 Genesis Crystal', value: '1090 GC', price: 249000 },
    { id: 'g4', label: 'Blessing Welkin Moon', value: 'BWM', price: 79000 },
  ],
  valorant: [
    { id: 'v1', label: '125 VP', value: '125 VP', price: 19000 },
    { id: 'v2', label: '420 VP', value: '420 VP', price: 59000, badge: 'Populer' },
    { id: 'v3', label: '700 VP', value: '700 VP', price: 95000 },
    { id: 'v4', label: '1750 VP', value: '1750 VP', price: 229000 },
  ],
  cod: [
    { id: 'c1', label: '80 CP', value: '80 CP', price: 16000 },
    { id: 'c2', label: '420 CP', value: '420 CP', price: 79000, badge: 'Populer' },
    { id: 'c3', label: '880 CP', value: '880 CP', price: 159000 },
  ],
};

const PAYMENT_METHODS = [
  {
    group: 'Saldo Aplikasi',
    items: [
      { id: 'balance', name: 'Saldo Isikuy', sub: 'Gunakan saldo dalam aplikasi', fee: 0, logo: 'IK', logoColor: '#16D8A3' },
    ]
  },
  {
    group: 'Virtual Account',
    items: [
      { id: 'va_bca', name: 'BCA Virtual Account', sub: 'Transfer via m-BCA / ATM / KlikBCA', fee: 4000, logo: 'BCA', logoColor: '#0058A3' },
      { id: 'va_bri', name: 'BRI Virtual Account', sub: 'Transfer via BRImo / ATM', fee: 4000, logo: 'BRI', logoColor: '#00529C' },
      { id: 'va_bni', name: 'BNI Virtual Account', sub: 'Transfer via BNI Mobile / ATM', fee: 4000, logo: 'BNI', logoColor: '#F37021' },
      { id: 'va_mandiri', name: 'Mandiri Virtual Account', sub: 'Transfer via Livin\' / ATM', fee: 4000, logo: 'MDR', logoColor: '#003A70' },
      { id: 'va_permata', name: 'Permata Virtual Account', sub: 'Transfer via PermataMobile X', fee: 4000, logo: 'PMT', logoColor: '#005BAC' },
    ]
  },
  {
    group: 'E-Wallet',
    items: [
      { id: 'ew_gopay', name: 'GoPay', sub: 'Saldo GoPay / GoPay Coins', fee: 1500, logo: 'GP', logoColor: '#00AA13' },
      { id: 'ew_ovo', name: 'OVO', sub: 'Saldo OVO Cash', fee: 1500, logo: 'OVO', logoColor: '#4C3494' },
      { id: 'ew_dana', name: 'DANA', sub: 'Saldo DANA', fee: 1500, logo: 'DN', logoColor: '#118EEA' },
      { id: 'ew_shopeepay', name: 'ShopeePay', sub: 'Saldo ShopeePay', fee: 1500, logo: 'SP', logoColor: '#EE4D2D' },
    ]
  },
  {
    group: 'QRIS',
    items: [
      { id: 'qris', name: 'QRIS', sub: 'Scan pakai semua e-wallet & m-banking', fee: 700, logo: 'QR', logoColor: '#FFB020' },
    ]
  },
  {
    group: 'Gerai Retail',
    items: [
      { id: 'alfamart', name: 'Alfamart', sub: 'Bayar tunai di kasir Alfamart', fee: 2500, logo: 'ALF', logoColor: '#E2231A' },
      { id: 'indomaret', name: 'Indomaret', sub: 'Bayar tunai di kasir Indomaret', fee: 2500, logo: 'IND', logoColor: '#005BAC' },
    ]
  },
  {
    group: 'Kartu',
    items: [
      { id: 'card', name: 'Kartu Debit/Kredit', sub: 'Visa, Mastercard, JCB', fee: 2900, logo: 'CC', logoColor: '#8B94A8' },
    ]
  },
];

const QUICK_CONTACTS = [
  { name: 'Saya Sendiri', phone: '0812-3456-7890' },
  { name: 'Ibu', phone: '0813-2233-4455' },
  { name: 'Ayah', phone: '0821-9988-7766' },
  { name: 'Adi', phone: '0817-1122-3344' },
];

const PROMO_DATA = [
  { tag: 'Promo', title: 'Cashback 10% Token PLN', desc: 'Maksimal cashback Rp5.000, berlaku untuk semua nominal token.' },
  { tag: 'Baru', title: 'Diskon Top Up Mobile Legends', desc: 'Hemat hingga Rp8.000 untuk pembelian 706 Diamonds.' },
  { tag: 'Promo', title: 'Gratis Biaya Admin QRIS', desc: 'Bayar pakai QRIS tanpa biaya tambahan sepanjang Juni.' },
];

const initialHistory = [
  { id: 'TRX' + uid(), cat: 'pulsa', title: 'Pulsa Telkomsel 25.000', sub: '0812-3456-7890', amount: 25500, status: 'success', date: '20 Jun 2026, 14:21' },
  { id: 'TRX' + uid(), cat: 'listrik', title: 'Token PLN 100.000', sub: 'No. Meter 5217008811', amount: 102500, status: 'success', date: '18 Jun 2026, 09:03' },
  { id: 'TRX' + uid(), cat: 'game', title: 'Mobile Legends 257 Diamonds', sub: 'ID 123456789 (8812)', amount: 61000, status: 'success', date: '15 Jun 2026, 21:47' },
  { id: 'TRX' + uid(), cat: 'ewallet', title: 'Top Up GoPay 50.000', sub: '0812-3456-7890', amount: 51000, status: 'failed', date: '12 Jun 2026, 18:12' },
];

/* =========================================================
   TOAST
   ========================================================= */
function useToast() {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);
  const show = (message, type = 'ok') => {
    clearTimeout(timerRef.current);
    setToast({ message, type });
    timerRef.current = setTimeout(() => setToast(null), 2600);
  };
  return [toast, show];
}

function Toast({ toast }) {
  return (
    <div className={`toast ${toast ? 'show' : ''} ${toast?.type === 'error' ? 'error' : ''}`}>
      {toast?.type === 'error' ? <I.alertTriangle /> : <I.checkCircle />}
      <span>{toast?.message || ''}</span>
    </div>
  );
}

/* =========================================================
   RECEIPT SHEET (signature element)
   ========================================================= */
function ReceiptSheet({ trx, onClose, showToast }) {
  if (!trx) return null;
  const isSuccess = trx.status === 'success';
  const isPending = trx.status === 'pending';

  const copyId = () => {
    navigator.clipboard?.writeText(trx.id).catch(() => {});
    showToast('ID transaksi disalin');
  };

  return (
    <div className="receipt-overlay" onClick={onClose}>
      <div className="receipt-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="receipt-handle" />
        <div className="receipt-status">
          <div className={`status-ring ${isPending ? 'pending' : ''}`}>
            {isPending ? <I.clock /> : isSuccess ? <I.checkCircle /> : <I.x />}
          </div>
          <h3>
            {isPending ? 'Transaksi Diproses' : isSuccess ? 'Transaksi Berhasil' : 'Transaksi Gagal'}
          </h3>
          <p>
            {isPending
              ? 'Pembayaran kamu sedang kami verifikasi, biasanya kurang dari 1 menit.'
              : isSuccess
                ? 'Produk sudah dikirim ke tujuan. Simpan struk ini sebagai bukti.'
                : 'Dana otomatis dikembalikan ke metode pembayaran kamu.'}
          </p>
        </div>

        <div className="receipt-strip">
          <div className="r-row">
            <span className="k">ID Transaksi</span>
            <span className="v mono" onClick={copyId} style={{ cursor: 'pointer', color: 'var(--mint)' }}>{trx.id}</span>
          </div>
          <div className="r-row">
            <span className="k">Waktu</span>
            <span className="v">{trx.date}</span>
          </div>
          <div className="r-row">
            <span className="k">Produk</span>
            <span className="v" style={{ textAlign: 'right', maxWidth: '60%' }}>{trx.title}</span>
          </div>
          <div className="r-row">
            <span className="k">Tujuan</span>
            <span className="v mono">{trx.sub}</span>
          </div>
          <div className="r-row">
            <span className="k">Metode Bayar</span>
            <span className="v">{trx.method || 'Saldo Isikuy'}</span>
          </div>

          <div className="receipt-zigzag" />

          <div className="r-row">
            <span className="k">Harga Produk</span>
            <span className="v mono">{rupiah(trx.amount - (trx.fee || 0))}</span>
          </div>
          <div className="r-row">
            <span className="k">Biaya Admin</span>
            <span className="v mono">{rupiah(trx.fee || 0)}</span>
          </div>
          <div className="r-row total">
            <span className="k">Total Bayar</span>
            <span className="v">{rupiah(trx.amount)}</span>
          </div>
        </div>

        <div className="receipt-actions">
          <button className="btn-ghost" onClick={() => showToast('Struk diunduh sebagai gambar')}>
            <I.download /> Unduh
          </button>
          <button className="btn-ghost" onClick={() => showToast('Tautan struk disalin')}>
            <I.share /> Bagikan
          </button>
          <button className="btn-primary" onClick={onClose}>
            <I.check /> Selesai
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   SHARED SMALL COMPONENTS
   ========================================================= */
function PageHeader({ title, sub, onBack }) {
  return (
    <div className="page-header">
      <button className="back-btn" onClick={onBack} aria-label="Kembali">
        <I.chevronLeft />
      </button>
      <div>
        <div className="page-title">{title}</div>
        {sub && <div className="page-sub">{sub}</div>}
      </div>
    </div>
  );
}

function NominalGrid({ items, selectedId, onSelect }) {
  return (
    <div className="nominal-grid">
      {items.map((it) => (
        <button
          key={it.id}
          className={`nominal-card ${selectedId === it.id ? 'selected' : ''}`}
          onClick={() => onSelect(it)}
        >
          {it.badge && <span className="badge">{it.badge}</span>}
          <span className="nom-title">{it.label}</span>
          <span className="nom-price">
            {rupiah(it.price)}
          </span>
        </button>
      ))}
    </div>
  );
}

function PaymentMethodPicker({ selected, onSelect, balance }) {
  return (
    <div className="pm-group">
      {PAYMENT_METHODS.map((grp) => (
        <div key={grp.group}>
          <div className="pm-group-label">{grp.group}</div>
          {grp.items.map((m) => {
            const insufficientBalance = m.id === 'balance' && balance < 0;
            return (
              <button
                key={m.id}
                className={`pm-row ${selected === m.id ? 'selected' : ''}`}
                onClick={() => onSelect(m.id)}
              >
                <div className="pm-logo" style={{ color: m.logoColor, background: 'var(--surface-2)' }}>{m.logo}</div>
                <div className="pm-info">
                  <div className="t">{m.name}</div>
                  <div className="s">{m.id === 'balance' ? `Saldo: ${rupiah(balance)}` : m.sub}</div>
                </div>
                <div className="pm-fee">{m.fee === 0 ? 'Gratis' : `+${rupiah(m.fee)}`}</div>
                <div className={`radio-dot ${selected === m.id ? 'on' : ''}`} />
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function EmptyState({ icon, title, desc }) {
  const Icon = icon;
  return (
    <div className="empty-state">
      <Icon />
      <h4>{title}</h4>
      <p>{desc}</p>
    </div>
  );
}

/* =========================================================
   HOME SCREEN
   ========================================================= */
function HomeScreen({ balance, balanceVisible, setBalanceVisible, goTo, history }) {
  const recentFavs = history.slice(0, 3);

  return (
    <div className="screen">
      <div className="topbar">
        <div className="brand">
          <div className="brand-mark">IK</div>
          <div className="brand-name">Isi<span>kuy</span></div>
        </div>
        <button className="icon-btn" aria-label="Notifikasi" onClick={() => goTo('notif')}>
          <I.bell />
          <span className="notif-dot" />
        </button>
      </div>

      <div className="balance-wrap">
        <div className="balance-card">
          <div className="balance-top">
            <span className="balance-label">
              <I.wallet style={{ width: 13, height: 13 }} /> Saldo Isikuy
            </span>
            <button className="eye-toggle" onClick={() => setBalanceVisible((v) => !v)} aria-label="Tampilkan saldo">
              {balanceVisible ? <I.eye /> : <I.eyeOff />}
            </button>
          </div>
          <div className="balance-amount">
            <span className="curr">Rp</span>
            {balanceVisible ? Math.round(balance).toLocaleString('id-ID') : '••••••'}
          </div>
          <div className="balance-actions">
            <button className="btn-primary" onClick={() => goTo('topupSaldo')}>
              <I.plus /> Top Up
            </button>
            <button className="btn-ghost" onClick={() => goTo('history')}>
              <I.history /> Riwayat
            </button>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section-head">
          <span className="section-title">Semua Layanan</span>
        </div>
        <div className="cat-grid">
          {CATEGORIES.map((c) => (
            <button key={c.id} className="cat-item" onClick={() => goTo('category', c.id)}>
              <div className="cat-icon">
                <c.icon style={{ color: 'var(--mint)' }} />
              </div>
              <span className="cat-label">{c.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="section">
        <div className="section-head">
          <span className="section-title">Promo Buat Kamu</span>
        </div>
      </div>
      <div className="promo-scroll">
        {PROMO_DATA.map((p, i) => (
          <div className="promo-card" key={i}>
            <span className="ptag">{p.tag}</span>
            <h4>{p.title}</h4>
            <p>{p.desc}</p>
          </div>
        ))}
      </div>

      <div className="section">
        <div className="section-head">
          <span className="section-title">Transaksi Terakhir</span>
          <button className="section-link" onClick={() => goTo('history')}>Lihat semua</button>
        </div>
        {recentFavs.length === 0 ? (
          <EmptyState icon={I.inbox} title="Belum ada transaksi" desc="Transaksi yang sudah selesai akan muncul di sini biar gampang diulang." />
        ) : (
          <div className="fav-list">
            {recentFavs.map((h) => {
              const cat = CATEGORIES.find((c) => c.id === h.cat);
              return (
                <button className="fav-row" key={h.id} onClick={() => goTo('category', h.cat)}>
                  <div className="fav-icon">{cat && <cat.icon style={{ color: 'var(--mint)' }} />}</div>
                  <div className="fav-info">
                    <div className="t">{h.title}</div>
                    <div className="s">{h.sub}</div>
                  </div>
                  <div className="fav-chevron"><I.chevronRight /></div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   GENERIC "NUMBER + NOMINAL" FLOW
   (Pulsa, Paket Data, Token PLN, BPJS, PDAM, TV Kabel)
   ========================================================= */
function NumberEntryFlow({ catId, onBack, onCheckout, showToast }) {
  const meta = {
    pulsa: { title: 'Isi Pulsa', sub: 'Semua operator', label: 'Nomor HP', placeholder: 'Contoh: 0812xxxxxxxx', items: PULSA_NOMINAL, detectOp: true, icon: I.phoneCall },
    data: { title: 'Paket Data', sub: 'Semua operator', label: 'Nomor HP', placeholder: 'Contoh: 0812xxxxxxxx', items: DATA_NOMINAL, detectOp: true, icon: I.wifi },
    listrik: { title: 'Token Listrik PLN', sub: 'Prabayar', label: 'No. Meter / ID Pelanggan', placeholder: 'Contoh: 5217008811', items: PLN_NOMINAL, detectOp: false, icon: I.bolt },
    bpjs: { title: 'BPJS Kesehatan', sub: 'Bayar iuran bulanan', label: 'No. Kartu / No. VA', placeholder: 'Contoh: 0001234567890', items: null, detectOp: false, icon: I.bpjs },
    pdam: { title: 'PDAM', sub: 'Pilih wilayah & bayar tagihan air', label: 'No. Pelanggan PDAM', placeholder: 'Contoh: 110023345', items: null, detectOp: false, icon: I.water },
    tv: { title: 'TV Kabel & Internet', sub: 'Indihome, Transvision, MNC Play, dll', label: 'No. Pelanggan', placeholder: 'Contoh: 120033441', items: null, detectOp: false, icon: I.tv },
  }[catId];

  const [number, setNumber] = useState('');
  const [selected, setSelected] = useState(null);
  const [method, setMethod] = useState('balance');
  const [billChecked, setBillChecked] = useState(false);
  const [bill, setBill] = useState(null);

  const op = meta.detectOp && number.length >= 4 ? detectOperator(number) : null;

  const isBillType = !meta.items; // BPJS / PDAM / TV pakai cek tagihan dulu
  const fee = PAYMENT_METHODS.flatMap((g) => g.items).find((m) => m.id === method)?.fee || 0;
  const productPrice = isBillType ? (bill?.amount || 0) : (selected?.price || 0);
  const total = productPrice + fee;
  const canPay = isBillType ? (billChecked && bill) : (!!selected && number.length >= 6);

  const handleCheckBill = () => {
    if (number.length < 5) { showToast('Nomor pelanggan belum valid', 'error'); return; }
    const simulated = { customerName: 'Budi Santoso', period: 'Juni 2026', amount: catId === 'bpjs' ? 150000 : catId === 'pdam' ? 87500 : 285000 };
    setBill(simulated);
    setBillChecked(true);
    showToast('Tagihan ditemukan');
  };

  const handlePay = () => {
    const title = isBillType
      ? `${meta.title} — ${bill.period}`
      : `${meta.title.replace('Isi ', '')} ${selected.label}`;
    onCheckout({
      cat: catId,
      title,
      sub: number,
      amount: total,
      fee,
      method: PAYMENT_METHODS.flatMap((g) => g.items).find((m) => m.id === method)?.name,
    });
  };

  return (
    <div className="screen">
      <PageHeader title={meta.title} sub={meta.sub} onBack={onBack} />

      <div className="field-group">
        <label className="field-label">{meta.label}</label>
        <div className="input-box">
          <meta.icon />
          <input
            type={isBillType ? 'text' : 'tel'}
            inputMode={isBillType ? 'text' : 'numeric'}
            placeholder={meta.placeholder}
            value={number}
            onChange={(e) => { setNumber(e.target.value); setBillChecked(false); setBill(null); }}
          />
          {number && (
            <button className="input-clear" onClick={() => { setNumber(''); setBillChecked(false); setBill(null); }}>
              <I.x />
            </button>
          )}
        </div>
        {op && (
          <div className="detect-chip" style={{ color: op.color, borderColor: op.color, background: op.color + '22' }}>
            <I.checkCircle /> Terdeteksi {op.name}
          </div>
        )}
        {meta.detectOp && (
          <div className="contact-chips">
            {QUICK_CONTACTS.map((c) => (
              <button key={c.name} className="cchip" onClick={() => setNumber(c.phone.replace(/\D/g, ''))}>
                <span className="av">{c.name[0]}</span> {c.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {isBillType ? (
        <>
          <div className="field-group">
            <button className="cta-btn" style={{ background: 'var(--surface-2)', color: 'var(--text)', border: '1px solid var(--border)', boxShadow: 'none' }} onClick={handleCheckBill}>
              <I.search /> Cek Tagihan
            </button>
          </div>
          {billChecked && bill && (
            <div className="field-group">
              <div className="receipt-strip" style={{ margin: 0 }}>
                <div className="r-row"><span className="k">Nama Pelanggan</span><span className="v">{bill.customerName}</span></div>
                <div className="r-row"><span className="k">Periode</span><span className="v">{bill.period}</span></div>
                <div className="r-row total"><span className="k">Total Tagihan</span><span className="v">{rupiah(bill.amount)}</span></div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="section" style={{ paddingTop: 18 }}>
          <div className="section-head"><span className="section-title">Pilih Nominal</span></div>
          <NominalGrid items={meta.items} selectedId={selected?.id} onSelect={setSelected} />
        </div>
      )}

      {canPay && (
        <div className="section" style={{ paddingTop: 18 }}>
          <div className="section-head"><span className="section-title">Metode Pembayaran</span></div>
        </div>
      )}
      {canPay && <PaymentMethodPicker selected={method} onSelect={setMethod} balance={1250000} />}

      <div className="sticky-cta">
        {canPay && (
          <div className="cta-summary">
            <span className="lbl">Total Bayar</span>
            <span className="val">{rupiah(total)}</span>
          </div>
        )}
        <button className="cta-btn" disabled={!canPay} onClick={handlePay}>
          <I.shield /> Bayar Sekarang
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   E-WALLET TOP UP FLOW
   ========================================================= */
function EwalletFlow({ onBack, onCheckout, showToast }) {
  const [provider, setProvider] = useState(null);
  const [phone, setPhone] = useState('');
  const [selected, setSelected] = useState(null);
  const [method, setMethod] = useState('balance');

  const fee = PAYMENT_METHODS.flatMap((g) => g.items).find((m) => m.id === method)?.fee || 0;
  const total = (selected?.price || 0) + fee;
  const canPay = provider && selected && phone.length >= 6;

  if (!provider) {
    return (
      <div className="screen">
        <PageHeader title="Top Up E-Wallet" sub="Pilih dompet digital tujuan" onBack={onBack} />
        <div className="field-group">
          <div className="cat-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {EWALLET_PRODUCTS.map((p) => (
              <button key={p.id} className="cat-item" onClick={() => setProvider(p)}>
                <div className="cat-icon">
                  <span style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: 13, color: p.color }}>
                    {p.name.slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <span className="cat-label">{p.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="screen">
      <PageHeader title={`Top Up ${provider.name}`} sub="Masukkan nomor terdaftar" onBack={() => setProvider(null)} />
      <div className="field-group">
        <label className="field-label">Nomor HP Terdaftar {provider.name}</label>
        <div className="input-box">
          <I.phoneCall />
          <input type="tel" inputMode="numeric" placeholder="Contoh: 0812xxxxxxxx" value={phone} onChange={(e) => setPhone(e.target.value)} />
          {phone && <button className="input-clear" onClick={() => setPhone('')}><I.x /></button>}
        </div>
        <div className="contact-chips">
          {QUICK_CONTACTS.map((c) => (
            <button key={c.name} className="cchip" onClick={() => setPhone(c.phone.replace(/\D/g, ''))}>
              <span className="av">{c.name[0]}</span> {c.name}
            </button>
          ))}
        </div>
      </div>

      <div className="section" style={{ paddingTop: 18 }}>
        <div className="section-head"><span className="section-title">Pilih Nominal Top Up</span></div>
        <NominalGrid items={EWALLET_NOMINAL} selectedId={selected?.id} onSelect={setSelected} />
      </div>

      {canPay && (
        <div className="section" style={{ paddingTop: 18 }}>
          <div className="section-head"><span className="section-title">Metode Pembayaran</span></div>
        </div>
      )}
      {canPay && <PaymentMethodPicker selected={method} onSelect={setMethod} balance={1250000} />}

      <div className="sticky-cta">
        {canPay && (
          <div className="cta-summary">
            <span className="lbl">Total Bayar</span>
            <span className="val">{rupiah(total)}</span>
          </div>
        )}
        <button
          className="cta-btn"
          disabled={!canPay}
          onClick={() => onCheckout({
            cat: 'ewallet',
            title: `Top Up ${provider.name} ${selected.label}`,
            sub: phone,
            amount: total,
            fee,
            method: PAYMENT_METHODS.flatMap((g) => g.items).find((m) => m.id === method)?.name,
          })}
        >
          <I.shield /> Bayar Sekarang
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   GAME TOP UP FLOW
   ========================================================= */
function GameFlow({ onBack, onCheckout, showToast }) {
  const [game, setGame] = useState(null);
  const [userId, setUserId] = useState('');
  const [serverId, setServerId] = useState('');
  const [selected, setSelected] = useState(null);
  const [method, setMethod] = useState('balance');

  const fee = PAYMENT_METHODS.flatMap((g) => g.items).find((m) => m.id === method)?.fee || 0;
  const total = (selected?.price || 0) + fee;
  const needsServer = game && ['mobilelegends', 'genshin'].includes(game.id);
  const canPay = game && selected && userId.length >= 4 && (!needsServer || serverId.length >= 1);

  if (!game) {
    return (
      <div className="screen">
        <PageHeader title="Top Up Game" sub="Pilih game favoritmu" onBack={onBack} />
        <div className="search-bar">
          <div className="search-row">
            <div className="search-box"><I.search /><input placeholder="Cari game..." /></div>
          </div>
        </div>
        <div className="field-group">
          <div className="fav-list">
            {GAME_PRODUCTS.map((g) => (
              <button key={g.id} className="fav-row" onClick={() => setGame(g)}>
                <div className="fav-icon" style={{ background: g.color + '33' }}>
                  <span style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: 12, color: g.color }}>{g.name.slice(0, 2).toUpperCase()}</span>
                </div>
                <div className="fav-info">
                  <div className="t">{g.name}</div>
                  <div className="s">{g.sub}</div>
                </div>
                <div className="fav-chevron"><I.chevronRight /></div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const nominalList = GAME_NOMINAL[game.id] || [];

  return (
    <div className="screen">
      <PageHeader title={game.name} sub={game.sub} onBack={() => setGame(null)} />
      <div className="field-group">
        <label className="field-label">User ID</label>
        <div className="input-box">
          <I.gamepad />
          <input inputMode="numeric" placeholder="Masukkan User ID kamu" value={userId} onChange={(e) => setUserId(e.target.value)} />
          {userId && <button className="input-clear" onClick={() => setUserId('')}><I.x /></button>}
        </div>
      </div>
      {needsServer && (
        <div className="field-group">
          <label className="field-label">Server ID / Zone ID</label>
          <div className="input-box">
            <I.grid />
            <input inputMode="numeric" placeholder="Contoh: 8812" value={serverId} onChange={(e) => setServerId(e.target.value)} />
            {serverId && <button className="input-clear" onClick={() => setServerId('')}><I.x /></button>}
          </div>
        </div>
      )}

      <div className="section" style={{ paddingTop: 18 }}>
        <div className="section-head"><span className="section-title">Pilih Item</span></div>
        <NominalGrid items={nominalList} selectedId={selected?.id} onSelect={setSelected} />
      </div>

      {canPay && (
        <div className="section" style={{ paddingTop: 18 }}>
          <div className="section-head"><span className="section-title">Metode Pembayaran</span></div>
        </div>
      )}
      {canPay && <PaymentMethodPicker selected={method} onSelect={setMethod} balance={1250000} />}

      <div className="sticky-cta">
        {canPay && (
          <div className="cta-summary">
            <span className="lbl">Total Bayar</span>
            <span className="val">{rupiah(total)}</span>
          </div>
        )}
        <button
          className="cta-btn"
          disabled={!canPay}
          onClick={() => onCheckout({
            cat: 'game',
            title: `${game.name} ${selected.label}`,
            sub: `ID ${userId}${needsServer ? ' (' + serverId + ')' : ''}`,
            amount: total,
            fee,
            method: PAYMENT_METHODS.flatMap((g) => g.items).find((m) => m.id === method)?.name,
          })}
        >
          <I.shield /> Bayar Sekarang
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   HISTORY SCREEN
   ========================================================= */
function HistoryScreen({ history, onBack, onOpenTrx }) {
  const [filter, setFilter] = useState('all');
  const filters = [
    { id: 'all', label: 'Semua' },
    { id: 'success', label: 'Berhasil' },
    { id: 'pending', label: 'Diproses' },
    { id: 'failed', label: 'Gagal' },
  ];
  const filtered = filter === 'all' ? history : history.filter((h) => h.status === filter);

  return (
    <div className="screen">
      <PageHeader title="Riwayat Transaksi" sub={`${history.length} transaksi tercatat`} onBack={onBack} />
      <div className="chip-row">
        {filters.map((f) => (
          <button key={f.id} className={`filter-chip ${filter === f.id ? 'on' : ''}`} onClick={() => setFilter(f.id)}>
            {f.label}
          </button>
        ))}
      </div>
      <div className="field-group" style={{ paddingTop: 6 }}>
        {filtered.length === 0 ? (
          <EmptyState icon={I.inbox} title="Tidak ada transaksi" desc="Belum ada transaksi dengan status ini." />
        ) : (
          <div className="fav-list">
            {filtered.map((h) => {
              const cat = CATEGORIES.find((c) => c.id === h.cat) || { icon: I.receipt };
              return (
                <button className="fav-row" key={h.id} onClick={() => onOpenTrx(h)}>
                  <div className="fav-icon"><cat.icon style={{ color: 'var(--mint)' }} /></div>
                  <div className="fav-info">
                    <div className="t">{h.title}</div>
                    <div className="s">{h.date}</div>
                  </div>
                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--mono)' }}>{rupiah(h.amount)}</span>
                    <span className={`status-pill ${h.status}`}>{h.status === 'success' ? 'Berhasil' : h.status === 'pending' ? 'Diproses' : 'Gagal'}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   TOP UP SALDO (untuk saldo aplikasi sendiri)
   ========================================================= */
function TopUpSaldoScreen({ onBack, onCheckout }) {
  const nominal = [
    { id: 's1', label: '50.000', value: 50000, price: 50000 },
    { id: 's2', label: '100.000', value: 100000, price: 100000 },
    { id: 's3', label: '200.000', value: 200000, price: 200000, badge: 'Populer' },
    { id: 's4', label: '500.000', value: 500000, price: 500000 },
    { id: 's5', label: '1.000.000', value: 1000000, price: 1000000 },
    { id: 's6', label: '2.000.000', value: 2000000, price: 2000000 },
  ];
  const [selected, setSelected] = useState(null);
  const [method, setMethod] = useState('va_bca');
  const payMethods = PAYMENT_METHODS.filter((g) => g.group !== 'Saldo Aplikasi');
  const fee = payMethods.flatMap((g) => g.items).find((m) => m.id === method)?.fee || 0;
  const total = (selected?.price || 0) + fee;

  return (
    <div className="screen">
      <PageHeader title="Top Up Saldo" sub="Isi saldo Isikuy untuk transaksi lebih cepat" onBack={onBack} />
      <div className="section" style={{ paddingTop: 6 }}>
        <div className="section-head"><span className="section-title">Pilih Nominal</span></div>
        <NominalGrid items={nominal} selectedId={selected?.id} onSelect={setSelected} />
      </div>

      {selected && (
        <>
          <div className="section" style={{ paddingTop: 18 }}>
            <div className="section-head"><span className="section-title">Metode Pembayaran</span></div>
          </div>
          <div className="pm-group">
            {payMethods.map((grp) => (
              <div key={grp.group}>
                <div className="pm-group-label">{grp.group}</div>
                {grp.items.map((m) => (
                  <button key={m.id} className={`pm-row ${method === m.id ? 'selected' : ''}`} onClick={() => setMethod(m.id)}>
                    <div className="pm-logo" style={{ color: m.logoColor }}>{m.logo}</div>
                    <div className="pm-info">
                      <div className="t">{m.name}</div>
                      <div className="s">{m.sub}</div>
                    </div>
                    <div className="pm-fee">{m.fee === 0 ? 'Gratis' : `+${rupiah(m.fee)}`}</div>
                    <div className={`radio-dot ${method === m.id ? 'on' : ''}`} />
                  </button>
                ))}
              </div>
            ))}
          </div>
        </>
      )}

      <div className="sticky-cta">
        {selected && (
          <div className="cta-summary">
            <span className="lbl">Total Bayar</span>
            <span className="val">{rupiah(total)}</span>
          </div>
        )}
        <button
          className="cta-btn"
          disabled={!selected}
          onClick={() => onCheckout({
            cat: 'topup',
            title: `Top Up Saldo ${selected.label}`,
            sub: 'Saldo Isikuy',
            amount: total,
            fee,
            method: payMethods.flatMap((g) => g.items).find((m) => m.id === method)?.name,
            isTopup: true,
            topupValue: selected.value,
          })}
        >
          <I.shield /> Bayar Sekarang
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   CATEGORY KATALOG (browse semua produk per kategori)
   ========================================================= */
function CategoryRouter({ catId, onBack, onCheckout, showToast }) {
  if (catId === 'ewallet') return <EwalletFlow onBack={onBack} onCheckout={onCheckout} showToast={showToast} />;
  if (catId === 'game') return <GameFlow onBack={onBack} onCheckout={onCheckout} showToast={showToast} />;
  return <NumberEntryFlow catId={catId} onBack={onBack} onCheckout={onCheckout} showToast={showToast} />;
}

/* =========================================================
   ALL SERVICES (grid lengkap)
   ========================================================= */
function ServicesScreen({ goTo, onBack }) {
  return (
    <div className="screen">
      <PageHeader title="Semua Layanan" sub="Pilih kategori yang kamu butuhkan" onBack={onBack} />
      <div className="field-group">
        <div className="cat-grid">
          {CATEGORIES.map((c) => (
            <button key={c.id} className="cat-item" onClick={() => goTo('category', c.id)}>
              <div className="cat-icon active-cat"><c.icon style={{ color: 'var(--mint)' }} /></div>
              <span className="cat-label">{c.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="divider" />
      <div className="field-group">
        <label className="field-label">Lainnya</label>
      </div>
      <div className="menu-list">
        <button className="menu-row"><div className="mi"><I.gift /></div><span className="mt">Voucher Belanja</span><div className="mc"><I.chevronRight /></div></button>
        <button className="menu-row"><div className="mi"><I.bank /></div><span className="mt">Tarik Tunai</span><div className="mc"><I.chevronRight /></div></button>
        <button className="menu-row" style={{ borderBottom: 'none' }}><div className="mi"><I.store /></div><span className="mt">Buka Lapak Konter</span><div className="mc"><I.chevronRight /></div></button>
      </div>
    </div>
  );
}

/* =========================================================
   PROFILE SCREEN
   ========================================================= */
function ProfileScreen({ balance, goTo }) {
  return (
    <div className="screen">
      <div className="topbar"><div className="page-title" style={{ fontSize: 17 }}>Akun Saya</div><div /></div>
      <div className="profile-head">
        <div className="profile-avatar">BS</div>
        <div>
          <div className="profile-name">Budi Santoso</div>
          <div className="profile-phone">0812-3456-7890 · budi.s@email.com</div>
        </div>
      </div>

      <div className="field-group">
        <div className="balance-card" style={{ padding: '16px 18px' }}>
          <div className="balance-top" style={{ marginBottom: 8 }}>
            <span className="balance-label"><I.wallet style={{ width: 13, height: 13 }} /> Saldo Isikuy</span>
          </div>
          <div className="balance-amount" style={{ fontSize: 24 }}>
            <span className="curr">Rp</span>{Math.round(balance).toLocaleString('id-ID')}
          </div>
          <div className="balance-actions">
            <button className="btn-primary" onClick={() => goTo('topupSaldo')}><I.plus /> Top Up Saldo</button>
          </div>
        </div>
      </div>

      <div className="divider" />

      <div className="menu-list">
        <button className="menu-row"><div className="mi"><I.user /></div><span className="mt">Edit Profil</span><div className="mc"><I.chevronRight /></div></button>
        <button className="menu-row" onClick={() => goTo('history')}><div className="mi"><I.history /></div><span className="mt">Riwayat Transaksi</span><div className="mc"><I.chevronRight /></div></button>
        <button className="menu-row"><div className="mi"><I.bank /></div><span className="mt">Rekening & Kartu Tersimpan</span><div className="mc"><I.chevronRight /></div></button>
        <button className="menu-row"><div className="mi"><I.shield /></div><span className="mt">Keamanan & PIN</span><div className="mc"><I.chevronRight /></div></button>
        <button className="menu-row"><div className="mi"><I.gift /></div><span className="mt">Kode Referral</span><div className="mc"><I.chevronRight /></div></button>
        <button className="menu-row"><div className="mi"><I.headset /></div><span className="mt">Bantuan & Pusat Panduan</span><div className="mc"><I.chevronRight /></div></button>
        <button className="menu-row" style={{ borderBottom: 'none' }}><div className="mi" style={{ color: 'var(--red)' }}><I.logout /></div><span className="mt" style={{ color: 'var(--red)' }}>Keluar</span></button>
      </div>
    </div>
  );
}

/* =========================================================
   NOTIFICATION SCREEN
   ========================================================= */
function NotifScreen({ onBack }) {
  const notifs = [
    { icon: I.checkCircle, title: 'Transaksi berhasil', desc: 'Token PLN 100.000 sudah masuk ke No. Meter 5217008811.', time: '2 jam lalu' },
    { icon: I.gift, title: 'Promo baru buat kamu', desc: 'Cashback 10% untuk semua top up token listrik bulan ini.', time: '1 hari lalu' },
    { icon: I.shield, title: 'Keamanan akun', desc: 'PIN transaksi kamu berhasil diperbarui.', time: '3 hari lalu' },
  ];
  return (
    <div className="screen">
      <PageHeader title="Notifikasi" sub="Update transaksi & info promo" onBack={onBack} />
      <div className="field-group">
        <div className="fav-list">
          {notifs.map((n, i) => (
            <div className="fav-row" key={i}>
              <div className="fav-icon"><n.icon style={{ color: 'var(--mint)' }} /></div>
              <div className="fav-info">
                <div className="t">{n.title}</div>
                <div className="s">{n.desc}</div>
              </div>
              <span style={{ fontSize: 10.5, color: 'var(--text-faint)', flexShrink: 0 }}>{n.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   BOTTOM NAVIGATION
   ========================================================= */
function BottomNav({ active, goTo }) {
  const tabs = [
    { id: 'home', label: 'Home', icon: I.home },
    { id: 'services', label: 'Layanan', icon: I.grid },
    { id: 'history', label: 'Riwayat', icon: I.receipt },
    { id: 'profile', label: 'Akun', icon: I.user },
  ];
  return (
    <div className="bottomnav">
      {tabs.map((t) => (
        <button key={t.id} className={`nav-btn ${active === t.id ? 'active' : ''}`} onClick={() => goTo(t.id)}>
          <t.icon />
          {t.label}
        </button>
      ))}
    </div>
  );
}

/* =========================================================
   ROOT APP
   ========================================================= */
function App() {
  const [screen, setScreen] = useState('home');
  const [activeTab, setActiveTab] = useState('home');
  const [catId, setCatId] = useState(null);
  const [balance, setBalance] = useState(1250000);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [history, setHistory] = useState(initialHistory);
  const [receiptTrx, setReceiptTrx] = useState(null);
  const [toast, showToast] = useToast();
  const [navStack, setNavStack] = useState(['home']);

  const goTo = (target, payload) => {
    if (target === 'category') setCatId(payload);
    if (['home', 'services', 'history', 'profile'].includes(target)) setActiveTab(target);
    setNavStack((s) => [...s, target]);
    setScreen(target);
    window.scrollTo(0, 0);
  };

  const goBack = () => {
    setNavStack((s) => {
      const next = s.slice(0, -1);
      const last = next[next.length - 1] || 'home';
      setScreen(last);
      if (['home', 'services', 'history', 'profile'].includes(last)) setActiveTab(last);
      return next.length ? next : ['home'];
    });
    window.scrollTo(0, 0);
  };

  const handleCheckout = (payload) => {
    const trxId = 'TRX' + uid();
    const date = nowStr();
    // simulasi proses: kemungkinan kecil gagal untuk realisme, mayoritas sukses
    const roll = Math.random();
    const status = roll > 0.93 ? 'failed' : 'success';

    const trx = { id: trxId, date, status, ...payload };

    setHistory((h) => [trx, ...h]);

    if (status === 'success') {
      if (payload.isTopup) {
        setBalance((b) => b + payload.topupValue);
      } else if (payload.method === 'Saldo Isikuy') {
        setBalance((b) => b - payload.amount);
      }
      showToast('Transaksi berhasil diproses');
    } else {
      showToast('Transaksi gagal, dana dikembalikan', 'error');
    }

    setReceiptTrx(trx);
    // balik ke home setelah checkout supaya nav-stack tidak menumpuk form
    setNavStack(['home']);
    setScreen('home');
    setActiveTab('home');
  };

  const renderScreen = () => {
    switch (screen) {
      case 'home':
        return <HomeScreen balance={balance} balanceVisible={balanceVisible} setBalanceVisible={setBalanceVisible} goTo={goTo} history={history} />;
      case 'services':
        return <ServicesScreen goTo={goTo} onBack={() => goTo('home')} />;
      case 'category':
        return <CategoryRouter catId={catId} onBack={goBack} onCheckout={handleCheckout} showToast={showToast} />;
      case 'history':
        return <HistoryScreen history={history} onBack={() => goTo('home')} onOpenTrx={setReceiptTrx} />;
      case 'profile':
        return <ProfileScreen balance={balance} goTo={goTo} />;
      case 'topupSaldo':
        return <TopUpSaldoScreen onBack={goBack} onCheckout={handleCheckout} />;
      case 'notif':
        return <NotifScreen onBack={goBack} />;
      default:
        return <HomeScreen balance={balance} balanceVisible={balanceVisible} setBalanceVisible={setBalanceVisible} goTo={goTo} history={history} />;
    }
  };

  return (
    <>
      {renderScreen()}
      <BottomNav active={activeTab} goTo={goTo} />
      <Toast toast={toast} />
      {receiptTrx && <ReceiptSheet trx={receiptTrx} onClose={() => setReceiptTrx(null)} showToast={showToast} />}
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById('app'));
root.render(<App />);
