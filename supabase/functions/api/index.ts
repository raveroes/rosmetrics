/**
 * RosMetrics — REST API (Supabase Edge Function)
 *
 * Port dari backend/api.php + php/validator.php + php/db.php (PHP/MySQL).
 * Kontrak API SAMA seperti versi PHP, hanya base URL yang berbeda:
 *
 *   POST  /functions/v1/api?action=register          daftar akun baru
 *   POST  /functions/v1/api?action=login             login, dapatkan token
 *   POST  /functions/v1/api?action=submit            kirim formulir      [token]
 *   GET   /functions/v1/api?action=dashboard         agregat dashboard   [token]
 *   GET   /functions/v1/api?action=umkm_list         tabel UMKM + skor   [token]
 *   GET   /functions/v1/api?action=factor_averages   rata-rata 6 faktor  [token]
 *   GET   /functions/v1/api?action=me                profil user         [token]
 *   GET   /functions/v1/api?action=health            cek koneksi DB
 *
 * Secret yang dibutuhkan (supabase secrets set ...):
 *   JWT_SECRET   (wajib, min. 32 karakter)
 *   CORS_ORIGIN  (opsional, default "*")
 *   APP_DEBUG    (opsional, "true" untuk menampilkan pesan error DB)
 *   PAGE_LIMIT_DEFAULT / PAGE_LIMIT_MAX (opsional, default 15 / 100)
 * SUPABASE_DB_URL disediakan otomatis oleh Supabase.
 */

import postgres from "npm:postgres@3.4.4";
import bcrypt from "npm:bcryptjs@2.4.3";

// ══════════════════════════════════════════════════════════════
//  Konfigurasi
// ══════════════════════════════════════════════════════════════
const CORS_ORIGIN = Deno.env.get("CORS_ORIGIN") ?? "*";
const APP_DEBUG = (Deno.env.get("APP_DEBUG") ?? "false") === "true";
const JWT_EXPIRE = 60 * 60 * 8; // 8 jam
const PAGE_LIMIT_DEFAULT = Number(Deno.env.get("PAGE_LIMIT_DEFAULT") ?? 15);
const PAGE_LIMIT_MAX = Number(Deno.env.get("PAGE_LIMIT_MAX") ?? 100);

// ══════════════════════════════════════════════════════════════
//  Database (pengganti php/db.php)
//  numeric & bigint dikonversi ke Number agar JSON-nya berupa angka
//  (PDO MySQL sebelumnya mengembalikan DECIMAL sebagai string).
// ══════════════════════════════════════════════════════════════
const sql = postgres(Deno.env.get("SUPABASE_DB_URL")!, {
  max: 1,
  prepare: false, // aman untuk koneksi via pooler (transaction mode)
  idle_timeout: 20,
  types: {
    numeric: { to: 1700, from: [1700], serialize: (x: unknown) => String(x), parse: (x: string) => parseFloat(x) },
    bigint: { to: 20, from: [20], serialize: (x: unknown) => String(x), parse: (x: string) => Number(x) },
  },
});

// ══════════════════════════════════════════════════════════════
//  Helper HTTP
// ══════════════════════════════════════════════════════════════
const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": CORS_ORIGIN,
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, x-client-info",
  "Access-Control-Max-Age": "86400",
};

function respond(success: boolean, data: unknown = null, message = "", code = 200): Response {
  return new Response(JSON.stringify({ success, message, data }), {
    status: code,
    headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" },
  });
}

async function bodyJson(req: Request): Promise<Record<string, any>> {
  try {
    const parsed = await req.json();
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

const str = (v: unknown): string => (v === null || v === undefined ? "" : String(v)).trim();

/** Sama dengan round() PHP untuk angka positif. */
function round(x: number, d = 0): number {
  const m = 10 ** d;
  return Math.round((x + Number.EPSILON) * m) / m;
}

function toOmzet(v: unknown): number | null {
  if (v === null || v === undefined || v === "" || typeof v === "boolean") return null;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? Math.trunc(n) : null;
}

// ══════════════════════════════════════════════════════════════
//  JWT HS256 (kompatibel dengan token buatan versi PHP)
// ══════════════════════════════════════════════════════════════
const te = new TextEncoder();
const td = new TextDecoder();

function bytesToB64Url(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64UrlToBytes(s: string): Uint8Array {
  const pad = s.length % 4 ? "=".repeat(4 - (s.length % 4)) : "";
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/") + pad);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

function jwtSecret(): string {
  const s = Deno.env.get("JWT_SECRET") ?? "";
  if (s.length < 32) throw new Error("JWT_SECRET belum diset atau kurang dari 32 karakter.");
  return s;
}

async function hmacKey(usage: "sign" | "verify"): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", te.encode(jwtSecret()), { name: "HMAC", hash: "SHA-256" }, false, [usage]);
}

async function jwtEncode(payload: Record<string, unknown>): Promise<string> {
  const header = bytesToB64Url(te.encode(JSON.stringify({ alg: "HS256", typ: "JWT" })));
  const body = bytesToB64Url(te.encode(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + JWT_EXPIRE })));
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", await hmacKey("sign"), te.encode(`${header}.${body}`)));
  return `${header}.${body}.${bytesToB64Url(sig)}`;
}

async function jwtDecode(token: string): Promise<Record<string, any> | null> {
  const parts = token.trim().split(".");
  if (parts.length !== 3) return null;
  const [header, body, sig] = parts;
  try {
    const ok = await crypto.subtle.verify("HMAC", await hmacKey("verify"), b64UrlToBytes(sig), te.encode(`${header}.${body}`));
    if (!ok) return null;
    const data = JSON.parse(td.decode(b64UrlToBytes(body)));
    if (!data || (data.exp ?? 0) < Math.floor(Date.now() / 1000)) return null;
    return data;
  } catch {
    return null;
  }
}

/** Mengembalikan payload JWT, atau null jika tidak valid (handler harus return 401). */
async function requireAuth(req: Request): Promise<Record<string, any> | null> {
  const header = req.headers.get("Authorization") ?? "";
  const token = header.replace(/^Bearer\s+/i, "").trim();
  return token ? await jwtDecode(token) : null;
}

const UNAUTH = () => respond(false, null, "Tidak terautentikasi. Silakan login.", 401);

// ══════════════════════════════════════════════════════════════
//  Validator (port dari php/validator.php)
// ══════════════════════════════════════════════════════════════
type Issue = { field: string | null; factor: string; code: string; message: string };
type Role = "owner" | "employee";

const FACTOR_SCHEMA: Record<string, { label: string; role: Role; weight: number; scale_max: number; questions: { id: string; code: string; text: string }[] }> = {
  INS: {
    label: "Sumber Daya", role: "owner", weight: 0.20, scale_max: 3, questions: [
      { id: "ins_oh1", code: "OH-1", text: "Memiliki NIB?" },
      { id: "ins_oh2", code: "OH-2", text: "Bantuan pendanaan pemerintah?" },
      { id: "ins_oh3", code: "OH-3", text: "Mengikuti kegiatan pemerintah?" },
      { id: "ins_oh4", code: "OH-4", text: "Kolaborasi dengan bisnis lain?" },
      { id: "ins_oh5", code: "OH-5", text: "Menggunakan pemasaran digital?" },
      { id: "ins_oh6", code: "OH-6", text: "Sumber modal keuangan utama?" },
    ],
  },
  OPS: {
    label: "Inovasi", role: "owner", weight: 0.15, scale_max: 5, questions: [
      { id: "ops_oh26", code: "OH-26", text: "Modal kerja mencukupi" },
      { id: "ops_oh27", code: "OH-27", text: "Gaji karyawan tepat waktu" },
      { id: "ops_oh28", code: "OH-28", text: "Peralatan/mesin optimal" },
      { id: "ops_oh29", code: "OH-29", text: "Rantai pasokan lancar" },
      { id: "ops_oh30", code: "OH-30", text: "Permintaan produk terprediksi" },
      { id: "ops_oh31", code: "OH-31", text: "Hubungan pelanggan jangka panjang" },
    ],
  },
  ECT: {
    label: "Eksternal", role: "owner", weight: 0.15, scale_max: 5, questions: [
      { id: "ect_oh32", code: "OH-32", text: "Jangkauan pasar/pelanggan baru" },
      { id: "ect_oh33", code: "OH-33", text: "Pertumbuhan penjualan memuaskan" },
      { id: "ect_oh34", code: "OH-34", text: "Liabilitas/utang terkelola" },
      { id: "ect_oh35", code: "OH-35", text: "Arus kas sehat & stabil" },
    ],
  },
  OV: {
    label: "Budaya", role: "employee", weight: 0.18, scale_max: 5, questions: [
      { id: "ov_oh18", code: "OH-18", text: "Bebas membicarakan kesulitan kerja" },
      { id: "ov_oh19", code: "OH-19", text: "Suasana kerja positif" },
      { id: "ov_oh20", code: "OH-20", text: "Semangat kerja tinggi" },
      { id: "ov_oh21", code: "OH-21", text: "Karyawan saling membantu" },
      { id: "ov_oh22", code: "OH-22", text: "Kepercayaan antar karyawan kuat" },
      { id: "ov_oh23", code: "OH-23", text: "Kerja tim efektif" },
      { id: "ov_oh24", code: "OH-24", text: "Saling menghormati" },
      { id: "ov_oh25", code: "OH-25", text: "Pekerjaan sebagai dedikasi" },
    ],
  },
  LDI: {
    label: "Kepemimpinan", role: "employee", weight: 0.17, scale_max: 5, questions: [
      { id: "ldi_oh7", code: "OH-7", text: "Pemimpin terhubung personal" },
      { id: "ldi_oh8", code: "OH-8", text: "Pemimpin sebagai panutan" },
      { id: "ldi_oh9", code: "OH-9", text: "Pemimpin terbuka terhadap ide" },
      { id: "ldi_oh10", code: "OH-10", text: "Pemimpin terlibat langsung" },
      { id: "ldi_oh11", code: "OH-11", text: "Pemimpin melatih karyawan baru" },
      { id: "ldi_oh12", code: "OH-12", text: "Pemimpin berlaku adil" },
    ],
  },
  WEQ: {
    label: "Proses", role: "employee", weight: 0.15, scale_max: 5, questions: [
      { id: "weq_oh13", code: "OH-13", text: "Bebas dari kecelakaan kerja" },
      { id: "weq_oh14", code: "OH-14", text: "Puas dengan jam kerja" },
      { id: "weq_oh15", code: "OH-15", text: "Beban kerja terkelola" },
      { id: "weq_oh16", code: "OH-16", text: "Kondisi fisik nyaman" },
      { id: "weq_oh17", code: "OH-17", text: "Karyawan jarang absen" },
    ],
  },
};

const ROLE_FACTORS: Record<string, string[]> = {
  owner: ["INS", "ECT", "OPS"],
  employee: ["OV", "LDI", "WEQ"],
};

const issue = (field: string | null, code: string, message: string, factor = ""): Issue => ({ field, factor, code, message });

type FactorResult = {
  errors: Issue[]; warnings: Issue[]; answered: number; total: number;
  completionPct: number; rawMean: number | null; normScore: number | null; rawVals: number[];
};

function validateFactor(fKey: string, data: Record<string, any>): FactorResult {
  const factor = FACTOR_SCHEMA[fKey];
  const errors: Issue[] = [];
  const warnings: Issue[] = [];
  const rawVals: number[] = [];
  let answered = 0;

  for (const q of factor.questions) {
    const raw = data[q.id];
    if (raw === null || raw === undefined || raw === "") {
      errors.push(issue(q.id, "MISSING", `${q.code}: "${q.text}" wajib dijawab.`, fKey));
      continue;
    }
    const n = typeof raw === "boolean" ? NaN : Number(raw);
    if (!Number.isInteger(n) || n < 1 || n > factor.scale_max) {
      errors.push(issue(q.id, "OUT_OF_RANGE", `${q.code}: Nilai ${raw} di luar rentang (1–${factor.scale_max}).`, fKey));
      continue;
    }
    rawVals.push(n);
    answered++;
  }

  const total = factor.questions.length;
  const pct = total > 0 ? round(answered / total, 4) : 0;
  if (answered > 0 && pct < 0.8) {
    warnings.push(issue(fKey, "LOW_COMPLETION", `Faktor ${fKey}: ${answered}/${total} dijawab.`, fKey));
  }
  if (answered >= 4 && new Set(rawVals).size === 1) {
    warnings.push(issue(fKey, "STRAIGHT_LINE", `Faktor ${fKey}: semua jawaban identik (${rawVals[0]}).`, fKey));
  }
  const rawMean = answered > 0 ? round(rawVals.reduce((a, b) => a + b, 0) / answered, 4) : null;
  const normScore = rawMean !== null ? round(rawMean / factor.scale_max, 4) : null;
  return { errors, warnings, answered, total, completionPct: pct, rawMean, normScore, rawVals };
}

type Composite = { composite: number; scoreOn5: number; category: string } | null;

function computeComposite(factorResults: Record<string, { normScore: number | null }>): Composite {
  let ws = 0;
  let wt = 0;
  for (const [fKey, r] of Object.entries(factorResults)) {
    if (r.normScore === null || r.normScore === undefined) continue;
    const w = FACTOR_SCHEMA[fKey].weight;
    ws += r.normScore * w;
    wt += w;
  }
  if (wt === 0) return null;
  const comp = round(ws / wt, 4);
  const cats = [
    { label: "SANGAT BAIK", min: 0.80 }, { label: "BAIK", min: 0.60 },
    { label: "CUKUP", min: 0.40 }, { label: "PERLU PERHATIAN", min: 0.00 },
  ];
  let cat = "PERLU PERHATIAN";
  for (const c of cats) if (comp >= c.min) { cat = c.label; break; }
  return { composite: comp, scoreOn5: round(comp * 5, 2), category: cat };
}

function validateSubmission(data: Record<string, any>, role: string) {
  const errors: Issue[] = [];
  const warnings: Issue[] = [];

  // Profil — hanya warning saat submit (sudah divalidasi saat registrasi)
  const name = str(data.umkm_name);
  if (name && [...name].length < 2) warnings.push(issue("umkm_name", "TOO_SHORT", "Nama UMKM minimal 2 karakter."));
  const email = str(data.email);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) warnings.push(issue("email", "INVALID_EMAIL", "Format email tidak valid."));
  if (!["owner", "employee"].includes(role)) errors.push(issue("role", "INVALID_ROLE", `Peran '${role}' tidak valid.`));

  // Faktor — penentu valid / tidak
  const required = ROLE_FACTORS[role] ?? [];
  const factorResults: Record<string, FactorResult> = {};
  for (const fKey of required) {
    const fr = validateFactor(fKey, data);
    factorResults[fKey] = fr;
    errors.push(...fr.errors);
    warnings.push(...fr.warnings);
  }

  // Cross-factor: kesenjangan antar faktor
  const scores: Record<string, number> = {};
  for (const [k, r] of Object.entries(factorResults)) if (r.normScore !== null) scores[k] = r.normScore;
  const keys = Object.keys(scores);
  if (keys.length >= 2) {
    const vals = keys.map((k) => scores[k]);
    const mx = Math.max(...vals);
    const mn = Math.min(...vals);
    if (round(mx - mn, 4) > 0.5) {
      const hk = keys.find((k) => scores[k] === mx)!;
      const lk = keys.find((k) => scores[k] === mn)!;
      warnings.push(issue(null, "DISPARITY", `Kesenjangan besar antara ${hk} (${Math.round(mx * 100)}%) dan ${lk} (${Math.round(mn * 100)}%).`));
    }
  }

  const composite = computeComposite(factorResults);

  // Sanitasi jawaban
  const answers: Record<string, number> = {};
  for (const fKey of required) {
    for (const q of FACTOR_SCHEMA[fKey].questions) {
      const v = data[q.id];
      if (v !== null && v !== undefined && v !== "") answers[q.id] = Math.trunc(Number(v));
    }
  }

  const formatted: Record<string, any> = {};
  for (const [k, r] of Object.entries(factorResults)) {
    formatted[k] = {
      rawMean: r.rawMean, normScore: r.normScore,
      scoreOn5: r.normScore !== null ? round(r.normScore * 5, 2) : null,
      completionPct: r.completionPct, answered: r.answered, total: r.total,
    };
  }

  return { valid: errors.length === 0, errors, warnings, scores: formatted, composite, answers };
}

// ══════════════════════════════════════════════════════════════
//  Handlers
// ══════════════════════════════════════════════════════════════

// ── POST register ─────────────────────────────────────────────
async function handleRegister(req: Request): Promise<Response> {
  const body = await bodyJson(req);
  const role = str(body.role) || "owner";
  const umkmName = str(body.umkm_name);
  const email = str(body.email).toLowerCase();
  const password = typeof body.password === "string" ? body.password : "";

  // Validasi profil (versi PHP tidak memeriksa password di server; ditambahkan di sini
  // agar konsisten dengan aturan client: min. 8 karakter)
  const profileErrors: Issue[] = [];
  if (!["owner", "employee"].includes(role)) profileErrors.push(issue("role", "INVALID_ROLE", `Peran '${role}' tidak valid.`));
  if ([...umkmName].length < 2) profileErrors.push(issue("umkm_name", "TOO_SHORT", "Nama UMKM minimal 2 karakter."));
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) profileErrors.push(issue("email", "INVALID_EMAIL", "Format email tidak valid."));
  if (password.length < 8) profileErrors.push(issue("password", "TOO_SHORT", "Kata sandi minimal 8 karakter."));
  if (profileErrors.length) return respond(false, { errors: profileErrors }, "Data registrasi tidak valid.", 422);

  const existing = await sql`select id from users where email = ${email}`;
  if (existing.length) return respond(false, null, "Email sudah terdaftar.", 409);

  if (role === "owner") {
    const owner = await sql`
      select id from users
      where role = 'owner' and lower(trim(umkm_name)) = lower(trim(${umkmName}))`;
    if (owner.length) {
      return respond(false, null,
        `UMKM "${umkmName}" sudah memiliki Owner terdaftar. Pendaftaran Owner baru untuk UMKM yang sama tidak diperbolehkan.`, 409);
    }
  }

  const hash = await bcrypt.hash(password, 10);
  const lokasi = str(body.lokasi) || null;
  const sektor = str(body.sektor) || null;
  const omzet = toOmzet(body.omzet);

  let id: number;
  try {
    const [row] = await sql`
      insert into users (umkm_name, email, password_hash, role, lokasi, sektor, omzet)
      values (${umkmName}, ${email}, ${hash}, ${role}, ${lokasi}, ${sektor}, ${omzet})
      returning id`;
    id = row.id;
  } catch (e: any) {
    if (e?.code === "23505") return respond(false, null, "Email sudah terdaftar.", 409); // race condition
    throw e;
  }

  const token = await jwtEncode({ user_id: id, role, email, umkm_name: umkmName });
  return respond(true, {
    token, user_id: id, role, email, umkm_name: umkmName,
    lokasi: lokasi ?? "", sektor: sektor ?? "", omzet,
  }, "Registrasi berhasil.");
}

// ── POST login ────────────────────────────────────────────────
async function handleLogin(req: Request): Promise<Response> {
  const body = await bodyJson(req);
  const email = str(body.email).toLowerCase();
  const pwd = typeof body.password === "string" ? body.password : "";

  const [user] = await sql`
    select id, umkm_name, email, password_hash, role, is_active, lokasi, sektor, omzet
    from users where email = ${email}`;

  if (!user || !(await bcrypt.compare(pwd, user.password_hash))) {
    return respond(false, null, "Email atau kata sandi salah.", 401);
  }
  if (!user.is_active) return respond(false, null, "Akun tidak aktif. Hubungi admin.", 403);

  const roleInput = str(body.role);
  if (roleInput && roleInput !== user.role) {
    return respond(false, null, `Akun ini terdaftar sebagai ${user.role}, bukan ${roleInput}.`, 403);
  }

  const token = await jwtEncode({ user_id: user.id, role: user.role, email: user.email, umkm_name: user.umkm_name });
  return respond(true, {
    token, user_id: user.id, role: user.role, email: user.email, umkm_name: user.umkm_name,
    lokasi: user.lokasi ?? "", sektor: user.sektor ?? "", omzet: user.omzet ?? null,
  }, "Login berhasil.");
}

// ── GET me ────────────────────────────────────────────────────
async function handleMe(req: Request): Promise<Response> {
  const auth = await requireAuth(req);
  if (!auth) return UNAUTH();
  const [user] = await sql`
    select id as user_id, umkm_name, email, role, lokasi, sektor, omzet
    from users where id = ${auth.user_id} and is_active`;
  if (!user) return respond(false, null, "Pengguna tidak ditemukan.", 404);
  return respond(true, user);
}

// ── POST submit ───────────────────────────────────────────────
async function handleSubmit(req: Request): Promise<Response> {
  const auth = await requireAuth(req);
  if (!auth) return UNAUTH();
  const body = await bodyJson(req);
  const role = String(auth.role);

  // Mendukung pengiriman berulang dari satu akun yang sama untuk keperluan demo (insert berulang diizinkan)

  const submitData = {
    ...body,
    email: auth.email ?? "",
    umkm_name: auth.umkm_name ?? body.umkm_name ?? "Pengguna",
    role,
  };
  const result = validateSubmission(submitData, role);

  // Pegawai: formulir harus valid & Owner UMKM yang sama harus sudah mengisi
  let ownerSub: Record<string, any> | null = null;
  if (role === "employee") {
    if (!result.valid) {
      return respond(false, { errors: result.errors, warnings: result.warnings },
        `Formulir ditolak: ${result.errors.length} error ditemukan.`, 422);
    }
    const rows = await sql`
      select s.id, s.score_ins, s.score_ops, s.score_ect, s.score_ov, s.score_ldi, s.score_weq, s.user_id
      from submissions s
      join users u on s.user_id = u.id
      where s.role = 'owner' and s.validation_pass
        and lower(trim(u.umkm_name)) = lower(trim(${String(auth.umkm_name ?? "")}))
      order by s.submitted_at desc
      limit 1`;
    ownerSub = rows[0] ?? null;
    if (!ownerSub) {
      return respond(false, null,
        `Owner dari UMKM "${auth.umkm_name}" belum mengisi kuesioner. Pegawai hanya dapat mengisi kuesioner setelah Owner mengisinya.`, 403);
    }
  }

  const logs = [
    ...result.errors.map((e) => ({ ...e, level: "error" })),
    ...result.warnings.map((w) => ({ ...w, level: "warning" })),
  ];
  const answerRows = (submissionId: number) =>
    Object.entries(result.answers).map(([qId, val]) => {
      const fKey = qId.split("_")[0].toUpperCase();
      const schema = FACTOR_SCHEMA[fKey];
      return {
        submission_id: submissionId,
        factor_key: fKey,
        question_id: qId,
        question_code: schema?.questions.find((q) => q.id === qId)?.code ?? "",
        answer_value: val,
        scale_max: schema?.scale_max ?? 5,
      };
    });
  const logRows = (submissionId: number) =>
    logs.map((l) => ({
      submission_id: submissionId, level: l.level, factor_key: l.factor || null,
      field_name: l.field ?? null, error_code: l.code, message: l.message,
    }));

  let submissionId = 0;
  let composite: Composite = result.composite;
  let scoresOut: Record<string, any> = result.scores;

  try {
    await sql.begin(async (tx) => {
      const sc = result.scores;
      if (role === "owner") {
        // 1. Header submission
        const [row] = await tx`
          insert into submissions
            (user_id, role, status, validation_pass,
             score_ins, score_ov, score_ldi, score_weq, score_ops, score_ect,
             score_composite, score_on_5, health_category)
          values (${auth.user_id}, ${role}, ${result.valid ? "submitted" : "rejected"}, ${result.valid},
                  ${sc.INS?.normScore ?? null}, ${sc.OV?.normScore ?? null}, ${sc.LDI?.normScore ?? null},
                  ${sc.WEQ?.normScore ?? null}, ${sc.OPS?.normScore ?? null}, ${sc.ECT?.normScore ?? null},
                  ${composite?.composite ?? null}, ${composite?.scoreOn5 ?? null}, ${composite?.category ?? null})
          returning id`;
        submissionId = row.id;

        // 2. Jawaban individual
        const ans = answerRows(submissionId);
        if (ans.length) await tx`insert into answers ${tx(ans)}`;
      } else {
        // Pegawai: catat submission pegawai (validation_pass=false agar tidak masuk statistik)
        await tx`
          insert into submissions
            (user_id, role, status, validation_pass,
             score_ins, score_ov, score_ldi, score_weq, score_ops, score_ect,
             score_composite, score_on_5, health_category)
          values (${auth.user_id}, ${role}, 'submitted', false,
                  null, ${sc.OV?.normScore ?? null}, ${sc.LDI?.normScore ?? null}, ${sc.WEQ?.normScore ?? null},
                  null, null,
                  ${result.composite?.composite ?? null}, ${result.composite?.scoreOn5 ?? null}, ${result.composite?.category ?? null})`;

        // Rata-rata skor semua pegawai di UMKM yang sama (termasuk yang baru dimasukkan)
        const [avg] = await tx`
          select avg(s.score_ov) as avg_ov, avg(s.score_ldi) as avg_ldi, avg(s.score_weq) as avg_weq
          from submissions s
          join users u on s.user_id = u.id
          where lower(trim(u.umkm_name)) = lower(trim(${String(auth.umkm_name ?? "")})) and s.role = 'employee'`;

        submissionId = Number(ownerSub!.id);
        const r4 = (v: number | null) => (v !== null && v !== undefined ? round(Number(v), 4) : null);
        const combined = {
          INS: { normScore: ownerSub!.score_ins as number | null },
          OPS: { normScore: ownerSub!.score_ops as number | null },
          ECT: { normScore: ownerSub!.score_ect as number | null },
          OV: { normScore: r4(avg.avg_ov) },
          LDI: { normScore: r4(avg.avg_ldi) },
          WEQ: { normScore: r4(avg.avg_weq) },
        };
        composite = computeComposite(combined);

        // Update header milik Owner dengan hasil akumulasi
        await tx`
          update submissions
          set score_ov = ${combined.OV.normScore}, score_ldi = ${combined.LDI.normScore}, score_weq = ${combined.WEQ.normScore},
              score_composite = ${composite?.composite ?? null}, score_on_5 = ${composite?.scoreOn5 ?? null},
              health_category = ${composite?.category ?? null},
              status = 'validated', validation_pass = true
          where id = ${submissionId}`;

        // Jawaban pegawai (upsert pada kunci submission_id + question_id)
        const ans = answerRows(submissionId);
        if (ans.length) {
          await tx`
            insert into answers ${tx(ans)}
            on conflict (submission_id, question_id) do update set answer_value = excluded.answer_value`;
        }

        const on5 = (n: number | null) => (n !== null && n !== undefined ? round(Number(n) * 5, 2) : null);
        scoresOut = Object.fromEntries(
          Object.entries(combined).map(([k, v]) => [k, { normScore: v.normScore, scoreOn5: on5(v.normScore) }]),
        );
      }

      // Log validasi
      const lr = logRows(submissionId);
      if (lr.length) await tx`insert into validation_log ${tx(lr)}`;
    });
  } catch (e) {
    console.error("submit failed:", e);
    return respond(false, null, APP_DEBUG ? `Database error: ${(e as Error).message}` : "Gagal menyimpan data.", 500);
  }

  if (role === "owner" && !result.valid) {
    return respond(false, { errors: result.errors, warnings: result.warnings, submission_id: submissionId },
      `Formulir ditolak: ${result.errors.length} error ditemukan.`, 422);
  }

  return respond(true, {
    submission_id: submissionId, scores: scoresOut, composite, warnings: result.warnings,
  }, "Formulir berhasil disimpan.", 200);
}

// ── GET dashboard & factor_averages ───────────────────────────
function withFactorAverages(row: Record<string, any> | undefined) {
  if (!row) return row ?? null;
  const out: Record<string, any> = { ...row };
  for (const f of ["ins", "ov", "ldi", "weq", "ops", "ect"]) {
    out[`avg_${f}_5`] = round(Number(row[`avg_${f}`] ?? 0) * 5, 2);
  }
  return out;
}

async function handleDashboard(req: Request): Promise<Response> {
  if (!(await requireAuth(req))) return UNAUTH();
  const [stats] = await sql`
    select
      count(*)                                         as total_umkm,
      count(*) filter (where validation_pass)          as total_valid,
      round(avg(score_composite) * 100, 1)             as avg_score_pct,
      round(max(score_composite) * 5, 2)               as best_score,
      round(min(score_composite) * 5, 2)               as worst_score,
      count(*) filter (where score_composite >= 0.6)   as sehat_count
    from submissions where validation_pass`;
  const [factorAvg] = await sql`select * from v_factor_averages`;
  return respond(true, { stats, factor_averages: withFactorAverages(factorAvg) });
}

async function handleFactorAverages(req: Request): Promise<Response> {
  if (!(await requireAuth(req))) return UNAUTH();
  const [row] = await sql`select * from v_factor_averages`;
  return respond(true, withFactorAverages(row));
}

// ── GET umkm_list ─────────────────────────────────────────────
async function handleUmkmList(req: Request, url: URL): Promise<Response> {
  if (!(await requireAuth(req))) return UNAUTH();
  const limit = Math.min(Math.max(parseInt(url.searchParams.get("limit") ?? "") || PAGE_LIMIT_DEFAULT, 1), PAGE_LIMIT_MAX);
  const offset = Math.max(parseInt(url.searchParams.get("offset") ?? "") || 0, 0);
  // Frontend mengirim "q"; versi PHP membaca "search" — keduanya didukung.
  const raw = url.searchParams.get("search") ?? url.searchParams.get("q") ?? "";
  const search = `%${raw.replace(/[\\%_]/g, "\\$&")}%`;

  const rows = await sql`
    select s.submission_id, s.umkm_name, s.lokasi, s.sektor, s.role,
           s.score_composite, s.score_on_5, s.health_category,
           to_char(s.submitted_at at time zone 'Asia/Jakarta', 'YYYY-MM-DD HH24:MI:SS') as submitted_at,
           u.omzet
    from v_submission_summary s
    left join users u on s.user_id = u.id
    where s.validation_pass
      and (s.umkm_name ilike ${search} or s.lokasi ilike ${search} or s.sektor ilike ${search})
    order by s.submitted_at asc
    limit ${limit} offset ${offset}`;
  const [total] = await sql`
    select count(*) as cnt from v_submission_summary
    where validation_pass
      and (umkm_name ilike ${search} or lokasi ilike ${search} or sektor ilike ${search})`;

  return respond(true, { rows, total: Number(total?.cnt ?? 0), limit, offset });
}

// ── GET health (pengganti backend/test.php) ───────────────────
async function handleHealth(): Promise<Response> {
  try {
    await sql`select 1`;
    return respond(true, { status: "ok", db: true });
  } catch (e) {
    console.error("health failed:", e);
    return respond(false, { status: "error", db: false }, APP_DEBUG ? (e as Error).message : "Database tidak dapat dihubungi.", 503);
  }
}

// ══════════════════════════════════════════════════════════════
//  Router
// ══════════════════════════════════════════════════════════════
Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });

  const url = new URL(req.url);
  const action = url.searchParams.get("action") ?? "";
  const method = req.method;

  try {
    if (action === "register" && method === "POST") return await handleRegister(req);
    if (action === "login" && method === "POST") return await handleLogin(req);
    if (action === "submit" && method === "POST") return await handleSubmit(req);
    if (action === "me" && method === "GET") return await handleMe(req);
    if (action === "dashboard" && method === "GET") return await handleDashboard(req);
    if (action === "umkm_list" && method === "GET") return await handleUmkmList(req, url);
    if (action === "factor_averages" && method === "GET") return await handleFactorAverages(req);
    if (action === "health" && method === "GET") return await handleHealth();
    return respond(false, null, `Endpoint '${action}' tidak ditemukan.`, 404);
  } catch (e) {
    console.error("unhandled:", e);
    return respond(false, APP_DEBUG ? { trace: (e as Error).message } : null, "Terjadi kesalahan server.", 500);
  }
});
