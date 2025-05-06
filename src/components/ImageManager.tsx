import React, { useState, useEffect } from 'react';
import { Trash2, Loader2, Copy, Camera, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import ConfirmModal from './ConfirmModal';

interface ImageItem {
  name: string;
  publicUrl: string;
  path: string;
}

const ImageManager: React.FC = () => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const imagesPerPage = 12;

  // Estados para el modal de subida de imagen
  const [showModal, setShowModal] = useState(false);
  const [modalFiles, setModalFiles] = useState<File[]>([]);
  const [modalPreviews, setModalPreviews] = useState<string[]>([]);
  const [modalUploading, setModalUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');

  // Estado para notificación de copiado
  const [copyMessage, setCopyMessage] = useState('');

  // Estado para el modal de confirmación para eliminar una imagen
  const [confirmDeleteImage, setConfirmDeleteImage] = useState<string | null>(null);

  // Estado para el modal de confirmación para eliminar TODAS las imágenes
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);

  const bucket = 'my-bucket';
  const folder = 'images';

  const fetchImages = async () => {
    setLoadingImages(true);
    const { data, error } = await supabase
      .storage
      .from(bucket)
      .list(folder, { limit: 100, offset: 0, sortBy: { column: 'name', order: 'desc' } });
    if (error) {
      console.error('Error al listar imágenes:', error);
      setLoadingImages(false);
      return;
    }
    if (data) {
      const fetchedImages: ImageItem[] = data.map(file => {
        const filePath = `${folder}/${file.name}`;
        const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(filePath);
        return { name: file.name, publicUrl: publicData.publicUrl, path: filePath };
      });
      setImages(fetchedImages);
    }
    setLoadingImages(false);
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const indexOfLast = currentPage * imagesPerPage;
  const indexOfFirst = indexOfLast - imagesPerPage;
  const currentImages = images.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(images.length / imagesPerPage);

  const handleModalFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setModalFiles(prev => [...prev, ...filesArray]);
      const previews = filesArray.map(file => URL.createObjectURL(file));
      setModalPreviews(prev => [...prev, ...previews]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const filesArray = Array.from(e.dataTransfer.files);
      setModalFiles(prev => [...prev, ...filesArray]);
      const previews = filesArray.map(file => URL.createObjectURL(file));
      setModalPreviews(prev => [...prev, ...previews]);
    }
  };

  const handleModalSubmit = async () => {
    if (modalFiles.length > 0) {
      setModalUploading(true);
      const uploadedImages: ImageItem[] = [];
      for (const file of modalFiles) {
        const filePath = `${folder}/${Date.now()}-${file.name}`;
        const { error } = await supabase.storage.from(bucket).upload(filePath, file);
        if (error) {
          console.error('Error al subir la imagen:', error);
        } else {
          const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
          if (data?.publicUrl) {
            uploadedImages.push({ name: file.name, publicUrl: data.publicUrl, path: filePath });
          }
        }
      }
      setImages(prev => [...uploadedImages, ...prev]);
      setModalUploading(false);
      setShowModal(false);
      setModalFiles([]);
      setModalPreviews([]);
      setUploadMessage('Imágenes subidas correctamente');
      setTimeout(() => {
        setUploadMessage('');
      }, 2000);
    } else {
      setShowModal(false);
    }
  };

  // Maneja el clic para eliminar una imagen (muestra el modal de confirmación)
  const handleDeleteClick = (path: string) => {
    setConfirmDeleteImage(path);
  };

  // Función para confirmar la eliminación de una imagen
  const confirmDeleteImageAction = async () => {
    if (confirmDeleteImage) {
      const { error } = await supabase.storage.from(bucket).remove([confirmDeleteImage]);
      if (error) {
        console.error('Error al eliminar la imagen:', error);
      } else {
        await fetchImages();
      }
      setConfirmDeleteImage(null);
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopyMessage('Link copiado al portapapeles');
    setTimeout(() => {
      setCopyMessage('');
    }, 2000);
  };

  // Función para eliminar TODAS las imágenes (se usa el modal existente en showDeleteAllConfirm)
  const confirmDeleteAll = async () => {
    const paths = images.map(img => img.path);
    if (paths.length > 0) {
      const { error } = await supabase.storage.from(bucket).remove(paths);
      if (error) {
        console.error('Error al eliminar todas las imágenes:', error);
      } else {
        await fetchImages();
      }
    }
    setShowDeleteAllConfirm(false);
  };

  return (
    <div className="p-4 bg-white rounded shadow-md">
      {/* Mensaje global de subida */}
      {uploadMessage && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'green',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '5px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
            zIndex: 9999
          }}
        >
          {uploadMessage}
        </div>
      )}
      {/* Mensaje global de copiado */}
      {copyMessage && (
        <div
          style={{
            position: 'fixed',
            top: '70px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'blue',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '5px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
            zIndex: 9999
          }}
        >
          {copyMessage}
        </div>
      )}

      <h2 className="text-xl font-bold mb-4">Gestor de Imágenes</h2>
      <div className="mb-4 flex justify-start space-x-4">
        <button onClick={() => setShowModal(true)} className="btn-primary">
          Agregar Imágenes
        </button>
        <button
          onClick={() => setShowDeleteAllConfirm(true)}
          className="btn-secondary"
          title="Eliminar todas las imágenes"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {loadingImages ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin mr-2" />
          <span className="text-lg">Cargando imágenes...</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {currentImages.map((img, index) => (
              <div key={index} className="border p-2 rounded">
                <a href={img.publicUrl} target="_blank" rel="noopener noreferrer">
                  <img
                    src={img.publicUrl}
                    alt={img.name}
                    className="w-full h-32 object-contain mb-2"
                  />
                </a>
                <div className="text-xs break-all mb-2">
                  <a
                    href={img.publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {img.publicUrl}
                  </a>
                </div>
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => copyToClipboard(img.publicUrl)}
                    className="btn-secondary"
                    title="Copiar link"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(img.path)}
                    className="btn-secondary"
                    title="Eliminar imagen"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-4 mt-4">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`btn-secondary ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Anterior
              </button>
              <span className="text-sm text-gray-700">
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`btn-secondary ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}

      {/* Modal para subir imágenes */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
            <div
              className="border-4 border-dashed border-gray-300 rounded-lg h-64 flex justify-center items-center mb-6 cursor-pointer relative"
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              <div className="flex flex-col items-center">
                <Camera className="w-12 h-12 text-gray-500 mb-2" />
                <span className="text-xl text-gray-600">Selecciona fotos o arrástralas aquí</span>
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleModalFileSelect}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>

            {modalFiles.length > 0 && (
              <div className="mb-6 max-h-40 overflow-y-auto border p-2 rounded">
                <ul className="text-sm text-gray-700">
                  {modalFiles.map((file, index) => (
                    <li
                      key={index}
                      className="flex justify-between items-center py-1 border-b last:border-0"
                    >
                      <span>{file.name}</span>
                      <button
                        onClick={() => {
                          setModalFiles(prev => prev.filter((_, i) => i !== index));
                          setModalPreviews(prev => prev.filter((_, i) => i !== index));
                        }}
                        className="text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end space-x-4">
              {modalUploading ? (
                <div className="flex items-center">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  <span>Subiendo...</span>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setModalFiles([]);
                      setModalPreviews([]);
                    }}
                    className="btn-secondary"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleModalSubmit}
                    className="btn-primary"
                  >
                    Aceptar
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación para eliminar TODAS las imágenes */}
      {showDeleteAllConfirm && (
        <ConfirmModal
          message="¿Estás seguro de eliminar todas las imágenes?"
          onConfirm={confirmDeleteAll}
          onCancel={() => setShowDeleteAllConfirm(false)}
          isDanger
        />
      )}

      {/* Modal de confirmación para eliminar una imagen */}
      {confirmDeleteImage && (
        <ConfirmModal
          message="¿Estás seguro de eliminar esta imagen?"
          onConfirm={confirmDeleteImageAction}
          onCancel={() => setConfirmDeleteImage(null)}
          isDanger
        />
      )}
    </div>
  );
};

export default ImageManager;
