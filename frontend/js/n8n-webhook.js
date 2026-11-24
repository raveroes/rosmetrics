/**
 * RosMetrics — Integrasi Trigger Webhook n8n
 * Mengirimkan data evaluasi UMKM (termasuk mitra Kopi Sudut Kota) ke webhook n8n lokal.
 */

// Endpoint lokal testing/development
const N8N_WEBHOOK_URL_TEST = 'http://localhost:5678/webhook-test/predict';

// Opsi endpoint production (aktifkan saat workflow n8n sudah dideploy/active):
// const N8N_WEBHOOK_URL_PROD = 'http://localhost:5678/webhook/predict';

const N8N_ENDPOINT = N8N_WEBHOOK_URL_TEST;

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

    const res = await fetch(N8N_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeout);

    let resData;
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      resData = await res.json();
    } else {
      const text = await res.text();
      try {
        resData = JSON.parse(text);
      } catch (err) {
        resData = { message: text || 'Webhook berhasil diterima oleh n8n' };
      }
    }

    console.log('[RosMetrics <- n8n] Respon webhook diterima:', resData);
    return {
      success: res.ok,
      status: res.status,
      data: resData,
      endpoint: N8N_ENDPOINT
    };
  } catch (err) {
    console.warn('[RosMetrics -> n8n] Peringatan koneksi n8n webhook:', err);
    return {
      success: false,
      error: err.name === 'AbortError' ? 'Koneksi ke n8n webhook timeout (7s)' : err.message,
      endpoint: N8N_ENDPOINT,
      fallbackNote: 'Webhook n8n lokal belum aktif di http://localhost:5678/webhook-test/predict atau belum menekan Listen for Test Event.'
    };
  }
}

// Pastikan fungsi dapat diakses secara global
window.kirimKeN8n = kirimKeN8n;

