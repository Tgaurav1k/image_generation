import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, CheckSquare, XSquare, Loader2 } from 'lucide-react';
import { downloadImages } from '../../services/imageService';
import ImageCard from './ImageCard';
import ImageDetailPanel from './ImageDetailPanel';
import Button from '../common/Button';
import { saveAs } from 'file-saver';

export default function ImageLibraryView({
  title,
  subtitle,
  emptyTitle = 'No images yet',
  emptySubtitle = 'Generate some images to see them here',
  loading,
  images,
  selectedIds,
  toggleSelect,
  selectAll,
  clearSelection,
  onDelete,
}) {
  const [downloading, setDownloading] = useState(false);
  const [detailImage, setDetailImage] = useState(null);

  const handleDownloadSelected = async () => {
    if (selectedIds.length === 0) return;
    setDownloading(true);
    try {
      const blob = await downloadImages(selectedIds);
      saveAs(blob, 'images_download.zip');
    } catch { /* ignore */ }
    setDownloading(false);
  };

  const handleDownloadSingle = async (img) => {
    try {
      const blob = await downloadImages([img.id]);
      saveAs(blob, `${(img.prompt || 'image').slice(0, 30)}.zip`);
    } catch { /* ignore */ }
  };

  const handleDelete = async (img) => {
    try {
      await onDelete?.(img);
      if (detailImage?.id === img.id) setDetailImage(null);
    } catch { /* ignore */ }
  };

  const handleSelectFromPanel = (img) => {
    toggleSelect(img.id);
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: 300, color: 'var(--text-muted)',
      }}>
        <div style={{
          width: 32, height: 32, border: '3px solid var(--border-subtle)',
          borderTopColor: 'var(--accent-sage)', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
      </div>
    );
  }

  return (
    <>
      <div className="image-library-root" style={{ display: 'flex', position: 'relative' }}>
        <div
          className="image-library-main"
          style={{
            flex: 1,
            transition: 'margin-right var(--duration-slow) var(--ease-out)',
            marginRight: detailImage ? 340 : 0,
          }}
        >
          <div style={{
            display: 'flex', flexWrap: 'wrap', alignItems: 'center',
            justifyContent: 'space-between', gap: 16, marginBottom: 24,
          }}>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 700 }}>{title}</h1>
              {subtitle && (
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>{subtitle}</p>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Button variant="ghost" onClick={selectAll}>
                <CheckSquare size={16} /> Select All
              </Button>
              {selectedIds.length > 0 && (
                <Button variant="ghost" onClick={clearSelection}>
                  <XSquare size={16} /> Clear
                </Button>
              )}
              <Button
                disabled={selectedIds.length === 0 || downloading}
                onClick={handleDownloadSelected}
              >
                {downloading
                  ? <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} />
                  : <Download size={16} />}
                Download ({selectedIds.length})
              </Button>
            </div>
          </div>

          {images.length === 0 ? (
            <div className="glass" style={{
              borderRadius: 'var(--radius-xl)', padding: 48,
              textAlign: 'center', color: 'var(--text-muted)',
            }}>
              <p style={{ fontSize: 16, marginBottom: 4 }}>{emptyTitle}</p>
              <p style={{ fontSize: 13 }}>{emptySubtitle}</p>
            </div>
          ) : (
            <div
              className="image-library-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: 16,
              }}
            >
              {images.map((img, i) => (
                <motion.div
                  key={img.id}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.35, delay: i * 0.02, ease: [0.16, 1, 0.3, 1] }}
                >
                  <ImageCard
                    image={img}
                    selected={selectedIds.includes(img.id)}
                    anySelected={selectedIds.length > 0}
                    onToggle={() => toggleSelect(img.id)}
                    onViewDetail={() => setDetailImage(img)}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <AnimatePresence>
          {detailImage && (
            <ImageDetailPanel
              image={detailImage}
              onClose={() => setDetailImage(null)}
              onDownload={handleDownloadSingle}
              onDelete={onDelete ? handleDelete : undefined}
              onSelect={handleSelectFromPanel}
            />
          )}
        </AnimatePresence>
      </div>

      <style>{`
        @media (max-width: 767px) {
          .image-library-grid {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)) !important;
          }
          .image-library-main {
            margin-right: 0 !important;
          }
        }
        @media (min-width: 1441px) {
          .image-library-grid {
            grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)) !important;
          }
        }
      `}</style>
    </>
  );
}
