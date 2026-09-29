const axios = require('axios');
const env = require('../config/env');

async function callImageAPI({ prompt, width, height }) {
  let response;
  try {
    response = await axios.post(
      env.IMAGE_API_URL,
      { prompt, model: 'turbo', width, height },
      {
        headers: {
          Authorization: `Bearer ${env.IMAGE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 120000,
      }
    );
  } catch (err) {
    const status = err?.response?.status;
    const detail = typeof err?.response?.data === 'string'
      ? err.response.data
      : JSON.stringify(err?.response?.data || {});
    throw new Error(`Image API failed${status ? ` (${status})` : ''}: ${detail || err.message}`);
  }

  const data = response.data;

  // OpenAI-compatible: may return base64 in data[].b64_json or a URL in data[].url
  if (data.data && data.data[0]) {
    const item = data.data[0];
    if (item.b64_json) {
      return Buffer.from(item.b64_json, 'base64');
    }
    if (item.url) {
      const imgRes = await axios.get(item.url, { responseType: 'arraybuffer', timeout: 60000 });
      return Buffer.from(imgRes.data);
    }
  }

  // Fallback: response itself is raw binary
  if (Buffer.isBuffer(data)) return data;
  if (data instanceof ArrayBuffer || ArrayBuffer.isView(data)) return Buffer.from(data);

  throw new Error('Unexpected image API response format');
}

module.exports = { callImageAPI };
