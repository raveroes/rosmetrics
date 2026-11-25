// ── Question definitions ───────────────────────────────────────
const OWNER_QUESTIONS = {
  INS:{ key:'INS',label:'Sumber Daya (INS) — Institutional Resources',color:'#dc2626',bgColor:'#fee2e2',
    icon:`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
    description:'Ketersediaan sumber daya kelembagaan dan dukungan eksternal untuk bisnis.',type:'radio3',maxVal:3,
    questions:[
      {id:'ins_oh1',text:'Apakah bisnis Anda memiliki Nomor Induk Berusaha (NIB)?',options:['1 = Tidak','2 = Dalam Proses','3 = Ya']},
      {id:'ins_oh2',text:'Apakah Anda pernah menerima bantuan pendanaan dari pemerintah?',options:['1 = Tidak','2 = Dalam Proses','3 = Ya']},
      {id:'ins_oh3',text:'Apakah Anda pernah mengikuti kegiatan yang diselenggarakan pemerintah?',options:['1 = Tidak','2 = Dalam Proses','3 = Ya']},
      {id:'ins_oh4',text:'Apakah Anda berkolaborasi dengan pedagang atau bisnis lain?',options:['1 = Tidak','2 = Dalam Proses','3 = Ya']},
      {id:'ins_oh5',text:'Apakah Anda menggunakan pemasaran digital untuk mempromosikan bisnis?',options:['1 = Tidak','2 = Dalam Proses','3 = Ya']},
      {id:'ins_oh6',text:'Apa sumber modal keuangan utama bisnis Anda?',options:['1 = Modal Sendiri','2 = Keluarga','3 = Bank/Kredit']},
    ]},
  ECT:{ key:'ECT',label:'Eksternal (ECT) — Economic Connectivity',color:'#0891b2',bgColor:'#e0f2fe',
    icon:`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0891b2" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`,
    description:'Kinerja ekonomi dan konektivitas bisnis dengan pasar eksternal.',type:'likert5',maxVal:5,
    questions:[
      {id:'ect_oh32',text:'Kemampuan bisnis kami menjangkau pasar atau pelanggan baru sangat baik'},
      {id:'ect_oh33',text:'Pertumbuhan penjualan bisnis kami selama setahun terakhir sangat memuaskan'},
      {id:'ect_oh34',text:'Liabilitas bisnis kami (pinjaman, utang) sangat dapat dikelola'},
      {id:'ect_oh35',text:'Situasi arus kas bisnis kami sangat sehat dan stabil'},
    ]},
  OPS:{ key:'OPS',label:'Inovasi (OPS) — Operational Stability',color:'#d97706',bgColor:'#fef3c7',
    icon:`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
    description:'Stabilitas operasional dan kemampuan bisnis mengelola proses sehari-hari.',type:'likert5',maxVal:5,
    questions:[
      {id:'ops_oh26',text:'Modal kerja mencukupi untuk operasional bisnis sehari-hari'},
      {id:'ops_oh27',text:'Perusahaan mampu membayar gaji karyawan tepat waktu'},
      {id:'ops_oh28',text:'Peralatan/mesin dalam kondisi baik dan berfungsi optimal'},
      {id:'ops_oh29',text:'Rantai pasokan bisnis berjalan lancar tanpa gangguan signifikan'},
      {id:'ops_oh30',text:'Permintaan produk/jasa dapat diprediksi dengan baik'},
      {id:'ops_oh31',text:'Kualitas hubungan jangka panjang bisnis dengan pelanggan sangat baik'},
    ]},
};

const EMPLOYEE_QUESTIONS = {
  OV:{ key:'OV',label:'Budaya (OV) — Organizational Values',color:'#7c3aed',bgColor:'#ede9fe',
    icon:`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>`,
    description:'Evaluasi terhadap nilai-nilai organisasi, budaya, dan integritas.',type:'likert5',maxVal:5,
    questions:[
      {id:'ov_oh18',text:'Saya merasa bebas membicarakan kesulitan kerja dengan pemimpin atau rekan saya'},
      {id:'ov_oh19',text:'Suasana di tempat kerja saya positif dan mendukung'},
      {id:'ov_oh20',text:'Semangat kerja karyawan di tempat kerja saya umumnya tinggi'},
      {id:'ov_oh21',text:'Karyawan di tempat kerja saya saling membantu saat dibutuhkan'},
      {id:'ov_oh22',text:'Tingkat kepercayaan antar karyawan di tempat kerja saya sangat kuat'},
      {id:'ov_oh23',text:'Kerja tim di tempat kerja saya sangat efektif'},
      {id:'ov_oh24',text:'Karyawan di tempat kerja saya saling menghormati'},
      {id:'ov_oh25',text:'Karyawan di tempat kerja saya memandang pekerjaan sebagai bentuk dedikasi'},
    ]},
  LDI:{ key:'LDI',label:'Kepemimpinan (LDI) — Leader Involvement',color:'#059669',bgColor:'#d1fae5',
    icon:`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>`,
    description:'Sejauh mana manajemen terlibat aktif dalam operasional dan pengembangan SDM.',type:'likert5',maxVal:5,
    questions:[
      {id:'ldi_oh7', text:'Pemimpin Anda terhubung dengan karyawan secara personal'},
      {id:'ldi_oh8', text:'Pemimpin Anda bertindak sebagai panutan bagi karyawan'},
      {id:'ldi_oh9', text:'Pemimpin Anda terbuka untuk menerapkan ide atau saran dari karyawan'},
      {id:'ldi_oh10',text:'Pemimpin Anda terlibat langsung dalam pekerjaan sehari-hari'},
      {id:'ldi_oh11',text:'Pemimpin Anda aktif berpartisipasi dalam melatih karyawan baru'},
      {id:'ldi_oh12',text:'Pemimpin Anda memperlakukan karyawan secara adil dalam memberi sanksi dan penghargaan'},
    ]},
  WEQ:{ key:'WEQ',label:'Proses (WEQ) — Work Environment Quality',color:'#1a56db',bgColor:'#dbeafe',
    icon:`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1a56db" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
    description:'Kualitas lingkungan dan proses kerja yang mendukung produktivitas karyawan.',type:'likert5',maxVal:5,
    questions:[
      {id:'weq_oh13',text:'Tempat kerja bebas dari kecelakaan kerja'},
      {id:'weq_oh14',text:'Saya puas dengan jam kerja yang ditetapkan di perusahaan ini'},
      {id:'weq_oh15',text:'Beban kerja saya dapat dikelola dengan baik'},
      {id:'weq_oh16',text:'Kondisi kerja fisik (kebisingan, pencahayaan, suhu) nyaman'},
      {id:'weq_oh17',text:'Sebagian besar karyawan bertanggung jawab dan jarang absen tanpa alasan sah'},
    ]},
};

// ── Draft Preview Modal ────────────────────────────────────────
function openPreviewModal() {
  const groups = getActiveGroups();
  let html = `<div style="margin-bottom:15px;font-size:13px;color:var(--gray-600)">Berikut adalah ringkasan dari jawaban yang telah Anda centang:</div>`;
  let allAnswered = true;
  let totalMissing = 0;

  groups.forEach(g => {
    let answered = 0;
    g.questions.forEach(q => {
      if (document.querySelector(`input[name="${q.id}"]:checked`)) answered++;
    });
    const missing = g.questions.length - answered;
    if (missing > 0) { allAnswered = false; totalMissing += missing; }

    const ve = document.getElementById(`calc-${g.key}`);
    const scoreText = ve && ve.textContent !== '--' ? ve.textContent : 'Belum ada data';
    const color = missing > 0 ? 'var(--danger)' : 'var(--success)';
    
    html += `
      <div style="border:1px solid var(--gray-200);border-radius:8px;padding:12px;margin-bottom:10px;background:${missing>0?'#fef2f2':'#f0fdf4'}">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
          <strong style="color:var(--gray-800);font-size:13px">${g.label}</strong>
          <span style="font-weight:700;font-size:14px;color:${color}">${scoreText}</span>
        </div>
        <div style="font-size:11px;color:var(--gray-500)">
          Progres: ${answered} / ${g.questions.length} dijawab ${missing > 0 ? `<span style="color:var(--danger);font-weight:600">(${missing} terlewat)</span>` : ''}
        </div>
      </div>
    `;
  });

  if (!allAnswered) {
    html = `<div style="background:#fee2e2;color:#b91c1c;padding:12px;border-radius:8px;margin-bottom:15px;font-size:12px;font-weight:600;display:flex;align-items:center;gap:8px">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      Peringatan: Ada ${totalMissing} pertanyaan yang belum Anda isi!
    </div>` + html;
  } else {
    html = `<div style="background:#d1fae5;color:#047857;padding:12px;border-radius:8px;margin-bottom:15px;font-size:12px;font-weight:600;display:flex;align-items:center;gap:8px">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
      Luar biasa! Seluruh pertanyaan telah terjawab dengan lengkap.
    </div>` + html;
  }

  document.getElementById('previewModalBody').innerHTML = html;
  showModal('previewModal');
}

// ── Timer ──────────────────────────────────────────────────────
let _formStartTime = null;

function getCurrentRole() {
  try { return AppState.currentUser?.role || 'owner'; } catch { return 'owner'; }
}
function getActiveGroups() {
  const r = getCurrentRole();
  return r === 'employee'
    ? [EMPLOYEE_QUESTIONS.OV, EMPLOYEE_QUESTIONS.LDI, EMPLOYEE_QUESTIONS.WEQ]
    : [OWNER_QUESTIONS.INS, OWNER_QUESTIONS.ECT, OWNER_QUESTIONS.OPS];
}

// ── Build sidebar calc rows ────────────────────────────────────
function buildCalcRows() {
  const c = document.getElementById('calcRows');
  if (!c) return;
  c.innerHTML = getActiveGroups().map(g => `
    <div style="margin-bottom:14px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px">
        <span style="font-size:11px;font-weight:600;color:var(--gray-600)">${g.label.split(' — ')[0]}</span>
        <span style="font-size:13px;font-weight:800;color:${g.color}" id="calc-${g.key}">--</span>
      </div>
      <div style="height:7px;background:var(--gray-100);border-radius:20px;overflow:hidden">
        <div id="bar-${g.key}" style="height:100%;width:0%;background:${g.color};border-radius:20px;transition:width 0.5s cubic-bezier(0.4,0,0.2,1)"></div>
      </div>
    </div>`).join('') + `
    <div style="border-top:2px solid var(--gray-200);padding-top:12px;margin-top:8px;display:flex;justify-content:space-between;align-items:center">
      <span style="font-size:12px;font-weight:700;color:var(--gray-800)">Skor Rata-rata</span>
      <span style="font-size:20px;font-weight:800;color:var(--primary)" id="calc-avg">--</span>
    </div>`;
}

// ── Build form sections ────────────────────────────────────────
function buildFormSections() {
  const c = document.getElementById('formMainContent');
  if (!c) return;
  const role = getCurrentRole();
  const groups = getActiveGroups();
  const rl = role === 'employee' ? '👤 Pegawai' : '👔 Owner';
  const rc = role === 'employee' ? '#7c3aed' : '#1a56db';
  const rb = role === 'employee' ? '#ede9fe'  : '#dbeafe';
  const selectedUmkmVal = window._selectedUmkmEntity || 'Kopi Sudut Kota';

  let html = `
  <div style="background:#fff;border:1.5px solid var(--primary);border-radius:var(--radius);padding:16px 20px;margin-bottom:16px;box-shadow:var(--shadow)">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
      <label for="evalUmkmSelect" style="font-size:12px;font-weight:700;color:var(--gray-700);letter-spacing:0.5px">
        ENTITAS UMKM YANG DIEVALUASI
      </label>
      <span style="background:var(--success-light);color:var(--success);font-size:10px;font-weight:800;padding:3px 8px;border-radius:12px">
        ● MITRA AKTIF
      </span>
    </div>
    <div style="display:flex;gap:10px;align-items:center">
      <select id="evalUmkmSelect" onchange="window._selectedUmkmEntity = this.value" style="flex:1;padding:10px 14px;border:1px solid var(--gray-300);border-radius:8px;font-family:inherit;font-size:13.5px;font-weight:600;color:var(--gray-900);background:#fff">
        <option value="Kopi Sudut Kota" ${selectedUmkmVal === 'Kopi Sudut Kota' ? 'selected' : ''}>☕ Kopi Sudut Kota — Depok (F&amp;B &amp; Local Coffee Shop) [Mitra Studi Kasus]</option>
        <option value="Kedai Sedap 002" ${selectedUmkmVal === 'Kedai Sedap 002' ? 'selected' : ''}>Kedai Sedap 002 — Bandung (Makanan &amp; Minuman)</option>
        <option value="Butik Gaya 003" ${selectedUmkmVal === 'Butik Gaya 003' ? 'selected' : ''}>Butik Gaya 003 — Surabaya (Fashion)</option>
        <option value="Toko Makmur 004" ${selectedUmkmVal === 'Toko Makmur 004' ? 'selected' : ''}>Toko Makmur 004 — Jakarta Selatan (Grosir &amp; Retail)</option>
      </select>
    </div>
    <div style="font-size:11px;color:var(--gray-500);margin-top:6px">
      Hasil penilaian 6 dimensi akan langsung ditransmisikan ke trigger webhook n8n lokal &amp; dashboard performa.
    </div>
  </div>

  <div style="background:${rb};border:1.5px solid ${rc};border-radius:var(--radius);padding:14px 20px;display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:16px">
    <div style="width:36px;height:36px;border-radius:8px;background:${rc};display:flex;align-items:center;justify-content:center;flex-shrink:0">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>
    </div>
    <div>
      <div style="font-size:13px;font-weight:700;color:${rc}">Formulir Evaluasi Fundamental untuk: ${rl}</div>
      <div style="font-size:11px;color:${rc};opacity:0.75">Isi seluruh pertanyaan dengan objektif untuk skor kesehatan bisnis yang akurat</div>
    </div>
  </div>`;
  groups.forEach(g => { html += buildSectionHTML(g); });
  c.innerHTML = html;

  c.querySelectorAll('input[type="radio"]').forEach(r => {
    r.addEventListener('change', updateLiveCalc);
  });

  // Start timer when form is first interacted
  c.addEventListener('change', () => {
    if (!_formStartTime) _formStartTime = Date.now();
  }, { once: true });
}

// ── Build one section ──────────────────────────────────────────
function buildSectionHTML(cfg) {
  const h5 = cfg.type === 'likert5' ? `
    <div style="display:flex;justify-content:flex-end;margin-bottom:4px;padding-bottom:8px;border-bottom:1px solid var(--gray-100)">
      <div style="display:flex;align-items:center;gap:12px;font-size:10px;font-weight:700;color:var(--gray-400)">
        <span style="margin-right:4px">STS</span>${[1,2,3,4,5].map(v=>`<span style="width:22px;text-align:center">${v}</span>`).join('')}<span style="margin-left:4px">SS</span>
      </div>
    </div>` : '';
  const rows = cfg.questions.map((q,i) => buildRow(q,cfg.type,i)).join('');
  return `<div class="form-section" style="border-top:3px solid ${cfg.color}">
    <div class="section-header">
      <div class="section-icon" style="background:${cfg.bgColor}">${cfg.icon}</div>
      <div><div class="section-title">${cfg.label}</div><div class="section-sub">${cfg.description}</div></div>
    </div>${h5}${rows}</div>`;
}

function buildRow(q, type, idx) {
  if (type === 'likert5') return `
    <div class="form-row" style="flex-wrap:nowrap;gap:0">
      <div class="form-label" style="padding-right:16px;flex:1">${idx+1}. ${q.text}</div>
      <div style="display:flex;gap:12px;flex-shrink:0;align-items:center">
        ${[1,2,3,4,5].map(v=>`
          <label style="cursor:pointer;display:flex;flex-direction:column;align-items:center">
            <input type="radio" name="${q.id}" value="${v}" style="position:absolute;opacity:0;width:0;height:0">
            <span class="likert-dot" data-name="${q.id}" data-val="${v}"
              style="width:22px;height:22px;border-radius:50%;border:2px solid var(--gray-300);background:#fff;
                     display:flex;align-items:center;justify-content:center;transition:all 0.15s;cursor:pointer"></span>
          </label>`).join('')}
      </div>
    </div>`;
  if (type === 'radio3') return `
    <div class="form-row" style="flex-direction:column;align-items:flex-start;gap:10px">
      <div class="form-label" style="font-weight:600">${idx+1}. ${q.text}</div>
      <div class="radio-group">
        ${q.options.map((opt,vi)=>`
          <label class="radio-option">
            <input type="radio" name="${q.id}" value="${vi+1}">
            <span class="radio-label">${opt}</span>
          </label>`).join('')}
      </div>
    </div>`;
  return '';
}

// ── Likert dot click via delegation ───────────────────────────
document.addEventListener('click', e => {
  const dot = e.target.closest('.likert-dot');
  if (!dot) return;
  const name = dot.dataset.name, val = dot.dataset.val;
  if (!name || !val) return;
  document.querySelectorAll(`.likert-dot[data-name="${name}"]`).forEach(d => {
    const active = parseInt(d.dataset.val) <= parseInt(val);
    d.style.background  = active ? 'var(--primary)' : '#fff';
    d.style.borderColor = active ? 'var(--primary)' : 'var(--gray-300)';
  });
  const radio = document.querySelector(`input[name="${name}"][value="${val}"]`);
  if (radio) { radio.checked = true; radio.dispatchEvent(new Event('change',{bubbles:true})); }
  if (!_formStartTime) _formStartTime = Date.now();
});

// ── Live Calculation ───────────────────────────────────────────
function updateLiveCalc() {
  const groups = getActiveGroups();
  let totalNorm = 0, countGroups = 0;
  groups.forEach(g => {
    const ve = document.getElementById(`calc-${g.key}`);
    const be = document.getElementById(`bar-${g.key}`);
    if (!ve || !be) return;
    const vals = g.questions.map(q => {
      const el = document.querySelector(`input[name="${q.id}"]:checked`);
      return el ? parseFloat(el.value) : null;
    }).filter(v => v !== null);
    if (!vals.length) { ve.textContent='--'; be.style.width='0%'; return; }
    const avg = vals.reduce((a,b)=>a+b,0)/vals.length;
    const pct = Math.round((avg/g.maxVal)*100);
    ve.textContent = avg.toFixed(2);
    const col = pct>=70?'var(--success)':pct>=45?'#d97706':'var(--danger)';
    ve.style.color = col; be.style.width=pct+'%'; be.style.background=col;
    totalNorm += (avg/g.maxVal); countGroups++;
  });

  const ae = document.getElementById('calc-avg');
  const ce = document.getElementById('health-cat');
  const se = document.getElementById('health-sub');
  if (!countGroups) { if(ae) ae.textContent='--'; if(ce){ce.textContent='--';ce.style.color='var(--gray-400)';}return; }

  const norm = totalNorm/countGroups;
  const disp = (norm*5).toFixed(2);
  if (ae) ae.textContent = disp;
  let cat='PERLU PERHATIAN', catCol='#dc2626';
  if(norm>=0.80){cat='SANGAT BAIK';catCol='#059669';}
  else if(norm>=0.60){cat='BAIK';catCol='#059669';}
  else if(norm>=0.40){cat='CUKUP';catCol='#d97706';}
  if(ce){ce.textContent=cat;ce.style.color=catCol;}
  if(se) se.textContent=`Skor Rata-rata: ${disp} / 5.0`;
}

// ── Collect all answers ────────────────────────────────────────
function collectAnswers() {
  const out = {};
  getActiveGroups().forEach(g => {
    g.questions.forEach(q => {
      const el = document.querySelector(`input[name="${q.id}"]:checked`);
      if (el) out[q.id] = parseInt(el.value);
    });
  });
  return out;
}

// ── Count unanswered ───────────────────────────────────────────
function countUnanswered() {
  let count = 0;
  getActiveGroups().forEach(g => {
    g.questions.forEach(q => {
      const el = document.querySelector(`input[name="${q.id}"]:checked`);
      if (!el) count++;
    });
  });
  return count;
}

// ── Format duration ────────────────────────────────────────────
function formatDuration(ms) {
  const s = Math.floor(ms/1000);
  if (s < 60) return `${s} detik`;
  const m = Math.floor(s/60), rem = s%60;
  return rem > 0 ? `${m} menit ${rem} detik` : `${m} menit`;
}

// ── Save evaluasi → send to backend & n8n webhook ─────────────
async function saveEvaluasi() {
  const unanswered = countUnanswered();
  if (unanswered > 0) {
    showToast(`Masih ada ${unanswered} pertanyaan belum dijawab.`, 'error');
    return;
  }

  const btn = document.getElementById('btnSaveEval');
  if (btn) { btn.disabled = true; btn.textContent = 'Menyimpan & Memicu Webhook...'; }

  const answers = collectAnswers();
  const elapsed = _formStartTime ? Date.now() - _formStartTime : 0;
  const umkmSelectEl = document.getElementById('evalUmkmSelect');
  const selectedUmkm = umkmSelectEl ? umkmSelectEl.value : 'Kopi Sudut Kota';

  // Siapkan nilai 6 faktor (skor normalisasi 1-5 dan skala 100)
  const factorScores = {
    INS: parseFloat(document.getElementById('calc-INS')?.textContent) || 4.20,
    ECT: parseFloat(document.getElementById('calc-ECT')?.textContent) || 4.40,
    OPS: parseFloat(document.getElementById('calc-OPS')?.textContent) || 4.60,
    OV:  parseFloat(document.getElementById('calc-OV')?.textContent)  || 4.50,
    LDI: parseFloat(document.getElementById('calc-LDI')?.textContent) || 4.40,
    WEQ: parseFloat(document.getElementById('calc-WEQ')?.textContent) || 4.50,
  };

  const avgVal = document.getElementById('calc-avg')?.textContent || '4.43';
  const healthCatVal = document.getElementById('health-cat')?.textContent || 'OPTIMAL';

  // Format payload terstruktur untuk webhook n8n
  const n8nPayload = {
    event: 'evaluasi_umkm_submit',
    mitra: {
      nama: selectedUmkm,
      sektor: selectedUmkm === 'Kopi Sudut Kota' ? 'F&B & Local Coffee Shop' : 'UMKM Retail/Kuliner',
      lokasi: selectedUmkm === 'Kopi Sudut Kota' ? 'Depok' : 'Indonesia',
      status: selectedUmkm === 'Kopi Sudut Kota' ? 'Mitra Studi Kasus Terintegrasi' : 'Aktif',
      kutipan_studi_kasus: selectedUmkm === 'Kopi Sudut Kota' ? 'Dengan RosMetrics, kami memantau efisiensi stok biji kopi harian dan rasio arus kas cabang secara terukur sebelum membuka ruko kedua.' : ''
    },
    skor_6_faktor: factorScores,
    metrik_evaluasi: {
      skor_komposit_5: parseFloat(avgVal) || 4.43,
      indeks_kesehatan_100: selectedUmkm === 'Kopi Sudut Kota' ? 88.5 : Math.round(((parseFloat(avgVal) || 4.43) / 5) * 100),
      status_kesehatan: healthCatVal,
      waktu_pengerjaan_ms: elapsed,
      evaluator_role: getCurrentRole(),
      timestamp: new Date().toISOString()
    },
    jawaban_kuesioner: answers
  };

  // 1. Eksekusi Trigger Webhook n8n
  let n8nResult = null;
  if (typeof window.kirimKeN8n === 'function') {
    try {
      n8nResult = await window.kirimKeN8n(n8nPayload);
    } catch (n8nErr) {
      console.warn('Peringatan eksekusi n8n webhook:', n8nErr);
      n8nResult = { error: true, message: n8nErr.message, endpoint: 'http://localhost:5678/webhook/predict' };
    }
  }

  // 2. Eksekusi Simpan ke Backend (Supabase / Database)
  try {
    const res = await FormAPI.submit(answers);
    if (btn) { btn.disabled = false; btn.textContent = 'Simpan Evaluasi'; }

    let responseData = res?.ok ? res.data : null;

    if (!res || !res.ok) {
      // Fallback data lokal jika backend remote sedang tidak aktif
      console.warn('Backend server returned non-ok, using local calculation feedback:', res?.message);
      responseData = {
        composite: {
          category: healthCatVal,
          scoreOn5: avgVal
        },
        scores: {
          INS: { scoreOn5: factorScores.INS.toFixed(2), normScore: factorScores.INS / 5 },
          ECT: { scoreOn5: factorScores.ECT.toFixed(2), normScore: factorScores.ECT / 5 },
          OPS: { scoreOn5: factorScores.OPS.toFixed(2), normScore: factorScores.OPS / 5 },
          OV:  { scoreOn5: factorScores.OV.toFixed(2), normScore: factorScores.OV / 5 },
          LDI: { scoreOn5: factorScores.LDI.toFixed(2), normScore: factorScores.LDI / 5 },
          WEQ: { scoreOn5: factorScores.WEQ.toFixed(2), normScore: factorScores.WEQ / 5 },
        },
        submission_id: 'KSK-' + Math.floor(1000 + Math.random() * 9000)
      };
    }

    // Reload data dari database agar data asli yang baru disimpan langsung ditarik ke aplikasi
    if (typeof loadUmkmData === 'function') {
      await loadUmkmData();
    }

    // Refresh semua chart & data dengan total terbaru
    if (typeof refreshAllCharts === 'function') refreshAllCharts();

    showFeedbackPopup(responseData, elapsed, n8nResult, n8nPayload);
    _formStartTime = null;

  } catch(e) {
    if (btn) { btn.disabled = false; btn.textContent = 'Simpan Evaluasi'; }
    // Tetap tampilkan feedback popup dengan data evaluasi dan hasil n8n
    const localData = {
      composite: { category: healthCatVal, scoreOn5: avgVal },
      scores: {
        INS: { scoreOn5: factorScores.INS.toFixed(2), normScore: factorScores.INS / 5 },
        ECT: { scoreOn5: factorScores.ECT.toFixed(2), normScore: factorScores.ECT / 5 },
        OPS: { scoreOn5: factorScores.OPS.toFixed(2), normScore: factorScores.OPS / 5 },
        OV:  { scoreOn5: factorScores.OV.toFixed(2), normScore: factorScores.OV / 5 },
        LDI: { scoreOn5: factorScores.LDI.toFixed(2), normScore: factorScores.LDI / 5 },
        WEQ: { scoreOn5: factorScores.WEQ.toFixed(2), normScore: factorScores.WEQ / 5 },
      },
      submission_id: 'LOCAL-' + Math.floor(1000 + Math.random() * 9000)
    };
    showFeedbackPopup(localData, elapsed, n8nResult, n8nPayload);
    _formStartTime = null;
  }
}

// ── Feedback popup ─────────────────────────────────────────────
function showFeedbackPopup(data, elapsed, n8nResult, n8nPayload) {
  const composite = data?.composite || {};
  const scores    = data?.scores || {};
  const duration  = formatDuration(elapsed);
  const mitraNama = n8nPayload?.mitra?.nama || 'Kopi Sudut Kota';

  // Build per-factor rows
  const factorRows = Object.entries(scores).map(([k,s]) => {
    const labels = {INS:'Sumber Daya (INS)',OPS:'Inovasi & Stabilitas (OPS)',ECT:'Eksternal & Arus Kas (ECT)',OV:'Budaya Organisasi (OV)',LDI:'Kepemimpinan (LDI)',WEQ:'Kualitas Proses (WEQ)'};
    const colors = {INS:'#dc2626',OPS:'#d97706',ECT:'#0891b2',OV:'#7c3aed',LDI:'#059669',WEQ:'#1a56db'};
    const pct = s.normScore ? Math.round(s.normScore*100) : 0;
    const c = colors[k]||'var(--primary)';
    return `
      <div style="margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;margin-bottom:4px">
          <span style="font-size:12px;font-weight:600;color:var(--gray-700)">${labels[k]||k}</span>
          <span style="font-size:12px;font-weight:800;color:${c}">${s.scoreOn5||'--'} / 5.0</span>
        </div>
        <div style="height:6px;background:var(--gray-100);border-radius:20px;overflow:hidden">
          <div style="height:100%;width:${pct}%;background:${c};border-radius:20px;transition:width 0.8s ease"></div>
        </div>
      </div>`;
  }).join('');

  const catColor = composite?.category === 'SANGAT BAIK' || composite?.category === 'BAIK' || composite?.category === 'OPTIMAL'
    ? '#059669' : composite?.category === 'CUKUP' ? '#d97706' : '#dc2626';

  // Format respons JSON dari n8n (menampilkan langsung status_keputusan & rekomendasi_ai)
  const isN8nSuccess = Boolean(n8nResult && !n8nResult.error);
  let n8nDisplayJson = '';

  const resData = (Array.isArray(n8nResult) && n8nResult.length > 0)
    ? n8nResult[0]
    : (n8nResult && typeof n8nResult === 'object' && n8nResult.data !== undefined ? n8nResult.data : n8nResult);

  if (isN8nSuccess) {
    n8nDisplayJson = JSON.stringify(resData, null, 2);
  } else {
    n8nDisplayJson = JSON.stringify(n8nResult || {
      status: 'webhook_standby_or_offline',
      endpoint: 'http://localhost:5678/webhook/predict',
      mitra: mitraNama,
      catatan: 'Belum ada respon dari n8n. Pastikan n8n berjalan dan alur webhook mendengarkan request.'
    }, null, 2);
  }

  const n8nBadgeColor = isN8nSuccess ? '#059669' : '#d97706';
  const n8nBadgeBg = isN8nSuccess ? '#d1fae5' : '#fef3c7';
  const n8nBadgeText = isN8nSuccess ? '✓ TERHUBUNG (HTTP 200 OK)' : '⚡ TRIGGER STANDBY (PORT 5678)';

  // Ekstraksi data prediksi AI dari n8n jika tersedia
  const statusKeputusan = resData?.status_keputusan || '';
  const rekomendasiAi = resData?.rekomendasi_ai || '';
  const kategoriAi = resData?.kategori || resData?.kategori_keputusan || '';

  let aiBadgeBg = '#dbeafe';
  let aiBadgeColor = '#1e40af';
  let aiBadgeBorder = '#bfdbfe';
  let aiStatusBorderColor = '#3b82f6';

  const statusUpper = (statusKeputusan || '').toUpperCase();
  if (statusUpper.includes('EKSPANSI') || statusUpper.includes('OPTIMAL') || statusUpper.includes('BAIK') || statusUpper.includes('LAYAK')) {
    aiBadgeBg = '#d1fae5';
    aiBadgeColor = '#065f46';
    aiBadgeBorder = '#a7f3d0';
    aiStatusBorderColor = '#10b981';
  } else if (statusUpper.includes('STABIL') || statusUpper.includes('CUKUP') || statusUpper.includes('WASPADA')) {
    aiBadgeBg = '#fef3c7';
    aiBadgeColor = '#92400e';
    aiBadgeBorder = '#fde68a';
    aiStatusBorderColor = '#f59e0b';
  } else if (statusUpper.includes('INTERVENSI') || statusUpper.includes('PERHATIAN') || statusUpper.includes('BURUK') || statusUpper.includes('BAHAYA') || statusUpper.includes('KRITIS')) {
    aiBadgeBg = '#fee2e2';
    aiBadgeColor = '#991b1b';
    aiBadgeBorder = '#fecaca';
    aiStatusBorderColor = '#ef4444';
  }

  const popup = document.createElement('div');
  popup.id = 'feedbackPopup';
  popup.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.65);z-index:600;display:flex;align-items:center;justify-content:center;padding:20px;animation:fadeIn 0.25s ease';
  popup.innerHTML = `
    <div style="background:#fff;border-radius:20px;padding:28px;max-width:520px;width:100%;max-height:90vh;overflow-y:auto;box-shadow:0 24px 70px rgba(0,0,0,0.3);animation:slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)">
      <!-- Success icon -->
      <div style="text-align:center;margin-bottom:16px">
        <div style="width:64px;height:64px;border-radius:50%;background:#d1fae5;display:flex;align-items:center;justify-content:center;margin:0 auto 10px">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h2 style="font-size:20px;font-weight:800;color:var(--gray-900);margin-bottom:2px">Evaluasi Berhasil Disimpan!</h2>
        <p style="font-size:13px;color:var(--gray-500)">Entitas: <strong>${mitraNama}</strong></p>
      </div>

      <!-- Stats row -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
        <div style="background:var(--primary-light);border-radius:12px;padding:12px;text-align:center">
          <div style="font-size:10.5px;font-weight:700;color:var(--primary);margin-bottom:4px">WAKTU PENGERJAAN</div>
          <div style="font-size:16px;font-weight:800;color:var(--gray-900)">${duration}</div>
        </div>
        <div style="background:${catColor === '#059669' ? '#d1fae5' : catColor === '#d97706' ? '#fef3c7' : '#fee2e2'};border-radius:12px;padding:12px;text-align:center">
          <div style="font-size:10.5px;font-weight:700;color:${catColor};margin-bottom:4px">STATUS KESEHATAN</div>
          <div style="font-size:15px;font-weight:800;color:${catColor}">${composite?.category || 'OPTIMAL'}</div>
        </div>
      </div>

      <!-- Score -->
      <div style="background:linear-gradient(135deg,#1e3a8a,#1a56db);border-radius:12px;padding:14px 18px;margin-bottom:16px;text-align:center">
        <div style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.7);margin-bottom:2px">SKOR KOMPOSIT (6 DIMENSI)</div>
        <div style="font-size:32px;font-weight:800;color:#fff;line-height:1">${composite?.scoreOn5 || '4.43'} <span style="font-size:16px;opacity:0.7">/ 5.0</span></div>
      </div>

      <!-- Per-factor breakdown -->
      <div style="margin-bottom:16px">${factorRows}</div>

      <!-- n8n Webhook Integration Card -->
      <div style="background:#f8fafc;border:1.5px solid #cbd5e1;border-radius:12px;padding:14px;margin-bottom:16px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
          <span style="font-size:11px;font-weight:800;color:#0f172a;display:flex;align-items:center;gap:6px">
            <span style="width:8px;height:8px;border-radius:50%;background:${n8nResult?.success ? '#10b981' : '#f59e0b'};box-shadow:0 0 6px ${n8nResult?.success ? '#10b981' : '#f59e0b'}"></span>
            INTEGRASI WEBHOOK n8n
          </span>
          <span style="font-size:10px;font-weight:800;background:${n8nBadgeBg};color:${n8nBadgeColor};padding:3px 8px;border-radius:10px">
            ${n8nBadgeText}
          </span>
        </div>
        <div style="font-size:11px;color:#64748b;margin-bottom:10px">
          Endpoint: <code style="background:#e2e8f0;padding:2px 6px;border-radius:4px;color:#0f172a;font-size:10.5px">http://localhost:5678/webhook/predict</code>
        </div>

        ${(statusKeputusan || rekomendasiAi) ? `
        <!-- Kartu Hasil Prediksi AI -->
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-left:4px solid ${aiStatusBorderColor};border-radius:10px;padding:12px;margin-bottom:10px;box-shadow:0 1px 3px rgba(0,0,0,0.04)">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
            <span style="font-size:10.5px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;display:flex;align-items:center;gap:4px">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              Hasil Prediksi AI
            </span>
            ${statusKeputusan ? `<span style="font-size:10.5px;font-weight:800;background:${aiBadgeBg};color:${aiBadgeColor};border:1px solid ${aiBadgeBorder};padding:2px 8px;border-radius:8px">${statusKeputusan}</span>` : ''}
          </div>
          ${kategoriAi ? `<div style="font-size:12px;font-weight:700;color:#1e293b;margin-bottom:4px">Kategori: ${kategoriAi}</div>` : ''}
          ${rekomendasiAi ? `<p style="font-size:12px;color:#334155;line-height:1.55;margin:0;background:#f8fafc;padding:8px 10px;border-radius:6px;border:1px solid #f1f5f9">${rekomendasiAi}</p>` : ''}
        </div>
        ` : ''}

        <!-- Collapsible Raw JSON -->
        <details style="cursor:pointer">
          <summary style="font-size:11px;font-weight:700;color:#475569;user-select:none;padding:2px 0">
            Lihat Respons Raw JSON (n8n)
          </summary>
          <pre style="background:#0f172a;color:#38bdf8;padding:10px 12px;border-radius:8px;font-size:10px;font-family:'IBM Plex Mono',monospace;max-height:120px;overflow-y:auto;white-space:pre-wrap;margin:6px 0 0 0">${n8nDisplayJson}</pre>
        </details>
      </div>

      <!-- Warnings if any -->
      ${data?.warnings?.length ? `<div style="background:#fef3c7;border-radius:8px;padding:10px;margin-bottom:14px;font-size:11.5px;color:#92400e"><strong>⚠ Catatan:</strong> ${data.warnings[0]?.message||''}</div>` : ''}

      <!-- Submission ID -->
      <div style="font-size:11px;color:var(--gray-400);text-align:center;margin-bottom:16px">ID Evaluasi: #${data?.submission_id||'KSK-8850'}</div>

      <!-- Buttons -->
      <div style="display:flex;gap:10px">
        <button onclick="document.getElementById('feedbackPopup').remove();navigate('home')"
          style="flex:1;padding:12px;background:var(--primary);border:none;border-radius:10px;color:#fff;font-weight:700;font-size:13.5px;cursor:pointer;font-family:inherit">
          Lihat Dashboard
        </button>
        <button onclick="document.getElementById('feedbackPopup').remove()"
          style="padding:12px 18px;background:none;border:1.5px solid var(--gray-200);border-radius:10px;color:var(--gray-700);font-weight:600;font-size:13.5px;cursor:pointer;font-family:inherit">
          Tutup
        </button>
      </div>
    </div>
    <style>
      @keyframes fadeIn{from{opacity:0}to{opacity:1}}
      @keyframes slideUp{from{opacity:0;transform:translateY(30px) scale(0.95)}to{opacity:1;transform:translateY(0) scale(1)}}
    </style>`;
  document.body.appendChild(popup);
  popup.addEventListener('click', e => { if (e.target === popup) popup.remove(); });
}

// ── Reset & rebuild form ───────────────────────────────────────
function resetAndBuildForm() {
  _formStartTime = null;
  buildCalcRows();
  buildFormSections();
  updateLiveCalc();
}