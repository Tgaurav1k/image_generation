import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PenLine, FileSpreadsheet, CheckCircle2, AlertCircle, Download, CheckSquare, XSquare, Loader2 } from 'lucide-react';
import SinglePromptForm from '../components/generate/SinglePromptForm';
import ExcelUploader from '../components/generate/ExcelUploader';
import ProgressBar from '../components/common/ProgressBar';
import PageTransition from '../components/common/PageTransition';
import Button from '../components/common/Button';
import ImageCard from '../components/image/ImageCard';
import ImageDetailPanel from '../components/image/ImageDetailPanel';
import useImageStore from '../store/imageStore';
import { generateImages, generateBulk, downloadImages, deleteImage } from '../services/imageService';
import { saveAs } from 'file-saver';

export default function GeneratePage() {
  const [tab, setTab] = useState('single');
  const { isGenerating, setGenerating, setProgress, progress, addImages, removeImage } = useImageStore();
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [selectedResultIds, setSelectedResultIds] = useState([]);
  const [detailImage, setDetailImage] = useState(null);
  const [downloading, setDownloading] = useState(false);

  const resetBatchUi = () => {
    setSelectedResultIds([]);
    setDetailImage(null);
  };

  const handleSingleGenerate = async ({ prompt, count, width, height }) => {
    setGenerating(true);
    setError('');
    setResult(null);
    resetBatchUi();
    setProgress(10);

    const interval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 5, 90));
    }, 800);

    try {
      console.log('[Generate][Single] Request', { prompt, count, width, height });
      const data = await generateImages(prompt, count, width, height);
      console.log('[Generate][Single] Success', data);
      clearInterval(interval);
      setProgress(100);
      setResult(data);
      setSelectedResultIds([]);
      if (data.images?.length) addImages(data.images);
    } catch (err) {
      console.error('[Generate][Single] Error', {
        message: err?.message,
        status: err?.response?.status,
        data: err?.response?.data,
      });
      clearInterval(interval);
      setError(err.response?.data?.error || 'Image service unavailable, try again later');
    } finally {
      setGenerating(false);
    }
  };

  const handleBulkGenerate = async ({ file, count, width, height, enhance = false }) => {
    setGenerating(true);
    setError('');
    setResult(null);
    resetBatchUi();
    setProgress(10);

    const interval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 3, 90));
    }, 1000);

    try {
      console.log('[Generate][Bulk] Request', {
        file: file?.name,
        promptsCountHint: file ? 'uploaded' : 'none',
        count,
        width,
        height,
      });
      const data = await generateBulk(file, count, width, height, enhance);
      console.log('[Generate][Bulk] Success', data);
      clearInterval(interval);
      setProgress(100);
      setResult(data);
      setSelectedResultIds([]);
      if (data.images?.length) addImages(data.images);
    } catch (err) {
      console.error('[Generate][Bulk] Error', {
        message: err?.message,
        status: err?.response?.status,
        data: err?.response?.data,
      });
      clearInterval(interval);
      setError(err.response?.data?.error || 'Image service unavailable, try again later');
    } finally {
      setGenerating(false);
    }
  };

  const resultImages = result?.images || [];
  const toggleResultSelect = (id) => {
    setSelectedResultIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };
  const selectAllResult = () => setSelectedResultIds(resultImages.map((i) => i.id));
  const clearResultSelection = () => setSelectedResultIds([]);

  const handleDownloadSelected = async () => {
    if (selectedResultIds.length === 0) return;
    setDownloading(true);
    try {
      const blob = await downloadImages(selectedResultIds);
      const isSingle = selectedResultIds.length === 1;
      const img = isSingle ? resultImages.find(i => i.id === selectedResultIds[0]) : null;
      saveAs(blob, isSingle ? `${(img?.prompt || 'image').slice(0, 40)}.png` : 'generated_images.zip');
    } catch { /* ignore */ }
    setDownloading(false);
  };

  const handleDownloadAll = async () => {
    if (resultImages.length === 0) return;
    setDownloading(true);
    try {
      const blob = await downloadImages(resultImages.map((i) => i.id));
      const isSingle = resultImages.length === 1;
      saveAs(blob, isSingle ? `${(resultImages[0]?.prompt || 'image').slice(0, 40)}.png` : 'generated_images_all.zip');
    } catch { /* ignore */ }
    setDownloading(false);
  };

  const handleDownloadSingle = async (img) => {
    try {
      const blob = await downloadImages([img.id]);
      saveAs(blob, `${(img.prompt || 'image').slice(0, 40)}.png`);
    } catch { /* ignore */ }
  };

  const handleDeleteFromBatch = async (img) => {
    await deleteImage(img.id);
    removeImage(img.id);
    setResult((prev) => {
      if (!prev?.images) return prev;
      return { ...prev, images: prev.images.filter((i) => i.id !== img.id) };
    });
    setSelectedResultIds((prev) => prev.filter((id) => id !== img.id));
    if (detailImage?.id === img.id) setDetailImage(null);
  };

  const tabStyle = (active) => ({
    padding: '10px 20px', borderRadius: 'var(--radius-full)', fontSize: 14, fontWeight: 500,
    cursor: 'pointer', border: 'none', transition: 'all var(--duration-fast) var(--ease-out)',
    background: active ? 'var(--accent-sage)' : 'transparent',
    color: active ? 'var(--text-inverse)' : 'var(--text-secondary)',
  });

  return (
    <PageTransition>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Generate Images</h1>

        <div className="bento-tile" style={{ marginBottom: 24 }}>
          <div style={{ marginBottom: 24, background: 'var(--bg-elevated)', borderRadius: 'var(--radius-full)', padding: 4, display: 'inline-flex', gap: 4 }}>
            <button type="button" onClick={() => setTab('single')} style={tabStyle(tab === 'single')}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><PenLine size={14} /> Single Prompt</span>
            </button>
            <button type="button" onClick={() => setTab('excel')} style={tabStyle(tab === 'excel')}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><FileSpreadsheet size={14} /> Excel Upload</span>
            </button>
          </div>

          {tab === 'single'
            ? <SinglePromptForm onGenerate={handleSingleGenerate} isGenerating={isGenerating} />
            : <ExcelUploader onGenerate={handleBulkGenerate} isGenerating={isGenerating} />
          }
        </div>

        {isGenerating && (
          <div className="bento-tile" style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 15, fontWeight: 500, marginBottom: 12 }}>Generating Images...</p>
            <ProgressBar progress={progress} label={`${Math.round(progress)}% complete`} />
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 12 }}>Please wait — do not close this tab</p>
          </div>
        )}

        {error && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '14px 18px', borderRadius: 'var(--radius-lg)',
              background: 'rgba(224,100,90,0.08)', color: 'var(--status-error)',
              fontSize: 14, border: '1px solid rgba(224,100,90,0.15)', marginBottom: 24,
            }}>
            <AlertCircle size={18} />
            {error}
          </motion.div>
        )}
      </div>

      {resultImages.length > 0 && (
        <div className="generate-results-root" style={{ marginTop: 8, position: 'relative', display: 'flex' }}>
          <div
            className="generate-results-main"
            style={{
              flex: 1,
              maxWidth: '100%',
              transition: 'margin-right var(--duration-slow) var(--ease-out)',
              marginRight: detailImage ? 340 : 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, color: 'var(--status-success)' }}>
              <CheckCircle2 size={18} />
              <span style={{ fontSize: 14, fontWeight: 500 }}>
                {resultImages.length} image{resultImages.length > 1 ? 's' : ''} generated
                {result.failed > 0 && ` (${result.failed} failed)`}
              </span>
            </div>

            <div style={{
              display: 'flex', flexWrap: 'wrap', alignItems: 'center',
              justifyContent: 'space-between', gap: 12, marginBottom: 20,
            }}>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Select images to download as ZIP</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
                <Button variant="ghost" onClick={selectAllResult}>
                  <CheckSquare size={16} /> Select all
                </Button>
                {selectedResultIds.length > 0 && (
                  <Button variant="ghost" onClick={clearResultSelection}>
                    <XSquare size={16} /> Clear
                  </Button>
                )}
                <Button
                  variant="secondary"
                  disabled={downloading || resultImages.length === 0}
                  onClick={handleDownloadAll}
                >
                  {downloading
                    ? <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} />
                    : <Download size={16} />}
                  Download all
                </Button>
                <Button
                  disabled={selectedResultIds.length === 0 || downloading}
                  onClick={handleDownloadSelected}
                >
                  {downloading
                    ? <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} />
                    : <Download size={16} />}
                  Download ({selectedResultIds.length})
                </Button>
              </div>
            </div>

            <div
              className="generate-results-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: 16,
              }}
            >
              {resultImages.map((img, i) => (
                <motion.div
                  key={img.id}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.35, delay: i * 0.03, ease: [0.16, 1, 0.3, 1] }}
                >
                  <ImageCard
                    image={img}
                    selected={selectedResultIds.includes(img.id)}
                    anySelected={selectedResultIds.length > 0}
                    onToggle={() => toggleResultSelect(img.id)}
                    onViewDetail={() => setDetailImage(img)}
                  />
                </motion.div>
              ))}
            </div>
          </div>

          <AnimatePresence>
            {detailImage && (
              <ImageDetailPanel
                image={detailImage}
                onClose={() => setDetailImage(null)}
                onDownload={handleDownloadSingle}
                onDelete={handleDeleteFromBatch}
                onSelect={(img) => toggleResultSelect(img.id)}
              />
            )}
          </AnimatePresence>

          <style>{`
            @media (max-width: 767px) {
              .generate-results-grid {
                grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)) !important;
              }
              .generate-results-main {
                margin-right: 0 !important;
              }
            }
            @media (min-width: 1441px) {
              .generate-results-grid {
                grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)) !important;
              }
            }
          `}</style>
        </div>
      )}
    </PageTransition>
  );
}
