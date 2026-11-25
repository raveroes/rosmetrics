/**
 * RosMetrics — Integrasi Trigger Webhook n8n
 * Mengirimkan data evaluasi UMKM (termasuk mitra Kopi Sudut Kota) ke webhook n8n lokal.
 */

// Endpoint lokal testing/development
const N8N_WEBHOOK_URL_TEST = 'http://localhost:5678/webhook/predict';

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
      fallbackNote: 'Webhook n8n lokal belum aktif di http://localhost:5678/webhook-test/predict atau belum menekan Listen for Test Event.'
    };
  }
}

// Pastikan fungsi dapat diakses secara global
window.kirimKeN8n = kirimKeN8n;

