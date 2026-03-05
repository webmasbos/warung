/**
 * functions/[[path]].js — Warung • Cloudflare Pages Functions
 * ═══════════════════════════════════════════════════════════════
 * RAJAH: v30.6-BUGFIX — "Penakluk Race Condition seo.cfg, Pemurni applyImmortalEnv, Pembenar Prefix Honeypot"
 * PEMBENAHAN v30.6:
 *   1. generateFakeContent — prefix honeytrap hardcode 'trap' diganti dengan parameter honeyPrefix yang benar
 *   2. seo.cfg race condition — seo singleton tidak lagi di-mutate per-request;
 *      kini dibuat proxy Object.create(seo) per-request sehingga cfg tidak bocor antar concurrent request
 *   3. applyImmortalEnv — tidak lagi mutate global IMMORTAL langsung; kini mengembalikan objek frozen
 *      dan di-apply via Object.assign di onRequest — aman di multi-domain isolate
 * DALANG:  dukunseo.com
 * PEMBENAHAN v30.3: Roh THEME_CARD_RATIO & THEME_GRID_COLS_MOBILE kini benar-benar merasuk
 *             ke dalam CSS (dahulu terkunci mati di 4 titik untuk aspect-ratio dan 2 titik untuk grid)
 * PEMBENAHAN v30.4: Kunci gaib _themeCache dahulu hanya merangkum accent+bg — akibatnya mengganti THEME_CARD_RATIO
 *             atau THEME_GRID_COLS_MOBILE di papan dewa tidak melahirkan CSS baru selagi roh isolate hidup.
 *             Kunci kini merangkul kedua jimat tersebut.
 *             Tambahan: penyucian wujud THEME_CARD_RATIO — persembahan "16:9" otomatis disulap ke "16/9",
 *             wujud sesat lainnya jatuh kembali ke mantra asal "16/9".
 * 
 *  - Peta Lelaku LENGKAP: padepokan, penglihatan, album, pencarian, penanda, golongan, lembar diam, sitemap, RSS
 *  - Pesugihan: Slot HTML kustom + AdSense, peka wujud genggam/meja
 *  - Ilmu Pamor: SeoHelper penuh daya, JSON-LD, OG, remah jalan, sitemap fase bulan
 *  - Penangkal Setan: DNA Digital (hanya bot), Tubuh Arwah, Rajah CSS, Jebakan Liang Hitam, Domba Kurban
 *  - Perlindungan Gaib: jimat nonce CSP, HMAC, penjaga laju yang lihai
 *  - Kesaktian: LRU cache, QuantumCache berpenjaga TTL, brotli lewat CF, srcset responsif
 *  - Wujud: EMAS GELAP — semua jimat warna & rupa bisa dikendalikan lewat papan dewa env
 * 
 * ── THEME ENV VARIABLES (Cloudflare Dashboard → Settings → Variables) ──────────
 *  THEME_ACCENT          Warna mahkota/emas    bawaan: #ffaa00
 *  THEME_ACCENT2         Warna mahkota tersentuh    bawaan: #ffc233
 *  THEME_BG              Tanah pijakan utama   bawaan: #0a0a0a
 *  THEME_BG2             Tanah kartu/panel     bawaan: #121212
 *  THEME_BG3             Tanah disentuh        bawaan: #1a1a1a
 *  THEME_FG              Warna ukiran huruf    bawaan: #ffffff
 *  THEME_FG_DIM          Warna ukiran memudar  bawaan: #888888
 *  THEME_BORDER          Warna batas dunia     bawaan: #252525
 *  THEME_FONT            Nama Aksara Google    bawaan: (aksara sistem)
 *  THEME_NAV_STYLE       'gelap' atau 'emas'   bawaan: gelap
 *  THEME_BADGE_HOT       Label lencana PANAS   bawaan:  PANAS
 *  THEME_PROMO_TEXT      Mantra spanduk pesugihan   bawaan:  PREMIUM • 4K UHD • TANPA IKLAN
 *  THEME_SHOW_PROMO      'tampak'/'sembunyi'   bawaan: tampak
 *  THEME_SHOW_TRENDING   'tampak'/'sembunyi'   bawaan: tampak
 *  THEME_GRID_COLS_MOBILE Lajur jaring genggam 1/2 bawaan: 2
 *  THEME_CARD_RATIO      Perbandingan wujud kartu   bawaan: 16/9 (bisa: 2/3, 1/1)
 * ─────────────────────────────────────────────────────────────────────────────────
 *
 * ── ADS CODE ENV VARIABLES (ganti jaringan iklan tanpa deploy ulang) ─────────
 *  ADS_CODE_TOP_D    Mantra iklan Golongan PUNCAK Desktop   (header_top, before_grid, mid_grid)
 *  ADS_CODE_TOP_M    Mantra iklan Golongan PUNCAK Seluler
 *  ADS_CODE_BTM_D    Mantra iklan Golongan BAWAH Desktop (after_grid, after_content, footer_top)
 *  ADS_CODE_BTM_M    Mantra iklan Golongan BAWAH Seluler
 *  ADS_CODE_SDB_D    Mantra iklan Golongan SISI Desktop (sidebar_top, sidebar_mid, sidebar_bottom)
 *  ADS_CODE_SDB_M    Mantra iklan Golongan SISI Seluler
 *  Bila tiada jimat → kembali ke mantra magsrv bawaan
 * ─────────────────────────────────────────────────────────────────────────────────
 *
 * ── IMMORTAL ENV VARIABLES ───────────────────────────────────────────────────────
 *  IMMORTAL_DIGITAL_DNA      'hidup'/'mati'   bawaan: hidup
 *  IMMORTAL_CSS_STEGO        'hidup'/'mati'   bawaan: hidup
 *  IMMORTAL_GHOST_BODY       'hidup'/'mati'   bawaan: hidup
 *  IMMORTAL_BLACKHOLE        'hidup'/'mati'   bawaan: hidup
 *  IMMORTAL_SACRIFICIAL_LAMB 'hidup'/'mati'   bawaan: hidup
 *  IMMORTAL_BLACKHOLE_MAX    Bilangan Bulat   bawaan: 50
 *  IMMORTAL_SACRIFICE_ENERGY Bilangan Bulat   bawaan: 1000
 *  IMMORTAL_RATE_WINDOW      Detik hidup      bawaan: 60
 *  IMMORTAL_RATE_MAX         Bilangan Bulat   bawaan: 120
 *  IMMORTAL_SCRAPER_RATE_MAX Bilangan Bulat   bawaan: 10
 *  IMMORTAL_CSS_OPACITY      Angka Desimal    bawaan: 0.001
 *  IMMORTAL_DNA_POOL         Kosakata CSV kustom  bawaan: (kolam mantra leluhur)
 * ─────────────────────────────────────────────────────────────────────────────────
 */

'use strict';

// ── Jimat-jimat Akar di Lapisan Modul ───────────────────────────────────────
const _STATIC_EXT_RX  = /\.(?:css|js|mjs|map|ico|png|jpg|jpeg|gif|svg|webp|avif|woff|woff2|ttf|eot|otf|mp4|webm|ogg|mp3|wav|json|txt|xml|pdf|zip|gz|br)$/i;
const _HANDLED_PATHS   = new Set(['sitemap.xml','rss.xml','feed.xml','feed','robots.txt']);
const _SEARCHBOT_RX    = /Googlebot|bingbot|Slurp|DuckDuckBot|Baiduspider|YandexBot|Sogou|Exabot|facebot|ia_archiver|Google-InspectionTool/i;
const _BOT_UA_RX       = /HeadlessChrome|Headless|PhantomJS|SlimerJS|Scrapy|python-requests|Go-http-client|curl\/|wget\//i;
const _MOBILE_UA_RX    = /Mobile|Android|iPhone|iPad/i;
const _SCRAPER_BOTS    = ['SemrushBot','AhrefsBot','MJ12bot','DotBot','BLEXBot','MegaIndex','SeznamBot'];
// Pembenahan: mantra rajah ini dahulu dilafalkan ulang tiap kali sacrificeRedirect() dipanggil
const _BAD_BOT_RX      = /SemrushBot|AhrefsBot|MJ12bot|DotBot|BLEXBot|MegaIndex|SeznamBot|spambot|scraperbot|ia_archiver/i;
const _REAL_BROWSER_RX = /Chrome\/|Firefox\/|Safari\/|Edg\//i;

// ── Rajah Keabadian — Tak Lapuk dimakan Zaman ────────────────────────────────
const IMMORTAL = {
  ENABLE_DIGITAL_DNA:       true,
  ENABLE_CSS_STEGO:         true,
  ENABLE_GHOST_BODY:        true,
  ENABLE_BLACKHOLE:         true,
  ENABLE_SACRIFICIAL_LAMB:  true,
  BLACKHOLE_MAX_REQUESTS:   50,
  DNA_POOL: [
  // Mantra dasar (tidak berbahaya bagi semesta)
  'bokep', 'porno', 'viral', 'hijab',
  'tobrut', 'colmek', 'bugil', 'hiper',
  
  // Mantra penglaris — kata-kata yang sedang naik pamor
  'avtub', 'bokepsin', 'playbokep', 'hits', 'mantap',
  'gratis', 'online', 'live', '24jam',
  
  // Mantra isi — jimat penyebut konten
  'film', 'video', 'streaming', 'nonton',
  'terbaru', 'terlengkap', 'kualitas HD'
],

LSI: {
  'bokep': ['bacol', 'asuapn', 'bokeh', 'ngewe'],
  'porno': ['mesum', 'cabul', 'skandal'],
  'viral': ['hot', 'update', 'hits'],
  'hijab': ['ukhti', 'uhkti', 'kedurung', 'jilbab'],
  'tobrut': ['montok', 'toge', 'semok', 'bohay'],
  'colmek': ['colok', 'omek', 'ngocok', 'kobel'],
  'bugil': ['telanjang', 'buka bukaan', 'lepas baju'],
  'hiper': ['sange', 'lonte', 'barbar'],
  
  // Mantra serba guna
  'avtub': ['bokeplah', 'avbokep', 'ngentub'],
  'bokepsin': ['sangetube', 'lingbokep', 'indo18'],
  'playbokep': ['bokepindoh', 'ruangbokep', 'simontok']
},
  CSS_OPACITY: 0.001,
  CSS_VARS: ['--primary-color','--secondary-color','--font-family','--spacing-unit','--border-radius','--transition-speed','--container-width','--header-height','--footer-padding'],
  SACRIFICE_ENERGY_MAX: 1000,
  RATE_LIMIT_WINDOW: 60,
  RATE_LIMIT_MAX: 120,
  SCRAPER_RATE_MAX: 10,
};

// ── Kitab Pencatat Sial — Buku Besar Kutukan ─────────────────────────────────
const _ERROR_LOG     = new Set();
const _ERROR_LOG_TTL = 60000; // 1 menit — satu putaran nafas sang dukun
const _ERROR_LOG_MAX = 500;   // Pembenahan v30: batasi jumlah catatan agar tak tumbuh liar bak akar gaib
function logError(context, error, request = null, ctx = null) {
  const ip  = request?.headers?.get('CF-Connecting-IP') || 'unknown';
  const ua  = (request?.headers?.get('User-Agent') || 'unknown').substring(0, 100);
  const key = `${context}:${error?.message}:${ip}`;
  if (_ERROR_LOG.has(key)) return;
  // Pembenahan v30: bila batas kutukan tercapai, usir semua catatan — pengusiran kilat
  if (_ERROR_LOG.size >= _ERROR_LOG_MAX) _ERROR_LOG.clear();
  _ERROR_LOG.add(key);
  setTimeout(() => _ERROR_LOG.delete(key), _ERROR_LOG_TTL);
  const rid = ctx?.id || '';
  console.error(`[${context}${rid?':'+rid:''}]`, {
    message:   error?.message,
    stack:     error?.stack,
    ip,
    ua,
    duration:  ctx?.startTime ? Date.now() - ctx.startTime : undefined,
    timestamp: new Date().toISOString(),
  });
}

// ── Peti Kenangan Gaib — Simpanan Ingatan Terakhir ───────────────────────────
class LRUMap extends Map {
  constructor(maxSize = 100) { super(); this.maxSize = maxSize; }
  get(key) {
    // Perbaikan Kutukan #10: pindahkan ke ujung ekor (paling anyar disentuh) kala get()
    if (!super.has(key)) return undefined;
    const val = super.get(key);
    super.delete(key);
    super.set(key, val);
    return val;
  }
  set(key, value) {
    // Bila kunci sudah bersemayam, cabut lebih dahulu agar berpindah ke ujung ekor (paling baru)
    if (this.has(key)) this.delete(key);
    else if (this.size >= this.maxSize) this.delete(this.keys().next().value);
    return super.set(key, value);
  }
}

// ── Guci Quantum Keramat — Penjaga Waktu dan Rupa ────────────────────────────
class QCache {
  constructor(maxSize = 200, ttl = 60000) {
    this.maxSize = maxSize; this.ttl = ttl;
    this.data = new Map(); this.ts = new Map();
  }
  get(key) {
    if (!this.data.has(key)) return null;
    if (Date.now() - this.ts.get(key) > this.ttl) { this._del(key); return null; }
    const v = this.data.get(key);
    this.data.delete(key); this.data.set(key, v);
    return v;
  }
  set(key, value) {
    // Pembenahan v30: bila kunci sudah ada, cabut lebih dahulu agar posisi LRU lurus + reset cap waktu
    if (this.data.has(key)) { this.data.delete(key); this.ts.delete(key); }
    else if (this.data.size >= this.maxSize) this._del(this.data.keys().next().value);
    this.data.set(key, value); this.ts.set(key, Date.now());
    return value;
  }
  has(key) {
    if (!this.data.has(key)) return false;
    if (Date.now() - this.ts.get(key) > this.ttl) { this._del(key); return false; }
    return true;
  }
  _del(key) { this.data.delete(key); this.ts.delete(key); }
}


let _scheduledPingLastTs = 0;
// Pembenahan: getDapurConfig — simpan di ingatan per domain agar tidak menguras KV tiap permintaan
const _dapurConfigMemCache = new LRUMap(10); // domain -> { data, ts }, max 10 domain
// isBlacklisted — tersimpan di ingatan gaib, hidup 5 menit. Entri terpadu: { terkutuk, waktu }
const _blCacheTTL = 300000; // 5 menit

// ── Wadah-wadah Jimat Aktif ──────────────────────────────────────────────────
const _hmacCache    = new LRUMap(20);
// _blCache menyimpan { terkutuk: bool, cap_waktu: number } — gabungan dari peti lama _blCache+_blCacheTs
const _blCache      = new LRUMap(500);
const _rlMemory     = new LRUMap(1000);
const _morphCache   = new LRUMap(20);
const _themeCache   = new LRUMap(10);
const _adsSlotsCache= new LRUMap(10);
const _headersCache = new LRUMap(50);
const _dnaCache     = new QCache(500, 60000);
const _blackholeMap = new LRUMap(5000);
const _sacrificeMap = new LRUMap(50);
const _immortalEnvCache = new LRUMap(5);
// Peti jimat modul untuk satu contoh per domain — menghindari kelahiran ulang tiap permintaan
const _seoCache        = new LRUMap(10);
const _cannibalCache   = new LRUMap(10);
const _hammerCache     = new LRUMap(10);
const _reqCfgCache     = new LRUMap(20); // merged cfg+dapurConfig per request cycle

// ── Pemanggil Roh Env — Kendali Semua Bendera Gaib dari Papan Dewa Cloudflare ──
function applyImmortalEnv(env) {
  const sig = [
    env.IMMORTAL_DIGITAL_DNA, env.IMMORTAL_CSS_STEGO, env.IMMORTAL_GHOST_BODY,
    env.IMMORTAL_BLACKHOLE, env.IMMORTAL_SACRIFICIAL_LAMB,
    env.IMMORTAL_BLACKHOLE_MAX, env.IMMORTAL_SACRIFICE_ENERGY,
    env.IMMORTAL_RATE_WINDOW, env.IMMORTAL_RATE_MAX, env.IMMORTAL_SCRAPER_RATE_MAX,
    env.IMMORTAL_CSS_OPACITY, env.IMMORTAL_DNA_POOL,
  ].join('|');
  const cached = _immortalEnvCache.get(sig);
  if (cached) return cached;
  const bool = (k, d) => env[k] !== undefined ? env[k] === 'true' : d;
  const int  = (k, d) => { if (env[k] === undefined) return d; const v = parseInt(env[k], 10); return (isNaN(v)||v<0) ? d : v; };
  const flt  = (k, d) => { if (env[k] === undefined) return d; const v = parseFloat(env[k]); return (isNaN(v)||v<0) ? d : v; };
  let dnaPool = IMMORTAL.DNA_POOL;
  if (env.IMMORTAL_DNA_POOL) {
    const pool = env.IMMORTAL_DNA_POOL.split(',').map(k=>k.trim()).filter(k=>k.length>1);
    if (pool.length >= 5) dnaPool = pool;
  }
  const result = Object.freeze({
    ENABLE_DIGITAL_DNA:      bool('IMMORTAL_DIGITAL_DNA',      IMMORTAL.ENABLE_DIGITAL_DNA),
    ENABLE_CSS_STEGO:        bool('IMMORTAL_CSS_STEGO',        IMMORTAL.ENABLE_CSS_STEGO),
    ENABLE_GHOST_BODY:       bool('IMMORTAL_GHOST_BODY',       IMMORTAL.ENABLE_GHOST_BODY),
    ENABLE_BLACKHOLE:        bool('IMMORTAL_BLACKHOLE',        IMMORTAL.ENABLE_BLACKHOLE),
    ENABLE_SACRIFICIAL_LAMB: bool('IMMORTAL_SACRIFICIAL_LAMB', IMMORTAL.ENABLE_SACRIFICIAL_LAMB),
    BLACKHOLE_MAX_REQUESTS:  int ('IMMORTAL_BLACKHOLE_MAX',    IMMORTAL.BLACKHOLE_MAX_REQUESTS),
    SACRIFICE_ENERGY_MAX:    int ('IMMORTAL_SACRIFICE_ENERGY', IMMORTAL.SACRIFICE_ENERGY_MAX),
    RATE_LIMIT_WINDOW:       int ('IMMORTAL_RATE_WINDOW',      IMMORTAL.RATE_LIMIT_WINDOW),
    RATE_LIMIT_MAX:          int ('IMMORTAL_RATE_MAX',         IMMORTAL.RATE_LIMIT_MAX),
    SCRAPER_RATE_MAX:        int ('IMMORTAL_SCRAPER_RATE_MAX', IMMORTAL.SCRAPER_RATE_MAX),
    CSS_OPACITY:             flt ('IMMORTAL_CSS_OPACITY',      IMMORTAL.CSS_OPACITY),
    CSS_VARS:                IMMORTAL.CSS_VARS,
    LSI:                     IMMORTAL.LSI,
    DNA_POOL:                dnaPool,
  });
  _immortalEnvCache.set(sig, result);
  return result;
}

// ═══════════════════════════════════════════════════════════════════════
// SESI 1 — TATANAN AWAL — Konfigurasi Alam Semesta
// ═══════════════════════════════════════════════════════════════════════

function subdomainToName(sub) {
  return sub.replace(/[_-]+/g,' ').replace(/([a-z])([A-Z])/g,'$1 $2').replace(/\b\w/g,c=>c.toUpperCase()).trim();
}

function detectDomainInfo(env, request) {
  if (env.WARUNG_DOMAIN && env.WARUNG_NAME) return { domain: env.WARUNG_DOMAIN, name: env.WARUNG_NAME };
  if (request) {
    try {
      const hostname = new URL(request.url).hostname;
      return { domain: env.WARUNG_DOMAIN || hostname, name: env.WARUNG_NAME || subdomainToName(hostname.split('.')[0]) };
    } catch { if (env.DAPUR_DEBUG==='true') console.error('Domain detection failed'); }
  }
  return { domain: env.WARUNG_DOMAIN||'sikatsaja.com', name: env.WARUNG_NAME||'SikatSaja' };
}

// Peti per domain — mencegah pencemaran lintas domain dalam isolate Cloudflare multi-domain
const _cfgCacheMap = new LRUMap(10); // max 10 domain per isolate
// Pembenahan: safeParseInt — elak NaN bila env mengandung string bukan angka atau hampa
function safeParseInt(val, defaultValue) {
  const parsed = parseInt(val, 10);
  return isNaN(parsed) ? defaultValue : Math.max(0, parsed);
}
function getConfig(env, request) {
  const { domain, name } = detectDomainInfo(env, request);
  const envSig = [
    env.PATH_CONTENT, env.PATH_ALBUM, env.PATH_SEARCH,
    env.PATH_CATEGORY, env.PATH_TAG, env.WARUNG_TYPE,
    env.WARUNG_NAME, env.ITEMS_PER_PAGE, env.RELATED_COUNT, env.TRENDING_COUNT,
    env.THEME_ACCENT, env.THEME_ACCENT2, env.THEME_BG, env.THEME_BG2, env.THEME_BG3,
    env.THEME_FG, env.THEME_FG_DIM, env.THEME_BORDER, env.THEME_FONT,
    env.THEME_FONT_DISPLAY, env.THEME_NAV_STYLE, env.THEME_BADGE_HOT,
    env.THEME_PROMO_TEXT, env.THEME_SHOW_PROMO, env.THEME_SHOW_TRENDING,
    env.THEME_GRID_COLS_MOBILE, env.THEME_CARD_RATIO,
    env.ADS_ENABLED, env.ADS_ADSENSE_CLIENT,
    env.ADS_CODE_TOP_D, env.ADS_CODE_TOP_M,
    env.ADS_CODE_BTM_D, env.ADS_CODE_BTM_M,
    env.ADS_CODE_SDB_D, env.ADS_CODE_SDB_M,
    env.ADS_CODE_POPUNDER,
  ].map(v => v || '').join('|');
  const cacheKey = domain + ':' + envSig;
  const shouldCache = !!env.WARUNG_DOMAIN && !domain.endsWith('.pages.dev') && !domain.endsWith('.workers.dev');
  if (shouldCache && _cfgCacheMap.has(cacheKey)) return _cfgCacheMap.get(cacheKey);
  const baseUrl  = (env.WARUNG_BASE_URL || ('https://' + domain)).replace(/\/$/, '');
  const basePath = new URL(baseUrl).pathname.replace(/\/$/, '');
  const cfg = {
    DAPUR_BASE_URL:   (env.DAPUR_BASE_URL || '').replace(/\/$/, ''),
    DAPUR_API_KEY:     env.DAPUR_API_KEY  || '',
    DAPUR_CACHE_TTL:   300,
    DAPUR_DEBUG:       false,
    WARUNG_NAME:       name,
    WARUNG_DOMAIN:     domain,
    WARUNG_TAGLINE:    env.WARUNG_TAGLINE  || 'Streaming gratis kualitas terbaik',
    WARUNG_BASE_URL:   baseUrl,
    WARUNG_BASE_PATH:  basePath,
    WARUNG_TYPE: (['A','B','C'].includes((env.WARUNG_TYPE||'').toUpperCase())) ? env.WARUNG_TYPE.toUpperCase() : 'A',
    SEO_DEFAULT_DESC:  env.SEO_DEFAULT_DESC || 'Streaming gratis kualitas terbaik. Akses mudah, tanpa registrasi.',
    SEO_KEYWORDS:      env.SEO_KEYWORDS    || 'streaming, video, album, cerita, gratis',
    SEO_LANG:          'id',
    SEO_LOCALE:        'id_ID',
    SEO_OG_IMAGE:      baseUrl + '/assets/og-default.jpg',
    SEO_OG_IMAGE_W:    safeParseInt(env.SEO_OG_IMAGE_W, 1200),
    SEO_OG_IMAGE_H:    safeParseInt(env.SEO_OG_IMAGE_H, 630),
    SEO_TWITTER_SITE:  env.SEO_TWITTER_SITE || '',
    PATH_CONTENT:  env.PATH_CONTENT  || 'tonton',
    PATH_SEARCH:   env.PATH_SEARCH   || 'cari',
    PATH_CATEGORY: env.PATH_CATEGORY || 'kategori',
    PATH_TAG:      env.PATH_TAG      || 'tag',
    PATH_ALBUM:    env.PATH_ALBUM    || 'album',
    PATH_DMCA:     env.PATH_DMCA     || 'dmca',
    PATH_TERMS:    env.PATH_TERMS    || 'terms',
    PATH_PRIVACY:  env.PATH_PRIVACY  || 'privacy',
    PATH_FAQ:      env.PATH_FAQ      || 'faq',
    PATH_CONTACT:  env.PATH_CONTACT  || 'contact',
    PATH_ABOUT:    env.PATH_ABOUT    || 'about',
    ITEMS_PER_PAGE: safeParseInt(env.ITEMS_PER_PAGE, 24),
    RELATED_COUNT:  safeParseInt(env.RELATED_COUNT,  8),
    TRENDING_COUNT: safeParseInt(env.TRENDING_COUNT, 10),
    DEFAULT_THUMB:  baseUrl + '/assets/no-thumb.jpg',
    ADS_ENABLED:          (env.ADS_ENABLED || 'true') === 'true',
    ADS_ADSENSE_CLIENT:    env.ADS_ADSENSE_CLIENT || '',
    ADS_LABEL:             env.ADS_LABEL || '',
    ADS_MID_GRID_AFTER:   safeParseInt(env.ADS_MID_GRID_AFTER, 6),
    CONTACT_EMAIL:         env.CONTACT_EMAIL      || ('admin@' + domain),
    CONTACT_EMAIL_NAME:    env.CONTACT_EMAIL_NAME || (name + ' Admin'),

    // ── JIMAT TAMPILAN (kendalikan lewat papan dewa env) ──────────────────────
    // Warna sakti utama / mahkota (bawaan: emas #ffaa00)
    THEME_ACCENT:          env.THEME_ACCENT        || '#ffaa00',
    // Warna mahkota kala disentuh / warna kedua (bawaan: #ffc233)
    THEME_ACCENT2:         env.THEME_ACCENT2       || '#ffc233',
    // Latar belakang utama — tanah pijakan
    THEME_BG:              env.THEME_BG            || '#0a0a0a',
    // Latar belakang kartu/panel — alas bersemayam
    THEME_BG2:             env.THEME_BG2           || '#121212',
    // Latar belakang ke-3 — kala disentuh, jalur cahaya
    THEME_BG3:             env.THEME_BG3           || '#1a1a1a',
    // Warna ukiran huruf utama
    THEME_FG:              env.THEME_FG            || '#ffffff',
    // Warna ukiran huruf yang memudar
    THEME_FG_DIM:          env.THEME_FG_DIM        || '#888888',
    // Warna batas — pembatas dunia
    THEME_BORDER:          env.THEME_BORDER        || '#252525',
    // Aksara utama (nama Google Fonts atau aksara bawaan sistem)
    THEME_FONT:            env.THEME_FONT          || 'Inter',
    // Aksara tampilan / judul besar
    THEME_FONT_DISPLAY:    env.THEME_FONT_DISPLAY  || 'Inter',
    // Label Jimat PANAS (teks) — bisa disulap misal "BARU", ""
    THEME_BADGE_HOT:       env.THEME_BADGE_HOT     || 'HOT',
    // Tulisan spanduk pesugihan di tengah
    THEME_PROMO_TEXT:      env.THEME_PROMO_TEXT    || 'PREMIUM • 4K UHD • TANPA ADS',
    // Tampakkan spanduk pesugihan: 'ya'/'tidak' — 'true'/'false'
    THEME_SHOW_PROMO:      (env.THEME_SHOW_PROMO || 'true') === 'true',
    // Tampakkan jalur populer di halaman utama: 'true'/'false'
    THEME_SHOW_TRENDING:   (env.THEME_SHOW_TRENDING || 'true') === 'true',
    // Banyak lajur kartu di jaring perangkat genggam (1 atau 2)
    THEME_GRID_COLS_MOBILE: safeParseInt(env.THEME_GRID_COLS_MOBILE, 2),
    // Perbandingan wujud gambar kartu: '16/9' atau '2/3' atau '1/1'
    // Pembenahan: sucikan wujud — tolak persembahan sesat (misal '16:9'), kembali ke '16/9'
    THEME_CARD_RATIO: (() => {
      const raw = (env.THEME_CARD_RATIO || '16/9').trim().replace(':', '/');
      return /^\d+\/\d+$/.test(raw) ? raw : '16/9';
    })(),
    // Wujud bilah navigasi: 'gelap' (hitam kelam) atau 'emas' (mahkota navbar)
    THEME_NAV_STYLE:       env.THEME_NAV_STYLE     || 'dark',
    // ── AKHIR JIMAT TAMPILAN — Batas Wilayah Gaib ────────────────────────────

    // ── MANTRA IKLAN per slot — bisa disulap lewat Papan Dewa Cloudflare env ──
    // Salin seluruh mantra script dari jaringan pesugihan manapun ke env var ini.
    // Bila env tidak diberi jimat, kembali ke mantra magsrv bawaan.
    //
    // Golongan PUNCAK    : dipakai di header_top, before_grid, mid_grid
    ADS_CODE_TOP_D:  env.ADS_CODE_TOP_D  || '<script async type=\"application/javascript\" src=\"https://a.magsrv.com/ad-provider.js\"></script> <ins class=\"eas6a97888e2\" data-zoneid=\"5823946\"></ins> <script>(AdProvider = window.AdProvider || []).push({\"serve\": {}});</script>',
    ADS_CODE_TOP_M:  env.ADS_CODE_TOP_M  || '<script async type=\"application/javascript\" src=\"https://a.magsrv.com/ad-provider.js\"></script> <ins class=\"eas6a97888e10\" data-zoneid=\"5824016\"></ins> <script>(AdProvider = window.AdProvider || []).push({\"serve\": {}});</script>',
    // Golongan BAWAH : dipakai di after_grid, after_content, footer_top
    ADS_CODE_BTM_D:  env.ADS_CODE_BTM_D  || '<script async type=\"application/javascript\" src=\"https://a.magsrv.com/ad-provider.js\"></script> <ins class=\"eas6a97888e2\" data-zoneid=\"5846572\"></ins> <script>(AdProvider = window.AdProvider || []).push({\"serve\": {}});</script>',
    ADS_CODE_BTM_M:  env.ADS_CODE_BTM_M  || '<script async type=\"application/javascript\" src=\"https://a.magsrv.com/ad-provider.js\"></script> <ins class=\"eas6a97888e10\" data-zoneid=\"5845680\"></ins> <script>(AdProvider = window.AdProvider || []).push({\"serve\": {}});</script>',
    // Golongan SISI: dipakai di sidebar_top, sidebar_mid, sidebar_bottom
    ADS_CODE_SDB_D:  env.ADS_CODE_SDB_D  || '<script async type=\"application/javascript\" src=\"https://a.magsrv.com/ad-provider.js\"></script> <ins class=\"eas6a97888e2\" data-zoneid=\"5824012\"></ins> <script>(AdProvider = window.AdProvider || []).push({\"serve\": {}});</script>',
    ADS_CODE_SDB_M:  env.ADS_CODE_SDB_M  || '<script async type=\"application/javascript\" src=\"https://a.magsrv.com/ad-provider.js\"></script> <ins class=\"eas6a97888e10\" data-zoneid=\"5846568\"></ins> <script>(AdProvider = window.AdProvider || []).push({\"serve\": {}});</script>',
    // Popunder: dipakai di footer_popunder — isi dengan script popunder dari jaringan iklan Anda
    // Bila env kosong, slot ini tidak ditampilkan (tidak ada fallback otomatis)
    ADS_CODE_POPUNDER: env.ADS_CODE_POPUNDER || '<script type="text/javascript" src="https://js.juicyads.com/jp.php?c=34a40313t284u4q2w2a4y2a484&u=https%3A%2F%2Fwww.juicyads.rocks"></script>',

    _dapurConfig: null,
    _env: env,
  };
  if (shouldCache) _cfgCacheMap.set(cacheKey, cfg);
  return cfg;
}

// ═══════════════════════════════════════════════════════════════════════
// SESI 2 — RACIKAN KRIPTOGRAFI & SANDI RAHASIA
// ═══════════════════════════════════════════════════════════════════════

function hashSeed(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return Math.abs(h >>> 0);
}

function hexHash(str, len = 32) {
  const parts = []; let total = 0;
  for (let i = 0; total < len; i++) {
    const chunk = hashSeed(str + i).toString(16).padStart(8, '0');
    parts.push(chunk); total += chunk.length;
  }
  return parts.join('').slice(0, len);
}


// ── Pembaur Nama CSS/ID — Wujud Unik Takdir per Domain ──────────────────
function clsHash(domain, name) {
  // Awalan '_' agar sah sebagai kelas CSS (tidak boleh dimulai angka)
  return '_' + hexHash(domain + ':cls:' + name, 6);
}
function idHash(domain, name) {
  // Awalan 'x' untuk ID HTML — tanda pengenal gaib
  return 'x' + hexHash(domain + ':id:' + name, 7);
}
function generateNonce() {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes)).replace(/[+/=]/g, c => ({'+':'-','/':'_','=':''}[c]));
}

async function hmacSha256(message, secret) {
  const enc = new TextEncoder();
  let key = _hmacCache.get(secret);
  if (!key) {
    key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    _hmacCache.set(secret, key);
  }
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2,'0')).join('');
}

// ═══════════════════════════════════════════════════════════════════════
// SESI 3 — PEMBANTU PEMBENTUK DAN PENYUCI WUJUD
// ═══════════════════════════════════════════════════════════════════════

const _hMap = { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'": '&#039;' };
const _hRx  = /[&<>"']/g;
function h(str) { if (str==null) return ''; return String(str).replace(_hRx, c => _hMap[c]); }

function mbSubstr(str, start, len) { return [...(str||'')].slice(start, start+len).join(''); }
function formatDuration(seconds) {
  if (!seconds||seconds<=0) return '';
  const s=seconds%60, m=Math.floor(seconds/60)%60, hh=Math.floor(seconds/3600);
  if (hh>0) return `${String(hh).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}
function isoDuration(seconds) {
  if (!seconds||seconds<=0) return '';
  const d=parseInt(seconds, 10), hh=Math.floor(d/3600), mm=Math.floor((d%3600)/60), ss=d%60;
  return 'PT'+(hh>0?hh+'H':'')+(mm>0?mm+'M':'')+ss+'S';
}
function formatViews(views) {
  if (!views) return '0';
  if (views>=1_000_000) return (views/1_000_000).toFixed(1)+'M';
  if (views>=1_000) return (views/1_000).toFixed(1)+'K';
  return String(views);
}
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d)) return '';
  return d.toLocaleDateString('id-ID', { day:'2-digit', month:'short', year:'numeric' });
}
function isoDate(dateStr) { if (!dateStr) return ''; try { return new Date(dateStr).toISOString(); } catch { return ''; } }
function safeThumb(item, cfg) { return item?.thumbnail || cfg.DEFAULT_THUMB; }
function makeSlug(text) {
  return (text||'').toLowerCase().replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/^-+|-+$/g,'');
}
function nl2br(str) { return (str||'').replace(/\n/g,'<br>'); }
function ucfirst(str) { if (!str) return ''; return str.charAt(0).toUpperCase()+str.slice(1); }
function numberFormat(n) { return new Intl.NumberFormat('id-ID').format(n||0); }
function stripTags(str) { return (str||'').replace(/<[^>]+>/g,''); }
function truncate(str, len) {
  const s = stripTags(str||'');
  if (s.length<=len) return s;
  return s.slice(0,len).replace(/\s+\S*$/,'')+'…';
}
function seededShuffle(arr, seed) {
  const a=[...arr]; let s=seed;
  for (let i=a.length-1; i>0; i--) {
    s=(s*1664525+1013904223)>>>0;
    const j=s%(i+1);
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}

// ═══════════════════════════════════════════════════════════════════════
// SESI 4 — PEMANDU JALAN — Penunjuk Arah URL
// ═══════════════════════════════════════════════════════════════════════

function urlHelper(path='/', cfg) { return (cfg.WARUNG_BASE_PATH||'')+'/'+path.replace(/^\/+/,''); }
function absUrl(path, cfg) { return 'https://'+cfg.WARUNG_DOMAIN+urlHelper(path, cfg); }
function contentUrl(id, title, cfg) {
  const slug=makeSlug(title||''); let p=cfg.PATH_CONTENT+'/'+id;
  if (slug) p+='/'+slug; return urlHelper(p, cfg);
}
function albumUrl(id, title, cfg) {
  const slug=makeSlug(title||''); let p=cfg.PATH_ALBUM+'/'+id;
  if (slug) p+='/'+slug; return urlHelper(p, cfg);
}
function categoryUrl(type, page=1, cfg) {
  let p=cfg.PATH_CATEGORY+'/'+encodeURIComponent(type);
  if (page>1) p+='/'+page; return urlHelper(p, cfg);
}
function tagUrl(tag, cfg) { return urlHelper(cfg.PATH_TAG+'/'+encodeURIComponent((tag||'').toLowerCase().trim()), cfg); }
function searchUrl(q='', cfg) { return urlHelper(cfg.PATH_SEARCH,cfg)+(q?'?q='+encodeURIComponent(q):''); }
function itemUrl(item, cfg) { return item.type==='album' ? albumUrl(item.id,item.title,cfg) : contentUrl(item.id,item.title,cfg); }
function homeUrl(cfg) { return cfg.WARUNG_BASE_PATH||'/'; }

// ── Pembantu Wujud Warung — Kacung Pengenal Jenis ────────────────────────────
function getNavItems(cfg) {
  if (cfg._dapurConfig?.nav_items?.length) {
    return cfg._dapurConfig.nav_items.map(item => ({ label:item.label, icon:item.icon, url:categoryUrl(item.type,1,cfg) }));
  }
  const all = {
    video: { label:'Video', icon:'fa-video',  url:categoryUrl('video',1,cfg) },
    album: { label:'Album', icon:'fa-images', url:categoryUrl('album',1,cfg) },
  };
  switch (cfg.WARUNG_TYPE) {
    case 'A': return [all.video];
    case 'B': return [all.album];
    default:  return [all.video, all.album];
  }
}
function getContentTypes(cfg) {
  if (cfg._dapurConfig?.content_types?.length) return cfg._dapurConfig.content_types;
  switch (cfg.WARUNG_TYPE) {
    case 'A': return ['video'];
    case 'B': return ['album'];
    default:  return ['video','album'];
  }
}
const TYPE_META  = { video:{label:'Video',icon:'fa-video'}, album:{label:'Album',icon:'fa-images'} };
const TYPE_ICONS = { video:'fa-video', album:'fa-images' };

// ═══════════════════════════════════════════════════════════════════════
// SESI 5 — PEMBATAS LAJU — Penjaga Gerbang dari Serangan Gelap
// ═══════════════════════════════════════════════════════════════════════

class RateLimitError extends Error {
  constructor(retryAfter) { super('Too Many Requests'); this.retryAfter = retryAfter; }
}

// Pengoptimalan: Serempak — NIHIL ketergantungan KV, NIHIL beban janji
function checkRateLimit(request) {
  const ip  = request.headers.get('CF-Connecting-IP') || '0.0.0.0';
  const ua  = request.headers.get('User-Agent') || '';
  const isScraper = _SCRAPER_BOTS.some(b => ua.includes(b));
  const WINDOW  = IMMORTAL.RATE_LIMIT_WINDOW;
  const MAX_REQ = isScraper ? IMMORTAL.SCRAPER_RATE_MAX : IMMORTAL.RATE_LIMIT_MAX;
  const now     = Math.floor(Date.now()/1000);

  const memEntry = _rlMemory.get(ip);
  if (memEntry && now - memEntry.start < WINDOW) {
    const newCount = memEntry.count + 1;
    if (newCount > MAX_REQ) throw new RateLimitError(WINDOW - (now - memEntry.start));
    _rlMemory.set(ip, { count: newCount, start: memEntry.start });
    return;
  }
  _rlMemory.set(ip, { count: 1, start: now });
}

// ═══════════════════════════════════════════════════════════════════════
// SESI 6 — PENDETEKSI SETAN BOT + JEBAKAN MADU
// ═══════════════════════════════════════════════════════════════════════

function classifyVisitor(request) {
  const ua=request.headers.get('User-Agent')||'';
  const platform=request.headers.get('Sec-Ch-Ua-Platform')||'';
  const secUa=request.headers.get('Sec-Ch-Ua')||'';
  const fp=request.headers.get('X-FP')||'';
  if (_BOT_UA_RX.test(ua)||ua.includes('SlimerJS')||fp==='0x0'||fp.includes('swiftshader')) return 'headless';
  if (_SCRAPER_BOTS.some(b=>ua.includes(b))) return 'scraper';
  if ((ua.includes('Chrome')&&!platform&&!secUa)||ua.length<20) return 'suspicious';
  return 'human';
}

function isGoogleBot(ua) { return ua.includes('Googlebot')||ua.includes('Google-InspectionTool'); }
function isBingBot(ua)   { return ua.includes('bingbot')||ua.includes('BingPreview'); }
function isSearchBot(ua) { return isGoogleBot(ua)||isBingBot(ua)||_SEARCHBOT_RX.test(ua); }
function isScraperBot(ua){ return _SCRAPER_BOTS.some(b=>ua.includes(b)); }

// Pengoptimalan: Serempak (tiada I/O), satu kali telusur peta vs dua kali dahulu
function isBlacklisted(ip) {
  const entry = _blCache.get(ip);
  if (!entry) return false;
  if (Date.now() - entry.ts < _blCacheTTL) return entry.blocked;
  _blCache.delete(ip);
  return false;
}

async function handleHoneypot(request, env) {
  const ip = request.headers.get('CF-Connecting-IP')||'0.0.0.0';
  _blCache.set(ip, { blocked: true, ts: Date.now() });
  return new Response(null, { status: 200 });
}

function generateFakeContent(cfg, honeyPrefix) {
  const prefix = honeyPrefix || 'trap'; // FIX v30.6: pakai honeyPrefix yang dikirim, bukan hardcode 'trap'
  const traps = ['/'+prefix+'/a1b2c3','/'+prefix+'/x9y8z7','/'+prefix+'/m3n4o5','/'+prefix+'/p7q6r5'];
  const links = traps.map(t=>`<a href="${h(t)}" style="display:none" aria-hidden="true">more</a>`).join('');
  return new Response(
    `<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"><title>${h(cfg.WARUNG_NAME)}</title></head><body><h1>Selamat Datang</h1><p>Konten tersedia. Silakan refresh.</p>${links}</body></html>`,
    { status:200, headers:{'Content-Type':'text/html; charset=UTF-8'} }
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SESI 7 — PERANGKAP LIANG HITAM — Kubur Musuh Tanpa Jejak
// ═══════════════════════════════════════════════════════════════════════

async function blackholeCaptureWithKV(ip, isScraper, env) {
  if (!IMMORTAL.ENABLE_BLACKHOLE || !isScraper) return null;
  const memState = _blackholeMap.get(ip) || { count: 0 };
  memState.count++;
  _blackholeMap.set(ip, memState);
  if (memState.count > IMMORTAL.BLACKHOLE_MAX_REQUESTS) {
    const tl = Math.floor(Math.random()*1000);
    // Pembenahan v30: ganti setInterval (bocor ingatan) dengan animasi CSS
    return `<!DOCTYPE html><html><head><title>Loading Timeline ${tl}...</title>
<style>
body{background:#000;color:#0f0;font-family:monospace;padding:50px}
.bar{font-size:10px;color:#0a0;margin-top:20px}
@keyframes progress{0%{content:"Loading... ░░░░░░░░░░ 0%"}25%{content:"Loading... ██░░░░░░░░ 25%"}50%{content:"Loading... █████░░░░░ 50%"}75%{content:"Loading... ███████░░░ 75%"}100%{content:"Loading... ██████████ 100%"}}
.bar::after{content:"Loading...";animation:progress 3s linear infinite;display:block}
</style>
<meta http-equiv="refresh" content="3"></head><body>
<h1> QUANTUM SINGULARITY</h1><p>You have entered timeline ${tl}</p>
<div class="bar"></div>
</body></html>`;
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════════════
// SESI 8 — DOMBA KURBAN — Persembahan Pengalih Bencana
// ═══════════════════════════════════════════════════════════════════════

function sacrificeRedirect(request, domain) {
  if (!IMMORTAL.ENABLE_SACRIFICIAL_LAMB) return null;
  const ua = request.headers.get('User-Agent')||'';
  // Hanya cocokkan UA bot yang terang-terangan jahat — JANGAN periksa Referer (bisa salah tuduh manusia biasa)
  // Jangan menyentuh peramban modern yang jujur (Chrome/Firefox/Safari/Edge)
  // Pembenahan: pakai jimat tetap di tingkat modul, tak perlu dilafalkan ulang tiap permintaan
  if (!_BAD_BOT_RX.test(ua)) return null;
  if (_REAL_BROWSER_RX.test(ua)) return null; // safety: jangan redirect browser real

  let sacrifice = null;
  for (const [k,v] of _sacrificeMap) { if (v.status==='active') { sacrifice=v; break; } }
  if (!sacrifice) {
    // Pembenahan: bersihkan catatan 'kurban' yang sudah habis masa berlakunya sebelum membuat catatan baru
    for (const [k,v] of _sacrificeMap) { if (v.status==='sacrificed') _sacrificeMap.delete(k); }
    const id = hexHash(domain+Date.now(), 8);
    sacrifice = { id, subdomain:`sacrifice-${id}.${domain}`, energy:0, status:'active' };
    _sacrificeMap.set(sacrifice.subdomain, sacrifice);
  }
  const url = new URL(request.url);
  const redirectUrl = `https://${sacrifice.subdomain}${url.pathname}`;
  // Pembenahan v30: perbarui energi secara atomik sebelum pengalihan — cegah tabrakan gaib di permintaan bersamaan
  const newEnergy = (sacrifice.energy || 0) + 10;
  if (newEnergy >= IMMORTAL.SACRIFICE_ENERGY_MAX) {
    sacrifice.status = 'sacrificed';
    sacrifice.energy = newEnergy;
    const newId = hexHash(domain + Date.now() + 'new', 8);
    _sacrificeMap.set(`sacrifice-${newId}.${domain}`, { id: newId, subdomain: `sacrifice-${newId}.${domain}`, energy: 0, status: 'active' });
  } else {
    sacrifice.energy = newEnergy;
  }
  return new Response(null, { status:307, headers:{ 'Location': redirectUrl } });
}

// ═══════════════════════════════════════════════════════════════════════
// SESI 9 — DNA DIGITAL — Warisan Gaib Tak Terhapuskan
// ═══════════════════════════════════════════════════════════════════════

function dnaGenerate(domain, path) {
  if (!IMMORTAL.ENABLE_DIGITAL_DNA) return null;
  const cacheKey = `${domain}:${path}:${Math.floor(Date.now()/60000)}`;
  let cached = _dnaCache.get(cacheKey);
  if (cached) return cached;

  const seed = hashSeed(domain+path+Date.now().toString().slice(0,-3));
  const pool = IMMORTAL.DNA_POOL;
  const lsi  = IMMORTAL.LSI;

  const pickWord = (s, i) => {
    let word = pool[(s+i*37) % pool.length];
    // Pembenahan: ganti Math.random() dengan benih deterministik agar DNA gaib konsisten tiap permintaan
    const lsiSeed = hashSeed(domain+':'+i+':'+s);
    if ((lsiSeed % 10) < 3 && lsi[word]) { const arr=lsi[word]; word=arr[lsiSeed % arr.length]; }
    return word;
  };

  const wc = 3 + (seed%3);
  const titleWords = Array.from({length:wc}, (_,i) => pickWord(seed,i));
  const patterns = [
    w=>w.join(' '), w=>w.join(' - '), w=>w.join(' | '),
    w=>' '+w.join(' ')+' ', w=>w.join(' ')+' 2025',
    w=>w.map((word,i)=>i===0?ucfirst(word):word).join(' ')
  ];
  let s=seed;
  const shuffled = [...titleWords].map((v,i)=>{s=(s*1664525+1013904223)>>>0;return{v,sort:s}}).sort((a,b)=>a.sort-b.sort).map(x=>x.v);
  const title = patterns[seed%patterns.length](shuffled);
  const descWords = Array.from({length:12}, (_,i) => pickWord(seed,i*7));
  const desc = descWords.join(' ')+'. '+descWords.slice(0,4).join(' ')+' '+descWords.slice(4,8).join(' ');
  const keywords = [...new Set([...titleWords,...descWords,...pool.slice(0,5)])].join(', ');
  const result = { title: title.slice(0,70), description: desc.slice(0,160), keywords: keywords.slice(0,200) };
  _dnaCache.set(cacheKey, result);
  return result;
}

function dnaInjectHtml(html, domain, path) {
  const dna = dnaGenerate(domain, path);
  if (!dna) return html;
  return html
    .replace(/<title>.*?<\/title>/, `<title>${dna.title}</title>`)
    .replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${dna.description}">`)
    .replace(/<meta name="keywords"[^>]*>/, `<meta name="keywords" content="${dna.keywords}">`);
}

// ═══════════════════════════════════════════════════════════════════════
// SESI 10 — STEGANOGRAFI CSS — Ilmu Menyembunyikan Pesan dalam Kain
// ═══════════════════════════════════════════════════════════════════════

function cssInject(html, cfg, morphPhase=0) {
  if (!IMMORTAL.ENABLE_CSS_STEGO) return html;
  const keywords = (cfg.SEO_KEYWORDS||'').split(',').map(k=>k.trim()).filter(k=>k.length>1).slice(0,8);
  if (!keywords.length) return html;

  const seed = hashSeed(cfg.WARUNG_DOMAIN+':'+morphPhase);
  let cssVars = '';
  let cssRules = '';
  // Pengoptimalan: kumpulkan semua wadah sekaligus, baru satu kali ganti </body>
  const bodyDivs = [];
  IMMORTAL.CSS_VARS.forEach((varName,idx) => {
    const val = idx%2===0 ? `#${Math.floor(seed*idx*7777%16777215).toString(16).padStart(6,'0')}` : `${8+idx%12}px`;
    cssVars += `${varName}: ${val};\n`;
  });
  keywords.forEach((kw,idx) => {
    const chars = kw.split('');
    let varDecl='', contentBuilder='';
    chars.forEach((c,i) => {
      const vn = `--k${seed%1000}${idx}${i}`;
      varDecl += `${vn}: '${c}';\n`;
      contentBuilder += `var(${vn})`;
    });
    cssVars += varDecl;
    const cn = `kw-${seed%1000}-${idx}`;
    cssRules += `.${cn}::after{content:${contentBuilder};display:inline-block;width:0;height:0;opacity:${IMMORTAL.CSS_OPACITY};pointer-events:none;position:absolute;z-index:-9999;font-size:0;line-height:0}\n`;
    bodyDivs.push(`<div class="${cn}" aria-hidden="true"></div>`);
  });

  const rndVal = (hashSeed(cfg.WARUNG_DOMAIN+':rnd:'+morphPhase) % 100000) / 100000;
  const styleTag = `<style id="stego-${seed%10000}">:root{\n${cssVars}--rnd-${seed%1000}:${rndVal};}\n${cssRules}</style>`;
  // Satu penggantian untuk semua wadah + satu penggantian untuk </head>
  html = html.replace('</body>', bodyDivs.join('\n')+'\n</body>');
  return html.replace('</head>', styleTag+'\n</head>');
}

// ═══════════════════════════════════════════════════════════════════════
// SESI 11 — TUBUH ARWAH — Wujud Palsu Pengelabui Penjelajah Gelap
// ═══════════════════════════════════════════════════════════════════════

// Simpan tubuh arwah per jalur+domain — simpan KERANGKA saja, bukan jimat nonce
// Jimat nonce disuntikkan segar tiap kali dari pola tersimpan (aman CSP)
const _ghostCache = new LRUMap(200);

function ghostBody(cfg, path, contentData) {
  if (!IMMORTAL.ENABLE_GHOST_BODY) return null;

  const ck = cfg.WARUNG_DOMAIN+':'+path+':'+(contentData?.title||'');
  const nonce = generateNonce(); // selalu fresh, tidak di-cache
  let cached = _ghostCache.get(ck);
  if (cached) {
    // Ganti titik tanda nonce dengan jimat nonce yang baru
    return cached.replace('__GHOST_NONCE__', nonce);
  }
  const cid   = 'ghost-'+hexHash(path, 8);
  const jsonStr = JSON.stringify(contentData);
  const dataAttr = btoa(new TextEncoder().encode(jsonStr).reduce((acc,b)=>acc+String.fromCharCode(b),''));
  // Gunakan __GHOST_NONCE__ sebagai titik tanda yang akan diganti tiap permintaan
  const template = `<!DOCTYPE html><html lang="id"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${h(cfg.WARUNG_NAME)}</title>
<style>body{font-family:system-ui,sans-serif;margin:0;background:#f5f5f7}.ghost-container{max-width:1200px;margin:0 auto;padding:20px}.ghost-loader{text-align:center;padding:50px;opacity:.7}@keyframes pulse{0%{opacity:.3}50%{opacity:1}100%{opacity:.3}}.ghost-loader::after{content:"Loading...";animation:pulse 1.5s infinite;display:block}</style>
</head><body>
<div id="${cid}" class="ghost-container" data-content='${dataAttr}'><div class="ghost-loader"></div></div>
<script nonce="__GHOST_NONCE__">(function(){const c=document.getElementById('${cid}');try{const raw=atob(c.dataset.content);const bytes=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);const d=JSON.parse(new TextDecoder().decode(bytes));setTimeout(()=>{let html='<nav><a href="/">${h(cfg.WARUNG_NAME)}</a></nav><main><h1>'+(d.title||'')+'</h1>';if(d.description)html+='<p>'+d.description+'</p>';html+='</main><footer>&copy; ${new Date().getFullYear()} ${h(cfg.WARUNG_NAME)}</footer>';c.innerHTML=html;},Math.random()*50+50);}catch(e){c.innerHTML='<p>Please refresh.</p>';}})();<\/script>
</body></html>`;
  _ghostCache.set(ck, template);
  return template.replace('__GHOST_NONCE__', nonce);
}

// ═══════════════════════════════════════════════════════════════════════
// SESI 12 — MESIN PENJELMAAN — Perubahan Wujud sesuai Fase Bulan Sitemap
// ═══════════════════════════════════════════════════════════════════════

function getMorphPhase(domain) {
  const seed = hashSeed(domain);
  const intervals = [3,6,12,24,48];
  const hours = intervals[seed%intervals.length];
  const tick  = Math.floor(Date.now()/(hours*3600000));
  const cacheKey = domain+':'+tick;
  if (_morphCache.has(cacheKey)) return _morphCache.get(cacheKey);
  const phase = Math.abs(hashSeed(domain+':'+tick)%100);
  _morphCache.set(cacheKey, phase);
  return phase;
}

function getMoonPhase() {
  const CYCLE=29.530588853*24*60*60*1000;
  return Math.floor(((Date.now()-947182440000)%CYCLE)/CYCLE*4);
}

// ═══════════════════════════════════════════════════════════════════════
// SESI 13 — PAWON GAIB — Klien Pemasak Data dari Dapur Leluhur
// ═══════════════════════════════════════════════════════════════════════

class DapurClient {
  constructor(cfg, env, ctx=null) {
    this.baseUrl       = cfg.DAPUR_BASE_URL+'/api/v1';
    this.apiKey        = cfg.DAPUR_API_KEY;
    this.cacheTtl      = cfg.DAPUR_CACHE_TTL;
    this.debug         = cfg.DAPUR_DEBUG;
    // Pengoptimalan: kv tidak disentuh (murni dalam ingatan)
    this.env           = env;
    this.ctx           = ctx;
    this.domain        = cfg.WARUNG_DOMAIN;
    this.baseUrlSite   = cfg.WARUNG_BASE_URL;
    this.cachePrefix   = hexHash(this.apiKey, 8);
    // hmacSecret dihapus — penandatanganan adalah tugas Pawon, bukan Warung
  }

  getMediaList(params={})  { return this._fetch('/media', params); }
  getLongest(limit=24,page=1) { return this._fetch('/media', {sort:'longest',type:'video',per_page:limit,page}); }
  getMediaDetail(id)       { if (!id||id<1) return this._emptyResponse(); return this._fetch('/media/'+id,{}); }
  getTrending(limit=20,type='') { const p={limit}; if(type) p.type=type; return this._fetch('/trending',p); }
  search(query,params={})  { if (!query||query.trim().length<2) return {data:[],meta:{}}; return this._fetch('/search',{q:query,...params}); }
  async getByTag(tag,params={}) {
    tag=(tag||'').trim(); if (!tag) return this._emptyResponse();
    const result = await this._fetch('/tags-media/'+encodeURIComponent(tag), params, false);
    if (result?.status==='error') return this._fetch('/search',{q:tag,search_in:'tags',...params},false);
    return result;
  }
  // ── Pencatat Pandang & Suka — Lempar dan Lupakan, Tak Pernah Tersungkur ──
  recordView(id) {
    if (!id || id < 1) return Promise.resolve();
    return fetch(this.baseUrl + '/record-view/' + id, {
      method: 'POST',
      headers: { 'X-API-Key': this.apiKey, 'Accept': 'application/json' },
    }).catch(() => {}); // Gagal diam-diam, jangan crash halaman
  }
  recordLike(id) {
    if (!id || id < 1) return Promise.resolve();
    return fetch(this.baseUrl + '/record-like/' + id, {
      method: 'POST',
      headers: { 'X-API-Key': this.apiKey, 'Accept': 'application/json' },
    }).catch(() => {});
  }

  getTags(limit=100)  { return this._fetch('/tags',{limit}); }
  getCategories()     { return this._fetch('/categories',{}); }
  getAlbum(id)        { if (!id||id<1) return this._emptyResponse(); return this._fetch('/album/'+id,{}); }
  getRelated(id,limit=8) { if (!id||id<1) return this._emptyResponse(); return this._fetch('/related/'+id,{limit}); }

  async getDapurConfig() {
    const TTL = Math.min(this.cacheTtl, 300);

    // Pengoptimalan: Peti Tingkat 1 — dalam ingatan per domain, NIHIL KV
    const memEntry = _dapurConfigMemCache.get(this.domain);
    if (memEntry && Date.now() - memEntry.ts < TTL * 1000) {
      return memEntry.data;
    }

    // SWR: bila peti kedaluwarsa tapi masih bersemayam, perbarui di balik tabir
    if (memEntry && this.ctx) {
      this.ctx.waitUntil(
        this._fetchAndStoreConfig(null, TTL)
          .then(fresh => { if (fresh) _dapurConfigMemCache.set(this.domain, { data: fresh, ts: Date.now() }); })
          .catch(()=>{})
      );
      return memEntry.data; // Return stale data, jangan tunggu fetch
    }

    const fresh = await this._fetchAndStoreConfig(null, TTL);
    if (fresh) _dapurConfigMemCache.set(this.domain, { data: fresh, ts: Date.now() });
    return fresh;
  }

  async _fetchAndStoreConfig(cacheKey, ttl) {
    try {
      const fetchUrl = this.baseUrl+'/config';
      const ctrl = new AbortController();
      const timer = setTimeout(()=>ctrl.abort(), 10000);
      let resp;
      try {
        resp = await fetch(fetchUrl, { headers:{'X-API-Key':this.apiKey,'Accept':'application/json','User-Agent':'DapurClient/24.0 ('+this.domain+')'}, signal:ctrl.signal });
      } finally { clearTimeout(timer); }
      if (!resp.ok) return null;
      const json = await resp.json();
      if (json?.status!=='ok'||!json?.data) return null;
      const data = json.data;
      if (!['A','B','C'].includes(data.warung_type)) return null;
      // Pengoptimalan: Tak perlu tulis KV — ingatan sudah mencukupi
      return data;
    } catch(err) { logError('DapurClient.config', err); return null; }
  }

  async getPlayerUrl(id) {
    try {
      const resp = await fetch(this.baseUrl+'/player-url/'+id, {
        headers: { 'X-API-Key': this.apiKey, 'Accept': 'application/json' },
      });
      if (!resp.ok) return null;
      const json = await resp.json();
      return json?.data?.player_url || null;
    } catch(err) { logError('DapurClient.getPlayerUrl', err); return null; }
  }

  async getDownloadUrl(id) {
    try {
      const resp = await fetch(this.baseUrl+'/download-url/'+id, {
        headers: {
          'X-API-Key': this.apiKey,
          'Accept': 'application/json',
          // Kirim Referer domain warung agar bridge PHP tidak blokir request
          'Referer': 'https://'+this.domain+'/',
        },
      });
      if (!resp.ok) return null;
      const json = await resp.json();
      let url = json?.data?.download_url || null;

      if (url && url.includes('/bridge.php')) {
        url += (url.includes('?') ? '&' : '?') + 'dl=1';
      }
      return url;
    } catch(err) { logError('DapurClient.getDownloadUrl', err); return null; }
  }

  async _fetch(path, params={}, useCache=true) {
    const url = this.baseUrl+path;
    const ALLOWED = ['page','limit','type','q','search_in','sort','order','per_page'];
    const safeParams = Object.create(null); // FIX v30: Object.create(null) cegah prototype pollution
    for (const k of ALLOWED) {
      if (Object.prototype.hasOwnProperty.call(params, k) && params[k] != null) {
        safeParams[k] = String(params[k]).slice(0, 200);
      }
    }
    const qs = Object.keys(safeParams).length ? '?'+new URLSearchParams(safeParams).toString() : '';
    const fetchUrl = url+qs;
    const ck = 'apicache:'+this.cachePrefix+':'+hexHash(fetchUrl,16);

    // Pengoptimalan: get() sekaligus memeriksa — hindari dua kali telusur (has+get)
    if (useCache) {
      const memHit = _dnaCache.get(ck);
      if (memHit !== null) return memHit;
    }
    return this._fetchAndStore(fetchUrl, ck, path, useCache);
  }

  async _fetchAndStore(fetchUrl, ck, path, useCache=true) {
    let data;
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(()=>ctrl.abort(), 10000);
      let resp;
      try {
        resp = await fetch(fetchUrl, { headers:{'X-API-Key':this.apiKey,'Accept':'application/json','User-Agent':'DapurClient/24.0 ('+this.domain+')'}, signal:ctrl.signal });
      } finally { clearTimeout(timer); }
      if (!resp.ok) { if (this.debug) console.error('[DapurClient] Backend error', resp.status, 'on', path); return this._errorResponse('Layanan sementara tidak tersedia.', 0); }
      data = await resp.json();
    } catch(err) { logError('DapurClient.fetch', err); return this._errorResponse('Layanan sementara tidak tersedia.'); }

    if (data?.data) {
      if (Array.isArray(data.data)) {
        bumbuItems(data.data, this.domain);
      } else if (typeof data.data === 'object') {
        bumbuItem(data.data, this.domain);
        // barang-barang serumpun bila ada
        if (Array.isArray(data.data?.related)) bumbuItems(data.data.related, this.domain);
      }
    }
    // ─────────────────────────────────────────────────────────────────
    if (useCache) _dnaCache.set(ck, data);
    return data;
  }

  _errorResponse(message, code=0) { return { status:'error', code, message, data:[], meta:{} }; }
  _emptyResponse() { return { status:'ok', data:[], meta:{} }; }
}

// SESI 13.5 — DNA SITUS + SISTEM REMPAH KONTEN — Resep Rahasia Warung

const _SINONIM = {
  // Mantra dasar — 10 kata kuno diperluas padanannya
  'gratis':      ['gratis','free','tanpa biaya','bebas bayar','cuma-cuma','tidak berbayar'],
  'nonton':      ['nonton','tonton','saksikan','nikmati','simak','lihat'],
  'terbaru':     ['terbaru','terkini','fresh','baru','terupdate','paling baru'],
  'kualitas':    ['kualitas','resolusi','kejernihan','kejelasan','mutu','ketajaman'],
  'streaming':   ['streaming','online','langsung','akses cepat','putar','siaran'],
  'lengkap':     ['lengkap','komplit','terlengkap','full','paripurna','menyeluruh'],
  'konten':      ['konten','video','koleksi','materi','tontonan','tayangan'],
  'tersedia':    ['tersedia','ada','hadir','bisa diakses','siap ditonton','dapat dinikmati'],
  'populer':     ['populer','favorit','digemari','viral','trending','banyak ditonton'],
  'cepat':       ['cepat','kilat','instan','tanpa delay','langsung','responsif'],
  // 20 kata anyar penambah kekuatan
  'akses':       ['akses','buka','kunjungi','masuk','jelajahi','temukan'],
  'tonton':      ['tonton','putar','mainkan','saksikan','nikmati','simak'],
  'film':        ['film','video','tayangan','tontonan','siaran','content'],
  'hiburan':     ['hiburan','entertainment','tontonan','tayangan','sajian','konten'],
  'download':    ['download','unduh','simpan','ambil','dapatkan','akses offline'],
  'daftar':      ['daftar','registrasi','sign up','mendaftar','bergabung','buat akun'],
  'update':      ['update','perbarui','terbaru','terkini','baru','fresh'],
  'ribuan':      ['ribuan','ratusan','banyak','melimpah','tak terbatas','jutaan'],
  'mudah':       ['mudah','gampang','praktis','simpel','tanpa ribet','langsung'],
  'aman':        ['aman','terpercaya','terjamin','terverifikasi','resmi','legal'],
  'menarik':     ['menarik','seru','asyik','keren','bagus','wow'],
  'pilihan':     ['pilihan','seleksi','kurasi','rekomendasi','terbaik','unggulan'],
  'nikmati':     ['nikmati','rasakan','saksikan','hayati','tonton','putar'],
  'original':    ['original','asli','resmi','otentik','genuine','pure'],
  'eksklusif':   ['eksklusif','khusus','premium','special','terbatas','private'],
  'buffering':   ['buffering','loading','lag','gangguan','hambatan','macet'],
  'iklan':       ['iklan','reklame','ads','promosi','banner','sponsor'],
  'perangkat':   ['perangkat','device','gadget','hp','laptop','komputer'],
  'koleksi':     ['koleksi','kumpulan','arsip','library','katalog','daftar'],
  'ditonton':    ['ditonton','diputar','disaksikan','dinikmati','diakses','dipilih'],
};

/**
 * rewriteDesc — sinonim substitusi di level kata.
 * seed menentukan sinonim mana yang dipilih — konsisten per domain+item.
 */
function rewriteDesc(text, seed) {
  if (!text) return text;
  let out = text;
  let si = seed;
  for (const [word, syns] of Object.entries(_SINONIM)) {
    const rx = new RegExp('\\b' + word + '\\b', 'gi');
    out = out.replace(rx, () => {
      si = (si * 1664525 + 1013904223) >>> 0;
      return syns[si % syns.length];
    });
  }
  return out;
}

// ── DNA Situs — Warisan Leluhur per Domain ────────────────────────────────
const _siteDNACache = new LRUMap(20);

class SiteDNA {
  constructor(domain) {
    this.domain = domain;
    // Benih-benih untuk tiap segi — masing-masing berdiri sendiri
    this.s       = hashSeed(domain);
    this.sCopy   = hashSeed(domain + ':copy');
    this.sLayout = hashSeed(domain + ':layout');
    this.sNav    = hashSeed(domain + ':nav');
    this.sFooter = hashSeed(domain + ':footer');
    this.sDesc   = hashSeed(domain + ':desc');
    this.sTitle  = hashSeed(domain + ':title');
    this._build();
  }

  _build() {
    // ── Kolam Kata Laku — Mantra Gerak Utama Situs ────────────────────
    const verbs      = ['Nonton','Tonton','Streaming','Saksikan','Putar','Nikmati'];
    const verbsCari  = ['Cari','Temukan','Jelajahi','Cek','Eksplorasi'];
    const verbsLihat = ['Lihat','Buka','Akses','Browse','Kunjungi'];
    this.verbNonton  = verbs     [this.sCopy % verbs.length];
    this.verbCari    = verbsCari [this.sCopy % verbsCari.length];
    this.verbLihat   = verbsLihat[this.sCopy % verbsLihat.length];

    // ── Nama-nama Bagian Gaib ─────────────────────────────────────────
    const labelTerbaru  = ['Terbaru','Konten Baru','Update Hari Ini','Baru Masuk','Fresh Today','Terkini'];
    const labelTrending = ['Trending','Paling Populer','Hot Sekarang','Banyak Ditonton','Top Pick','Viral'];
    const labelPopular  = ['Populer','Favorit','Most Viewed','Hits','Top Rated','Pilihan'];
    const labelSemua    = ['Semua','Seluruh Konten','All','Semua Konten','Pilih Kategori'];
    this.labelTerbaru   = labelTerbaru [this.sNav % labelTerbaru.length];
    this.labelTrending  = labelTrending[this.sNav % labelTrending.length];
    this.labelPopular   = labelPopular [(this.sNav+1) % labelPopular.length];
    this.labelSemua     = labelSemua   [(this.sNav+2) % labelSemua.length];

    // ── Mantra Penggerak — Ajian Panggil Tindakan ─────────────────────
    const ctaPlay   = ['Tonton Sekarang','Play Now','Langsung Tonton','Mulai Streaming','Putar Video','Saksikan'];
    const ctaSearch = ['Cari Konten','Temukan Video','Jelajahi Koleksi','Cari di Sini','Search'];
    const ctaMore   = ['Lihat Lebih Banyak','Muat Lebih','Load More','Tampilkan Lagi','Lebih Banyak'];
    this.ctaPlay    = ctaPlay  [this.sCopy % ctaPlay.length];
    this.ctaSearch  = ctaSearch[(this.sCopy+1) % ctaSearch.length];
    this.ctaMore    = ctaMore  [(this.sCopy+2) % ctaMore.length];

    // ── Bisikan di Lubang Pencarian ───────────────────────────────────
    const placeholders = [
      'Cari video...', 'Mau nonton apa?', 'Ketik judul atau kata kunci...',
      'Temukan konten favoritmu...', 'Cari film, album...', 'Search here...',
    ];
    this.searchPlaceholder = placeholders[this.sNav % placeholders.length];

    // ── Judul Besar Halaman Padepokan ─────────────────────────────────
    const secTitles = [
      'Konten Terbaru','Update Terkini','Koleksi Pilihan',
      ' Baru Ditambahkan',' Konten Unggulan',' Top Hari Ini',
    ];
    this.sectionTitleDefault = secTitles[this.sLayout % secTitles.length];

    // ── Salam Penutup dari Leluhur ─────────────────────────────────────
    const taglines = [
      'Platform streaming gratis terbaik.',
      'Konten berkualitas tanpa batas.',
      'Nikmati hiburan tanpa registrasi.',
      'Ribuan konten siap ditonton.',
      'Streaming HD, gratis selamanya.',
      'Update harian, kualitas terjamin.',
    ];
    this.footerTagline = taglines[this.sFooter % taglines.length];

    // ── Gaya Ukiran Hak Milik Gaib ─────────────────────────────────────
    const copyrights = [
      (name, year) => `© ${year} ${name} • All Rights Reserved`,
      (name, year) => `${name} © ${year} • 18+ Only`,
      (name, year) => `© ${year} ${name} — Streaming Gratis`,
      (name, year) => `${year} © ${name} • Untuk 18 Tahun ke Atas`,
    ];
    this.copyrightFn = copyrights[this.sFooter % copyrights.length];

    // ── Pola Nama untuk Tiap Jimat Konten ─────────────────────────────
    // 24 pola video + 20 pola album — ragam nama tak terhitung
    // ANTI-TABRAKAN: kolam jimat diperbesar 6-10 pilihan per lubang
    // + akhiran microVar per (domain+contentId) → efektif ~720 kombinasi
    // Sehingga tabrakan antar domain+konten sangat jarang terjadi
    const sExt  = hashSeed(this.domain + ':ext');
    const sExt2 = hashSeed(this.domain + ':x2');
    const _q  = ['Ultra HD','4K Premium','Full HD','HDR','4K HDR','Blu-ray','Super HD','Crystal Clear','4K UHD','Pro HD'][this.sTitle%10];
    const _q2 = ['HD','FHD','4K','720p','1080p','HDR','2K','UHD','HQ','SD Free'][(this.sTitle+1)%10];
    const _q3 = ['Jernih','Tajam','Crisp','Bening','Terang'][(this.sTitle+2)%5];
    const _a  = ['Tanpa Daftar','No Register','Langsung Putar','Skip Login','Instant Access','Zero Sign Up'][(this.sTitle)%6];
    const _a2 = ['Kapan Saja','Dimana Saja','Sekarang Juga','24 Jam','Non-Stop','All Day'][(this.sTitle+1)%6];
    const _a3 = ['Ribuan Konten','Koleksi Lengkap','Pilihan Terbaik','Jutaan Video','Katalog Besar','Arsip Penuh'][(this.sTitle+2)%6];
    const _c  = ['Gratis','Free','Cuma-Cuma','Bebas Bayar','Zero Cost','No Charge'][(this.sTitle+3)%6];
    const _c2 = ['Streaming Gratis','Nonton Online','Putar Sekarang','Watch Free','Akses Gratis','View Now'][(this.sTitle+4)%6];
    const _c3 = ['Anti Lag','Zero Buffer','Tanpa Gangguan','No Delay','Fast Stream','Instant Play'][(this.sTitle+5)%6];
    const _tp = ['Situs','Platform','Tempat','Portal','Hub','Layanan'][(this.sTitle+6)%6];
    const _ub = ['Unggulan','Terpilih','Pilihan','Andalan','Favorit','Hits'][(this.sTitle+7)%6];
    const _vl = ['Versi Lengkap','Full Version','Edisi Lengkap','Complete Edition','Full Cut','Uncut'][(this.sTitle+8)%6];
    const _fr = ['Video','Film','Klip','Show','Content','Stream'][(this.sTitle+9)%6];
    const _e1 = ['Premium','Eksklusif','Special','VIP','Pro','Plus'][sExt%6];
    const _e2 = ['Terbaru','Fresh','Baru','Update','Latest','New'][(sExt+1)%6];
    const _e3 = ['Mudah','Cepat','Praktis','Instan','Kilat','Simple'][(sExt+2)%6];
    const _e4 = ['Aman','Terpercaya','Legal','Resmi','Verified','Safe'][sExt2%6];

    const videoTpls = [
      `${this.verbNonton} {t} - ${_c} ${_q2} ${_e2}`,
      `{t} ${_vl} · ${this.verbNonton} ${_c} ${_e1}`,
      `${_fr} {t} ${_ub} | ${_q2} ${_e4}`,
      `{t} ${_q} | ${this.verbNonton} ${_a} ${_e2}`,
      `${_c2} {t} ${_q2} | ${_e3}`,
      `{t} ${_a3} · ${this.verbNonton} · ${_e2}`,
      `${this.verbNonton} {t} ${_a2} | ${_q2} ${_e1}`,
      `{t} Kualitas ${_q} · ${_c} ${_e4}`,
      `{t} ${_c} · ${_q2} · ${this.verbNonton} · ${_e3}`,
      `{t} — ${this.ctaPlay} ${_q2} ${_e2}`,
      `${this.verbNonton} {t} ${_c} | ${_a} · ${_e4}`,
      `{t} ${_q2} ${_e1} · ${this.verbNonton} · ${_c}`,
      `${_fr} {t} ${_ub} ${_e2} — ${this.verbNonton} ${_c2}`,
      `{t} — ${_c2} | ${_a} · ${_e3}`,
      `${this.verbNonton} {t} ${_a} · ${_q2} · ${_e1}`,
      `{t} ${_q2} ${_e4} — ${_c} | ${this.verbNonton}`,
      `${this.verbNonton} {t} ${_q2} ${_e2} | ${_a2}`,
      `{t} | ${_q3} · ${_a3} · ${_c} ${_e1}`,
      `${this.verbNonton} {t} — ${_a3} · ${_c} ${_e3}`,
      `{t} ${_vl} ${_c} ${_e2} · ${_q2}`,
      `Akses {t} ${_e3} — ${this.verbNonton} ${_a2} · ${_q2}`,
      `{t} ${_ub} ${_e1} — ${this.verbNonton} ${_q} ${_c}`,
      `${_tp} ${_e4} ${this.verbNonton} {t} — ${_q2} ${_c}`,
      `{t} — ${_c3} ${_e2} · ${_q2} · ${this.verbNonton}`,
    ];

    // Pola Album — sama, semua memiliki jimat domain-spesifik
    const _al = ['Foto','Gambar','Image'][(this.sTitle)%3];
    const _ag = ['Galeri','Album','Koleksi'][(this.sTitle+1)%3];
    const _ar = ['Resolusi Tinggi','High Res','Full HD'][(this.sTitle+2)%3];
    const _af = ['Terlengkap','Terbesar','Terpilih'][(this.sTitle+3)%3];
    const _ae = ['Eksklusif','Premium','Spesial'][(this.sTitle+4)%3];

    const albumTpls = [
      `${_ag} {t} - ${_al} ${_af}`,
      `{t} | Koleksi ${_al} ${_ae}`,
      `${_ag} {t} Terbaru & ${_af}`,
      `{t} - ${_al} ${_ar}`,
      `${this.verbLihat} {t} Full ${_ag}`,
      `{t} | ${_ag} ${_ae} · ${_ar}`,
      `${_al} {t} - ${_ae} ${_ar}`,
      `${_ag} Lengkap {t} · ${_al} ${_af}`,
      `{t} ${_ag} ${_ar} · ${_c}`,
      `${this.verbLihat} Koleksi {t} · ${_al} ${_ae}`,
      `{t} — ${_al} ${_ae} · ${_ag} ${_af}`,
      `${_ag} {t} ${_af} · ${_ar}`,
      `{t} | ${_ar} · ${_c}`,
      `${this.verbLihat} {t} — ${_al} ${_af} · ${_ag}`,
      `{t} Photo Collection · ${_ar} · ${_c}`,
      `${_ag} {t} — Update Terbaru · ${_ar}`,
      `{t} | ${_al} ${_ar} · ${_ae}`,
      `${this.verbLihat} ${_al} {t} ${_c}`,
      `Koleksi Lengkap {t} — ${this.verbLihat} ${_al} ${_ae}`,
      `{t} ${_ag} Online · ${_ar} · ${_c}`,
    ];
    // Pengacakan berbiji — domain menentukan urutan pola
    this.videoTpls = seededShuffle(videoTpls, this.sTitle);
    this.albumTpls = seededShuffle(albumTpls, this.sTitle + 1);

    // ── Pembuka dan Penutup Uraian — Mantra Awal dan Akhir ────────────
    // 20 pembuka + 20 penutup — variasi susunan kalimat, bukan sekadar sinonim
    const prefixes = [
      // Struktur: Kata Laku + pelaku
      `${this.verbNonton} {t} secara gratis tanpa registrasi.`,
      `{t} hadir dengan kualitas terbaik untuk Anda.`,
      `Temukan {t} di koleksi terlengkap kami.`,
      `{t} kini bisa disaksikan kapan saja dan di mana saja.`,
      `{t} tersedia gratis, ${this.ctaPlay.toLowerCase()} sekarang.`,
      `Koleksi {t} pilihan siap dinikmati tanpa batas.`,
      `{t} — konten berkualitas tanpa gangguan iklan.`,
      `Dapatkan akses penuh ke {t} secara gratis sekarang.`,
      `Kami hadirkan {t} dengan streaming paling lancar.`,
      `{t} adalah pilihan hiburan terbaik hari ini.`,
      // 10 pembuka baru — variasi susunan yang berbeda rupa
      `Ingin ${this.verbNonton.toLowerCase()} {t}? Tersedia gratis di sini.`,
      `{t} kini dapat dinikmati tanpa perlu mendaftar.`,
      `Akses {t} langsung — tanpa iklan, tanpa buffering.`,
      `${this.verbNonton} {t} kapan saja, di perangkat apa saja.`,
      `{t} sudah tersedia — ${this.verbNonton.toLowerCase()} sekarang juga.`,
      `Ribuan penonton sudah menikmati {t}. Giliran Anda.`,
      `{t} hadir di ${this.verbNonton.toLowerCase()} kami — gratis dan mudah diakses.`,
      `Tidak perlu download, ${this.verbNonton.toLowerCase()} {t} langsung online.`,
      `{t} — konten pilihan yang ditonton jutaan orang.`,
      `${['Mulai','Langsung','Segera'][(this.sDesc+5)%3]} ${this.verbNonton.toLowerCase()} {t} tanpa perlu daftar.`,
    ];
    const suffixes = [
      'Diperbarui setiap hari, selalu fresh.',
      'Tanpa batas, tanpa registrasi, langsung tonton.',
      `Streaming ${['cepat','kilat','tanpa delay'][this.sDesc%3]}, kualitas jernih.`,
      'Ribuan konten serupa menanti Anda.',
      `Diakses ${['jutaan','ratusan ribu','banyak'][this.sDesc%3]} penonton setiap harinya.`,
      'Platform hiburan terpercaya.',
      `Kualitas ${['HD','Full HD','4K'][this.sDesc%3]} terjamin di semua perangkat.`,
      'Konten diperbarui otomatis setiap hari.',
      'Gratis selamanya, nikmati tanpa khawatir.',
      `${this.verbNonton} sekarang, tidak perlu tunggu.`,
      // 10 penutup baru — variasi salam akhir yang berbeda
      `Lebih dari ${['1.000','5.000','10.000'][(this.sDesc+1)%3]} konten siap ditonton.`,
      'Tidak perlu akun, langsung akses kapan saja.',
      `Kompatibel di ${['semua perangkat','HP dan laptop','Android & iOS'][(this.sDesc+2)%3]}.`,
      'Update harian otomatis, selalu ada yang baru.',
      `${['Zero buffering','Anti lag','Tanpa gangguan'][(this.sDesc+3)%3]} dengan server cepat kami.`,
      'Temukan konten serupa di halaman rekomendasi kami.',
      `Sudah dipercaya ${['ribuan','jutaan','banyak'][(this.sDesc+4)%3]} pengguna setia.`,
      'Nikmati hiburan berkualitas tanpa harus keluar rumah.',
      `${['100%','Sepenuhnya','Benar-benar'][(this.sDesc+5)%3]} gratis, tanpa syarat apapun.`,
      'Simpan favorit Anda dan tonton kapan pun mau.',
    ];
    this.descPrefixes = seededShuffle(prefixes, this.sDesc);
    this.descSuffixes = seededShuffle(suffixes, this.sDesc + 1);

    // ── Cap Mutu — Stempel Kesempurnaan ───────────────────────────────
    this.qualityPool = seededShuffle(['HD','FHD','4K','720p','1080p','HDR','UHD','HQ','2K','4K HDR'], this.s);

    // ── Wadah Penanda Tambahan dari Alam Gaib ─────────────────────────
    const tagPools = [
      ['gratis','streaming','online','terbaru'],
      ['hd','kualitas','terbaik','pilihan'],
      ['nonton','video','film','hiburan'],
      ['update','baru','terlengkap','populer'],
      ['free','watch','quality','stream'],
      ['indonesia','lokal','terpercaya','lengkap'],
      ['viral','trending','hits','favorit'],
    ];
    this.tagPools = seededShuffle(tagPools, this.s + 7);

    // ── Tatanan Altar di Halaman Utama ─────────────────────────────────
    // 3 kemungkinan tatanan altar di halaman padepokan
    const orders = [
      ['banner_top','trending','filter','grid','promo','banner_bottom'],
      ['banner_top','filter','grid','trending','promo','banner_bottom'],
      ['filter','banner_top','trending','grid','banner_bottom','promo'],
    ];
    this.homeSectionOrder = orders[this.sLayout % orders.length];

    // ── Ragam Nama Jalur Navigasi Antar Golongan ──────────────────────
    this.navLabels = {
      semua:    this.labelSemua,
      trending: `${this.labelTrending}`,
      terbaru:  `${this.labelTerbaru}`,
      popular:  `${this.labelPopular}`,
      terlama:  `${['Terlama','Durasi Panjang','Paling Panjang'][this.sNav%3]}`,
      video:    ` ${['Video','Film','Stream'][this.sNav%3]}`,
      album:    ` ${['Album','Galeri','Foto'][this.sNav%3]}`,
      search:   ` ${this.verbCari}`,
    };
    // ── Peta Nama Gaib CSS & ID — Unik per Domain, Anti Lacak Sidik ───
    this._buildClassMap();
  }

  _buildClassMap() {
    const d = this.domain;
    const c = (n) => clsHash(d, n);
    const i = (n) => idHash(d, n);
    this.cls = {
      // Tata letak pokok
      header:          c('header'),
      headerCont:      c('header-container'),
      footer:          c('footer'),
      footerGrid:      c('footer-grid'),
      footerCol:       c('footer-col'),
      footerCopy:      c('footer-copy'),
      // Papan penunjuk jalan
      categories:      c('categories'),
      catInner:        c('categories-inner'),
      cat:             c('cat'),
      catActive:       c('cat-active'),
      bottomNav:       c('bottom-nav'),
      bnItem:          c('bn-item'),
      bnIconWrap:      c('bn-icon-wrap'),
      bnDot:           c('dot'),
      // Jendela gaib muncul tiba-tiba
      modalOverlay:    c('modal-overlay'),
      modalInner:      c('modal-inner'),
      modalHead:       c('modal-head'),
      modalClose:      c('modal-close'),
      modalNav:        c('modal-nav'),
      // Perkakas tampilan
      logo:            c('logo'),
      searchBar:       c('search-bar'),
      menuBtn:         c('menu-btn'),
      // Isi semesta
      container:       c('container'),
      layoutMain:      c('layout-main'),
      contentGrid:     c('content-grid'),
      contentArea:     c('content-area'),
      vGrid:           c('v-grid'),
      // Kartu-kartu gulungan video
      vCard:           c('v-card'),
      vImg:            c('v-img'),
      vInfo:           c('v-info'),
      vTitle:          c('v-title'),
      vMeta:           c('v-meta'),
      // Kartu-kartu yang sedang dibicarakan
      trendingStrip:   c('trending-strip'),
      trendingInner:   c('trending-inner'),
      tCard:           c('t-card'),
      tImg:            c('t-img'),
      tInfo:           c('t-info'),
      tTitle:          c('t-title'),
      tNum:            c('t-num'),
      tDur:            c('t-dur'),
      // Lencana penanda kehormatan
      badgeHot:        c('badge-hot'),
      badgeQual:       c('badge-qual'),
      badgeDur:        c('badge-dur'),
      // Perkakas tampilan serba-serbi
      breadcrumb:      c('breadcrumb'),
      bcSep:           c('bc-sep'),
      tag:             c('tag'),
      tags:            c('tags'),
      tagCloud:        c('tag-cloud'),
      pagination:      c('pagination'),
      pg:              c('pg'),
      pgActive:        c('pg-active'),
      pgWide:          c('pg-wide'),
      pageEllipsis:    c('page-ellipsis'),
      pageNumbers:     c('page-numbers'),
      pageBtn:         c('page-btn'),
      promoBar:        c('promo-banner'),
      loadMore:        c('load-more-btn'),
      secHeader:       c('sec-header'),
      secTitle:        c('sec-title'),
      secCount:        c('sec-count'),
      sectionHeader:   c('section-header'),
      sectionTitle:    c('section-title'),
      sectionCount:    c('section-count'),
      pageHeader:      c('page-header'),
      pageTitle:       c('page-title'),
      pageDesc:        c('page-desc'),
      noResults:       c('no-results'),
      skeletonCard:    c('skeleton-card'),
      skeletonLine:    c('skeleton-line'),
      viewMain:        c('view-main'),
      viewLayout:      c('view-layout'),
      categoryStrip:   c('category-strip'),
      catStripInner:   c('category-strip-inner'),
      errorPage:       c('error-page'),
      errorContent:    c('error-content'),
    };
    this.ids = {
      mainContent:  i('main-content'),
      modalMenu:    i('modal-menu'),
      menuBtn:      i('menu-btn'),
      closeModal:   i('close-modal'),
      searchInput:  i('search-input'),
      searchBtn:    i('search-btn'),
      catList:      i('cat-list'),
      backToTop:    i('back-to-top'),
    };
  }

  /** Ambil SiteDNA dari cache, atau buat baru */
  static get(domain) {
    let dna = _siteDNACache.get(domain);
    if (!dna) { dna = new SiteDNA(domain); _siteDNACache.set(domain, dna); }
    return dna;
  }
}

// ── Fungsi Peramu Rempah — Ilmu Mengolah Konten Menjadi Sakti ────────────

function microVar(domain, contentId) {
  const s1 = hashSeed(domain + ':' + contentId + ':mv1');
  const s2 = hashSeed(domain + ':' + contentId + ':mv2');
  const s3 = hashSeed(String(contentId) + domain.slice(0, 3) + ':mv3');
  const qual = ['HD','FHD','4K','720p','1080p','HDR','2K','UHD','HQ','BluRay','8K','SD','1080i','480p','360p'][s1 % 15];
  const stat = ['Gratis','Free','Online','Full','Terbaru','Update','Stream','Baru','Legal','Fast','Clear','Best'][s2 % 12];
  const sep  = [' · ', ' | ', ' — ', ' / '][(s1 + s2) % 4];
  const bonus = (s3 % 3 === 0) ? (' ' + ['v' + ((s3 % 9) + 1), 'ep' + ((s3 % 12) + 1), '#' + ((s3 % 20) + 1)][s3 % 3]) : '';
  return sep + qual + (s3 % 2 === 0 ? '' : (' ' + stat)) + bonus;
}


function bumbuItem(item, domain) {
  if (!item || !item.id) return item;
  const dna     = SiteDNA.get(domain);
  const s       = hashSeed(domain + ':' + item.id);
  const sDesc   = hashSeed(domain + ':' + item.id + ':desc');
  const sTag    = hashSeed(domain + ':' + item.id + ':tag');
  const isAlbum = item.type === 'album';

  // ── 1. Putaran Judul — Memutar Nama Bak Cakra Manggilingan ───────────
  if (item.title) {
    const tpls = isAlbum ? dna.albumTpls : dna.videoTpls;
    item._original_title = item._original_title || item.title;
    // Pola dasar + akhiran microVar → efektif 17.280 kombinasi per domain
    const tpl = tpls[s % tpls.length];
    const base = tpl
      .replace('{v}', dna.verbNonton)
      .replace('{t}', item._original_title);
    item.title = base + microVar(domain, item.id);
  }

  // ── 2. Putaran Uraian + Penulisan Ulang Sinonim — Sulap Kata-Kata ──────
  const baseTitle = item._original_title || item.title || '';
  const prefix    = dna.descPrefixes[sDesc % dna.descPrefixes.length].replace('{t}', baseTitle);
  const suffix    = dna.descSuffixes[(sDesc + 3) % dna.descSuffixes.length];
  const origDesc  = item._original_description !== undefined ? item._original_description : (item.description || '');
  item._original_description = origDesc;
  // Gabungkan pembuka + uraian asli (dipotong + sulap sinonim) + penutup
  const trimmed   = origDesc ? rewriteDesc(truncate(origDesc, 120), sDesc) + ' ' : '';
  item.description = `${prefix} ${trimmed}${suffix}`;

  // ── 3. Cap Kualitas — Stempel Dukun Penilai Mutu ──────────────────────
  item.quality_label = dna.qualityPool[s % dna.qualityPool.length];

  // ── 4. Pengayaan Penanda — Memperkaya Jejak Gaib ──────────────────────
  if (Array.isArray(item.tags)) {
    const extra  = dna.tagPools[sTag % dna.tagPools.length];
    item.tags = [...new Set([...item.tags, ...extra])].slice(0, 15);
  }

  return item;
}

function bumbuItems(items, domain) {
  if (!Array.isArray(items)) return;
  for (const item of items) {
    bumbuItem(item, domain);
    if (item.photos && Array.isArray(item.photos)) {
      for (const photo of item.photos) bumbuItem(photo, domain);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════
// SESI 14 — PEMBANTU PAMOR — Ilmu Pengangkat Derajat di Mata Mesin Pencari
// ═══════════════════════════════════════════════════════════════════════

class SeoHelper {
  constructor(cfg) {
    this.siteName   = cfg.WARUNG_NAME;
    this.domain     = cfg.WARUNG_DOMAIN;
    this.domainSeed = hashSeed(cfg.WARUNG_DOMAIN);
    this.cfg        = cfg;

    const s = this.domainSeed;
    const n = this.siteName;
    // Jimat domain-spesifik untuk SeoHelper — selaras dengan DNA Situs
    const dna = SiteDNA.get(this.domain);
    const _sv = dna.verbNonton;                                           // verb domain
    const _sq = ['HD','FHD','4K','1080p','Ultra HD'][s%5];               // quality
    const _sq2= ['Gratis','Free','Cuma-Cuma'][(s+1)%3];                  // free label
    const _sa = ['Tanpa Daftar','No Register','Langsung'][(s+2)%3];      // action
    const _sc = ['Terbaru','Update','Baru'][(s+3)%3];                    // fresh label
    const _se = ['Terpercaya','Terbaik','Unggulan'][(s+4)%3];            // trust label

    this.titleTemplates = seededShuffle([
      `{title} ${_sq} - ${n}`,
      `{title} | ${n} · ${_sq2}`,
      `${_sv} {title} di ${n}`,
      `{title} ${_sq} | ${n} · ${_sa}`,
      `Streaming {title} - ${n} · ${_sq}`,
      `${n} | {title} · ${_sv}`,
      `{title} ${_sq2} - ${n} · ${_sq}`,
      `${_sv} {title} Online | ${n}`,
      `{title} ${_sc} - ${n} · ${_sq}`,
      `${n} ${_se}: {title}`,
      `{title} · ${_sq} · ${_sq2} | ${n}`,
      `${n} · ${_sv} {title} ${_sq}`,
      `{title} | ${_sa} · ${_sq} - ${n}`,
      `${_sv} {title} ${_sq2} | ${n}`,
      `{title} ${_sc} ${_sq} - ${n}`,
      `${n} | {title} · ${_sq} · ${_sq2}`,
      `{title} ${_se} - ${n} · ${_sv}`,
      `{title} · ${_sa} | ${n} ${_sq}`,
      `${n} ${_sq}: {title} · ${_sq2}`,
      `${_sv} {title} | ${n} · ${_sc}`,
      `{title} · ${_sv} · ${_sq} | ${n}`,
      `${n} — {title} ${_sq} ${_sq2}`,
      `{title} ${_se} ${_sq} | ${n}`,
      `${_sv} {title} ${_sc} - ${n} ${_sq}`,
    ], this.domainSeed);

    // ── Pola Uraian Sakti: 20 slot untuk meta description halaman semesta ──────
    // Pakai awalan DNA Situs sebagai dasar agar selaras dengan bumbuItem.
    // Setelah diambil dari DNA Situs, ditambah akhiran {situs} untuk cap nama.
    // Pembenahan: dna sudah diumumkan di atas (baris 1518), tak perlu diumumkan ulang
    this.descTemplates = seededShuffle([
      // Wujud: uraian + cap nama situs
      `{title} tersedia gratis di ${n}. Streaming langsung tanpa registrasi.`,
      `Tonton {title} kualitas HD di ${n}. Gratis, cepat, tanpa buffering.`,
      `${n} menghadirkan {title}. Akses unlimited, 100% gratis.`,
      `Nikmati {title} di ${n}. Platform streaming terpercaya.`,
      `{title} kini hadir di ${n}. Nonton gratis tanpa iklan.`,
      `Streaming {title} HD di ${n}. Tanpa registrasi, langsung tonton.`,
      `Cari {title}? ${n} tempatnya. Gratis dan berkualitas.`,
      `{title} — tersedia di ${n}. Kualitas HD, gratis selamanya.`,
      `${n} hadirkan {title} untuk Anda. Tonton kapan saja, di mana saja.`,
      `Ingin tonton {title}? ${n} menyediakan gratis tanpa daftar.`,
      // Wujud: kaya pamor SEO dengan tampilan kata kunci
      `{title} sudah ditonton {views}di ${n}. Bergabung dan nikmati gratis.`,
      `${n}: tempat terbaik ${['nonton','tonton','streaming'][(s+1)%3]} {title}. Gratis & HD.`,
      `{title} kini bisa disaksikan di ${n}. Update harian, kualitas terjamin.`,
      `Akses {title} di ${n} — tanpa iklan, tanpa buffering, tanpa biaya.`,
      `${n} mengupdate {title} setiap hari. ${['Tonton','Nikmati','Saksikan'][(s+2)%3]} sekarang.`,
      // Wujud: keistimewaan didahulukan
      `Gratis dan tanpa daftar — ${['nonton','tonton','akses'][(s+3)%3]} {title} di ${n} sekarang.`,
      `{title} resolusi ${['HD','Full HD','4K'][(s+4)%3]} tersedia gratis di ${n}.`,
      `Ribuan penonton sudah ${['menikmati','menonton','menyaksikan'][(s+5)%3]} {title} di ${n}.`,
      `{title} — konten pilihan di ${n}. Tidak perlu registrasi, langsung tonton.`,
      `${n} | {title} tersedia dalam kualitas ${['HD','FHD','4K'][(s+6)%3]} tanpa biaya apapun.`,
    ], this.domainSeed + 1);

    this.schemaTypeMap = { video:'VideoObject', album:'ImageGallery' };
    this.hiddenTokens = ['premium','exclusive','ultra-hd','no-ads','fast-stream','4k-quality','hd-ready','instant-play','zero-buffer','high-speed'];
  }

  generateUniqueSchema(id, type='video') {
    const seed = hashSeed(this.domain+id+type+this.domainSeed);
    return {
      schema_type:      this.schemaTypeMap[type]||'CreativeWork',
      token:            this.hiddenTokens[seed%this.hiddenTokens.length],
      interaction_type: (type==='video'?'WatchAction':'ViewAction'),
      comment:          `<!-- ${this.domain} -->`,
      seed, hash: hexHash(seed+this.domain, 32),
    };
  }

  title(baseTitle, contentId=0, type='') {
    baseTitle=(baseTitle||'').trim(); if (!baseTitle) return this.siteName;
    // Pembenahan: benih gabungan domainSeed + contentId + jenis — lebih tersebar, kurangi tabrakan
    const contentSeed = contentId>0 ? (contentId*2654435761) : hashSeed(baseTitle);
    const idx = Math.abs((this.domainSeed ^ contentSeed ^ hashSeed(type||'v')) % this.titleTemplates.length);
    const out = this.titleTemplates[idx]
      .replace('{title}', baseTitle)
      .replace('{site}',  this.siteName)
      .replace('{type}',  type||'konten');
    return mbSubstr(out, 0, [60,62,65,68,70][this.domainSeed%5]);
  }

  description(baseTitle, contentId=0, type='', views=0) {
    baseTitle=(baseTitle||'').trim(); if (!baseTitle) return this.cfg.SEO_DEFAULT_DESC;
    // Pembenahan: benih lebih tersebar dengan tambahan hash jenis
    const contentSeed = contentId>0 ? (contentId*1234567891) : hashSeed(baseTitle);
    const idx = Math.abs((this.domainSeed ^ contentSeed ^ hashSeed(type||'v') ^ 0xdeadbeef) % this.descTemplates.length);
    const viewsStr = views>0 ? formatViews(views)+'x ditonton. ' : '';
    const out = this.descTemplates[idx]
      .replace('{title}',  baseTitle)
      .replace('{site}',   this.siteName)
      .replace('{type}',   type||'konten')
      .replace('{views}',  viewsStr);
    return mbSubstr(out, 0, [150,155,160,165,170][this.domainSeed%5]);
  }

  canonical(path='', request=null) {
    if (!path&&request) path=new URL(request.url).pathname;
    path=path.replace(/[^\w\-\/\.?=&#@!,:+~%]/g,'');
    return 'https://'+this.domain+(path||'/');
  }

  renderMeta({ title, desc, canonical, ogImage, ogType='website', keywords, noindex=false,
               contentId=0, contentType='meta', publishedTime='', modifiedTime='',
               twitterCard='', isPagePaginated=false, nonce='' }) {
    const fp = this.generateUniqueSchema(contentId, contentType);
    const robotsBase = noindex ? 'noindex, nofollow'
      : isPagePaginated ? 'index, follow, max-snippet:-1, max-image-preview:large'
      : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1';
    const finalImg = ogImage||this.cfg.SEO_OG_IMAGE;
    const card = twitterCard||(finalImg?'summary_large_image':'summary');
    const locale = this.cfg.SEO_LOCALE||'id_ID';
    const twitterSite = this.cfg.SEO_TWITTER_SITE ? `\n<meta name="twitter:site" content="${h(this.cfg.SEO_TWITTER_SITE)}">` : '';
    let articleMeta='', videoMeta='';
    if (ogType==='article'||ogType==='video.movie') {
      if (publishedTime) articleMeta+=`\n<meta property="article:published_time" content="${h(publishedTime)}">`;
      if (modifiedTime)  articleMeta+=`\n<meta property="article:modified_time"  content="${h(modifiedTime)}">`;
      articleMeta+=`\n<meta property="article:author" content="https://${h(this.domain)}">`;
      articleMeta+=`\n<meta property="article:publisher" content="https://${h(this.domain)}">`;
    }
    if (ogType==='video.movie') {
      videoMeta=`\n<meta property="og:video" content="${h(canonical)}">\n<meta property="og:video:secure_url" content="${h(canonical)}">\n<meta property="og:video:type" content="text/html">\n<meta property="og:video:width" content="1280">\n<meta property="og:video:height" content="720">`;
    }
    return `${fp.comment}
<title>${h(title)}</title>
<meta name="description" content="${h(desc)}">
<meta name="keywords" content="${h(keywords||this.cfg.SEO_KEYWORDS)}">
<meta name="robots" content="${robotsBase}">
<meta name="googlebot" content="${robotsBase}">
<meta name="author" content="${h(this.siteName)}">
<meta name="rating" content="general">
<meta name="HandheldFriendly" content="True">
<link rel="canonical" href="${h(canonical)}">
<link rel="alternate" hreflang="id" href="${h(canonical)}">
<link rel="alternate" hreflang="x-default" href="${h(canonical)}">
<meta property="og:title" content="${h(title)}">
<meta property="og:description" content="${h(desc)}">
<meta property="og:url" content="${h(canonical)}">
<meta property="og:image" content="${h(finalImg)}">
<meta property="og:image:secure_url" content="${h(finalImg)}">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="${this.cfg.SEO_OG_IMAGE_W||1200}">
<meta property="og:image:height" content="${this.cfg.SEO_OG_IMAGE_H||630}">
<meta property="og:image:alt" content="${h(title)}">
<meta property="og:type" content="${h(ogType)}">
<meta property="og:site_name" content="${h(this.siteName)}">
<meta property="og:locale" content="${h(locale)}">
<meta name="twitter:card" content="${card}">
<meta name="twitter:title" content="${h(title)}">
<meta name="twitter:description" content="${h(desc)}">
<meta name="twitter:image" content="${h(finalImg)}">
<meta name="twitter:image:alt" content="${h(title)}">${twitterSite}${articleMeta}${videoMeta}`;
  }

  contentSchema(item, canonical, playerUrl=null) {
    if (!item) return '';
    const fp=this.generateUniqueSchema(item.id||0, item.type);
    const type=item.type||'video';
    const baseId='https://'+this.domain+'/#'+type+'-'+(item.id||0);
    const pub={ '@type':'Organization', '@id':'https://'+this.domain+'/#organization', 'name':this.siteName, 'url':'https://'+this.domain, 'logo':{'@type':'ImageObject','url':'https://'+this.domain+'/assets/og-default.jpg','width':1200,'height':630} };
    const base={
      '@type':fp.schema_type,'@id':baseId,'name':item.title||'',
      'description':truncate(item.description||item.title||'',300),
      'url':canonical,'publisher':pub,'isFamilyFriendly':true,'isAccessibleForFree':true,
      'interactionStatistic':{'@type':'InteractionCounter','interactionType':{'@type':fp.interaction_type},'userInteractionCount':parseInt(item.views||0, 10)},
    };
    if (item.thumbnail) { base['thumbnail']={'@type':'ImageObject','url':item.thumbnail}; base['image']=item.thumbnail; }
    if (type==='video') {
      const thumb=item.thumbnail||('https://'+this.domain+'/assets/og-default.jpg');
      Object.assign(base,{'thumbnailUrl':[thumb],'uploadDate':item.created_at||new Date().toISOString(),'contentUrl':canonical,'embedUrl':playerUrl||canonical,'regionsAllowed':'ID','requiresSubscription':false,'inLanguage':this.cfg.SEO_LANG||'id','potentialAction':{'@type':'WatchAction','target':{'@type':'EntryPoint','urlTemplate':canonical}}});
      if (item.duration) base['duration']=isoDuration(parseInt(item.duration, 10));
      if (item.created_at) base['datePublished']=item.created_at;
      if (item.updated_at) base['dateModified']=item.updated_at;
    } else if (type==='album') {
      Object.assign(base,{'datePublished':item.created_at||new Date().toISOString(),'dateModified':item.updated_at||item.created_at||new Date().toISOString(),'inLanguage':this.cfg.SEO_LANG||'id','numberOfItems':item.photo_count||0,'potentialAction':{'@type':'ViewAction','target':canonical}});
    }
    Object.keys(base).forEach(k=>(base[k]===undefined||base[k]===null)&&delete base[k]);
    return `<script type="application/ld+json" nonce="${generateNonce()}">${JSON.stringify({'@context':'https://schema.org','@graph':[base]},null,0)}</script>`;
  }

  websiteSchema(searchUrlTpl) {
    const orgId='https://'+this.domain+'/#organization';
    const siteId='https://'+this.domain+'/#website';
    const graph=[
      {'@type':'Organization','@id':orgId,'name':this.siteName,'url':'https://'+this.domain,'logo':{'@type':'ImageObject','@id':'https://'+this.domain+'/#logo','url':'https://'+this.domain+'/assets/og-default.jpg','width':1200,'height':630,'caption':this.siteName},'contactPoint':{'@type':'ContactPoint','email':this.cfg.CONTACT_EMAIL,'contactType':'customer support'},'sameAs':['https://'+this.domain]},
      {'@type':'WebSite','@id':siteId,'name':this.siteName,'url':'https://'+this.domain,'description':this.cfg.SEO_DEFAULT_DESC,'inLanguage':this.cfg.SEO_LANG||'id','publisher':{'@id':orgId},'potentialAction':{'@type':'SearchAction','target':{'@type':'EntryPoint','urlTemplate':searchUrlTpl},'query-input':'required name=search_term_string'}},
    ];
    return `<script type="application/ld+json" nonce="${generateNonce()}">${JSON.stringify({'@context':'https://schema.org','@graph':graph},null,0)}</script>`;
  }

  breadcrumbSchema(items, pageId='') {
    const bcrumbId = 'https://'+this.domain+(pageId||'/')+'#breadcrumb';
    const schema = { '@context':'https://schema.org', '@type':'BreadcrumbList', '@id':bcrumbId, 'itemListElement':items.map((item,i)=>{const el={'@type':'ListItem','position':i+1,'name':item.name};if(item.url) el['item']='https://'+this.domain+item.url; return el;}) };
    return `<script type="application/ld+json" nonce="${generateNonce()}">${JSON.stringify(schema,null,0)}</script>`;
  }

  itemListSchema(items, canonical, cfg) {
    if (!items?.length) return '';
    const schema={ '@context':'https://schema.org','@type':'ItemList','@id':canonical+'#itemlist','url':canonical,'name':cfg.WARUNG_NAME,'numberOfItems':items.length,'itemListElement':items.slice(0,10).map((item,i)=>({'@type':'ListItem','position':i+1,'url':'https://'+cfg.WARUNG_DOMAIN+itemUrl(item,cfg),'name':item.title||'','image':item.thumbnail||''})) };
    return `<script type="application/ld+json" nonce="${generateNonce()}">${JSON.stringify(schema,null,0)}</script>`;
  }

  faqSchema(faqs) {
    if (!faqs?.length) return '';
    const schema={ '@context':'https://schema.org','@type':'FAQPage','mainEntity':faqs.map(faq=>({'@type':'Question','name':faq.q,'acceptedAnswer':{'@type':'Answer','text':faq.a}})) };
    return `<script type="application/ld+json" nonce="${generateNonce()}">${JSON.stringify(schema,null,0)}</script>`;
  }
}

// ═══════════════════════════════════════════════════════════════════════
// SESI 15 — SISTEM PESUGIHAN — Pengelola Iklan dan Spanduk Gaib
// ═══════════════════════════════════════════════════════════════════════

function sanitizeAdCode(code) {
  if (!code) return '';
  // Hanya tanggalkan penangan peristiwa inline dari tag HTML (bukan isi script)
  // Penting: jangan hapus isi <script> karena AdProvider.push() membutuhkannya
  return code
    .replace(/(<(?:ins|iframe|div|a)\b[^>]*)\son\w+="[^"]*"/gi, '$1')
    .replace(/(<(?:ins|iframe|div|a)\b[^>]*)\son\w+='[^']*'/gi, '$1');
}

function getAdsSlots(cfg) {
  const ck = cfg.WARUNG_DOMAIN+':'+cfg.ADS_ADSENSE_CLIENT+':'
    +(cfg.ADS_CODE_TOP_D||'').slice(0,32)+':'+(cfg.ADS_CODE_TOP_M||'').slice(0,32)+':'
    +(cfg.ADS_CODE_BTM_D||'').slice(0,32)+':'+(cfg.ADS_CODE_BTM_M||'').slice(0,32)+':'
    +(cfg.ADS_CODE_SDB_D||'').slice(0,32)+':'+(cfg.ADS_CODE_SDB_M||'').slice(0,32)+':'
    +(cfg.ADS_CODE_POPUNDER||'').slice(0,32)+':'+cfg.ADS_MID_GRID_AFTER;
  if (_adsSlotsCache.has(ck)) return _adsSlotsCache.get(ck);

  const tD = cfg.ADS_CODE_TOP_D, tM = cfg.ADS_CODE_TOP_M; // Grup TOP
  const bD = cfg.ADS_CODE_BTM_D, bM = cfg.ADS_CODE_BTM_M; // Grup BOTTOM
  const sD = cfg.ADS_CODE_SDB_D, sM = cfg.ADS_CODE_SDB_M; // Grup SIDEBAR
  // Popunder — kode khusus, bila kosong fallback ke bottom group
  const pU = cfg.ADS_CODE_POPUNDER || bM || bD;

  const slots = {
    header_top:      { enabled:true, type:'html', code_desktop:tD, code_mobile:tM, label:true,        align:'center', margin:'0 0 4px' },
    before_grid:     { enabled:true, type:'html', code_desktop:tD, code_mobile:tM, label:'Sponsored', align:'center', margin:'8px 0 16px' },
    mid_grid:        { enabled:true, type:'html', code_desktop:tD, code_mobile:tM, label:'Iklan',     align:'center', margin:'4px 0', insert_after:safeParseInt(cfg.ADS_MID_GRID_AFTER,6) },
    after_grid:      { enabled:true, type:'html', code_desktop:bD, code_mobile:bM, label:true,        align:'center', margin:'16px 0 8px' },
    sidebar_top:     { enabled:true, type:'html', code_desktop:sD, code_mobile:sM, label:true,        align:'center', margin:'0 0 16px' },
    sidebar_mid:     { enabled:true, type:'html', code_desktop:sD, code_mobile:sM, label:true,        align:'center', margin:'0 0 16px' },
    sidebar_bottom:  { enabled:true, type:'html', code_desktop:sD, code_mobile:sM, label:true,        align:'center', margin:'0' },
    after_content:   { enabled:true, type:'html', code_desktop:bD, code_mobile:bM, label:true,        align:'center', margin:'24px 0' },
    footer_top:      { enabled:true, type:'html', code_desktop:bD, code_mobile:bM, label:true,        align:'center', margin:'0' },
    // Popunder — slot khusus di footer, selalu render mobile+desktop sebagai script tag
    footer_popunder: { enabled:true, type:'popunder', code_desktop:pU, code_mobile:pU, label:false,   align:'center', margin:'0' },
  };
  _adsSlotsCache.set(ck, slots);
  return slots;
}

function getDeliveryMode(request) {
  const ect=request.headers.get('ECT')||'';
  const downlink=parseFloat(request.headers.get('downlink')||'NaN');
  const saveData=request.headers.get('Save-Data')==='on';
  const ua=request.headers.get('User-Agent')||'';
  const cfDev=request.headers.get('CF-Device-Type')||'';
  const slowNet=(ect==='slow-2g'||ect==='2g')||(!isNaN(downlink)&&downlink<0.5);
  return { lite:slowNet||saveData, saveData, mobile:cfDev==='mobile'||_MOBILE_UA_RX.test(ua), lowEnd:slowNet };
}

function renderBanner(name, cfg, request=null, nonce='') {
  if (!cfg.ADS_ENABLED) return '';
  const slots=getAdsSlots(cfg); const slot=slots[name];
  if (!slot||!slot.enabled) return '';
  const margin=h(slot.margin||'16px 0');
  const align=slot.align==='left'?'left':slot.align==='right'?'right':'center';
  // Suntikkan jimat nonce ke semua tag <script> agar lolos penjaga CSP
  const injectNonce = (code) => {
    if (!code||!nonce) return sanitizeAdCode(code);
    return sanitizeAdCode(code).replace(/<script\b([^>]*)>/gi, (m, attrs) => {
      if (attrs.includes('nonce=')) return m;
      return `<script${attrs} nonce="${nonce}">`;
    });
  };
  if (slot.type==='popunder') {
    // Popunder: render sebagai script container tersembunyi — tidak ada ads-desktop/ads-mobile toggle
    const code = injectNonce(slot.code_mobile || slot.code_desktop || '');
    if (!code) return '';
    return `<div class="ad-slot ad-slot--footer_popunder" aria-hidden="true">${code}</div>`;
  }
  if (slot.type==='html'&&slot.code_desktop&&slot.code_mobile) {
    if (request) {
      const isMob=getDeliveryMode(request).mobile;
      const code=injectNonce(isMob?slot.code_mobile:slot.code_desktop);
      const cls=isMob?'ads-mobile':'ads-desktop';
      return `<div class="ad-slot ad-slot--${h(name)} ${cls}" style="margin:${margin};text-align:${align}">${code}</div>`;
    }
    return [
      `<div class="ad-slot ad-slot--${h(name)} ads-desktop" style="margin:${margin};text-align:${align}">${injectNonce(slot.code_desktop)}</div>`,
      `<div class="ad-slot ad-slot--${h(name)} ads-mobile"  style="margin:${margin};text-align:${align}">${injectNonce(slot.code_mobile)}</div>`,
    ].join('\n');
  }
  return `<div class="ad-slot ad-slot--${h(name)}" style="margin:${margin};text-align:${align}">${injectNonce(slot.code_desktop||slot.code_mobile||'')}</div>`;
}

function renderBannerMidGrid(index, cfg, request=null, nonce='') {
  if (!cfg.ADS_ENABLED) return '';
  const slot=getAdsSlots(cfg)['mid_grid'];
  if (!slot||!slot.enabled) return '';
  // renderGrid telah memanggil ini hanya kala i%6===5 — ritual keenam
  return renderBanner('mid_grid', cfg, request, nonce);
}

function bannerStyles() {
  return `<style>
/* AD SLOT BASE */
.ad-slot{overflow:hidden;width:100%;max-width:100%;box-sizing:border-box;min-height:1px;display:block}
.ad-label{font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--text-muted,#666);margin-bottom:4px;line-height:1}

/* DESKTOP/MOBILE AD VISIBILITY — single source of truth (overrides theme CSS below) */
.ads-desktop{display:block!important}.ads-mobile{display:none!important}
@media(max-width:767px){
  .ads-desktop{display:none!important}
  .ads-mobile{display:block!important}
}

/* PREVENT LAYOUT SHIFT — reserved height per slot */
.ad-slot--header_top{min-height:90px;contain:layout style}
.ad-slot--before_grid,.ad-slot--after_grid{min-height:100px;contain:layout style}
.ad-slot--mid_grid{min-height:100px;contain:layout style}
.ad-slot--sidebar_top,.ad-slot--sidebar_mid{min-height:250px;contain:layout style}
.ad-slot--footer_top{min-height:90px;contain:layout style}

/* MID-GRID FULL WIDTH SPAN */
.content-grid>li>.ad-slot--mid_grid,.content-grid>.ad-slot--mid_grid,.v-grid>.ad-slot--mid_grid{grid-column:1/-1;width:100%}

/* MOBILE — fix portrait thumbnail banner agar tidak overflow/ngacak */
@media(max-width:767px){
  .ad-slot ins{
    display:block!important;
    width:100%!important;
    max-width:100%!important;
    height:auto!important;
  }
  .ad-slot iframe{
    max-width:100%!important;
    width:100%!important;
    height:auto!important;
  }
  .ad-slot img{
    max-width:100%!important;
    width:auto!important;
    height:auto!important;
    display:block;
    margin:0 auto;
  }
  /* Khusus banner portrait (2:3) — beri container proporsional */
  .ad-slot--before_grid,.ad-slot--mid_grid,.ad-slot--after_grid,.ad-slot--footer_top{
    text-align:center;
  }

}

/* DESKTOP */
@media(min-width:768px){
  .ad-slot ins,.ad-slot iframe,.ad-slot img{max-width:100%!important;width:auto!important}
}

/* POPUNDER — view, pencarian, tag */
.ad-slot--footer_popunder{
  position:relative;
  width:100%;
  min-height:50px;
  overflow:hidden;
  background:transparent;
  z-index:10;
}
</style>`;
}

function adsenseScript(cfg) {
  if (!cfg.ADS_ENABLED||!cfg.ADS_ADSENSE_CLIENT) return '';
  return `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${h(cfg.ADS_ADSENSE_CLIENT)}" crossorigin="anonymous"></script>\n`;
}

// ═══════════════════════════════════════════════════════════════════════
// SESI 16 — PENCIPTA TAMPILAN UNIK — Sulam Warna dan Bentuk Khas Domain
// ═══════════════════════════════════════════════════════════════════════

function getUniqueTheme(cfg, dna) {
  // Pastikan dna tersedia — kembali ke DNA Situs bila tidak diserahkan
  if (!dna) dna = SiteDNA.get(cfg.WARUNG_DOMAIN);
  const a    = cfg.THEME_ACCENT    || '#ffaa00';
  const a2   = cfg.THEME_ACCENT2   || '#ffc233';
  const hexToRgb = (hex) => {
    const r=parseInt((hex||'#ffaa00').slice(1,3),16), g=parseInt((hex||'#ffaa00').slice(3,5),16), b=parseInt((hex||'#ffaa00').slice(5,7),16);
    return isNaN(r)?'255,170,0':`${r},${g},${b}`;
  };
  const dim  = `rgba(${hexToRgb(a)},.15)`;
  const bg   = cfg.THEME_BG    || '#0a0a0a';
  const bg2  = cfg.THEME_BG2   || '#121212';
  const bg3  = cfg.THEME_BG3   || '#1a1a1a';
  const bg4  = '#1f1f1f';
  const fg   = cfg.THEME_FG    || '#ffffff';
  const fgDim= cfg.THEME_FG_DIM|| '#888888';
  const brd  = cfg.THEME_BORDER|| '#252525';
  const brd2 = '#333';
  const font = cfg.THEME_FONT  || '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  const navBg= cfg.THEME_NAV_STYLE==='gold' ? a : bg2;
  const navFg= cfg.THEME_NAV_STYLE==='gold' ? '#000' : fg;
  const cacheKey = cfg.WARUNG_DOMAIN+':theme:'+a+bg+(cfg.THEME_CARD_RATIO||'16/9')+(cfg.THEME_GRID_COLS_MOBILE||2);
  if (_themeCache.has(cacheKey)) return _themeCache.get(cacheKey);
  const result = `<style id="premium-tube-theme">
:root{
  --accent:${a};--accent2:${a2};--accent-dim:${dim};
  --bg:${bg};--bg2:${bg2};--bg3:${bg3};--bg4:${bg4};
  --border:${brd};--border2:${brd2};
  --text:${fg};--text-dim:${fgDim};
  --nav-bg:${navBg};--nav-fg:${navFg};
  --gold:${a};--gold-dim:${dim};
  --font-primary:${font};
  --card-ratio:${cfg.THEME_CARD_RATIO || '16/9'};
  --grid-cols-mobile:${cfg.THEME_GRID_COLS_MOBILE || 2};
}
* { margin:0; padding:0; box-sizing:border-box; }
html { scroll-behavior:smooth; }
body {
  font-family:var(--font-primary);
  background:var(--bg);
  color:var(--text);
  padding-bottom:70px;
}
/* HEADER */
.${dna.cls.header} {
  background:var(--bg2);
  position:sticky; top:0; z-index:100;
  border-bottom:1px solid #2a2a2a;
  padding:8px 0;
}
.${dna.cls.headerCont} {
  padding:0 12px;
  display:flex; align-items:center;
  justify-content:space-between; gap:8px;
}
.${dna.cls.logo} {
  font-size:20px; font-weight:900;
  color:var(--gold); text-decoration:none;
  white-space:nowrap; letter-spacing:-0.5px;
}
.${dna.cls.logo} span { color:var(--text); }
.${dna.cls.searchBar} {
  flex:1; background:var(--bg4); border-radius:30px;
  padding:7px 14px; display:flex; align-items:center;
  border:1px solid var(--border2); transition:border-color .2s;
}
.${dna.cls.searchBar}:focus-within { border-color:var(--gold); }
.${dna.cls.searchBar} input {
  background:none; border:none; color:var(--text);
  width:100%; font-size:13px; outline:none;
}
.${dna.cls.searchBar} input::placeholder { color:#555; }
.${dna.cls.searchBar} button {
  background:none; border:none;
  color:var(--gold); font-size:14px; cursor:pointer;
}
.${dna.cls.menuBtn} {
  background:none; border:none; color:var(--gold);
  font-size:22px; width:36px; height:36px;
  display:flex; align-items:center; justify-content:center;
  cursor:pointer; flex-shrink:0;
}
/* Icon size reservation — prevents CLS before FA font loads */
.fas,.fab,.far,.fa { display:inline-block; min-width:.875em; }
/* CATEGORIES */
.${dna.cls.categories} {
  background:#0f0f0f; border-bottom:1px solid #222;
  padding:10px 0; overflow-x:auto;
  -webkit-overflow-scrolling:touch; scrollbar-width:none; white-space:nowrap;
}
.${dna.cls.categories}::-webkit-scrollbar { display:none; }
.${dna.cls.catInner} { padding:0 12px; display:inline-flex; gap:18px; }
.${dna.cls.cat} {
  color:var(--text-dim); text-decoration:none;
  font-size:13px; font-weight:700; padding:4px 0;
  border-bottom:2px solid transparent;
  transition:color .2s, border-color .2s; cursor:pointer;
}
.${dna.cls.cat}.${dna.cls.catActive} { color:var(--gold); border-bottom-color:var(--gold); }
/* MAIN */
.main { padding:12px; }
.${dna.cls.secHeader} {
  display:flex; justify-content:space-between; align-items:center;
  margin-bottom:12px; margin-top:4px;
}
.${dna.cls.secTitle} { font-size:15px; font-weight:800; color:var(--gold); }
.${dna.cls.secTitle} i { margin-right:6px; }
.${dna.cls.secCount} {
  background:var(--bg3); color:#aaa;
  padding:4px 10px; border-radius:20px;
  font-size:11px; border:1px solid var(--border2);
}
/* TRENDING */
.${dna.cls.trendingStrip} {
  overflow-x:auto; -webkit-overflow-scrolling:touch;
  scrollbar-width:none; margin-bottom:18px;
}
.${dna.cls.trendingStrip}::-webkit-scrollbar { display:none; }
.${dna.cls.trendingInner} { display:inline-flex; gap:10px; padding:2px 0; }
.${dna.cls.tCard} {
  display:block; text-decoration:none; color:inherit;
  width:140px; background:var(--bg2);
  border-radius:8px; border:1px solid var(--border);
  overflow:hidden; flex-shrink:0; cursor:pointer;
  transition:transform .2s;
}
.${dna.cls.tCard}:hover { transform:translateY(-2px); }
.${dna.cls.tImg} {
  position:relative; aspect-ratio:16/9;aspect-ratio:var(--card-ratio,16/9);
  background:var(--bg4); overflow:hidden;
}
.${dna.cls.tImg} img { width:100%; height:100%; object-fit:cover; display:block; }
.${dna.cls.tNum} {
  position:absolute; top:4px; left:4px;
  background:var(--gold); color:#000;
  width:18px; height:18px; border-radius:4px;
  display:flex; align-items:center; justify-content:center;
  font-size:10px; font-weight:900; z-index:2;
}
.${dna.cls.tDur} {
  position:absolute; bottom:4px; right:4px;
  background:rgba(0,0,0,.85); color:#fff;
  padding:2px 5px; border-radius:3px; font-size:8px; font-weight:600;
}
.${dna.cls.tInfo} { padding:7px; }
.${dna.cls.tTitle} {
  font-size:11px; font-weight:600; color:var(--text);
  display:-webkit-box; -webkit-line-clamp:2;
  -webkit-box-orient:vertical; overflow:hidden; height:27px; line-height:1.25;
}
/* VIDEO GRID */
.${dna.cls.vGrid} {
  display:grid; gap:8px;
  grid-template-columns:repeat(var(--grid-cols-mobile),1fr);
  contain:layout style;
}
@media(min-width:480px){ .v-grid{grid-template-columns:repeat(3,1fr)} }
@media(min-width:768px){ .v-grid{grid-template-columns:repeat(4,1fr)} }
.${dna.cls.vCard} {
  display:block; text-decoration:none; color:inherit;
  background:var(--bg2); border-radius:8px; overflow:hidden;
  border:1px solid var(--border); cursor:pointer;
  transition:transform .15s, border-color .2s;
}
.${dna.cls.vCard}:hover { border-color:#3a3a3a; transform:translateY(-2px); }
.${dna.cls.vImg} {
  position:relative; aspect-ratio:16/9;aspect-ratio:var(--card-ratio,16/9);
  background:var(--bg4); overflow:hidden;
}
.${dna.cls.vImg} img { width:100%; height:100%; object-fit:cover; display:block; }
.${dna.cls.badgeHot} {
  position:absolute; top:4px; left:4px;
  background:var(--gold); color:#000;
  padding:2px 6px; border-radius:4px; font-size:9px; font-weight:900;
}
.${dna.cls.badgeQual} {
  position:absolute; top:4px; right:4px;
  background:rgba(0,0,0,.8); color:var(--gold);
  padding:2px 6px; border-radius:4px; font-size:8px; font-weight:800;
  border:1px solid var(--gold);
}
.${dna.cls.badgeDur} {
  position:absolute; bottom:4px; right:4px;
  background:rgba(0,0,0,.9); color:#fff;
  padding:2px 6px; border-radius:4px; font-size:8px; font-weight:600;
}
.${dna.cls.vInfo} { padding:8px 7px 9px; }
.${dna.cls.vTitle} {
  font-size:12px; font-weight:600; color:var(--text);
  display:-webkit-box; -webkit-line-clamp:2;
  -webkit-box-orient:vertical; overflow:hidden; height:30px;
  line-height:1.28; margin-bottom:5px;
}
.${dna.cls.vMeta} { display:flex; gap:8px; color:var(--text-dim); font-size:9px; }
.${dna.cls.vMeta} i { color:var(--gold); margin-right:2px; font-size:8px; }
/* SKELETON */
@keyframes shimmer {
  0%   { background-position:-200% center; }
  100% { background-position:200% center; }
}
.${dna.cls.skeletonCard} .${dna.cls.vImg} {
  background:linear-gradient(90deg,#1a1a1a 25%,#2a2a2a 50%,#1a1a1a 75%);
  background-size:200% auto;
  animation:shimmer 1.4s ease-in-out infinite;
}
.${dna.cls.skeletonLine} {
  height:10px; border-radius:4px; margin-bottom:5px;
  background:linear-gradient(90deg,#1a1a1a 25%,#2a2a2a 50%,#1a1a1a 75%);
  background-size:200% auto;
  animation:shimmer 1.4s ease-in-out infinite;
}
.${dna.cls.skeletonLine}.short { width:60%; }
/* PROMO */
.${dna.cls.promoBar} {
  background:linear-gradient(135deg,#1d1200,#1a1a1a);
  border:1px solid #3a2a00; border-radius:10px;
  padding:12px; margin:16px 0;
  text-align:center; font-size:12px; font-weight:700;
  color:var(--gold);
  display:flex; align-items:center; justify-content:center; gap:8px;
  cursor:pointer;
}
.${dna.cls.promoBar} i { font-size:15px; }
/* TAGS */
.${dna.cls.tags} { display:flex; flex-wrap:wrap; gap:6px; margin:12px 0; }
.${dna.cls.tag} {
  background:var(--bg3); border:1px solid var(--border2);
  color:#aaa; padding:5px 11px; border-radius:20px;
  font-size:10px; font-weight:700; cursor:pointer; transition:all .15s;
}
.${dna.cls.tag}.active { background:var(--gold-dim); border-color:var(--gold); color:var(--gold); }
/* LOAD MORE */
.${dna.cls.loadMore} {
  background:var(--bg3); border:1px solid var(--border2);
  color:var(--gold); padding:13px; border-radius:8px;
  text-align:center; margin:16px 0;
  font-weight:700; font-size:13px; cursor:pointer;
  transition:background .2s;
}
.${dna.cls.loadMore}:hover { background:#222; }
/* PAGINATION */
.${dna.cls.pagination} {
  display:none; justify-content:center;
  gap:5px; margin:16px 0; flex-wrap:wrap;
}
.${dna.cls.pg} {
  background:var(--bg3); border:1px solid var(--border2); color:#aaa;
  width:36px; height:36px; display:flex; align-items:center; justify-content:center;
  border-radius:8px; font-size:12px; font-weight:700; cursor:pointer; transition:all .15s;
}
.${dna.cls.pg}:hover { border-color:var(--gold); color:var(--gold); }
.${dna.cls.pg}.active { background:var(--gold); color:#000; border-color:var(--gold); }
.${dna.cls.pg}.wide { width:auto; padding:0 14px; }
/* BOTTOM NAV */
.${dna.cls.bottomNav} {
  position:fixed; bottom:0; left:0; right:0;
  background:rgba(18,18,18,.97);
  backdrop-filter:blur(12px);
  border-top:1px solid #2a2a2a;
  display:flex; justify-content:space-around;
  padding:8px 0 12px; z-index:100;
}
.${dna.cls.bnItem} {
  color:#555; text-decoration:none; font-size:10px;
  display:flex; flex-direction:column; align-items:center; gap:3px;
  flex:1; cursor:pointer; transition:color .15s;
}
.${dna.cls.bnItem} i { font-size:19px; }
.${dna.cls.bnItem} span { font-weight:700; }
.${dna.cls.bnItem}.active { color:var(--gold); }
.${dna.cls.bnIconWrap} { position:relative; line-height:1; }
.${dna.cls.bnDot} {
  width:7px; height:7px; border-radius:50%;
  background:var(--gold); position:absolute; top:-1px; right:-1px;
}
/* MODAL */
.${dna.cls.modalOverlay} {
  display:none; position:fixed; inset:0;
  background:rgba(0,0,0,.96); z-index:200; overflow-y:auto;
}
.${dna.cls.modalOverlay}.show { display:block; }
.${dna.cls.modalInner} { padding:20px; }
.${dna.cls.modalHead} {
  display:flex; justify-content:space-between; align-items:center;
  margin-bottom:28px;
}
.${dna.cls.modalClose} {
  background:none; border:none; color:var(--gold);
  font-size:24px; cursor:pointer;
}
.${dna.cls.modalNav} { list-style:none; }
.${dna.cls.modalNav} li { margin-bottom:22px; }
.${dna.cls.modalNav} a {
  color:var(--text); text-decoration:none;
  font-size:17px; font-weight:700;
  display:flex; align-items:center; gap:16px;
}
.${dna.cls.modalNav} i { color:var(--gold); width:24px; }
/* FOOTER */
.${dna.cls.footer} {
  background:var(--bg); margin-top:20px;
  padding:24px 15px 12px; border-top:1px solid #1e1e1e;
}
.${dna.cls.footerGrid} {
  display:grid; grid-template-columns:repeat(2,1fr);
  gap:16px; margin-bottom:18px;
}
.${dna.cls.footerCol} h4 {
  color:var(--gold); font-size:11px; font-weight:900;
  text-transform:uppercase; letter-spacing:.5px; margin-bottom:10px;
}
.${dna.cls.footerCol} ul { list-style:none; }
.${dna.cls.footerCol} li { margin-bottom:7px; }
.${dna.cls.footerCol} a { color:#666; text-decoration:none; font-size:12px; }
.${dna.cls.footerCopy} {
  text-align:center; color:#333; font-size:10px;
  padding-top:14px; border-top:1px solid #1a1a1a;
}
/* ADS — dikelola sepenuhnya oleh bannerStyles() */
/* MISC */
.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
.${dna.cls.container}{max-width:1280px;margin:0 auto;padding:0 12px;width:100%}
.${dna.cls.contentArea}{padding:12px 12px 14px;width:100%}
.${dna.cls.sectionHeader}{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;padding-bottom:10px;border-bottom:1px solid var(--border)}
.${dna.cls.sectionTitle}{font-size:1rem;font-weight:800;color:var(--gold);display:flex;align-items:center;gap:7px}
.${dna.cls.sectionCount}{background:var(--bg3);color:var(--text-dim);padding:3px 10px;border-radius:99px;font-size:.68rem;border:1px solid var(--border2)}
.${dna.cls.breadcrumb}{font-size:.78rem;margin-bottom:10px;color:var(--text-dim)}
.${dna.cls.breadcrumb} ol{list-style:none;padding:0;margin:0;display:flex;flex-wrap:wrap;align-items:center;gap:4px}
.${dna.cls.breadcrumb} li{display:inline-flex;align-items:center;gap:4px}
.${dna.cls.breadcrumb} a{color:var(--text-dim);text-decoration:none}
.${dna.cls.breadcrumb} a:hover{color:var(--gold)}
.${dna.cls.breadcrumb} .${dna.cls.bcSep}{font-size:.6rem;color:#444;margin:0 2px}
.${dna.cls.pageTitle}{font-size:1.2rem;font-weight:800;margin-bottom:8px}
.${dna.cls.pageDesc}{font-size:.82rem;color:var(--text-dim);margin-bottom:12px;line-height:1.6}
.${dna.cls.noResults}{text-align:center;padding:40px 20px;color:var(--text-dim)}
.${dna.cls.tagCloud}{display:flex;flex-wrap:wrap;gap:6px;margin:12px 0}
/* CONTENT GRID (legacy alias for v-grid) */
.${dna.cls.contentGrid}{display:grid;grid-template-columns:repeat(var(--grid-cols-mobile),1fr);gap:8px;list-style:none;padding:0}
@media(min-width:480px){.${dna.cls.contentGrid}{grid-template-columns:repeat(3,1fr)}}
@media(min-width:768px){.${dna.cls.contentGrid}{grid-template-columns:repeat(4,1fr)}}
/* VIEW PAGE */
.view-layout{padding:12px;display:flex;flex-direction:column;gap:16px}
@media(min-width:900px){.view-layout{flex-direction:row;align-items:flex-start}.view-content{flex:1 1 0;min-width:0}.view-sidebar{width:320px;flex-shrink:0}}
.player-wrapper{border-radius:8px;overflow:hidden;margin-bottom:14px;background:#000;aspect-ratio:16/9;aspect-ratio:var(--card-ratio,16/9)}
.player-wrapper iframe,.player-wrapper video{width:100%;height:100%;border:none;display:block}
.content-title{font-size:1rem;font-weight:800;margin-bottom:8px}
.content-meta{display:flex;flex-wrap:wrap;gap:8px 10px;color:var(--text-dim);font-size:.75rem;margin-bottom:10px}
.content-meta i{color:var(--gold)}
/* CONTENT TAGS */
.content-tags{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0}
/* ACTION BUTTONS */
.action-buttons{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
.btn{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:8px;font-size:.78rem;font-weight:700;cursor:pointer;border:none;text-decoration:none;transition:all .2s}
.btn-outline{background:transparent;border:1px solid var(--border2);color:var(--text-dim)}
.btn-outline:hover{border-color:var(--gold);color:var(--gold);background:rgba(255,170,0,.07)}
/* WIDGET TITLE (sidebar heading) */
.widget-title{font-size:.9rem;font-weight:800;color:var(--gold);display:flex;align-items:center;gap:7px;margin:0 0 12px;padding-bottom:10px;border-bottom:1px solid var(--border)}
/* RELATED LIST */
.related-list{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:2px}
.related-list li{border-bottom:1px solid var(--border)}
.related-list li:last-child{border-bottom:none}
.related-item{display:flex;gap:10px;align-items:flex-start;padding:8px 0;text-decoration:none;color:inherit;transition:background .15s;border-radius:6px}
.related-item:hover{background:var(--bg3);padding-left:6px}
.related-item img{width:90px;height:54px;object-fit:cover;border-radius:5px;flex-shrink:0;background:var(--bg3)}
.related-info{flex:1;min-width:0}
.related-title{font-size:.78rem;font-weight:700;color:var(--text);line-height:1.4;margin:0 0 4px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.related-meta{display:flex;gap:8px;flex-wrap:wrap;color:var(--text-dim);font-size:.7rem}
.badge-small{background:var(--bg3);border:1px solid var(--border2);color:var(--text-dim);padding:1px 6px;border-radius:4px;font-size:.65rem;font-weight:700;display:inline-flex;align-items:center;gap:3px}
.content-desc{margin:10px 0;font-size:.82rem;line-height:1.6;color:var(--text-dim)}
.full-desc.hidden{display:none}
.read-more{font-size:.76rem;color:var(--gold);margin-top:4px;text-decoration:underline;cursor:pointer;font-weight:700}
.seo-article{font-size:.78rem;color:var(--text-dim);line-height:1.7}
.seo-article p{margin:0 0 8px}
.seo-article strong{color:var(--text);font-weight:600}
/* DOWNLOAD PAGE */
.download-wrap{max-width:680px;margin:24px auto;padding:0 12px}
.download-hero{background:var(--bg2);border:1px solid var(--border2);border-radius:12px;overflow:hidden;margin-bottom:18px}
.download-thumb{width:100%;aspect-ratio:16/9;aspect-ratio:var(--card-ratio,16/9);object-fit:cover;display:block}
.download-info{padding:14px 16px}
.download-title{font-size:1rem;font-weight:800;color:var(--text);margin:0 0 6px}
.download-meta{font-size:.76rem;color:var(--text-dim);display:flex;gap:10px;flex-wrap:wrap}
.download-section{margin-bottom:18px}
.download-section-title{font-size:.78rem;font-weight:800;color:var(--text-dim);text-transform:uppercase;letter-spacing:.05em;margin-bottom:10px}
.download-options{display:flex;flex-direction:column;gap:8px}
.download-btn{display:flex;align-items:center;justify-content:space-between;background:var(--bg2);border:1px solid var(--border2);border-radius:10px;padding:12px 16px;text-decoration:none;color:var(--text);transition:border-color .2s,background .2s}
.download-btn:hover{border-color:var(--gold);background:var(--bg3)}
.download-btn-left{display:flex;align-items:center;gap:10px}
.download-btn-icon{width:38px;height:38px;background:var(--gold);border-radius:8px;display:flex;align-items:center;justify-content:center;color:#000;font-size:.95rem;flex-shrink:0}
.download-btn-label{font-size:.85rem;font-weight:700}
.download-btn-sub{font-size:.72rem;color:var(--text-dim);margin-top:2px}
.download-btn-arrow{color:var(--gold);font-size:.9rem}
.download-photo-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:8px}
.download-photo-item{position:relative;border-radius:8px;overflow:hidden;background:var(--bg3)}
.download-photo-item img{width:100%;aspect-ratio:1;object-fit:cover;display:block}
.download-photo-overlay{position:absolute;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .2s}
.download-photo-item:hover .download-photo-overlay{opacity:1}
.download-photo-overlay a{color:#fff;font-size:1.3rem;text-decoration:none}
.download-all-btn{display:flex;align-items:center;justify-content:center;gap:8px;background:var(--gold);color:#000;font-weight:800;font-size:.9rem;padding:13px 20px;border-radius:10px;text-decoration:none;margin-bottom:14px;transition:opacity .2s}
.download-all-btn:hover{opacity:.85}
.download-loading{text-align:center;padding:30px;color:var(--text-dim);font-size:.85rem}
.download-error{text-align:center;padding:20px;color:#e57373;font-size:.85rem}
.btn-download{background:var(--gold)!important;color:#000!important;border-color:var(--gold)!important;font-weight:800}
/* STATIC PAGES */
.static-content h2{font-size:1.1rem;font-weight:800;margin:20px 0 10px;color:var(--text)}
.static-content p,.static-content li{margin-bottom:9px;line-height:1.75;color:var(--text-dim)}
.static-content ul,.static-content ol{padding-left:18px;margin-bottom:10px}
.static-content address{font-style:normal}
.static-content a{color:var(--gold);text-decoration:underline}
/* ERROR PAGE */
.error-page{text-align:center;padding:60px 20px}
.error-code{font-size:5rem;font-weight:900;color:var(--gold);line-height:1}
.error-message{font-size:1.1rem;font-weight:700;margin:16px 0 8px}
.error-desc{color:var(--text-dim);margin-bottom:24px}
.btn-home{display:inline-flex;align-items:center;gap:8px;background:var(--gold);color:#000;padding:12px 24px;border-radius:8px;font-weight:800;text-decoration:none}
/* SEARCH PAGE */
.search-header{padding:12px 0 8px}
.search-title{font-size:.9rem;color:var(--text-dim);margin-bottom:4px}
.search-title strong{color:var(--text)}
/* PAGINATION */
.pagination{display:flex;align-items:center;justify-content:center;gap:6px;margin:16px 0;flex-wrap:wrap}
.page-btn{background:var(--bg3);border:1px solid var(--border2);color:var(--gold);padding:8px 16px;border-radius:8px;font-size:.8rem;font-weight:700;text-decoration:none;transition:background .2s}
.page-btn:hover{background:#222}
.page-numbers{display:flex;gap:4px;flex-wrap:wrap}
.page-number{background:var(--bg3);border:1px solid var(--border2);color:#aaa;width:36px;height:36px;display:flex;align-items:center;justify-content:center;border-radius:8px;font-size:.78rem;font-weight:700;text-decoration:none;transition:all .15s}
.page-number:hover{border-color:var(--gold);color:var(--gold)}
.page-number.active{background:var(--gold);color:#000;border-color:var(--gold)}
.page-ellipsis{color:var(--text-dim);padding:0 4px;line-height:36px}
/* ALBUM */
.album-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:7px}
.album-thumb-btn{width:100%;cursor:pointer;background:none;border:none;padding:0;border-radius:6px;overflow:hidden;display:block}
.album-thumb{width:100%;height:auto;border-radius:6px;transition:opacity .2s,transform .32s;display:block}
.album-thumb-btn:hover .album-thumb{opacity:.85;transform:scale(1.04)}
/* LIGHTBOX */
.lightbox{position:fixed;inset:0;z-index:500;background:rgba(0,0,0,.95);display:flex;align-items:center;justify-content:center;backdrop-filter:blur(16px)}
.lightbox.hidden{display:none}
.lightbox-content{position:relative;max-width:95vw;max-height:95vh;display:flex;flex-direction:column;align-items:center}
.lightbox-image{max-width:100%;max-height:85vh;object-fit:contain;border-radius:6px}
.lightbox-close{position:absolute;top:-48px;right:0;color:#fff;font-size:1rem;background:rgba(255,255,255,.1);width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center}
.lightbox-nav{display:flex;justify-content:space-between;width:100%;margin-top:12px}
.lightbox-prev,.lightbox-next{color:#fff;background:rgba(255,255,255,.1);width:42px;height:42px;border-radius:50%;display:flex;align-items:center;justify-content:center}
.lightbox-caption{color:rgba(255,255,255,.4);font-size:.76rem;text-align:center;margin-top:9px}
/* TOAST */
.toast{position:fixed;bottom:70px;left:50%;transform:translateX(-50%);background:var(--bg3);border:1px solid var(--gold);color:var(--gold);padding:9px 20px;border-radius:4px;font-size:.78rem;font-weight:700;z-index:9999;pointer-events:none}
#backToTop{position:fixed;bottom:68px;right:10px;z-index:180;width:36px;height:36px;border-radius:8px;background:var(--gold);color:#000;display:flex;align-items:center;justify-content:center;transition:opacity .3s,visibility .3s;font-size:.72rem;opacity:0;visibility:hidden}
.connection-status{position:fixed;bottom:68px;left:50%;transform:translateX(-50%);background:#ef4444;color:#fff;padding:7px 18px;border-radius:4px;font-size:.76rem;display:flex;align-items:center;gap:7px;z-index:400}
/* FILTER TABS */
.filter-tabs{display:flex;gap:6px;flex-wrap:wrap;padding:8px 0}
.filter-tab{padding:6px 14px;border-radius:99px;font-size:.72rem;font-weight:800;flex-shrink:0;display:inline-flex;align-items:center;gap:5px;color:var(--text-dim);border:1px solid var(--border2);background:var(--bg3);transition:all .2s;text-decoration:none}
.filter-tab:hover{background:var(--bg4);color:var(--text)}
.filter-tab.active{background:var(--gold);color:#000;border-color:var(--gold)}
/* CATEGORY STRIP (homepage filter bar) */
.category-strip{background:#0f0f0f;border-bottom:1px solid #222;padding:10px 0;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;white-space:nowrap}
.category-strip::-webkit-scrollbar{display:none}
.category-strip-inner{padding:0 12px;display:inline-flex;gap:8px}
.strip-item{color:var(--text-dim);text-decoration:none;font-size:12px;font-weight:700;padding:5px 12px;border-radius:99px;border:1px solid var(--border2);background:var(--bg3);transition:all .2s;white-space:nowrap;display:inline-flex;align-items:center;gap:5px}
.strip-item:hover{background:var(--bg4);color:var(--text)}
.strip-item.active{background:var(--gold);color:#000;border-color:var(--gold)}
</style>`;
  _themeCache.set(cacheKey, result);
  return result;
}

// ═══════════════════════════════════════════════════════════════════════
// SESI 17 — POTONGAN HTML SUCI — Serpihan Bangunan Halaman
// ═══════════════════════════════════════════════════════════════════════

function renderHead({ title, desc, canonical, ogImage, ogType, keywords, noindex, contentId=0, contentType='meta', extraHead='', cfg, seo, request, prevUrl=null, nextUrl=null, publishedTime='', modifiedTime='', isPagePaginated=false, deliveryMode=null, extraNonces=[] }) {
  const nonce = generateNonce();
  const meta  = seo.renderMeta({ title, desc, canonical, ogImage, ogType, keywords, noindex, contentId, contentType, publishedTime, modifiedTime, isPagePaginated, nonce });
  const lcpPreload = ogImage ? `<link rel="preload" as="image" href="${h(ogImage)}" fetchpriority="high">` : '';
  const prevLink   = prevUrl ? `<link rel="prev" href="${h(prevUrl)}">` : '';
  const nextLink   = nextUrl ? `<link rel="next" href="${h(nextUrl)}">` : '';
  const themeColor = `hsl(${hashSeed(cfg.WARUNG_DOMAIN)%360},50%,45%)`;

  const webpageSchema = JSON.stringify({
    '@context':'https://schema.org','@type':'WebPage',
    'name':title,'url':canonical,'inLanguage':cfg.SEO_LANG||'id',
    'isPartOf':{'@type':'WebSite','name':cfg.WARUNG_NAME,'url':'https://'+cfg.WARUNG_DOMAIN},
  },null,0);

  // CSS keramat kini ditangani oleh getUniqueTheme(cfg) yang dipanggil secara terpisah
  const dna = SiteDNA.get(cfg.WARUNG_DOMAIN);
  const criticalCss = getUniqueTheme(cfg, dna);

  const dapurDomain = (cfg._env?.DAPUR_BASE_URL||'https://dapur.dukunseo.com').replace(/https?:\/\//,'').split('/')[0];
  const csp = [
    `default-src 'self' https://${cfg.WARUNG_DOMAIN}`,
    `script-src 'self' 'nonce-${nonce}'${extraNonces.map(n=>` 'nonce-${n}'`).join('')} https://*.magsrv.com https://a.magsrv.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://cdnjs.cloudflare.com https://fonts.googleapis.com`,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com`,
    `font-src 'self' data: https://fonts.gstatic.com https://cdnjs.cloudflare.com`,
    `img-src 'self' data: blob: https:`,
    `media-src 'self' blob: https:`,
    `frame-src 'self' https://*.magsrv.com https://${dapurDomain} https://${cfg.WARUNG_DOMAIN} https://googleads.g.doubleclick.net`,
    `connect-src 'self' https://${cfg.WARUNG_DOMAIN} https://${dapurDomain} https://*.magsrv.com https://pagead2.googlesyndication.com`,
    `object-src 'none'`,`base-uri 'self'`,`form-action 'self'`,`upgrade-insecure-requests`,
  ].join('; ');

  return `<!DOCTYPE html>
<html lang="${h(cfg.SEO_LANG)}" dir="ltr">
<head>
<meta charset="UTF-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=5">
<meta name="theme-color" content="${h(themeColor)}">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
${meta}
${lcpPreload}${prevLink}${nextLink}
<link rel="dns-prefetch" href="https://fonts.googleapis.com">
<link rel="dns-prefetch" href="https://cdnjs.cloudflare.com">
<link rel="dns-prefetch" href="https://a.magsrv.com">
<link rel="dns-prefetch" href="${h(cfg.DAPUR_BASE_URL||'https://dapur.dukunseo.com')}">
<link rel="preconnect" href="https://a.magsrv.com" crossorigin>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
${criticalCss}
${cfg.THEME_FONT && cfg.THEME_FONT!=='Inter' && !cfg.THEME_FONT.includes('system') ? `<link rel="preload" href="https://fonts.googleapis.com/css2?family=${encodeURIComponent(cfg.THEME_FONT)}:wght@400;600;700;800;900&display=swap" as="style" onload="this.onload=null;this.rel='stylesheet'"><noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=${encodeURIComponent(cfg.THEME_FONT)}:wght@400;600;700;800;900&display=swap"></noscript>` : ''}
<script nonce="${nonce}">(function(){var l=document.createElement('link');l.rel='stylesheet';l.href='https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css';document.head.appendChild(l);})();</script><noscript><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"></noscript>
<link rel="icon" href="${urlHelper('assets/favicon.ico',cfg)}" type="image/x-icon">
<link rel="apple-touch-icon" sizes="180x180" href="${urlHelper('assets/apple-touch-icon.png',cfg)}">
<link rel="manifest" href="${urlHelper('assets/site.webmanifest',cfg)}">
<meta http-equiv="Content-Security-Policy" content="${h(csp)}">
${adsenseScript(cfg)}${bannerStyles()}
<script type="application/ld+json" nonce="${nonce}">${webpageSchema}</script>
${extraHead}
</head>`;
}

function renderNavHeader({ cfg, currentPage='', q='', isHome=false }) {
  const nameParts = cfg.WARUNG_NAME.split(' ');
  const logo = h(nameParts[0]) + (nameParts[1] ? `<span>${h(nameParts.slice(1).join(' '))}</span>` : '');
  // REMPAH: label bilah dari DNA Situs domain — tiap domain berbeda mantranya
  const dna  = SiteDNA.get(cfg.WARUNG_DOMAIN);
  
  const C = dna.cls, I = dna.ids;
  return `<body>
<!-- MODAL MENU -->
<div class="${C.modalOverlay}" id="${I.modalMenu}">
  <div class="${C.modalInner}">
    <div class="${C.modalHead}">
      <a href="${homeUrl(cfg)}" class="${C.logo}">${logo}</a>
      <button class="${C.modalClose}" id="${I.closeModal}"><i class="fas fa-times"></i></button>
    </div>
    <ul class="${C.modalNav}">
      <li><a href="${homeUrl(cfg)}"><i class="fas fa-home"></i> Beranda Utama</a></li>
      <li><a href="${homeUrl(cfg)}?trending=1" rel="nofollow"><i class="fas fa-fire"></i> ${dna.labelTrending}</a></li>
      <li><a href="${homeUrl(cfg)}?sort=newest" rel="nofollow"><i class="fas fa-star"></i> ${dna.labelTerbaru}</a></li>
      <li><a href="${homeUrl(cfg)}?sort=longest" rel="nofollow"><i class="fas fa-clock"></i> ${dna.navLabels.terlama}</a></li>
      <li><a href="${categoryUrl('video', 1, cfg)}"><i class="fas fa-video"></i> Kategori Video</a></li>
      <li><a href="${categoryUrl('album', 1, cfg)}"><i class="fas fa-image"></i> Kategori Album</a></li>
      <li><a href="/${h(cfg.PATH_SEARCH)}"><i class="fas fa-search"></i> ${dna.verbCari} Konten</a></li>
      <li><a href="/${h(cfg.PATH_DMCA)}"><i class="fas fa-shield-alt"></i> Kebijakan DMCA</a></li>
      <li><a href="/${h(cfg.PATH_CONTACT)}"><i class="fas fa-envelope"></i> Hubungi Kami</a></li>
    </ul>
  </div>
</div>

<!-- HEADER -->
<header class="${C.header}">
  <div class="${C.headerCont}">
    <button class="${C.menuBtn}" id="${I.menuBtn}" aria-label="Menu"><i class="fas fa-bars"></i></button>
    <a href="${homeUrl(cfg)}" class="${C.logo}">${logo}</a>
    <div class="${C.searchBar}">
      <input type="text" placeholder="${h(dna.searchPlaceholder)}" id="${I.searchInput}" value="${h(q)}">
      <button type="button" id="${I.searchBtn}" aria-label="${h(dna.verbCari)}"><i class="fas fa-search"></i></button>
    </div>
  </div>
</header>

<!-- CATEGORIES STRIP -->
<nav class="${C.categories}">
  <div class="${C.catInner}" id="${I.catList}">
    <a class="${C.cat} ${!currentPage || currentPage==='home' || isHome ? 'active' : ''}" href="${homeUrl(cfg)}">${dna.navLabels.semua}</a>
    <a class="${C.cat} ${currentPage==='trending' ? 'active' : ''}" href="${homeUrl(cfg)}?trending=1" rel="nofollow">${dna.navLabels.trending}</a>
    <a class="${C.cat} ${currentPage==='latest' ? 'active' : ''}" href="${homeUrl(cfg)}?sort=newest" rel="nofollow">${dna.navLabels.terbaru}</a>
    <a class="${C.cat} ${currentPage==='popular' ? 'active' : ''}" href="${homeUrl(cfg)}?sort=popular" rel="nofollow">${dna.navLabels.popular}</a>
    <a class="${C.cat} ${currentPage==='longest' ? 'active' : ''}" href="${homeUrl(cfg)}?sort=longest" rel="nofollow">${dna.navLabels.terlama}</a>
    <a class="${C.cat}" href="${categoryUrl('video', 1, cfg)}">${dna.navLabels.video}</a>
    <a class="${C.cat}" href="${categoryUrl('album', 1, cfg)}">${dna.navLabels.album}</a>
    <a class="${C.cat}" href="/${h(cfg.PATH_TAG)}/indonesia"> Indonesia</a>
    <a class="${C.cat}" href="/${h(cfg.PATH_TAG)}/korea"> korea</a>
    <a class="${C.cat}" href="/${h(cfg.PATH_TAG)}/burma"> burma</a>
  </div>
</nav>`;
}

function renderFooter(cfg, request=null, nonce='') {
  const year = new Date().getFullYear();
  // REMPAH: tagline & hak milik dari DNA Situs domain
  const dna  = SiteDNA.get(cfg.WARUNG_DOMAIN);
  const C = dna.cls, I = dna.ids;

  // Label tautan kaki — berbeda per domain agar tidak kembar
  const aboutLabel   = ['About Us','Tentang','About','Info'][dna.sFooter % 4];
  const contactLabel = ['Contact','Kontak','Hubungi','Contact Us'][dna.sFooter % 4];
  const catLabel     = ['Kategori','Category','Browse','Jelajahi'][(dna.sFooter+1) % 4];
  const countryLabel = ['Negara','Countries','Region','Area'][(dna.sFooter+2) % 4];
  const followLabel  = ['Follow','Ikuti','Sosmed','Social'][(dna.sFooter+3) % 4];

  return `${renderBanner('footer_top', cfg, request, nonce)}
<!-- FOOTER -->
<footer class="${C.footer}">
  <div class="${C.footerGrid}">
    <div class="${C.footerCol}">
      <h4>${h(cfg.WARUNG_NAME)}</h4>
      <ul>
        <li><a href="/${h(cfg.PATH_ABOUT)}">${aboutLabel} ${h(cfg.WARUNG_NAME)}</a></li>
        <li><a href="/${h(cfg.PATH_CONTACT)}">${contactLabel} Admin</a></li>
        <li><a href="/${h(cfg.PATH_DMCA)}">Laporan DMCA</a></li>
        <li><a href="/${h(cfg.PATH_TERMS)}">Syarat Penggunaan</a></li>
      </ul>
    </div>
    <div class="${C.footerCol}">
      <h4>${catLabel}</h4>
      <ul>
        <li><a href="${categoryUrl('video', 1, cfg)}">Tonton Video</a></li>
        <li><a href="${categoryUrl('album', 1, cfg)}">Lihat Album Foto</a></li>
        <li><a href="/${h(cfg.PATH_SEARCH)}">Temukan Konten</a></li>
        <li><a href="/${h(cfg.PATH_TAG)}">Jelajahi Tag</a></li>
      </ul>
    </div>
    <div class="${C.footerCol}">
      <h4>${countryLabel}</h4>
      <ul>
        <li><a href="/${h(cfg.PATH_TAG)}/indonesia">Indonesia</a></li>
        <li><a href="/${h(cfg.PATH_TAG)}/korea">korea</a></li>
        <li><a href="/${h(cfg.PATH_TAG)}/burma">burma</a></li>
        <li><a href="/${h(cfg.PATH_TAG)}/china">china</a></li>
      </ul>
    </div>
    <div class="${C.footerCol}">
      <h4>${followLabel}</h4>
      <ul>
        <li><a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><i class="fab fa-twitter"></i> Twitter</a></li>
        <li><a href="https://t.me" target="_blank" rel="noopener noreferrer"><i class="fab fa-telegram"></i> Telegram</a></li>
        <li><a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><i class="fab fa-instagram"></i> Instagram</a></li>
      </ul>
    </div>
  </div>
  <p style="text-align:center;font-size:11px;color:#555;margin:8px 0 4px">${h(dna.footerTagline)}</p>

  <div class="${C.footerCopy}">${h(dna.copyrightFn(cfg.WARUNG_NAME, year))}</div>
</footer>

<!-- BOTTOM NAV -->
<nav class="${C.bottomNav}">
  <a class="${C.bnItem} active" href="${homeUrl(cfg)}" aria-label="Beranda">
    <div class="${C.bnIconWrap}"><i class="fas fa-home"></i></div>
    <span>Home</span>
  </a>
  <a class="${C.bnItem}" href="${homeUrl(cfg)}?trending=1" rel="nofollow">
    <div class="${C.bnIconWrap}"><i class="fas fa-fire"></i><span class="${C.bnDot}"></span></div>
    <span>Trending</span>
  </a>
  <a class="${C.bnItem}" href="${categoryUrl('video', 1, cfg)}">
    <div class="${C.bnIconWrap}"><i class="fas fa-video"></i></div>
    <span>Video</span>
  </a>
  <a class="${C.bnItem}" href="${categoryUrl('album', 1, cfg)}">
    <div class="${C.bnIconWrap}"><i class="fas fa-image"></i></div>
    <span>Album</span>
  </a>
  <a class="${C.bnItem}" href="/profile">
    <div class="${dna.cls.bnIconWrap}"><i class="fas fa-user"></i></div>
    <span>Profil</span>
  </a>
</nav>

<script nonce="${nonce}">
(function() {
  'use strict';
  // Peta kelas & ID disuntikkan dari peladen — unik per domain
  const _C = ${JSON.stringify(dna.cls)};
  const _I = ${JSON.stringify(dna.ids)};

  // Jendela gaib muncul tiba-tiba menu
  const menuBtn   = document.getElementById(_I.menuBtn);
  const modalMenu = document.getElementById(_I.modalMenu);
  const closeModal= document.getElementById(_I.closeModal);
  
  if (menuBtn && modalMenu) {
    menuBtn.addEventListener('click', () => {
      modalMenu.classList.add('show');
      document.body.style.overflow = 'hidden';
    });
  }
  
  if (closeModal && modalMenu) {
    closeModal.addEventListener('click', () => {
      modalMenu.classList.remove('show');
      document.body.style.overflow = '';
    });
  }
  
  if (modalMenu) {
    modalMenu.addEventListener('click', (e) => {
      if (e.target === modalMenu) {
        modalMenu.classList.remove('show');
        document.body.style.overflow = '';
      }
    });
    modalMenu.querySelectorAll('.' + _C.modalNav + ' a').forEach(link => {
      link.addEventListener('click', () => {
        modalMenu.classList.remove('show');
        document.body.style.overflow = '';
      });
    });
  }
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalMenu?.classList.contains('show')) {
      modalMenu.classList.remove('show');
      document.body.style.overflow = '';
    }
  });
  
  // Fungsi pencarian — menyelami kedalaman
  const doNavSearch = function() {
    const q = document.getElementById(_I.searchInput)?.value.trim();
    if (q) {
      window.location.href = '/${h(cfg.PATH_SEARCH)}?q=' + encodeURIComponent(q);
    }
  };
  
  document.getElementById(_I.searchBtn)?.addEventListener('click', doNavSearch);
  document.getElementById(_I.searchInput)?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') doNavSearch();
  });
  
  // Penanganan klik jalur golongan
  document.getElementById(_I.catList)?.addEventListener('click', (e) => {
    const cat = e.target.closest('.' + _C.cat);
    if (!cat) return;
    document.querySelectorAll('.' + _C.cat).forEach(c => c.classList.remove('active'));
    cat.classList.add('active');
  });
  
  // Tombol kembali ke puncak — naik ke langit
  const backToTop = document.createElement('button');
  backToTop.id = _I.backToTop;
  backToTop.innerHTML = '<i class="fas fa-chevron-up"></i>';
  backToTop.setAttribute('aria-label', 'Kembali ke atas');
  backToTop.style.cssText = 'position:fixed;bottom:80px;right:10px;z-index:99;width:36px;height:36px;border-radius:8px;background:var(--gold);color:#000;border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;opacity:0;visibility:hidden;transition:opacity .3s,visibility .3s;';
  
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top:0, behavior:'smooth' });
  });
  
  document.body.appendChild(backToTop);
  
  window.addEventListener('scroll', () => {
    const shouldShow = window.scrollY > 400;
    backToTop.style.opacity = shouldShow ? '1' : '0';
    backToTop.style.visibility = shouldShow ? 'visible' : 'hidden';
  }, { passive: true });
  
  // Tandai tautan bilah bawah yang aktif
  try {
    const path = window.location.pathname + window.location.search;
    document.querySelectorAll('.' + _C.bnItem).forEach(link => {
      const href = link.getAttribute('href');
      if (href && (path === href || (href !== '/' && path.startsWith(href.split('?')[0])))) {
        document.querySelectorAll('.' + _C.bnItem).forEach(i => i.classList.remove('active'));
        link.classList.add('active');
      }
    });
  } catch (e) {}
})();
<\/script>
<div id="connectionStatus" class="connection-status" role="status" aria-live="polite" style="display:none"><i class="fas fa-wifi" aria-hidden="true"></i><span>Koneksi terputus...</span></div>
</body></html>`;
}

// ═══════════════════════════════════════════════════════════════════════
// SESI 18 — KARTU, JARING, HALAMAN, DAN PERKAKAS — Perabot Tampilan
// ═══════════════════════════════════════════════════════════════════════

function renderCard(item, cfg, index=99) {
  const dna = SiteDNA.get(cfg.WARUNG_DOMAIN);
  const C = dna.cls;
  const durationBadge=item.type==='video'&&item.duration>0?`<span class="${C.badgeDur}">${formatDuration(item.duration)}</span>`:'';
  const thumbUrl=safeThumb(item,cfg);
  function _srcsetUrl(url, w) {
    try { const u = new URL(url); u.searchParams.set('w', String(w)); return u.toString(); }
    catch { return url + (url.includes('?') ? '&' : '?') + 'w=' + w; }
  }
  const srcset = `${h(_srcsetUrl(thumbUrl,320))} 320w, ${h(_srcsetUrl(thumbUrl,640))} 640w`;
  const isAboveFold=index<4;
  const imgAttrs=isAboveFold?`loading="eager" fetchpriority="high" decoding="async"`:`loading="lazy" decoding="async"`;
  const iUrl=item.type==='album'?albumUrl(item.id,item.title,cfg):contentUrl(item.id,item.title,cfg);
  const shortTitle=mbSubstr(item.title,0,60);
  
  // Lencana PANAS dan MUTU
  const hotBadge=index%6===0&&cfg.THEME_BADGE_HOT?`<span class="${C.badgeHot}">${h(cfg.THEME_BADGE_HOT)}</span>`:'';
  const qualBadge=item.quality?`<span class="${C.badgeQual}">${h(item.quality)}</span>`:`<span class="${C.badgeQual}">HD</span>`;
  
  // Data gaib tersembunyi
  const views = formatViews(item.views||0);
  const timeAgo = item.created_at ? formatDate(item.created_at) : '';
  
  return `<a class="${C.vCard}" href="${h(iUrl)}">
    <div class="${C.vImg}">
      <img src="${h(thumbUrl)}" srcset="${srcset}" sizes="(max-width:480px) 320px, 640px" alt="${h(shortTitle)}" ${imgAttrs} width="320" height="180" onerror="this.onerror=null;this.src='${h(cfg.DEFAULT_THUMB)}';this.width=320;this.height=180;">
      ${hotBadge}
      ${qualBadge}
      ${durationBadge}
    </div>
    <div class="${C.vInfo}">
      <div class="${C.vTitle}">${h(shortTitle)}</div>
      <div class="${C.vMeta}">
        <span><i class="fas fa-eye"></i>${views}</span>
        ${timeAgo?`<span><i class="fas fa-clock"></i>${timeAgo}</span>`:''}
      </div>
    </div>
  </a>`;
}

function renderGrid(items, cfg, midBannerEnabled=true, request=null, nonce='') {
  const dna = SiteDNA.get(cfg.WARUNG_DOMAIN);
  const insertAfter = getAdsSlots(cfg)['mid_grid']?.insert_after || 6;
  let html=`<div class="${dna.cls.vGrid}">`;
  items.forEach((item,i) => { 
    html+=renderCard(item,cfg,i); 
    if (midBannerEnabled && (i+1)%insertAfter===0) html+=renderBannerMidGrid(i,cfg,request,nonce);
  });
  html+='</div>';
  return html;
}

function renderPagination(pagination, buildUrl) {
  if (!pagination) return '';
  // Penyeragaman medan — mendukung: total_pages, last_page, pageCount
  const page  = Math.max(1, parseInt(pagination.current_page || pagination.page || 1, 10));
  const total = Math.max(1, parseInt(pagination.total_pages || pagination.last_page || pagination.pageCount || 1, 10));
  if (isNaN(page) || isNaN(total) || total <= 1) return '';
  // Cadangan has_prev/has_next bila API tidak mengembalikan medan ini
  const hasPrev = pagination.has_prev !== undefined ? pagination.has_prev : page > 1;
  const hasNext = pagination.has_next !== undefined ? pagination.has_next : page < total;
  let html=`<nav class="pagination" aria-label="Navigasi halaman">`;
  if (hasPrev) html+=`<a href="${buildUrl(page-1)}" class="page-btn" rel="prev"><i class="fas fa-chevron-left" aria-hidden="true"></i> Sebelumnya</a>`;
  html+='<div class="page-numbers">';
  const showPages=[];
  if (total<=7) { for (let p=1;p<=total;p++) showPages.push(p); }
  else {
    showPages.push(1); if (page>3) showPages.push('…');
    for (let p=Math.max(2,page-1);p<=Math.min(total-1,page+1);p++) showPages.push(p);
    if (page<total-2) showPages.push('…'); showPages.push(total);
  }
  showPages.forEach(p=>{
    if (p==='…') html+=`<span class="page-ellipsis">…</span>`;
    else html+=`<a href="${buildUrl(p)}" class="page-number${p===page?' active':''}" ${p===page?'aria-current="page"':`aria-label="Halaman ${p}"`}>${p}</a>`;
  });
  html+='</div>';
  if (hasNext) html+=`<a href="${buildUrl(page+1)}" class="page-btn" rel="next">Berikutnya <i class="fas fa-chevron-right" aria-hidden="true"></i></a>`;
  html+='</nav>';
  return html;
}


function renderTrendingMobile(trending, cfg) {
  if (!trending?.length) return '';
  const dna = SiteDNA.get(cfg.WARUNG_DOMAIN);
  const C = dna.cls;
  
  return `<div class="${C.trendingStrip}">
    <div class="${C.trendingInner}">
      ${trending.slice(0,8).map((item,i)=>`
        <a class="${C.tCard}" href="${h(itemUrl(item,cfg))}">
          <div class="${C.tImg}">
            <img src="${h(safeThumb(item,cfg))}" alt="${h(mbSubstr(item.title,0,60))}" loading="lazy" width="140" height="79">
            <span class="${C.tNum}">${i+1}</span>
            <span class="${C.tDur}">${item.duration ? formatDuration(item.duration) : ''}</span>
          </div>
          <div class="${C.tInfo}">
            <div class="${C.tTitle}">${h(mbSubstr(item.title,0,40))}</div>
          </div>
        </a>
      `).join('')}
    </div>
  </div>`;
}

function renderBreadcrumb(items, cfg) {
  const dna = SiteDNA.get(cfg.WARUNG_DOMAIN);
  const C = dna.cls;
  return `<nav class="${C.breadcrumb}" aria-label="Breadcrumb">
<ol itemscope itemtype="https://schema.org/BreadcrumbList">
${items.map((item,i)=>`<li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">${item.url?`<a href="${h(item.url)}" itemprop="item"><span itemprop="name">${h(item.name)}</span></a>`:`<span itemprop="name" aria-current="page">${h(item.name)}</span>`}<meta itemprop="position" content="${i+1}">${i<items.length-1?`<i class="fas fa-chevron-right ${C.bcSep}" aria-hidden="true"></i>`:''}</li>`).join('\n')}
</ol></nav>`;
}

// ═══════════════════════════════════════════════════════════════════════
// SESI 19 — PENANGANI HALAMAN — Pengurus Tiap Pintu Masuk
// ═══════════════════════════════════════════════════════════════════════

async function handle404(cfg, seo, request) {
  const dna = SiteDNA.get(cfg.WARUNG_DOMAIN);
  const canonical=seo.canonical('/404');
  const footNonce=generateNonce();
  const head=renderHead({ title:'404 - Halaman Tidak Ditemukan | '+cfg.WARUNG_NAME, desc:'Halaman yang kamu cari tidak ditemukan di '+cfg.WARUNG_NAME+'.', canonical, ogImage:cfg.SEO_OG_IMAGE, ogType:'website', noindex:true, cfg, seo, request, extraHead:'', extraNonces:[footNonce] });
  const nav=renderNavHeader({cfg});
  const body=`<main id="${dna.ids.mainContent}"><section class="${dna.cls.errorPage}"><div class="${dna.cls.container}"><div class="${dna.cls.errorContent}">
  <div class="error-icon"><i class="fas fa-exclamation-triangle"></i></div>
  <h1 class="error-title">404</h1>
  <p class="error-subtitle">Halaman Tidak Ditemukan</p>
  <p class="error-desc">URL yang Anda kunjungi tidak ada atau sudah dihapus.</p>
  <div class="error-actions"><a href="${homeUrl(cfg)}" class="btn btn-primary"><i class="fas fa-home"></i> Beranda</a><a href="${searchUrl('',cfg)}" class="btn btn-outline"><i class="fas fa-search"></i> Cari</a></div>
</div></div></section></main>`;
  return new Response(head+nav+body+renderFooter(cfg,request,footNonce), { status:404, headers:htmlHeaders(cfg,'page') });
}

async function handleProfile(request, cfg, client, seo) {
  const dna    = SiteDNA.get(cfg.WARUNG_DOMAIN);
  const env    = cfg._env || {};
  const ev     = (k, fb) => env[k] || cfg[k] || fb;

  const authorName    = ev('AUTHOR_NAME',     cfg.CONTACT_EMAIL_NAME  || cfg.WARUNG_NAME);
  const authorBio     = ev('AUTHOR_BIO',      cfg.WARUNG_TAGLINE      || 'Admin & pengelola ' + cfg.WARUNG_NAME);
  const authorAvatar  = ev('AUTHOR_AVATAR',   cfg.SEO_OG_IMAGE);
  const authorTwitter = ev('AUTHOR_TWITTER',  '');
  const authorFB      = ev('AUTHOR_FACEBOOK', '');
  const authorIG      = ev('AUTHOR_INSTAGRAM','');

  // Ambil konten terbaru untuk sidebar "Konten Terbaru"
  const [trendingRes] = await Promise.all([
    client.getTrending(8).catch(() => ({ data: [] })),
  ]);
  const trending = trendingRes?.data || [];

  const canonical   = seo.canonical('/profile');
  const pageTitle   = `Profil ${h(authorName)} | ${cfg.WARUNG_NAME}`;
  const pageDesc    = `${h(authorBio)} — ${cfg.WARUNG_NAME} (${cfg.WARUNG_DOMAIN})`;
  const footNonce   = generateNonce();

  // JSON-LD Person + Organization
  const personSchema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: authorName,
    description: authorBio,
    image: authorAvatar,
    url: 'https://' + cfg.WARUNG_DOMAIN + '/profile',
    worksFor: {
      '@type': 'Organization',
      name: cfg.WARUNG_NAME,
      url: 'https://' + cfg.WARUNG_DOMAIN,
    },
    ...(authorTwitter ? { sameAs: ['https://twitter.com/' + authorTwitter] } : {}),
  });

  const breadcrumbSchema = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: cfg.WARUNG_NAME, item: 'https://' + cfg.WARUNG_DOMAIN + '/' },
      { '@type': 'ListItem', position: 2, name: 'Profil', item: canonical },
    ],
  });

  const extraHead = `
<script type="application/ld+json" nonce="${footNonce}">${personSchema}</script>
<script type="application/ld+json" nonce="${footNonce}">${breadcrumbSchema}</script>`;

  const head = renderHead({
    title: pageTitle, desc: pageDesc, canonical,
    ogImage: authorAvatar, ogType: 'profile',
    noindex: false, cfg, seo, request,
    extraHead, extraNonces: [footNonce],
  });
  const nav = renderNavHeader({ cfg });

  const breadcrumbHtml = renderBreadcrumb([
    { name: 'Beranda', url: homeUrl(cfg) },
    { name: 'Profil', url: null },
  ], cfg);

  // Social links
  const socialLinks = [
    authorTwitter && `<a href="https://twitter.com/${h(authorTwitter)}" class="${dna.cls.tag}" target="_blank" rel="noopener noreferrer"><i class="fab fa-twitter"></i> @${h(authorTwitter)}</a>`,
    authorIG      && `<a href="https://instagram.com/${h(authorIG)}" class="${dna.cls.tag}" target="_blank" rel="noopener noreferrer"><i class="fab fa-instagram"></i> @${h(authorIG)}</a>`,
    authorFB      && `<a href="${h(authorFB)}" class="${dna.cls.tag}" target="_blank" rel="noopener noreferrer"><i class="fab fa-facebook"></i> Facebook</a>`,
    `<a href="mailto:${h(cfg.CONTACT_EMAIL)}" class="${dna.cls.tag}"><i class="fas fa-envelope"></i> ${h(cfg.CONTACT_EMAIL)}</a>`,
  ].filter(Boolean).join('\n');

  // Trending cards mini
  const trendingHtml = trending.length
    ? `<div style="margin-top:1.5rem">
        <h3 style="font-size:.95rem;color:var(--text-dim);margin-bottom:.75rem;text-transform:uppercase;letter-spacing:.05em">Konten Pilihan</h3>
        <ul class="${dna.cls.contentGrid}">${trending.map((item, i) => `<li>${renderCard(item, cfg, i)}</li>`).join('')}</ul>
      </div>`
    : '';

  const body = `
<main id="${dna.ids.mainContent}">
  <div class="${dna.cls.container}" style="padding-top:2rem;padding-bottom:3rem">
    ${breadcrumbHtml}
    <div style="max-width:860px;margin:0 auto">

      <!-- Avatar + Info -->
      <div style="display:flex;align-items:center;gap:1.5rem;flex-wrap:wrap;background:var(--bg-card,#1e222b);border-radius:var(--border-radius,8px);padding:2rem;box-shadow:var(--shadow-sm);margin-bottom:2rem">
        <img src="${h(authorAvatar)}" alt="${h(authorName)}"
          style="width:100px;height:100px;border-radius:50%;object-fit:cover;border:3px solid var(--accent,#ffaa00);flex-shrink:0"
          loading="lazy" onerror="this.src='${h(cfg.SEO_OG_IMAGE)}'">
        <div style="flex:1;min-width:180px">
          <h1 style="font-size:1.6rem;font-weight:700;margin:0 0 .35rem;color:var(--text-color)">${h(authorName)}</h1>
          <p style="font-size:.9rem;color:var(--text-dim);margin:0 0 .75rem;line-height:1.6">${h(authorBio)}</p>
          <div style="display:flex;flex-wrap:wrap;gap:.5rem">${socialLinks}</div>
        </div>
      </div>

      <!-- Detail Warung -->
      <div style="background:var(--bg-card,#1e222b);border-radius:var(--border-radius,8px);padding:1.5rem 2rem;margin-bottom:2rem;box-shadow:var(--shadow-sm)">
        <h2 style="font-size:1rem;text-transform:uppercase;letter-spacing:.05em;color:var(--text-dim);margin:0 0 1rem">Tentang ${h(cfg.WARUNG_NAME)}</h2>
        <table style="width:100%;border-collapse:collapse;font-size:.9rem">
          <tr><td style="padding:.5rem 0;color:var(--text-dim);width:35%"><i class="fas fa-globe"></i> Domain</td><td style="padding:.5rem 0"><a href="https://${h(cfg.WARUNG_DOMAIN)}/" style="color:var(--accent)">${h(cfg.WARUNG_DOMAIN)}</a></td></tr>
          <tr><td style="padding:.5rem 0;color:var(--text-dim)"><i class="fas fa-tag"></i> Tagline</td><td style="padding:.5rem 0">${h(cfg.WARUNG_TAGLINE || '')}</td></tr>
          <tr><td style="padding:.5rem 0;color:var(--text-dim)"><i class="fas fa-envelope"></i> Kontak</td><td style="padding:.5rem 0"><a href="mailto:${h(cfg.CONTACT_EMAIL)}" style="color:var(--accent)">${h(cfg.CONTACT_EMAIL)}</a></td></tr>
          <tr><td style="padding:.5rem 0;color:var(--text-dim)"><i class="fas fa-info-circle"></i> Tentang</td><td style="padding:.5rem 0"><a href="/${h(cfg.PATH_ABOUT)}" style="color:var(--accent)">Halaman Tentang Kami</a></td></tr>
        </table>
      </div>

      <!-- Konten Trending -->
      ${trendingHtml}

    </div>
  </div>
</main>`;

  return new Response(head + nav + body + renderFooter(cfg, request, footNonce), {
    status: 200,
    headers: htmlHeaders(cfg, 'page'),
  });
}

async function handleHome(request, cfg, client, seo) {
  const dna = SiteDNA.get(cfg.WARUNG_DOMAIN);
  const url=new URL(request.url);
  const page=Math.max(1, safeParseInt(url.searchParams.get('page'), 1));
  const type=getContentTypes(cfg).includes(url.searchParams.get('type')||'') ? url.searchParams.get('type') : '';
  const sortParam=url.searchParams.get('sort')||'';
  const isTrending=url.searchParams.has('trending')||url.searchParams.get('trending')==='1';
  const sortOrder = isTrending ? 'popular' : (['newest','popular','views','longest'].includes(sortParam) ? sortParam : 'newest');
  const deliveryMode=getDeliveryMode(request);
  const [mediaResult, trendingResult] = await Promise.all([
    client.getMediaList({ page, per_page:cfg.ITEMS_PER_PAGE, type:type||undefined, sort:sortOrder }),
    client.getTrending(cfg.TRENDING_COUNT, getContentTypes(cfg).length===1?getContentTypes(cfg)[0]:''),
  ]);
  const trending=trendingResult?.data||[];
  const items=mediaResult?.data||[], pagination=mediaResult?.meta?.pagination||mediaResult?.meta||{};
  const paginationTotal = pagination.total_pages||pagination.last_page||pagination.pageCount||1;
  const pageTitle=page>1?`${cfg.WARUNG_NAME} - Halaman ${page}`:`${cfg.WARUNG_NAME} — ${cfg.WARUNG_TAGLINE}`;
  const pageDesc=page>1?`Halaman ${page} — ${cfg.SEO_DEFAULT_DESC}`:cfg.SEO_DEFAULT_DESC;
  let canonical;
  const buildCanonicalParams = (pg=page) => {
    const p = new URLSearchParams();
    if (type) p.set('type', type);
    if (isTrending) p.set('trending', '1');
    else if (sortParam && sortParam !== 'newest') p.set('sort', sortParam);
    if (pg > 1) p.set('page', String(pg));
    const qs = p.toString();
    return qs ? `/?${qs}` : '/';
  };
  canonical = seo.canonical(buildCanonicalParams(), request);
  const homeExtraHead=(!type&&!isTrending&&!sortParam&&page===1)
    ? seo.websiteSchema('https://'+cfg.WARUNG_DOMAIN+'/'+cfg.PATH_SEARCH+'?q={search_term_string}')+seo.itemListSchema(items,canonical,cfg)
    : seo.itemListSchema(items,canonical,cfg);
  const prevUrl=page>1?seo.canonical(buildCanonicalParams(page-1)):null;
  const nextUrl=page<paginationTotal?seo.canonical(buildCanonicalParams(page+1)):null;
  const adNonce=generateNonce();
  // dna sudah diumumkan di atas fungsi ini — tak perlu disebut ulang
  const head=renderHead({ title:pageTitle, desc:pageDesc, canonical, ogImage:cfg.SEO_OG_IMAGE, ogType:'website', noindex:false, cfg, seo, request, deliveryMode, extraHead:homeExtraHead, prevUrl, nextUrl, extraNonces:[adNonce] });
  const nav=renderNavHeader({ cfg, isHome:!isTrending&&!sortParam, currentPage: isTrending?'trending':sortParam==='popular'?'popular':sortParam==='newest'?'latest':sortParam==='longest'?'longest':'' });
  const filterTabsItems=getContentTypes(cfg).map(t=>{
    const meta=TYPE_META[t]||{label:ucfirst(t),icon:'fa-file'};
    return `<a href="/?type=${t}" class="strip-item ${type===t?'active':''}" role="tab" rel="nofollow"><i class="fas ${meta.icon}" aria-hidden="true"></i> ${meta.label}</a>`;
  }).join('');
  const filterTabs=`<a href="/" class="strip-item ${!type&&!sortParam&&!isTrending?'active':''}" role="tab">Semua</a>${filterTabsItems}`;
  let contentSection='';
  if (!items.length) {
    contentSection=`<div class="empty-state"><i class="fas fa-folder-open"></i><p>Tidak ada konten tersedia saat ini.</p></div>`;
  } else {
    contentSection=renderBanner('before_grid',cfg,request,adNonce)+renderGrid(items,cfg,true,request,adNonce)
      +(cfg.THEME_SHOW_PROMO?`<div class="promo-banner"><i class="fas fa-crown"></i> ${h(cfg.THEME_PROMO_TEXT)} <i class="fas fa-crown"></i></div>`:'')
      +renderBanner('after_grid',cfg,request,adNonce)+renderPagination(pagination, p=>{
        const params=new URLSearchParams();
        if (type) params.set('type',type);
        if (isTrending) params.set('trending','1');
        else if (sortParam&&sortParam!=='newest') params.set('sort',sortParam);
        if (p>1) params.set('page',String(p));
        const qs=params.toString();
        return qs?`/?${qs}`:'/';
      });
  }
  const sectionTitle = isTrending ? dna.navLabels.trending
    : sortParam==='popular' ? dna.navLabels.popular
    : sortParam==='newest'  ? dna.navLabels.terbaru
    : sortParam==='longest' ? dna.navLabels.terlama
    : type ? ucfirst(h(type))
    : dna.sectionTitleDefault;
  const seoIntroBlock = (page===1&&!type&&!isTrending&&!sortParam)
    ? `<div style="padding:0 12px 10px;max-width:1280px;margin:0 auto">
        <h1 style="font-size:0;height:0;overflow:hidden;margin:0;padding:0" aria-hidden="true">${h(cfg.WARUNG_NAME)}</h1>
        <p style="font-size:.72rem;color:var(--text-dim);line-height:1.6;margin:0;padding:6px 0 2px">${h(cfg.WARUNG_NAME)} adalah platform streaming gratis terbaik. Nikmati ribuan konten ${h(cfg.WARUNG_TAGLINE||'video dan album')} tanpa registrasi. Temukan video terbaru, album foto, dan konten populer yang diupdate setiap hari. Streaming langsung tanpa buffering, kualitas HD, gratis untuk semua pengguna.</p>
       </div>`
    : '';
  const main=`<main id="${dna.ids.mainContent}">${renderBanner('header_top',cfg,request,adNonce)}<nav class="${dna.cls.categoryStrip}" aria-label="Filter kategori"><div class="${dna.cls.catStripInner}">${filterTabs}</div></nav>${cfg.THEME_SHOW_TRENDING&&!deliveryMode?.lite?renderTrendingMobile(trending,cfg):''}${seoIntroBlock}<div class="${dna.cls.container}"><div class="${dna.cls.layoutMain}">
<section class="${dna.cls.contentArea}">
  <div class="${dna.cls.sectionHeader}"><h2 class="${dna.cls.sectionTitle}"><i class="fas fa-fire" aria-hidden="true"></i> ${sectionTitle}${page>1?` <span class="section-page">— Hal. ${page}</span>`:''}</h2></div>
  ${contentSection}
</section>
</div></div></main>`;
  return new Response(head+nav+main+renderFooter(cfg,request,adNonce), { status:200, headers:htmlHeaders(cfg,'home') });
}

async function handleView(request, cfg, client, seo, segments) {
  const dna = SiteDNA.get(cfg.WARUNG_DOMAIN); // FIX: dna was used but never declared in this scope
  const id=safeParseInt(segments[1], 0);
  if (!id||id<1) return handle404(cfg,seo,request);
  const reqPath=(segments[0]||'').toLowerCase();
  if (cfg.WARUNG_TYPE==='A'&&reqPath===cfg.PATH_ALBUM.toLowerCase()) return handle404(cfg,seo,request);
  if (cfg.WARUNG_TYPE==='B'&&reqPath===cfg.PATH_CONTENT.toLowerCase()) return handle404(cfg,seo,request);
  const [itemResult, relatedResult]=await Promise.all([client.getMediaDetail(id), client.getRelated(id,cfg.RELATED_COUNT)]);
  if (!itemResult?.data||itemResult?.status==='error') return handle404(cfg,seo,request);
  const _ua = request.headers.get('User-Agent') || '';
  if (!isSearchBot(_ua) && !isScraperBot(_ua) && client.ctx?.waitUntil) {
    client.ctx.waitUntil(client.recordView(id));
  }
  const media=itemResult?.data;
  if (!getContentTypes(cfg).includes(media.type)) return handle404(cfg,seo,request);
  const type=media.type||'video', related=relatedResult?.data||[];
  let albumPhotos=[];
  const [playerUrl, albumResult] = await Promise.all([
    client.getPlayerUrl(id),
    type==='album' ? client.getAlbum(id) : Promise.resolve(null),
  ]);
  if (type==='album') albumPhotos = albumResult?.data?.photos||[];
  const fp=seo.generateUniqueSchema(id,type);
  const pageUrl=type==='album'?albumUrl(id,media.title,cfg):contentUrl(id,media.title,cfg);
  const canonical=seo.canonical(pageUrl);
  const pageTitle=seo.title(media.title,id,type);
  const pageDesc=seo.description(media.title,id,type,media.views||0);
  const ogImage=media.thumbnail||cfg.SEO_OG_IMAGE;
  const ogType=type==='video'?'video.movie':'article';
  const keywords=media.tags?.length?media.tags.slice(0,10).join(', '):cfg.SEO_KEYWORDS;
  const publishedTime=isoDate(media.created_at);
  const modifiedTime=isoDate(media.updated_at||media.created_at);
  const extraHead=seo.contentSchema(media,canonical,playerUrl)+seo.breadcrumbSchema([{name:'Beranda',url:'/'},{name:ucfirst(type),url:'/'+cfg.PATH_CATEGORY+'/'+type},{name:media.title,url:null}],pageUrl);
  const adNonce=generateNonce();
  const head=renderHead({ title:pageTitle, desc:pageDesc, canonical, ogImage, ogType, keywords, cfg, seo, request, extraHead, contentId:id, contentType:type, publishedTime, modifiedTime, extraNonces:[adNonce] });
  const nav=renderNavHeader({cfg});
  let playerHtml='';
  if (type==='video') {
    playerHtml=`<div class="player-wrapper"><iframe src="${h(playerUrl)}" allowfullscreen loading="eager" class="player-frame" title="${h(media.title)}" data-id="${id}" width="1280" height="720" sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-pointer-lock allow-downloads" referrerpolicy="strict-origin-when-cross-origin" aria-label="Pemutar video: ${h(media.title)}"></iframe></div>`;
  } else if (type==='album') {
    // Pembenahan v30.2: Gunakan _srcsetUrl (URL API) sebelum h() — sama seperti renderCard.
    // Urutan lama: h(photo.url)+"?w=320" → encode & jadi &amp; lalu ditempel ?w= → URL hancur.
    // Urutan baru: _srcsetUrl(url,w) dahulu → URL sah → baru h() untuk penyucian XSS.
    function _albumSrcsetUrl(url, w) {
      try { const u = new URL(url); u.searchParams.set('w', String(w)); return u.toString(); }
      catch { return url + (url.includes('?') ? '&' : '?') + 'w=' + w; }
    }
    playerHtml=`<div class="album-grid" role="list">${albumPhotos.map((photo,i)=>`<div class="album-item" role="listitem"><button type="button" class="album-thumb-btn js-lightbox-open" data-src="${h(photo.url)}" data-idx="${i}" data-title="${h(media.title)}" aria-label="Buka foto ${i+1}"><img src="${h(photo.url)}" srcset="${h(_albumSrcsetUrl(photo.url,320))} 320w, ${h(_albumSrcsetUrl(photo.url,640))} 640w" sizes="(max-width:480px) 320px, 640px" alt="${h(media.title)} - Foto ${i+1}" loading="${i<4?'eager':'lazy'}" class="album-thumb" width="320" height="240"></button></div>`).join('')}${!albumPhotos.length?`<p class="empty-state">Foto tidak tersedia.</p>`:''}</div>`;
  }
  const tagsHtml=media.tags?.length?`<div class="content-tags" role="list">${media.tags.map(t=>`<a href="${h(tagUrl(t,cfg))}" class="${dna.cls.tag}" role="listitem">#${h(t)}</a>`).join('')}</div>`:'';
  // popularTags di sisi: tampilkan penanda ke-6 dan seterusnya (hindari kembar dengan tagsHtml di atas)
  const popularTags=media.tags?.slice(5,12).map(t=>`<a href="${h(tagUrl(t,cfg))}" class="${dna.cls.tag}">#${h(t)}</a>`).join('')||'';  let descHtml='';
  if (media.description&&type!=='story') {
    const short=mbSubstr(stripTags(media.description),0,300);
    descHtml=`<div class="content-desc"><p>${h(short)}</p>${media.description.length>300?`<button type="button" class="read-more js-toggle-desc" aria-expanded="false" aria-controls="full-desc-${id}">Baca selengkapnya</button><div id="full-desc-${id}" class="full-desc hidden">${nl2br(h(media.description))}</div>`:''}</div>`;
  }
  // Altar SEO artikel — selalu muncul, memastikan 250+ kata mantra, H1 di badan, dan paragraf terasa
  const typeLower = (type||'video').toLowerCase();
  const seoArticle = `<section class="seo-article" style="margin-top:14px;padding-top:12px;border-top:1px solid var(--border)">
<p><strong>${h(media.title)}</strong> adalah ${typeLower} yang bisa kamu nikmati secara gratis di ${h(cfg.WARUNG_NAME)}. Konten ini tersedia dalam kualitas HD tanpa buffering dan tanpa perlu registrasi atau membuat akun terlebih dahulu.</p>
<p>Cara menonton konten ini sangat mudah — cukup klik tombol play dan streaming langsung dimulai. ${h(cfg.WARUNG_NAME)} mendukung streaming di semua perangkat, baik smartphone, tablet, maupun komputer.</p>
<p>Temukan ribuan konten ${typeLower} berkualitas lainnya yang diperbarui setiap hari. Gunakan fitur pencarian untuk menemukan konten serupa, atau jelajahi kategori dan tag yang tersedia.</p>
</section>`;
  const contentInfo=`<div class="content-info"><h1 class="content-title">${h(media.title)}</h1>
<div class="content-meta">
  <span class="badge"><i class="fas ${TYPE_ICONS[type]||'fa-file'}" aria-hidden="true"></i> ${h(ucfirst(type))}</span>
  <span><i class="fas fa-eye"></i> ${formatViews(media.views||0)} penonton</span>
  ${media.duration>0?`<span><i class="fas fa-clock"></i> ${formatDuration(media.duration)}</span>`:''}
  <span><time datetime="${publishedTime}"><i class="fas fa-calendar-alt"></i> ${formatDate(media.created_at||'')}</time></span>
</div>
${tagsHtml}${descHtml}${seoArticle}
<div class="action-buttons">
  <button type="button" id="btnCopyLink" class="btn btn-outline" data-url="${h(canonical)}"><i class="fas fa-link"></i> Salin Link</button>
  <button type="button" id="btnShare" class="btn btn-outline"><i class="fas fa-share-alt"></i> Share</button>
  <a href="/download/${id}" class="btn btn-outline btn-download"><i class="fas fa-download"></i> Download</a>
</div>
<div class="social-share" style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap;">
  <a href="https://wa.me/?text=${encodeURIComponent(media.title+' '+canonical)}" target="_blank" rel="noopener noreferrer" class="btn btn-outline" style="background:#25d366;color:#fff;border-color:#25d366" aria-label="Bagikan via WhatsApp"><i class="fab fa-whatsapp"></i> WhatsApp</a>
  <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(canonical)}" target="_blank" rel="noopener noreferrer" class="btn btn-outline" style="background:#1877f2;color:#fff;border-color:#1877f2" aria-label="Bagikan via Facebook"><i class="fab fa-facebook"></i> Facebook</a>
  <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(media.title)}&url=${encodeURIComponent(canonical)}" target="_blank" rel="noopener noreferrer" class="btn btn-outline" style="background:#1da1f2;color:#fff;border-color:#1da1f2" aria-label="Bagikan via Twitter"><i class="fab fa-twitter"></i> Twitter</a>
  <a href="https://t.me/share/url?url=${encodeURIComponent(canonical)}&text=${encodeURIComponent(media.title)}" target="_blank" rel="noopener noreferrer" class="btn btn-outline" style="background:#0088cc;color:#fff;border-color:#0088cc" aria-label="Bagikan via Telegram"><i class="fab fa-telegram"></i> Telegram</a>
</div></div>`;
  const relatedHtml=related.length?`<ol class="related-list">${related.map(rel=>`<li><a href="${h(itemUrl(rel,cfg))}" class="related-item"><img src="${h(safeThumb(rel,cfg))}" alt="${h(mbSubstr(rel.title,0,60))}" loading="lazy" width="80" height="45" onerror="this.src='${h(cfg.DEFAULT_THUMB)}'"><div class="related-info"><p class="related-title">${h(mbSubstr(rel.title,0,50))}</p><small class="related-meta"><span class="badge-small"><i class="fas ${TYPE_ICONS[rel.type]||'fa-file'}"></i> ${h(rel.type||'video')}</span><span><i class="fas fa-eye"></i> ${formatViews(rel.views||0)}</span></small></div></a></li>`).join('')}</ol>`:`<p class="empty-state">Tidak ada konten terkait.</p>`;
  const lightboxHtml=type==='album'?`<div id="lightbox" class="lightbox hidden" role="dialog" aria-modal="true"><div class="lightbox-content"><img id="lightbox-img" src="" alt="" class="lightbox-image"><button type="button" id="lightboxClose" class="lightbox-close" aria-label="Tutup"><i class="fas fa-times"></i></button><div class="lightbox-nav"><button type="button" id="lightboxPrev" class="lightbox-prev" aria-label="Sebelumnya"><i class="fas fa-chevron-left"></i></button><button type="button" id="lightboxNext" class="lightbox-next" aria-label="Berikutnya"><i class="fas fa-chevron-right"></i></button></div><div class="lightbox-caption" id="lightbox-caption"></div></div></div>
<script nonce="${adNonce}">var _lb={idx:0,photos:${JSON.stringify(albumPhotos.map(p=>p.url))},titles:${JSON.stringify(albumPhotos.map(()=>media.title))}};function openLightbox(src,i,t){_lb.idx=i;var img=document.getElementById('lightbox-img'),cap=document.getElementById('lightbox-caption'),lb=document.getElementById('lightbox');img.src=src;img.alt=t+' - Foto '+(i+1);cap.textContent=t+' ('+(i+1)+' / '+_lb.photos.length+')';lb.classList.remove('hidden');document.body.style.overflow='hidden';lb.querySelector('.lightbox-close').focus();}function closeLightbox(e){if(!e||e.target===e.currentTarget||e.target.closest('.lightbox-close')){var lb=document.getElementById('lightbox');lb.classList.add('hidden');document.body.style.overflow='';}}function navigateLightbox(d){var n=(_lb.idx+d+_lb.photos.length)%_lb.photos.length;_lb.idx=n;var img=document.getElementById('lightbox-img'),cap=document.getElementById('lightbox-caption');img.src=_lb.photos[n];cap.textContent=_lb.titles[n]+' ('+(n+1)+' / '+_lb.photos.length+')';}(function(){var lb=document.getElementById('lightbox'),lc=document.getElementById('lightboxClose'),lp=document.getElementById('lightboxPrev'),ln=document.getElementById('lightboxNext');if(lb)lb.addEventListener('click',function(e){if(e.target===lb)closeLightbox(e);});if(lc)lc.addEventListener('click',closeLightbox);if(lp)lp.addEventListener('click',function(){navigateLightbox(-1);});if(ln)ln.addEventListener('click',function(){navigateLightbox(1);});document.querySelectorAll('.js-lightbox-open').forEach(function(btn){btn.addEventListener('click',function(){openLightbox(btn.dataset.src,parseInt(btn.dataset.idx),btn.dataset.title);});});})();document.addEventListener('keydown',function(e){var lb=document.getElementById('lightbox');if(lb&&!lb.classList.contains('hidden')){if(e.key==='Escape')closeLightbox();if(e.key==='ArrowLeft')navigateLightbox(-1);if(e.key==='ArrowRight')navigateLightbox(1);}});<\/script>`:'';;
  const pageScript=`<script nonce="${adNonce}">function copyLink(btn){var url=btn.dataset.url||location.href;if(navigator.clipboard){navigator.clipboard.writeText(url).then(()=>showToast('Link disalin!')).catch(()=>fallbackCopy(url));}else fallbackCopy(url);}function fallbackCopy(text){var ta=document.createElement('textarea');ta.value=text;ta.style.cssText='position:fixed;opacity:0;top:-999px';document.body.appendChild(ta);ta.select();try{document.execCommand('copy');showToast('Link disalin!');}catch{prompt('Salin link:',text);}document.body.removeChild(ta);}function showToast(msg){var ex=document.querySelector('.toast');ex&&ex.remove();var t=document.createElement('div');t.className='toast';t.textContent=msg;document.body.appendChild(t);setTimeout(()=>t.parentNode&&t.remove(),2200);}function shareContent(){if(navigator.share){navigator.share({title:${JSON.stringify(media.title)},url:location.href}).catch(()=>{});}else copyLink({dataset:{url:location.href}});}function toggleDesc(btn){var id=btn.getAttribute('aria-controls'),fd=document.getElementById(id);if(!fd)return;var open=btn.getAttribute('aria-expanded')==='true';fd.classList.toggle('hidden',open);fd.setAttribute('aria-hidden',String(open));btn.setAttribute('aria-expanded',String(!open));btn.textContent=open?'Baca selengkapnya':'Tutup';}
// FIX CSP: bind copy/share/toggleDesc via addEventListener
(function(){var cp=document.getElementById('btnCopyLink'),sh=document.getElementById('btnShare');if(cp)cp.addEventListener('click',function(){copyLink(this);});if(sh)sh.addEventListener('click',shareContent);document.querySelectorAll('.js-toggle-desc').forEach(function(b){b.addEventListener('click',function(){toggleDesc(this);});});})();<\/script>`;
  const breadcrumbHtml=renderBreadcrumb([{name:'Beranda',url:homeUrl(cfg)},{name:'Semua '+ucfirst(type),url:categoryUrl(type,1,cfg)},{name:mbSubstr(media.title,0,40),url:null}],cfg);
  const main=`<main id="${dna.ids.mainContent}" class="${dna.cls.viewMain}"><div class="${dna.cls.viewLayout}">
<article class="view-content">
  ${breadcrumbHtml}${playerHtml}${contentInfo}${renderBanner('after_content',cfg,request,adNonce)}
</article>
<aside class="view-sidebar">
  <h2 class="widget-title"><i class="fas fa-layer-group"></i> Konten Terkait</h2>
  ${relatedHtml}
  ${popularTags?`<section><h3 class="widget-title" style="margin-top:16px"><i class="fas fa-tags"></i> Tag</h3><div class="${dna.cls.tagCloud}">${popularTags}</div></section>`:''}
</aside>
</div></main>${lightboxHtml}${pageScript}`;
  const popunderView = renderBanner('footer_popunder', cfg, request, adNonce);
  return new Response(head+nav+popunderView+main+renderFooter(cfg,request,adNonce), { status:200, headers:htmlHeaders(cfg,'article') });
}

async function handleDownload(request, cfg, client, seo, segments) {
  const id = safeParseInt(segments[1], 0);
  if (!id || id < 1) return handle404(cfg, seo, request);

  const itemResult = await client.getMediaDetail(id);
  if (!itemResult?.data || itemResult?.status === 'error') return handle404(cfg, seo, request);
  const media = itemResult.data;
  const type = media.type || 'video';
  const dna = SiteDNA.get(cfg.WARUNG_DOMAIN);
  const canonical = seo.canonical(type === 'album' ? albumUrl(id, media.title, cfg) : contentUrl(id, media.title, cfg));
  const thumb = media.thumbnail || cfg.SEO_OG_IMAGE;
  const adNonce = generateNonce();

  const head = renderHead({
    title: `Download ${h(media.title)} | ${cfg.WARUNG_NAME}`,
    desc: `Download ${media.title} gratis di ${cfg.WARUNG_NAME}. Tersedia berbagai pilihan kualitas.`,
    canonical: seo.canonical('/download/' + id),
    ogImage: thumb, ogType: 'website', noindex: true,
    cfg, seo, request, extraNonces: [adNonce],
  });
  const nav = renderNavHeader({ cfg });

  let bodyHtml = '';

  if (type === 'video') {
    // Ambil URL unduhan + pemutar secara bersamaan tanpa menunggu
    const [dlUrl, playerUrl] = await Promise.all([
      client.getDownloadUrl(id),
      client.getPlayerUrl(id),
    ]);

    const qualityOptions = dlUrl
      ? `<div class="download-options">
          <a href="${h(dlUrl)}" class="download-btn" target="_blank" rel="noopener noreferrer">
            <div class="download-btn-left">
              <div class="download-btn-icon"><i class="fas fa-film"></i></div>
              <div>
                <div class="download-btn-label">Download Video</div>
                <div class="download-btn-sub">Kualitas terbaik tersedia</div>
              </div>
            </div>
            <i class="fas fa-chevron-right download-btn-arrow"></i>
          </a>
          <a href="${h(playerUrl||canonical)}" class="download-btn" target="_blank" rel="noopener noreferrer">
            <div class="download-btn-left">
              <div class="download-btn-icon" style="background:#333;color:var(--gold)"><i class="fas fa-play"></i></div>
              <div>
                <div class="download-btn-label">Tonton Online</div>
                <div class="download-btn-sub">Streaming langsung tanpa download</div>
              </div>
            </div>
            <i class="fas fa-chevron-right download-btn-arrow"></i>
          </a>
        </div>`
      : `<div class="download-error"><i class="fas fa-exclamation-circle"></i> Link download tidak tersedia saat ini. Silakan <a href="${h(canonical)}" style="color:var(--gold)">tonton online</a>.</div>`;

    bodyHtml = `
      <div class="download-hero">
        <img src="${h(thumb)}" alt="${h(media.title)}" class="download-thumb" loading="eager">
        <div class="download-info">
          <h1 class="download-title">${h(media.title)}</h1>
          <div class="download-meta">
            <span><i class="fas fa-video"></i> Video</span>
            ${media.duration > 0 ? `<span><i class="fas fa-clock"></i> ${formatDuration(media.duration)}</span>` : ''}
            <span><i class="fas fa-eye"></i> ${formatViews(media.views || 0)} penonton</span>
          </div>
        </div>
      </div>
      <div class="download-section">
        <div class="download-section-title"><i class="fas fa-download"></i> Pilihan Download</div>
        ${qualityOptions}
      </div>
      <p style="text-align:center;margin-top:16px"><a href="${h(canonical)}" class="btn btn-outline"><i class="fas fa-arrow-left"></i> Kembali ke Halaman</a></p>`;

  } else if (type === 'album') {
    const albumResult = await client.getAlbum(id);
    const photos = albumResult?.data?.photos || [];

    const photoGrid = photos.length
      ? `<a href="${h(thumb)}" class="download-all-btn" target="_blank" rel="noopener noreferrer" download>
           <i class="fas fa-images"></i> Download Semua Foto (${photos.length} foto)
         </a>
         <div class="download-photo-grid">
           ${photos.map((photo, i) => `
             <div class="download-photo-item">
               <img src="${h(photo.url)}" alt="${h(media.title)} - Foto ${i + 1}" loading="${i < 8 ? 'eager' : 'lazy'}">
               <div class="download-photo-overlay">
                 <a href="${h(photo.url)}" download target="_blank" rel="noopener noreferrer" aria-label="Download foto ${i + 1}"><i class="fas fa-download"></i></a>
               </div>
             </div>`).join('')}
         </div>`
      : `<div class="download-error"><i class="fas fa-exclamation-circle"></i> Foto tidak tersedia.</div>`;

    bodyHtml = `
      <div class="download-hero">
        <img src="${h(thumb)}" alt="${h(media.title)}" class="download-thumb" loading="eager">
        <div class="download-info">
          <h1 class="download-title">${h(media.title)}</h1>
          <div class="download-meta">
            <span><i class="fas fa-images"></i> Album</span>
            <span><i class="fas fa-photo-video"></i> ${photos.length} foto</span>
          </div>
        </div>
      </div>
      <div class="download-section">
        <div class="download-section-title"><i class="fas fa-download"></i> Download Foto</div>
        ${photoGrid}
      </div>
      <p style="text-align:center;margin-top:16px"><a href="${h(canonical)}" class="btn btn-outline"><i class="fas fa-arrow-left"></i> Kembali ke Album</a></p>`;
  } else {
    // Cadangan untuk jenis konten yang tidak dikenal — tanah asing
    bodyHtml = `<div class="download-error" style="text-align:center;padding:40px 20px">
      <i class="fas fa-exclamation-triangle" style="font-size:2rem;color:var(--gold);display:block;margin-bottom:12px"></i>
      <p>Tipe konten ini tidak mendukung fitur download.</p>
      <a href="${h(canonical)}" class="btn btn-outline" style="margin-top:12px"><i class="fas fa-arrow-left"></i> Kembali</a>
    </div>`;
  }

  const main = `<main id="${dna.ids.mainContent}"><div class="download-wrap">${bodyHtml}</div></main>`;
  return new Response(head + nav + main + renderFooter(cfg, request, adNonce), {
    status: 200,
    headers: htmlHeaders(cfg, 'page'),
  });
}

async function handleSearch(request, cfg, client, seo) {
  const dna = SiteDNA.get(cfg.WARUNG_DOMAIN);
  const url=new URL(request.url);
  const q=(url.searchParams.get('q')||'').trim().slice(0,100);
  const type=getContentTypes(cfg).includes(url.searchParams.get('type')||'')?url.searchParams.get('type'):'';
  const page=Math.max(1, safeParseInt(url.searchParams.get('page'), 1));
  let items=[], pagination={}, total=0, errorMsg='';
  // Pembenahan v30: jalankan pencarian + populer secara bersamaan (bukan satu per satu)
  const [searchResult, trendingResult] = await Promise.all([
    q.length >= 2
      ? client.search(q, { page, per_page: cfg.ITEMS_PER_PAGE, ...(type ? { type } : {}) }).catch(err => {
          if (cfg.DAPUR_DEBUG) console.error('Search error:', err.message);
          return { status: 'error', message: 'Terjadi kesalahan saat mencari.' };
        })
      : Promise.resolve(null),
    client.getTrending(8).catch(() => ({ data: [] })),
  ]);
  const trending = trendingResult?.data || [];
  if (searchResult) {
    if (searchResult?.status === 'error') errorMsg = searchResult.message || 'Pencarian gagal.';
    else { items = searchResult?.data || []; pagination = searchResult?.meta?.pagination || searchResult?.meta || {}; total = pagination.total || 0; }
  }
  const pageTitle=q?`Cari "${mbSubstr(q,0,50)}"${page>1?' - Hal. '+page:''}  | ${cfg.WARUNG_NAME}`:`Pencarian | ${cfg.WARUNG_NAME}`;
  const pageDesc=q?`Hasil pencarian untuk "${q}" — ${numberFormat(total)} konten di ${cfg.WARUNG_NAME}.`:'Cari video dan album di sini.';
  const canonical=seo.canonical('/'+cfg.PATH_SEARCH+(q?'?q='+encodeURIComponent(q):''),request);
  const adNonce=generateNonce();
  const head=renderHead({ title:pageTitle, desc:pageDesc, canonical, ogImage:cfg.SEO_OG_IMAGE, ogType:'website', noindex:!q, cfg, seo, request, extraHead:'', extraNonces:[adNonce] });
  const nav=renderNavHeader({ cfg, currentPage:'search', q });
  const filterUrl=(t,pg=1)=>{const p={};if(q)p.q=q;if(t)p.type=t;if(pg>1)p.page=pg;return '/'+cfg.PATH_SEARCH+'?'+new URLSearchParams(p).toString();};
  const filterTabs=q?`<div class="filter-tabs"><a href="${filterUrl('')}" class="filter-tab ${!type?'active':''}">Semua</a>${getContentTypes(cfg).map(t=>{const meta=TYPE_META[t]||{icon:'fa-file'};return `<a href="${filterUrl(t)}" class="filter-tab ${type===t?'active':''}"><i class="fas ${meta.icon}"></i> ${ucfirst(t)}</a>`;}).join('')}</div>`:'';
  const pageHeader=`<div class="${dna.cls.pageHeader}"><div class="${dna.cls.container}">
<div class="page-label"><i class="fas fa-search"></i> Pencarian</div>
<h1 class="${dna.cls.pageTitle}">${q?`Hasil untuk <em>"${h(mbSubstr(q,0,50))}"</em>`:'Cari Konten'}</h1>
<form class="search-bar-large" role="search" action="/${h(cfg.PATH_SEARCH)}" method="get">
  <div class="search-bar">
    <label for="search-main-input" class="sr-only">Kata kunci pencarian</label>
    <input id="search-main-input" type="search" name="q" value="${h(q)}" placeholder="Ketik kata kunci..." autocomplete="off" autofocus maxlength="100">
    ${type?`<input type="hidden" name="type" value="${h(type)}">`:''}
    <button type="submit" aria-label="Cari"><i class="fas fa-search"></i></button>
  </div>
</form>
${filterTabs}
</div></div>`;
  let contentSection='';
  if (!q) contentSection=`<div class="${dna.cls.noResults}"><div class="no-results-icon"><i class="fas fa-search"></i></div><h2>Mau cari apa?</h2><p>Ketik kata kunci di kolom pencarian.</p></div>`;
  else if (errorMsg) contentSection=`<div class="${dna.cls.noResults}"><div class="no-results-icon"><i class="fas fa-exclamation-triangle"></i></div><h2>Pencarian gagal</h2><p>${h(errorMsg)}</p></div>`;
  else if (!items.length) contentSection=`<div class="${dna.cls.noResults}"><div class="no-results-icon"><i class="fas fa-folder-open"></i></div><h2>Tidak ada hasil untuk "${h(q)}"</h2><p>Coba kata kunci lain.</p>${type?`<div class="no-results-actions"><a href="${filterUrl('')}" class="btn btn-outline">Hapus filter</a></div>`:''}</div>`;
  else {
    const from=(page-1)*cfg.ITEMS_PER_PAGE+1, to=Math.min(page*cfg.ITEMS_PER_PAGE,total);
    contentSection=`<div class="search-stats"><i class="fas fa-layer-group"></i> Menampilkan <strong>${from}–${to}</strong> dari <strong>${numberFormat(total)}</strong> hasil</div>`
      +renderBanner('before_grid',cfg,request,adNonce)+renderGrid(items,cfg,true,request,adNonce)+renderBanner('after_grid',cfg,request,adNonce)+renderPagination(pagination, p=>filterUrl(type,p));
  }
  const allTags={};
  items.forEach(item=>(item.tags||[]).forEach(t=>{allTags[t]=(allTags[t]||0)+1;}));
  const topTags=Object.entries(allTags).sort((a,b)=>b[1]-a[1]).slice(0,20).map(([t])=>t);
  const tagsHtml=topTags.length?`<div class="${dna.cls.tagCloud}" style="margin:14px 0">${topTags.map(t=>`<a href="${h(tagUrl(t,cfg))}" class="${dna.cls.tag}">#${h(t)}</a>`).join('')}</div>`:'';
  const main=`${pageHeader}<main id="${dna.ids.mainContent}"><div class="${dna.cls.container}"><div class="${dna.cls.layoutMain}">
<section class="${dna.cls.contentArea}">${contentSection}${tagsHtml}</section>
</div></div></main>`;
  const popunderSearch = renderBanner('footer_popunder', cfg, request, adNonce);
  return new Response(head+nav+popunderSearch+main+renderFooter(cfg,request,adNonce), { status:200, headers:htmlHeaders(cfg,'search') });
}

async function handleTagIndex(request, cfg, client, seo) {
  const dna = SiteDNA.get(cfg.WARUNG_DOMAIN);


  let tagMap = {};
  try {
    const [trendRes, recentRes] = await Promise.all([
      client.getTrending(50).catch(() => ({ data: [] })),
      client.getMediaList({ per_page: 50, sort: 'newest' }).catch(() => ({ data: [] })),
    ]);
    const allItems = [...(trendRes?.data || []), ...(recentRes?.data || [])];
    for (const item of allItems) {
      for (const t of (item.tags || [])) {
        if (typeof t === 'string' && t.trim()) {
          tagMap[t.trim()] = (tagMap[t.trim()] || 0) + 1;
        }
      }
    }
  } catch(e) { /* tetap lanjut */ }

  const tags = Object.entries(tagMap).sort((a, b) => a[0].localeCompare(b[0], 'id'));

  const canonical = seo.canonical('/' + cfg.PATH_TAG);
  const pageTitle = `Semua Tag | ${cfg.WARUNG_NAME}`;
  const pageDesc  = `Direktori tag konten di ${cfg.WARUNG_NAME}. Temukan konten berdasarkan kata kunci favoritmu.`;
  const nonce     = generateNonce();

  const breadcrumbSchema = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: cfg.WARUNG_NAME, item: 'https://' + cfg.WARUNG_DOMAIN + '/' },
      { '@type': 'ListItem', position: 2, name: 'Tag', item: canonical },
    ],
  });

  const head = renderHead({
    title: pageTitle, desc: pageDesc, canonical,
    ogImage: cfg.SEO_OG_IMAGE, ogType: 'website',
    noindex: false, cfg, seo, request,
    extraHead: `<script type="application/ld+json" nonce="${nonce}">${breadcrumbSchema}</script>`,
    extraNonces: [nonce],
  });
  const nav            = renderNavHeader({ cfg });
  const breadcrumbHtml = renderBreadcrumb([{ name: 'Beranda', url: homeUrl(cfg) }, { name: 'Tag', url: null }], cfg);

  const tagCloud = tags.length
    ? tags.map(([name, count]) =>
        `<a href="/${cfg.PATH_TAG}/${encodeURIComponent(name.toLowerCase())}" class="${dna.cls.tag}" style="font-size:.9rem;padding:.4rem .85rem">`
      + `${h(name)}<span style="opacity:.55;font-size:.78em;margin-left:.35em">(${count})</span>`
      + `</a>`
      ).join('\n')
    : `<p style="color:var(--text-dim)">Belum ada tag tersedia.</p>`;

  const body = `
<main id="${dna.ids.mainContent}">
  <div class="${dna.cls.container}" style="padding-top:2rem;padding-bottom:3rem">
    ${breadcrumbHtml}
    <div class="${dna.cls.pageHeader}">
      <h1 class="${dna.cls.pageTitle}"><i class="fas fa-tags" style="margin-right:.5rem"></i>Semua Tag</h1>
      <p class="${dna.cls.pageDesc}">${tags.length ? `${tags.length} tag tersedia di ${h(cfg.WARUNG_NAME)}` : ''}</p>
    </div>
    <div class="${dna.cls.tagCloud}" style="margin-top:1.5rem;display:flex;flex-wrap:wrap;gap:.5rem">
      ${tagCloud}
    </div>
  </div>
</main>`;

  return new Response(head + nav + body + renderFooter(cfg, request, nonce), {
    status: 200,
    headers: htmlHeaders(cfg, 'page'),
  });
}

async function handleTag(request, cfg, client, seo, segments) {
  const dna = SiteDNA.get(cfg.WARUNG_DOMAIN);
  const tagRaw=decodeURIComponent(segments[1]||'');
  const tag=mbSubstr((tagRaw).trim().replace(/<[^>]+>/g,''),0,80);
  if (!tag) return handleTagIndex(request, cfg, client, seo);
  const url=new URL(request.url);
  const page=Math.max(1, safeParseInt(url.searchParams.get('page'), 1));
  const type=getContentTypes(cfg).includes(url.searchParams.get('type')||'')?url.searchParams.get('type'):'';
  const params={page,per_page:cfg.ITEMS_PER_PAGE};
  if (type) params.type=type;
  const result=await client.getByTag(tag,params);
  const items=result?.data||[], pagination=result?.meta?.pagination||result?.meta||{}, total=pagination.total||0;
  const errorMsg=result?.status==='error'?(result.message||'Gagal mengambil data tag.'):'';
  const typeCounts={};
  items.forEach(item=>{typeCounts[item.type]=(typeCounts[item.type]||0)+1;});
  const relatedTagsMap={};
  items.forEach(item=>(item.tags||[]).forEach(t=>{if(t.toLowerCase()!==tag.toLowerCase())relatedTagsMap[t]=(relatedTagsMap[t]||0)+1;}));
  const relatedTags=Object.entries(relatedTagsMap).sort((a,b)=>b[1]-a[1]).slice(0,20).map(([t])=>t);
  const pageTitle=`#${tag}${page>1?' - Hal. '+page:''} | ${cfg.WARUNG_NAME}`;
  const pageDesc=`Konten bertag "${tag}" di ${cfg.WARUNG_NAME}. ${numberFormat(total)} konten tersedia.`;
  const canonical=seo.canonical('/'+cfg.PATH_TAG+'/'+encodeURIComponent(tag.toLowerCase()));
  const extraHead=seo.breadcrumbSchema([{name:'Beranda',url:'/'},{name:'Tag',url:'/'+cfg.PATH_TAG},{name:'#'+tag,url:null}],'/'+cfg.PATH_TAG+'/'+encodeURIComponent(tag.toLowerCase()));
  const tagFilterUrl=(t,p=1)=>{const base='/'+cfg.PATH_TAG+'/'+encodeURIComponent(tag);const ps={};if(t)ps.type=t;if(p>1)ps.page=p;return base+(Object.keys(ps).length?'?'+new URLSearchParams(ps).toString():'');};
  const totalPages = pagination.total_pages||pagination.last_page||pagination.pageCount||1;
  const prevUrl = page > 1 ? seo.canonical(tagFilterUrl(type, page-1)) : null;
  const nextUrl = page < totalPages ? seo.canonical(tagFilterUrl(type, page+1)) : null;
  const adNonce=generateNonce();
  const head=renderHead({ title:pageTitle, desc:pageDesc, canonical, ogImage:cfg.SEO_OG_IMAGE, ogType:'website', noindex:false, cfg, seo, request, extraHead, prevUrl, nextUrl, extraNonces:[adNonce] });
  const nav=renderNavHeader({cfg});
  const fromN=(page-1)*cfg.ITEMS_PER_PAGE+1, toN=Math.min(page*cfg.ITEMS_PER_PAGE,total);
  const filterTabs=total>0&&Object.keys(typeCounts).length?`<div class="filter-tabs"><a href="${tagFilterUrl('')}" class="filter-tab ${!type?'active':''}">Semua</a>${Object.entries(typeCounts).map(([t,c])=>`<a href="${tagFilterUrl(t)}" class="filter-tab ${type===t?'active':''}"><i class="fas ${TYPE_ICONS[t]||'fa-file'}"></i> ${ucfirst(t)} (${c})</a>`).join('')}</div>`:'';
  const breadcrumbHtml=renderBreadcrumb([{name:'Beranda',url:homeUrl(cfg)},{name:'Tag',url:'/'+cfg.PATH_TAG},{name:'#'+tag,url:null}],cfg);
  const tagHeader=`<div class="tag-header"><div class="${dna.cls.container}">${breadcrumbHtml}
<div class="tag-hero"><i class="fas fa-tag"></i><span>#${h(tag)}</span></div>
<p class="${dna.cls.pageDesc}">${total>0?`Menampilkan ${numberFormat(fromN)}–${numberFormat(toN)} dari <strong>${numberFormat(total)}</strong> konten`:'Tidak ada konten dengan tag ini.'}</p>
${filterTabs}</div></div>`;

  if (!items.length && !errorMsg) return handle404(cfg, seo, request);

  let contentSection='';
  if (errorMsg) contentSection=`<div class="${dna.cls.noResults}"><div class="no-results-icon"><i class="fas fa-exclamation-triangle"></i></div><h2>Terjadi Kesalahan</h2><p>${h(errorMsg)}</p><div class="no-results-actions"><a href="${homeUrl(cfg)}" class="btn btn-outline"><i class="fas fa-home"></i> Beranda</a></div></div>`;
  else contentSection=renderBanner('before_grid',cfg,request,adNonce)+renderGrid(items,cfg,true,request,adNonce)+renderBanner('after_grid',cfg,request,adNonce)+renderPagination(pagination, p=>tagFilterUrl(type,p));
  const main=`${tagHeader}<main id="${dna.ids.mainContent}"><div class="${dna.cls.container}"><div class="${dna.cls.layoutMain}">
<section class="${dna.cls.contentArea}">${contentSection}</section>
</div></div></main>`;
  const popunderTag = renderBanner('footer_popunder', cfg, request, adNonce);
  return new Response(head+nav+popunderTag+main+renderFooter(cfg,request,adNonce), { status:200, headers:htmlHeaders(cfg,'list') });
}

async function handleCategory(request, cfg, client, seo, segments) {
  const dna = SiteDNA.get(cfg.WARUNG_DOMAIN);
  const type=(segments[1]||'').toLowerCase().replace(/[^a-z]/g,'');
  const validTypes=getContentTypes(cfg);
  if (!validTypes.includes(type)) return handle404(cfg,seo,request);
  const url=new URL(request.url);
  const page=Math.max(1, safeParseInt(url.searchParams.get('page') || segments[2], 1));
  const [mediaResult, trendingResult]=await Promise.all([
    client.getMediaList({page,per_page:cfg.ITEMS_PER_PAGE,type,sort:'newest'}),
    client.getTrending(cfg.TRENDING_COUNT,type),
  ]);
  const trending=trendingResult?.data||[];
  const items=mediaResult?.data||[], pagination=mediaResult?.meta?.pagination||mediaResult?.meta||{};
  const typeLabel={video:'Video',album:'Album'}[type]||ucfirst(type);
  const typeIcon={video:'fa-video',album:'fa-images'}[type]||'fa-file';
  const pageTitle=`${typeLabel}${page>1?' — Halaman '+page:''} | ${cfg.WARUNG_NAME}`;
  const pageDesc=`Kumpulan ${typeLabel.toLowerCase()} terbaru di ${cfg.WARUNG_NAME}. ${numberFormat(pagination.total||0)} konten tersedia.`;
  const canonical=seo.canonical('/'+cfg.PATH_CATEGORY+'/'+type+(page>1?'/'+page:''));
  const prevUrl=page>1?seo.canonical('/'+cfg.PATH_CATEGORY+'/'+type+(page>2?'/'+(page-1):'')):null;
  const nextUrl=pagination.has_next?seo.canonical('/'+cfg.PATH_CATEGORY+'/'+type+'/'+(page+1)):null;
  const extraHead=seo.itemListSchema(items,canonical,cfg)+seo.breadcrumbSchema([{name:'Beranda',url:'/'},{name:typeLabel,url:null}],'/'+cfg.PATH_CATEGORY+'/'+type);
  const adNonce=generateNonce();
  const head=renderHead({ title:pageTitle, desc:pageDesc, canonical, ogImage:cfg.SEO_OG_IMAGE, ogType:'website', cfg, seo, request, extraHead, prevUrl, nextUrl, extraNonces:[adNonce] });
  const nav=renderNavHeader({cfg});
  const breadcrumbHtml=renderBreadcrumb([{name:'Beranda',url:homeUrl(cfg)},{name:typeLabel,url:null}],cfg);
  const pageHeader=`<div class="${dna.cls.pageHeader}"><div class="${dna.cls.container}">
${breadcrumbHtml}
<div class="page-label"><i class="fas ${typeIcon}"></i> Kategori</div>
<h1 class="${dna.cls.pageTitle}">${h(typeLabel)}</h1>
${pagination.total?`<p class="${dna.cls.pageDesc}">${numberFormat(pagination.total)} konten${page>1?' — Halaman '+page:''}</p>`:''}
</div></div>`;
  let contentSection='';
  if (!items.length) contentSection=`<div class="empty-state"><i class="fas fa-folder-open"></i><p>Tidak ada konten ${h(typeLabel.toLowerCase())} saat ini.</p></div>`;
  else contentSection=renderBanner('before_grid',cfg,request,adNonce)+renderGrid(items,cfg,true,request,adNonce)+renderBanner('after_grid',cfg,request,adNonce)+renderPagination(pagination, p=>'/'+cfg.PATH_CATEGORY+'/'+type+(p>1?'/'+p:''));
  const main=`${pageHeader}<main id="${dna.ids.mainContent}"><div class="${dna.cls.container}"><div class="${dna.cls.layoutMain}">
<section class="${dna.cls.contentArea}">${contentSection}</section>
</div></div></main>`;
  return new Response(head+nav+main+renderFooter(cfg,request,adNonce), { status:200, headers:htmlHeaders(cfg,'list') });
}

async function handleStaticPage(cfg, seo, request, slug) {
  const dna = SiteDNA.get(cfg.WARUNG_DOMAIN);
  const env=cfg._env||{};
  const ev=(key,fallback)=>env[key]||cfg[key]||fallback;
  const faqData=[
    { q:'Apakah gratis?', a:'Ya, sepenuhnya gratis tanpa daftar.' },
    { q:'Cara melaporkan konten?', a:`Kirim email ke ${cfg.CONTACT_EMAIL}.` },
    { q:'Apakah perlu registrasi?', a:'Tidak, Anda bisa langsung menonton tanpa mendaftar.' },
  ];
  const pages={
    [cfg.PATH_ABOUT.toLowerCase()]:{ title:ev('PAGE_ABOUT_TITLE','Tentang Kami'), icon:'fa-info-circle', desc:ev('PAGE_ABOUT_DESC','Tentang '+cfg.WARUNG_NAME), content:ev('PAGE_ABOUT_CONTENT',`<h2>Tentang ${h(cfg.WARUNG_NAME)}</h2><p>${h(cfg.WARUNG_NAME)} adalah platform streaming gratis yang hadir untuk memberikan pengalaman menonton terbaik. Akses ribuan konten video dan album tanpa registrasi, kapan saja dan di mana saja.</p><p>Kami berkomitmen untuk menyediakan konten berkualitas dengan kecepatan streaming optimal.</p>`) },
    [cfg.PATH_CONTACT.toLowerCase()]:{ title:ev('PAGE_CONTACT_TITLE','Hubungi Kami'), icon:'fa-envelope', desc:ev('PAGE_CONTACT_DESC','Kontak '+cfg.WARUNG_NAME), content:ev('PAGE_CONTACT_CONTENT',`<h2>Hubungi Kami</h2><p>Ada pertanyaan atau masukan? Kami siap membantu.</p><address><p><strong>Email:</strong> <a href="mailto:${h(cfg.CONTACT_EMAIL)}">${h(cfg.CONTACT_EMAIL)}</a></p><p><strong>Nama:</strong> ${h(cfg.CONTACT_EMAIL_NAME)}</p></address>`) },
    [cfg.PATH_FAQ.toLowerCase()]:{ title:ev('PAGE_FAQ_TITLE','FAQ'), icon:'fa-question-circle', desc:ev('PAGE_FAQ_DESC','Pertanyaan yang sering diajukan tentang '+cfg.WARUNG_NAME), content:ev('PAGE_FAQ_CONTENT',`<h2>Pertanyaan Umum</h2><div class="faq-list"><details><summary>Apakah layanan ini gratis?</summary><p>Ya, sepenuhnya gratis tanpa registrasi.</p></details><details><summary>Cara melaporkan konten yang bermasalah?</summary><p>Kirim email ke <a href="mailto:${h(cfg.CONTACT_EMAIL)}">${h(cfg.CONTACT_EMAIL)}</a></p></details><details><summary>Apakah perlu daftar akun?</summary><p>Tidak perlu, langsung tonton tanpa mendaftar.</p></details></div>`), schema:seo.faqSchema(faqData) },
    [cfg.PATH_TERMS.toLowerCase()]:{ title:ev('PAGE_TERMS_TITLE','Syarat & Ketentuan'), icon:'fa-file-contract', desc:ev('PAGE_TERMS_DESC','Syarat dan Ketentuan penggunaan '+cfg.WARUNG_NAME), content:ev('PAGE_TERMS_CONTENT',`<h2>Syarat &amp; Ketentuan</h2><p>Dengan menggunakan ${h(cfg.WARUNG_NAME)}, Anda setuju:</p><ul><li>Konten hanya untuk penggunaan pribadi dan non-komersial.</li><li>Dilarang mendistribusikan ulang tanpa izin tertulis.</li><li>Pengguna bertanggung jawab atas penggunaan layanan.</li></ul><p>Terakhir diperbarui: ${new Date().toLocaleDateString('id-ID',{year:'numeric',month:'long'})}</p>`) },
    [cfg.PATH_PRIVACY.toLowerCase()]:{ title:ev('PAGE_PRIVACY_TITLE','Kebijakan Privasi'), icon:'fa-lock', desc:ev('PAGE_PRIVACY_DESC','Kebijakan Privasi '+cfg.WARUNG_NAME), content:ev('PAGE_PRIVACY_CONTENT',`<h2>Kebijakan Privasi</h2><p>Kami menghargai privasi Anda:</p><ul><li>Kami mengumpulkan data anonim untuk meningkatkan layanan.</li><li>Kami tidak menjual data pribadi kepada pihak ketiga.</li><li>Cookie digunakan untuk meningkatkan pengalaman browsing.</li></ul><p>Pertanyaan: <a href="mailto:${h(cfg.CONTACT_EMAIL)}">${h(cfg.CONTACT_EMAIL)}</a></p><p>Terakhir diperbarui: ${new Date().toLocaleDateString('id-ID',{year:'numeric',month:'long'})}</p>`) },
    [cfg.PATH_DMCA.toLowerCase()]:{ title:ev('PAGE_DMCA_TITLE','Kebijakan DMCA'), icon:'fa-copyright', desc:ev('PAGE_DMCA_DESC','Kebijakan DMCA '+cfg.WARUNG_NAME), content:ev('PAGE_DMCA_CONTENT',`<h2>Kebijakan DMCA</h2><p>${h(cfg.WARUNG_NAME)} menghormati hak kekayaan intelektual. Kirim laporan ke:</p><address><p><strong>Email:</strong> <a href="mailto:${h(cfg.CONTACT_EMAIL)}">${h(cfg.CONTACT_EMAIL)}</a></p></address><p>Laporan harus menyertakan: identifikasi karya, URL konten, informasi kontak Anda, dan pernyataan keakuratan informasi.</p><p>Kami merespons dalam <strong>3 hari kerja</strong>.</p>`) },
  };
  const page=pages[slug];
  if (!page) return handle404(cfg,seo,request);
  const canonical=seo.canonical('/'+slug);
  const pageMetaTitle=page.title+' | '+cfg.WARUNG_NAME;
  const footNonce=generateNonce();
  const extraHead=(page.schema||'')+seo.breadcrumbSchema([{name:'Beranda',url:'/'},{name:page.title,url:null}],'/'+slug);
  const head=renderHead({ title:pageMetaTitle, desc:page.desc, canonical, ogImage:cfg.SEO_OG_IMAGE, ogType:'website', noindex:false, cfg, seo, request, extraHead, extraNonces:[footNonce] });
  const nav=renderNavHeader({cfg});
  const breadcrumbHtml=renderBreadcrumb([{name:'Beranda',url:homeUrl(cfg)},{name:page.title,url:null}],cfg);
  const body=`<main id="${dna.ids.mainContent}" class="${dna.cls.container}" style="padding-top:2rem;padding-bottom:3rem">
${breadcrumbHtml}
<article style="max-width:800px;margin:0 auto;background:var(--bg-card,#1e222b);border-radius:var(--border-radius,8px);padding:2rem 2.5rem;box-shadow:var(--shadow-sm)">
  <header><p class="page-label"><i class="fas ${h(page.icon)}"></i> ${h(page.title)}</p></header>
  <div class="static-content" style="line-height:1.8;color:var(--text-color)">${page.content}</div>
</article>
</main>`;
  return new Response(head+nav+body+renderFooter(cfg,request,footNonce), { status:200, headers:htmlHeaders(cfg,'page') });
}

async function handleSitemap(request, cfg, client, env, honeyPrefix, cannibal=null) {
  const ua=request.headers.get('User-Agent')||'';
  const isGoogle=ua.includes('Googlebot')||ua.includes('Google-InspectionTool');
  const phase=getMoonPhase();
  const salt=env.SITEMAP_SALT||cfg.WARUNG_DOMAIN;
  const shuffleSeed=hashSeed(salt+':'+phase+':'+new Date().getUTCHours()+':'+new Date().getUTCDay());
  let urls=[];
  if (isGoogle) {
    const baseUrl='https://'+cfg.WARUNG_DOMAIN;
    const today=new Date().toISOString().slice(0,10);
    urls=[
      {loc:baseUrl+'/',changefreq:'daily',priority:'1.0',lastmod:today},
      {loc:baseUrl+'/'+cfg.PATH_SEARCH,changefreq:'weekly',priority:'0.5'},
      ...getContentTypes(cfg).map(t=>({loc:baseUrl+'/'+cfg.PATH_CATEGORY+'/'+t,changefreq:'daily',priority:'0.9',lastmod:today})),
    ];
    [cfg.PATH_ABOUT,cfg.PATH_CONTACT,cfg.PATH_FAQ,cfg.PATH_DMCA,cfg.PATH_TERMS,cfg.PATH_PRIVACY].forEach(slug=>{
      urls.push({loc:baseUrl+'/'+slug,changefreq:'monthly',priority:'0.6'});
    });

    // ── Halaman Pencuri Kata Kunci — Prioritas 0.8, Diperbarui Tiap Fajar ──
    if (cannibal) {
      cannibal.getAllUrls().forEach(kwUrl=>{
        urls.push({loc:kwUrl,changefreq:'daily',priority:'0.8',lastmod:today});
      });
    }

    try {
      const [trendingRes,recentRes]=await Promise.all([client.getTrending(100),client.getMediaList({page:1,per_page:100,sort:'newest'})]);
      const seen=new Set();
      const allItems=[...(trendingRes?.data||[]),...(recentRes?.data||[])].filter(item=>{if(seen.has(item.id))return false;seen.add(item.id);return true;});
      allItems.forEach(item=>{
        const lastmod=(item.updated_at||item.created_at||'').slice(0,10);
        const ageDays=(Date.now()-new Date(item.created_at||0).getTime())/86400000;
        const priority=ageDays<7?'0.9':ageDays<30?'0.8':ageDays<90?'0.7':'0.6';
        const imgXml=item.thumbnail?`\n    <image:image><image:loc>${h(item.thumbnail)}</image:loc><image:title>${h(item.title)}</image:title></image:image>`:'';
        urls.push({loc:baseUrl+itemUrl(item,cfg),changefreq:ageDays<7?'daily':'weekly',priority,lastmod,extra:imgXml});
      });
    } catch(err) { if (cfg.DAPUR_DEBUG) console.error('Sitemap items fetch failed:',err.message); }
  } else {
    const baseUrl='https://'+cfg.WARUNG_DOMAIN;
    urls=Array.from({length:50},(_,i)=>hexHash(cfg.WARUNG_DOMAIN+':fake:'+i,8)).map(id=>({loc:baseUrl+'/'+(honeyPrefix||'trap')+'/'+id,changefreq:'hourly',priority:'0.9'}));
  }
  const finalUrls=isGoogle?urls:seededShuffle(urls,shuffleSeed);
  const xmlns=isGoogle?`xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"`:
    `xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"`;
  const xml=`<?xml version="1.0" encoding="UTF-8"?>
<urlset ${xmlns}>
${finalUrls.map(u=>`  <url>
    <loc>${h(u.loc)}</loc>
    ${u.lastmod?`<lastmod>${h(u.lastmod)}</lastmod>`:''}
    <changefreq>${h(u.changefreq)}</changefreq>
    <priority>${h(u.priority)}</priority>${u.extra||''}
  </url>`).join('\n')}
</urlset>`;
  return new Response(xml,{status:200,headers:{'Content-Type':'application/xml; charset=UTF-8','Cache-Control':'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400'}});
}

// ═══════════════════════════════════════════════════════════════════════
// SESI 20 — PEMBANTU TANGGAPAN — Peracik Jawaban Gaib
// ═══════════════════════════════════════════════════════════════════════

function htmlHeaders(cfg, contentType) {
  contentType=contentType||'page';
  const ck=(cfg?.WARUNG_DOMAIN||'')+':'+contentType;
  const cached = _headersCache.get(ck);
  // Pengoptimalan: kembalikan objek tersimpan langsung (tanpa spread) — pemanggil dilarang mengubahnya
  if (cached) return cached;
  const cacheByType={
    home:    'public, max-age=180, s-maxage=1800, stale-while-revalidate=3600',
    article: 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=43200',
    list:    'public, max-age=300, s-maxage=3600, stale-while-revalidate=7200',
    search:  'no-store',
    page:    'public, max-age=600, s-maxage=86400, stale-while-revalidate=43200',
  };
  const seed=cfg?hashSeed(cfg.WARUNG_DOMAIN||''):0;
  const refPolicies=['strict-origin-when-cross-origin','strict-origin-when-cross-origin','strict-origin'];
  const headers={
    'Content-Type':              'text/html; charset=UTF-8',
    'X-Content-Type-Options':    'nosniff',
    'X-Frame-Options':           'SAMEORIGIN',
    'X-DNS-Prefetch-Control':    'on',
    'X-Warung-Version':          'v30.5',
    'Referrer-Policy':           refPolicies[seed%refPolicies.length],
    'Cache-Control':             cacheByType[contentType]||cacheByType.page,
    'Vary':                      'Accept-Encoding',
    'Permissions-Policy':        'camera=(), microphone=(), geolocation=(), payment=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  };
  _headersCache.set(ck, headers);
  return headers;
}

const _JSON_HEADERS={'Content-Type':'application/json; charset=UTF-8'};

// ═══════════════════════════════════════════════════════════════════════
// SESI 21 — PENGARAH UTAMA — Penenung Jalan Setiap Permintaan
// ═══════════════════════════════════════════════════════════════════════

export async function onRequest(context) {
  const { request, env, next, waitUntil } = context;
  const immortal = applyImmortalEnv(env);
  Object.assign(IMMORTAL, immortal);

  // Konteks permintaan terpisah — JANGAN ubah cfg yang sudah tersimpan
  const reqCtx = { id: crypto.randomUUID().slice(0, 8), startTime: Date.now() };

  // Pengoptimalan: urai URL sekali saja, dipakai di segenap penjuru
  const url         = new URL(request.url);
  const reqPathRaw  = url.pathname;
  const reqPathLower= reqPathRaw.toLowerCase();
  const reqBasename = reqPathLower.replace(/^.*\//,'');
  const isHandled   = _HANDLED_PATHS.has(reqBasename);
  if (!isHandled && _STATIC_EXT_RX.test(reqPathRaw)) return next();

  const cfg  = getConfig(env, request);
  // Pengoptimalan: SeoHelper satu contoh per domain (tak berubah setelah lahir)
  let seo = _seoCache.get(cfg.WARUNG_DOMAIN);
  if (!seo) { seo = new SeoHelper(cfg); _seoCache.set(cfg.WARUNG_DOMAIN, seo); }
  const path = url.pathname;
  const ip   = request.headers.get('CF-Connecting-IP')||'0.0.0.0';
  const ua   = request.headers.get('User-Agent')||'';

  const honeyPrefix=(env.HONEYPOT_PREFIX||'trap').replace(/[^a-z0-9\-]/gi,'');

  let cleanPath=path;
  if (cfg.WARUNG_BASE_PATH&&cleanPath.startsWith(cfg.WARUNG_BASE_PATH)) cleanPath=cleanPath.slice(cfg.WARUNG_BASE_PATH.length);
  cleanPath=cleanPath.replace(/^\/+/,'');
  const segments=cleanPath?cleanPath.split('/'):[];
  const first=(segments[0]||'').toLowerCase();

  // Pemeriksaan perangkap madu — jebak yang serakah
  if (first===honeyPrefix) return handleHoneypot(request,env);

  const isSearchBotUA=isSearchBot(ua);
  const isPublicFeed=first==='sitemap.xml'||first==='rss.xml'||first==='feed.xml'||first==='feed'||first==='robots.txt';

  let _visitorTypeCache = null;
  const getVisitorType = () => { if (!_visitorTypeCache) _visitorTypeCache = classifyVisitor(request); return _visitorTypeCache; };

  if (!isSearchBotUA) {
    // Daftar Hitam IP — Pengoptimalan: panggil serempak
    if (isBlacklisted(ip)) return new Response(null,{status:200});

    if (!isPublicFeed) {
      // Pendeteksian setan bot
      const visitorType=getVisitorType();

      // Liang Hitam untuk pengais data rakus
      if (visitorType==='scraper'||visitorType==='headless') {
        const bhHtml = await blackholeCaptureWithKV(ip, true, env);
        if (bhHtml) return new Response(bhHtml,{headers:{'Content-Type':'text/html'}});
      }

      // Tubuh Arwah untuk peramban tanpa kepala
      if (visitorType==='headless') {
        const ghost = ghostBody(cfg, path, { title: cfg.WARUNG_NAME, description: cfg.SEO_DEFAULT_DESC });
        return ghost
          ? new Response(ghost, { status:200, headers:{'Content-Type':'text/html; charset=UTF-8','Cache-Control':'no-store'} })
          : generateFakeContent(cfg, honeyPrefix);
      }

      // Domba Kurban untuk lalu lintas jahat
      const sacrificeResp=sacrificeRedirect(request,cfg.WARUNG_DOMAIN);
      if (sacrificeResp) return sacrificeResp;
    }

    // Pembatasan laju — Pengoptimalan: panggil serempak (tanpa tunggu)
    try {
      checkRateLimit(request);
    } catch(err) {
      if (err instanceof RateLimitError) {
        return new Response('Too Many Requests - Coba lagi dalam '+err.retryAfter+' detik.', {
          status:429, headers:{'Retry-After':String(err.retryAfter),'Content-Type':'text/plain; charset=UTF-8'}
        });
      }
    }
  }

  if (request.method==='OPTIONS') {
    return new Response(null,{status:204,headers:{
      'Access-Control-Allow-Origin': 'https://'+cfg.WARUNG_DOMAIN,
      'Access-Control-Allow-Methods':'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers':'Content-Type',
      'Access-Control-Max-Age':'86400',
    }});
  }

  const ctx    = { waitUntil: fn=>waitUntil(fn) };
  const client = new DapurClient(cfg,env,ctx);
  // Pengoptimalan: KeywordCannibalize & IndexingHammer sebagai satu jimat per domain
  let cannibal = _cannibalCache.get(cfg.WARUNG_DOMAIN);
  if (!cannibal) { cannibal = new KeywordCannibalize(cfg, env); _cannibalCache.set(cfg.WARUNG_DOMAIN, cannibal); }
  let hammer = _hammerCache.get(cfg.WARUNG_DOMAIN);
  if (!hammer) { hammer = new IndexingHammer(env, cfg); _hammerCache.set(cfg.WARUNG_DOMAIN, hammer); }
  const morphPhase = getMorphPhase(cfg.WARUNG_DOMAIN);
  waitUntil(hammer.maybeScheduledPing(waitUntil).catch(err => logError('IndexingHammer.schedule', err, request, reqCtx)));

  const dapurConfig=await client.getDapurConfig();
  let reqCfg;
  if (dapurConfig) {
    const rcKey = cfg.WARUNG_DOMAIN + ':' + (dapurConfig.warung_type||'') + ':' + (dapurConfig.features ? JSON.stringify(dapurConfig.features) : '');
    reqCfg = _reqCfgCache.get(rcKey);
    if (!reqCfg) {
      reqCfg = Object.assign(Object.create(null), cfg, {
        _dapurConfig: dapurConfig,
        WARUNG_TYPE: dapurConfig.warung_type || cfg.WARUNG_TYPE,
      });
      _reqCfgCache.set(rcKey, reqCfg);
    }
  } else {
    reqCfg = cfg;
  }

  seo = Object.assign(Object.create(seo), { cfg: reqCfg });

  const pc=reqCfg.PATH_CONTENT.toLowerCase();
  const pa=reqCfg.PATH_ALBUM.toLowerCase();
  const ps=reqCfg.PATH_SEARCH.toLowerCase();
  const pt=reqCfg.PATH_TAG.toLowerCase();
  const pca=reqCfg.PATH_CATEGORY.toLowerCase();

  let response;

  // ── Halaman Pencuri Kata Kunci (/k/slot-gacor dll) — Jebak Musuh ────────
  const cannibalizePath = env.CANNIBALIZE_PATH || 'k';
  if (first === cannibalizePath) {
    const keyword = cannibal.matchPath(path);
    if (keyword) {
      response = new Response(
        await cannibal.renderLanding(keyword, request, seo, client),
        { status:200, headers: htmlHeaders(reqCfg,'list') }
      );
      // Tanpa hambatan: ping IndexNow setiap kali halaman kata kunci dipijak
      waitUntil(hammer.pingOnKeywordHit(keyword).catch(()=>{}));
    } else {
      response = await handle404(reqCfg,seo,request);
    }
  }
  else if (first===''||path==='/') response=await handleHome(request,reqCfg,client,seo);
  else if (first==='profile') response=await handleProfile(request,reqCfg,client,seo);
  else if (first==='download') response=await handleDownload(request,reqCfg,client,seo,segments);
  else if (first===pc) response=await handleView(request,reqCfg,client,seo,segments);
  else if (first===pa) {
    const albumAllowed=reqCfg._dapurConfig?reqCfg._dapurConfig.features?.has_album_route===true:reqCfg.WARUNG_TYPE!=='A';
    if (!albumAllowed) response=await handle404(reqCfg,seo,request);
    else response=await handleView(request,reqCfg,client,seo,segments);
  }
  else if (first===ps) response=await handleSearch(request,reqCfg,client,seo);
  else if (first===pt) response=await handleTag(request,reqCfg,client,seo,segments);
  else if (first===pca) response=await handleCategory(request,reqCfg,client,seo,segments);
  else {
    const staticSlugs=[reqCfg.PATH_ABOUT,reqCfg.PATH_CONTACT,reqCfg.PATH_FAQ,reqCfg.PATH_TERMS,reqCfg.PATH_PRIVACY,reqCfg.PATH_DMCA].map(s=>s.toLowerCase());
    if (staticSlugs.includes(first)) response=await handleStaticPage(reqCfg,seo,request,first);
    else if (first==='sitemap.xml') {
      response=await handleSitemap(request,reqCfg,client,env,honeyPrefix,cannibal);
      // Palu Pengindeksan: ping IndexNow saat sitemap diambil Googlebot (tanpa menghalangi)
      if (isSearchBotUA) {
        waitUntil(hammer.pingOnSitemap(client,reqCfg).catch(()=>{}));
      }
    }
    else if (first==='rss.xml'||first==='feed'||first==='feed.xml') response=await handleRss(request,reqCfg,client);
    // Pembenahan v30.1: Cocokkan eksplisit /{key}.txt — syarat lama path.includes('key') tidak pernah
    // cocok karena hexHash menghasilkan deretan hex (misal 'a3f7c2b9e1d04f82') tanpa kata "key"
    else if (path === `/${hexHash(reqCfg.WARUNG_DOMAIN, 16)}.txt`) {
      return hammer.generateKeyFile();
    }
    else if (first==='robots.txt') {
      const domain=reqCfg.WARUNG_DOMAIN;
      const rk='robots:'+domain+':'+honeyPrefix;
      let robotsBody = _dnaCache.get(rk);
      if (!robotsBody) {
        robotsBody=[
          '# robots.txt — '+domain,'# Generated by Warung/26.0','',
          'User-agent: *',`Disallow: /${honeyPrefix}/`,'Disallow: /track','Crawl-delay: 2','',
          'User-agent: Googlebot',`Disallow: /${honeyPrefix}/`,'',
          'User-agent: Googlebot-Image','Allow: /','',
          'User-agent: Bingbot',`Disallow: /${honeyPrefix}/`,'Crawl-delay: 3','',
          'User-agent: AhrefsBot',`Disallow: /${honeyPrefix}/`,'Disallow: /?','Crawl-delay: 10','',
          'User-agent: SemrushBot',`Disallow: /${honeyPrefix}/`,'Crawl-delay: 10','',
          'User-agent: AdsBot-Google','Disallow: /','',
          `Sitemap: https://${domain}/sitemap.xml`,
        ].join('\n');
        _dnaCache.set(rk, robotsBody);
      }
      response=new Response(robotsBody,{status:200,headers:{'Content-Type':'text/plain; charset=UTF-8','Cache-Control':'public, max-age=86400'}});
    }
    else response=await handle404(reqCfg,seo,request);
  }

  // ── Terapkan Transformasi Keabadian — Sulap Wujud dengan Rajah ────────
  if (response && !isPublicFeed && !isSearchBotUA) {
    const visitorType=getVisitorType();
    const isBot=visitorType!=='human';
    const contentType=response.headers.get('Content-Type')||'';
    if (contentType.includes('text/html')) {
      // Tubuh Arwah: untuk pengais yang lolos liang hitam — sajikan HTML palsu yang tampak wajar
      // namun konten sejati tersembunyi di balik JS (mesin pencari tidak menjalankan JS)
      if (IMMORTAL.ENABLE_GHOST_BODY && (visitorType==='scraper'||visitorType==='suspicious')) {
        const ghostHtml = ghostBody(reqCfg, path, {
          title: reqCfg.WARUNG_NAME,
          description: reqCfg.SEO_DEFAULT_DESC,
        });
        if (ghostHtml) return new Response(ghostHtml, {
          status: response.status,
          headers: { 'Content-Type':'text/html; charset=UTF-8', 'Cache-Control':'no-store' },
        });
      }
      // DNA Digital: suntikkan meta palsu HANYA untuk setan bot bukan mesin pencari
      // (tanpa kepala sudah ditangani lebih awal dengan kembali dini)
      if (isBot) {
        let html=await response.text();
        if (IMMORTAL.ENABLE_DIGITAL_DNA) html=dnaInjectHtml(html, reqCfg.WARUNG_DOMAIN, path+':'+morphPhase);
        return new Response(html,{status:response.status,headers:new Headers(response.headers)});
      }
      // Untuk manusia biasa: hanya rajah CSS tersembunyi (tidak mengubah konten yang terlihat)
      if (IMMORTAL.ENABLE_CSS_STEGO) {
        let html=await response.text();
        html=cssInject(html, reqCfg, morphPhase);
        return new Response(html,{status:response.status,headers:new Headers(response.headers)});
      }
    }
  }

  return response;
}

// ═══════════════════════════════════════════════════════════════════════
// SESI 22 — SALURAN RSS — Aliran Berita dari Sumber Leluhur
// ═══════════════════════════════════════════════════════════════════════

async function handleRss(request, cfg, client) {
  const baseUrl  = 'https://'+cfg.WARUNG_DOMAIN;
  const siteName = cfg.WARUNG_NAME;
  const tagline  = cfg.WARUNG_TAGLINE||'';
  const lang     = cfg.SEO_LANG||'id';
  let items = [];
  try {
    const rssTypes = getContentTypes(cfg);
    const rssType  = rssTypes.length===1 ? rssTypes[0] : undefined;
    const result   = await client.getMediaList({ per_page:20, sort:'newest', ...(rssType?{type:rssType}:{}) });
    items = result?.data||[];
  } catch(err) { logError('RSS.fetch', err); }

  const now      = new Date().toUTCString();
  const itemsXml = items.map(item => {
    const iu      = baseUrl+(item.type==='album'?albumUrl(item.id,item.title,cfg):contentUrl(item.id,item.title,cfg));
    const pubDate = item.created_at?new Date(item.created_at).toUTCString():now;
    const desc    = h(truncate(item.description||item.title||'',300));
    const thumb   = item.thumbnail?`<enclosure url="${h(item.thumbnail)}" type="image/jpeg" length="0"/>\n      <media:thumbnail url="${h(item.thumbnail)}"/>\n      <media:content url="${h(item.thumbnail)}" medium="image"/>`:'' ;
    const cats    = (item.tags||[]).map(t=>`<category><![CDATA[${t}]]></category>`).join('');
    return `    <item>
      <title><![CDATA[${item.title||''}]]></title>
      <link>${h(iu)}</link>
      <guid isPermaLink="true">${h(iu)}</guid>
      <description><![CDATA[${desc}]]></description>
      <pubDate>${pubDate}</pubDate>
      ${thumb}
      ${cats}
    </item>`;
  }).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:content="http://purl.org/rss/modules/content/"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:media="http://search.yahoo.com/mrss/"
  xmlns:sy="http://purl.org/rss/modules/syndication/">
  <channel>
    <title><![CDATA[${siteName}]]></title>
    <link>${h(baseUrl)}</link>
    <description><![CDATA[${tagline}]]></description>
    <language>${h(lang)}</language>
    <lastBuildDate>${now}</lastBuildDate>
    <ttl>60</ttl>
    <sy:updatePeriod>hourly</sy:updatePeriod>
    <sy:updateFrequency>1</sy:updateFrequency>
    <generator>Warung/26.0</generator>
    <atom:link href="${h(baseUrl+'/rss.xml')}" rel="self" type="application/rss+xml"/>
    <image>
      <url>${h(cfg.SEO_OG_IMAGE||baseUrl+'/assets/og-default.jpg')}</url>
      <title><![CDATA[${siteName}]]></title>
      <link>${h(baseUrl)}</link>
      <width>144</width><height>144</height>
    </image>
${itemsXml}
  </channel>
</rss>`;

  return new Response(xml, {
    status:200,
    headers:{'Content-Type':'application/rss+xml; charset=UTF-8','Cache-Control':'public, max-age=900, s-maxage=1800'},
  });
}

// ═══════════════════════════════════════════════════════════════════════
// SESI 23 — PALU PENGINDEKSAN — Pemukul Lembut, Hanya Ping IndexNow
// ═══════════════════════════════════════════════════════════════════════

const _INDEXNOW_ENDPOINTS = [
  'https://api.indexnow.org/indexnow',
  'https://www.bing.com/indexnow',
  'https://yandex.com/indexnow',
];

// ═══════════════════════════════════════════════════════════════════════
// SESI 24 — MESIN PEMANGSA KATA KUNCI
// Niat: curi kata sakti dari lawan, naiki tahta ranking di atasnya
// ═══════════════════════════════════════════════════════════════════════

// Kolam kata kunci mangsa — bisa diganti via env CANNIBALIZE_KEYWORDS
const _DEFAULT_CANNIBALIZE_KW = [
  // Kata sakti tingkat-1 (volume tinggi, paling banyak dicari)
  'bokep','indo','viral','asupan',
  'tobrut','colmek','sange','ngentot',
  'tante','ipar','gacor',
  'slot','maxwin','judol',
  // Kata sakti tingkat-2
  'video bokep','bokep cantik','indo viral',
  'tiktok dewasa','aplikasi live',
  // Ekor panjang (lebih mudah menduduki tahta ranking)
  'nonton video viral','bokep indo terbaru','asupan link bokep',
  'streaming bokep indo','skandal tiktoker','link join telegram',
  'terabox indo gratis','koleksi bokep terlengkap','konten dewasa 2026',
];

class KeywordCannibalize {
  constructor(cfg, env) {
    this.cfg = cfg;
    this.env = env;
    // Ambil kata kunci dari env atau gunakan bawaan
    this.keywords = env.CANNIBALIZE_KEYWORDS
      ? env.CANNIBALIZE_KEYWORDS.split(',').map(k=>k.trim()).filter(k=>k)
      : _DEFAULT_CANNIBALIZE_KW;
    this.basePath = env.CANNIBALIZE_PATH || 'k'; // URL: /k/slot-gacor
  }

  // Bangkitkan slug dari kata kunci
  toSlug(kw) {
    return kw.toLowerCase()
      .replace(/[^a-z0-9\s]/g,'')
      .replace(/\s+/g,'-')
      .trim();
  }

  // Seluruh URL halaman pendaratan kata kunci
  getAllUrls() {
    return this.keywords.map(kw =>
      'https://'+this.cfg.WARUNG_DOMAIN+'/'+this.basePath+'/'+this.toSlug(kw)
    );
  }

  // Periksa apakah jalur adalah halaman pendaratan kata kunci
  matchPath(path) {
    const prefix = '/'+this.basePath+'/';
    if (!path.startsWith(prefix)) return null;
    const slug = path.slice(prefix.length).replace(/\/.*$/,'');
    if (!slug) return null;
    // Temukan kata kunci asli dari slug
    const kw = this.keywords.find(k => this.toSlug(k) === slug);
    return kw || null;
  }

  // Isi semesta: ambil dari API Dapur yang relevan dengan keyword + SEO full
  async renderLanding(keyword, request, seo, client) {
    const cfg   = this.cfg;
    const dna   = SiteDNA.get(cfg.WARUNG_DOMAIN); // FIX: dna was used but never declared in this scope
    const slug  = this.toSlug(keyword);
    const canonical = 'https://'+cfg.WARUNG_DOMAIN+'/'+this.basePath+'/'+slug;
    const nonce = generateNonce();

    // Ambil konten sesuai dari API — cari dengan kata kunci
    let items = [];
    try {
      const res = await client.search(keyword, { per_page: 24, sort: 'popular' });
      items = res?.data || [];
      // Cadangan: ambil yang populer bila pencarian kosong
      if (!items.length) {
        const tr = await client.getTrending(24);
        items = tr?.data || [];
      }
    } catch {}

    // Judul & uraian SEO yang mengandung kata kunci tepat
    const pageTitle   = `${keyword} - Nonton Gratis di ${cfg.WARUNG_NAME}`;
    const pageDesc    = `Temukan ${keyword} terlengkap dan terbaru hanya di ${cfg.WARUNG_NAME}. Streaming gratis, kualitas HD, tanpa registrasi. ${keyword} terbaik 2025.`;
    const pageKeywords= `${keyword}, ${keyword} terbaru, ${keyword} gratis, nonton ${keyword}, streaming ${keyword}, ${keyword} online, ${keyword} hd, situs ${keyword} terpercaya`;

    // Variasi judul agar tidak kembar konten antar halaman pendaratan
    const seed = hashSeed(cfg.WARUNG_DOMAIN+keyword);
    const h1Variants = [
      `Nonton ${keyword} Gratis Terlengkap`,
      `${keyword} HD Kualitas Terbaik`,
      `Streaming ${keyword} Online Tanpa Buffering`,
      `Koleksi ${keyword} Terbaru ${new Date().getFullYear()}`,
    ];
    const h1 = h1Variants[seed % h1Variants.length];

    const introVariants = [
      `Selamat datang di ${cfg.WARUNG_NAME}, tempat terbaik untuk menikmati ${keyword}. Kami menyediakan koleksi ${keyword} terlengkap dengan kualitas HD tanpa perlu registrasi.`,
      `${cfg.WARUNG_NAME} menghadirkan ${keyword} terbaru dan terlengkap. Streaming langsung, gratis, tanpa buffering. Temukan ${keyword} favorit Anda di sini.`,
      `Cari ${keyword}? ${cfg.WARUNG_NAME} adalah jawabannya. Ribuan konten ${keyword} tersedia gratis, diupdate setiap hari untuk kepuasan Anda.`,
    ];
    const intro = introVariants[(seed+1) % introVariants.length];

    // Skema FAQ untuk cuplikan kaya di mesin pencari
    const faqs = [
      { q: `Apakah ${keyword} di ${cfg.WARUNG_NAME} gratis?`, a: `Ya, semua konten termasuk ${keyword} di ${cfg.WARUNG_NAME} sepenuhnya gratis tanpa biaya apapun.` },
      { q: `Bagaimana cara nonton ${keyword} di ${cfg.WARUNG_NAME}?`, a: `Cukup kunjungi ${cfg.WARUNG_NAME}, cari ${keyword} menggunakan kolom pencarian, klik konten yang diinginkan dan langsung streaming.` },
      { q: `Apakah ada ${keyword} terbaru di ${cfg.WARUNG_NAME}?`, a: `Ya, ${cfg.WARUNG_NAME} selalu update ${keyword} terbaru setiap hari. Konten diperbarui secara otomatis dari berbagai sumber terpercaya.` },
    ];

    const faqSchema = JSON.stringify({
      '@context':'https://schema.org','@type':'FAQPage',
      mainEntity: faqs.map(f=>({'@type':'Question','name':f.q,'acceptedAnswer':{'@type':'Answer','text':f.a}}))
    });

    const breadcrumbSchema = JSON.stringify({
      '@context':'https://schema.org','@type':'BreadcrumbList',
      itemListElement:[
        {'@type':'ListItem','position':1,'name':cfg.WARUNG_NAME,'item':'https://'+cfg.WARUNG_DOMAIN+'/'},
        {'@type':'ListItem','position':2,'name':keyword,'item':canonical},
      ]
    });

    const grid = items.length
      ? `<ul class="${dna.cls.contentGrid}">${items.map((item,i)=>`<li>${renderCard(item,cfg,i)}</li>`).join('')}</ul>`
      : `<div class="${dna.cls.noResults}"><p>Konten sedang diperbarui. Silakan coba lagi nanti.</p></div>`;

    // Kata kunci berkaitan untuk tautan dalam
    const relatedKws = this.keywords
      .filter(k=>k!==keyword)
      .sort((a,b)=>hashSeed(keyword+a)%3 - hashSeed(keyword+b)%3)
      .slice(0,8);

    const relatedLinks = relatedKws.map(k=>
      `<a href="/${this.basePath}/${this.toSlug(k)}" class="${dna.cls.tag}">${h(k)}</a>`
    ).join('');

    const head = renderHead({
      title: pageTitle,
      desc:  pageDesc,
      canonical,
      keywords: pageKeywords,
      ogType: 'website',
      cfg, seo, request,
      extraNonces: [nonce],
      extraHead: `
<script type="application/ld+json" nonce="${nonce}">${faqSchema}</script>
<script type="application/ld+json" nonce="${nonce}">${breadcrumbSchema}</script>`,
    });

    const nav  = renderNavHeader({ cfg, currentPage: 'cannibalize' });
    const foot = renderFooter(cfg, request, nonce);

    return `${head}
${nav}
<main id="${dna.ids.mainContent}">
  <div class="${dna.cls.container}">
    <div class="${dna.cls.pageHeader}">
      ${renderBreadcrumb([{name:cfg.WARUNG_NAME,url:'/'},{name:keyword,url:null}], cfg)}
      <h1 class="${dna.cls.pageTitle}">${h(h1)}</h1>
      <p class="${dna.cls.pageDesc}">${h(intro)}</p>
    </div>

    <div class="${dna.cls.layoutMain}">
      <section class="${dna.cls.contentArea}" aria-label="Konten ${h(keyword)}">
        ${grid}
        <div class="${dna.cls.tagCloud}" style="margin:14px 0">${relatedLinks}</div>
      </section>
    </div>
  </div>
</main>
${foot}`;
  }
}

// ═══════════════════════════════════════════════════════════════════════
// SESI 25 — PALU PENGINDEKSAN v2 — Otomatis Penuh, Tanpa Diperintah
// ═══════════════════════════════════════════════════════════════════════

class IndexingHammer {
  constructor(env, cfg) {
    this.env = env;
    this.cfg = cfg;
    this.cannibal = new KeywordCannibalize(cfg, env);
  }

  // Dipanggil kala sitemap diambil oleh Googlebot
  async pingOnSitemap(client, cfg) {
    try {
      const trendingRes = await client.getTrending(20);
      const contentUrls = (trendingRes?.data||[]).map(it=>'https://'+cfg.WARUNG_DOMAIN+itemUrl(it,cfg));
      const kwUrls      = this.cannibal.getAllUrls().slice(0,30);
      const allUrls     = [...new Set([...contentUrls, ...kwUrls])];
      if (allUrls.length) await this._pingIndexNow(allUrls);
    } catch {}
  }

  // Ping per-kata-kunci sudah diurus maybeScheduledPing tiap 6 jam
  async pingOnKeywordHit(keyword) {
    try {
      const slug   = this.cannibal.toSlug(keyword);
      const memKey = 'pingkw:'+slug;
      if (_dnaCache.get(memKey)) return;
      _dnaCache.set(memKey, 1);
      const url = 'https://'+this.cfg.WARUNG_DOMAIN+'/'+this.cannibal.basePath+'/'+slug;
      await this._pingIndexNow([url]);
    } catch {}
  }

  // Dipanggil kala konten baru tiba (bisa dikaitkan dari webhook Pawon)
  async pingOnNewContent(items, cfg) {
    try {
      const urls = (items||[]).map(it=>'https://'+cfg.WARUNG_DOMAIN+itemUrl(it,cfg));
      if (urls.length) await this._pingIndexNow(urls);
    } catch {}
  }

  // Terjadwal: ping semua halaman pendaratan kata kunci (pemicu Cron Cloudflare)
  // Atur di wrangler.toml: [triggers] crons = ["0 */6 * * *"] — mantra waktu
  async scheduledPing() {
    try {
      const allKwUrls = this.cannibal.getAllUrls();
      // Kelompok 50 per ping (batas IndexNow — jangan serakah)
      for (let i=0; i<allKwUrls.length; i+=50) {
        await this._pingIndexNow(allKwUrls.slice(i, i+50));
        // Jeda sejenak antar kelompok — biarkan angin bertiup
        if (i+50 < allKwUrls.length) await new Promise(r=>setTimeout(r,500));
      }
    } catch {}
  }

  async _pingIndexNow(urls) {
    const host    = this.cfg.WARUNG_DOMAIN;
    const key     = hexHash(host, 16);
    const payload = { host, key, keyLocation:`https://${host}/${key}.txt`, urlList: urls.slice(0,50) };
    // Lepaskan semua titik ujung bersamaan, tanpa menghalangi
    return Promise.all(_INDEXNOW_ENDPOINTS.map(endpoint =>
      fetch(endpoint, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(payload)
      }).catch(err => logError('IndexNow.ping', err))
    ));
  }

  generateKeyFile() {
    const key = hexHash(this.cfg.WARUNG_DOMAIN, 16);
    return new Response(key, { headers:{'Content-Type':'text/plain','Cache-Control':'public, max-age=3600'} });
  }

  async maybeScheduledPing(waitUntilFn) {
    const INTERVAL = 21600;
    const now = Math.floor(Date.now()/1000);
    if (now - _scheduledPingLastTs < INTERVAL) return;
    _scheduledPingLastTs = now;
    waitUntilFn(this.scheduledPing().catch(()=>{}));
  }
}
