import { useEffect, useState } from 'react';
import useImageStore from '../store/imageStore';
import { fetchImages, deleteImage } from '../services/imageService';
import ImageLibraryView from '../components/image/ImageLibraryView';
import PageTransition from '../components/common/PageTransition';

export default function GalleryPage() {
  const { images, setImages, selectedIds, toggleSelect, selectAll, clearSelection, removeImage } = useImageStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchImages()
      .then(data => setImages(data.images || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [setImages]);

  const handleDelete = async (img) => {
    await deleteImage(img.id);
    removeImage(img.id);
  };

  return (
    <PageTransition>
      <ImageLibraryView
        title="Gallery"
        loading={loading}
        images={images}
        selectedIds={selectedIds}
        toggleSelect={toggleSelect}
        selectAll={selectAll}
        clearSelection={clearSelection}
        onDelete={handleDelete}
      />
    </PageTransition>
  );
}
