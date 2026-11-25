/**
 * RosMetrics — Integrasi Trigger Webhook n8n & EmailJS Persona Dispatch
 * Mengirimkan data evaluasi UMKM (termasuk mitra Kopi Sudut Kota) ke webhook n8n lokal
 * serta mengirimkan laporan diagnostik berdesain ke email dosen melalui EmailJS.
 */

// Endpoint lokal testing/development
const N8N_WEBHOOK_URL_TEST = 'http://localhost:5678/webhook/predict';

// Opsi endpoint production (aktifkan saat workflow n8n sudah dideploy/active):
// const N8N_WEBHOOK_URL_PROD = 'http://localhost:5678/webhook/predict';

const N8N_ENDPOINT = N8N_WEBHOOK_URL_TEST;

// Konfigurasi EmailJS
const EMAILJS_PUBLIC_KEY = 'I7lq6XcsZHDrRS7o-';
const EMAILJS_SERVICE_ID = 'service_jghpire';
const EMAILJS_TEMPLATE_ID = 'template_4xuhc0g';

/**
 * Mengirimkan data evaluasi ke webhook n8n
 * @param {Object} payload - Data mitra dan metrik 6 faktor evaluasi
 * @returns {Promise<Object>} Respon dari n8n webhook
 */
async function kirimKeN8n(payload) {
  console.log('[RosMetrics -> n8n] Mengirim data ke webhook:', N8N_ENDPOINT, payload);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);

    const response = await fetch(N8N_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (response.ok) {
      const n8nResult = await response.json();
      console.log('[RosMetrics <- n8n] Respon webhook berhasil (HTTP 200 OK):', n8nResult);
      return n8nResult;
    } else {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = await response.text();
      }
      console.warn('[RosMetrics <- n8n] Respon webhook error (status non-200):', response.status, errorData);
      return {
        error: true,
        status: response.status,
        message: errorData,
        endpoint: N8N_ENDPOINT
      };
    }
  } catch (err) {
    console.warn('[RosMetrics -> n8n] Peringatan koneksi n8n webhook:', err);
    return {
      error: true,
      message: err.name === 'AbortError' ? 'Koneksi ke n8n webhook timeout (7s)' : err.message,
      endpoint: N8N_ENDPOINT,
      fallbackNote: 'Webhook n8n lokal belum aktif di http://localhost:5678/webhook/predict atau workflow n8n belum diaktifkan.'
    };
  }
}

/**
 * Memetakan skor fundamental (0–100) ke profil Persona Experience dan langkah tindak lanjut
 * @param {number|string} skorFundamental
 * @returns {Object} Metadata persona, kategori, status, dan rencana aksi
 */
function getPersonaExperience(skorFundamental) {
  const skor = Number(skorFundamental) || 0;

  if (skor >= 80) {
    return {
      kategori: 'Sangat Baik (Optimal)',
      status_keputusan: 'LAYAK EKSPANSI',
      persona_badge: 'PERSONA: VISIONARY SCALER (SIAP TUMBUH)',
      persona_narasi:
        'Fondasi sumber daya dan operasional sudah terstandarisasi dengan sangat baik; fokus pada replikasi SOP dan ekspansi kanal distribusi/cabang baru.',
      rekomendasi_ai:
        'Kapasitas organisasi dan arus kas berada pada zona optimal untuk melakukan replikasi model bisnis maupun pembukaan cabang ruko kedua.',
      langkah_1: 'Susun SOP operasional standar sebagai cetak biru replikasi cabang.',
      langkah_2: 'Alokasikan cadangan laba untuk ekspansi kanal distribusi atau lokasi baru.',
      langkah_3: 'Terapkan dashboard KPI mingguan untuk memantau performa lintas unit.'
    };
  }

  if (skor >= 60) {
    return {
      kategori: 'Cukup (Stabilisasi)',
      status_keputusan: 'STABILISASI & EFISIENSI',
      persona_badge: 'PERSONA: RESILIENT BUILDER (FASE KONSOLIDASI)',
      persona_narasi:
        'Bisnis memiliki daya tahan baik namun masih bergantung pada kontrol harian pemilik; fokus pada efisiensi HPP dan dokumentasi SOP.',
      rekomendasi_ai:
        'Perkuat konsistensi proses internal dan efisiensi biaya produksi sebelum mengambil keputusan ekspansi agresif.',
      langkah_1: 'Audit struktur Harga Pokok Penjualan (HPP) untuk menekan pemborosan bahan baku.',
      langkah_2: 'Dokumentasikan alur kerja inti agar operasional tidak bergantung penuh pada pemilik.',
      langkah_3: 'Tetapkan target evaluasi arus kas dan retensi pelanggan per 30 hari.'
    };
  }

  return {
    kategori: 'Kritis (Butuh Intervensi)',
    status_keputusan: 'BUTUH INTERVENSI SEGERA',
    persona_badge: 'PERSONA: SURVIVAL NAVIGATOR (PRIORITAS PEMULIHAN)',
    persona_narasi:
      'Fase krusial yang membutuhkan pengamanan likuiditas kas, pemangkasan pemborosan operasional, dan penyelarasan tim.',
    rekomendasi_ai:
      'Prioritaskan penyelamatan arus kas jangka pendek dan restrukturisasi beban operasional harian secara ketat.',
    langkah_1: 'Bekukan pengeluaran non-esensial dan fokus pada produk dengan margin tertinggi.',
    langkah_2: 'Negosiasikan ulang tempo pembayaran dengan pemasok untuk menjaga likuiditas kas.',
    langkah_3: 'Lakukan evaluasi mingguan terhadap beban operasional dan produktivitas tim.'
  };
}

/**
 * Mengirimkan laporan hasil evaluasi lengkap ke email dosen via EmailJS
 * @param {Object} evaluasiData - Objek hasil dari n8nResult atau skor komposit lokal
 */
async function kirimHasilEvaluasiKeEmailDosen(evaluasiData) {
  const inputEl = document.getElementById('n8n-email-recipient');
  const statusEl = document.getElementById('n8n-email-status');
  const btnEl = document.getElementById('n8n-send-email-btn');

  const toEmail = (inputEl?.value || '').trim();
  if (!toEmail || !toEmail.includes('@')) {
    if (statusEl) {
      statusEl.textContent = 'MASUKKAN ALAMAT EMAIL DOSEN YANG VALID.';
      statusEl.style.color = '#F87171';
    }
    return;
  }

  if (!window.emailjs) {
    if (statusEl) {
      statusEl.textContent = 'SDK EMAILJS BELUM TERMUAT. REFRESH HALAMAN (CTRL+SHIFT+R).';
      statusEl.style.color = '#F87171';
    }
    return;
  }

  const faktor = evaluasiData?.rincian_faktor || evaluasiData?.skor_6_faktor || {};
  const skorFundamental = Number(
    evaluasiData?.indeks_kesehatan ?? evaluasiData?.skor_fundamental ?? 0
  ).toFixed(1);

  const persona = getPersonaExperience(skorFundamental);
  const tanggalSekarang = new Date().toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const templateParams = {
    to_email: toEmail,
    tanggal: tanggalSekarang,
    mitra: evaluasiData?.mitra || 'Kopi Sudut Kota',
    skor_fundamental: skorFundamental,
    kategori: evaluasiData?.kategori || persona.kategori,
    status_keputusan: evaluasiData?.status_keputusan || persona.status_keputusan,
    persona_badge: persona.persona_badge,
    persona_narasi: persona.persona_narasi,
    ins: Number(faktor.INS ?? 0).toFixed(2),
    ops: Number(faktor.OPS ?? 0).toFixed(2),
    ect: Number(faktor.ECT ?? 0).toFixed(2),
    ov: Number(faktor.OV ?? 0).toFixed(2),
    ldi: Number(faktor.LDI ?? 0).toFixed(2),
    weq: Number(faktor.WEQ ?? 0).toFixed(2),
    rekomendasi_ai: evaluasiData?.rekomendasi_ai || persona.rekomendasi_ai,
    langkah_1: persona.langkah_1,
    langkah_2: persona.langkah_2,
    langkah_3: persona.langkah_3
  };

  try {
    if (btnEl) {
      btnEl.disabled = true;
      btnEl.textContent = 'MENGIRIM...';
    }
    if (statusEl) {
      statusEl.textContent = `MENGIRIM LAPORAN KE ${toEmail.toUpperCase()}...`;
      statusEl.style.color = '#A7FFD0';
    }

    emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);

    console.log('[RosMetrics -> EmailJS] Laporan berhasil terkirim ke:', toEmail, templateParams);
    if (statusEl) {
      statusEl.textContent = `✓ LAPORAN TERKIRIM KE ${toEmail}`;
      statusEl.style.color = '#C9F46B';
    }
  } catch (err) {
    console.error('[RosMetrics EmailJS Error]:', err);
    if (statusEl) {
      statusEl.textContent = `GAGAL MENGIRIM: ${err?.text || err?.message || 'PERIKSA TEMPLATE EMAILJS'}`;
      statusEl.style.color = '#F87171';
    }
  } finally {
    if (btnEl) {
      btnEl.disabled = false;
      btnEl.textContent = 'KIRIM EMAIL ↗';
    }
  }
}

// Pastikan seluruh fungsi dapat diakses secara global oleh form.js
window.kirimKeN8n = kirimKeN8n;
window.getPersonaExperience = getPersonaExperience;
window.kirimHasilEvaluasiKeEmailDosen = kirimHasilEvaluasiKeEmailDosen;