import api from './api';

export async function enhancePromptApi(prompt) {
  const res = await api.post('/api/images/enhance', { prompt });
  return res.data;
}

export async function generateImages(prompt, count, width, height) {
  const res = await api.post('/api/images/generate', { prompt, count, width, height });
  return res.data;
}

export async function generateBulk(file, count, width, height, enhance = false) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('count', count);
  formData.append('width', width);
  formData.append('height', height);
  formData.append('enhance', enhance ? 'true' : 'false');
  const res = await api.post('/api/images/generate-bulk', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function fetchImages() {
  const res = await api.get('/api/images');
  return res.data;
}

export async function deleteImage(id) {
  const res = await api.delete(`/api/images/${id}`);
  return res.data;
}

export async function downloadImages(imageIds) {
  const res = await api.post('/api/images/download', { image_ids: imageIds }, {
    responseType: 'blob',
  });
  return res.data;
}

export function getImageUrl(imageId) {
  const base = import.meta.env.VITE_API_URL || '';
  return `${base}/api/images/${imageId}/data`;
}
