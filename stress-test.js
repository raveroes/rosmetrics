import http from 'k6/http';
import { check, sleep } from 'k6';

// Jalankan: k6 run -e API_BASE=https://<ref>.supabase.co/functions/v1/api stress-test.js

export const options = {
  vus: 50,        // 50 user virtual sekaligus
  duration: '30s', // selama 30 detik
};

export default function () {
  const res = http.get(
    `${__ENV.API_BASE}?action=health`
  );

  check(res, {
    'status 200': (r) => r.status === 200,
    'response time < 3000ms': (r) => r.timings.duration < 3000,
  });

  sleep(1);
}