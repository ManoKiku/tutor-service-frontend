'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import './saved-content.css';
import { deleteSavedContent, getSavedContent, getSavedContentDownloadUrl, uploadSavedContent } from '@/services/saved-content';

export default function SavedContentPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [savedContents, setSavedContents] = useState<SavedContentDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const isTutor = user?.role === 1 || user?.role === 'Tutor';

  const loadSavedContents = useCallback(async () => {
    if (!isTutor) return;
    try {
      setIsLoading(true);
      const data = await getSavedContent();
      setSavedContents(data || []);
    } catch (error) {
      console.error('Error loading saved contents:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isTutor]);

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      if (!isTutor) {
        router.push('/');
        return;
      }
      loadSavedContents();
    }
  }, [isAuthenticated, authLoading, isTutor, router, loadSavedContents]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    setUploadError(null);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadError(null);
    try {
      await uploadSavedContent({ file: selectedFile });
      setSelectedFile(null);
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      await loadSavedContents();
    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadError(error.message || 'Ошибка при загрузке файла');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот файл? Он останется в уже созданных заданиях, но пропадёт из списка сохранённых.')) {
      return;
    }
    setDeletingId(id);
    try {
      await deleteSavedContent(id);
      setSavedContents(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Delete error:', error);
      alert('Не удалось удалить файл');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownload = async (content: SavedContentDto) => {
    const url = await getSavedContentDownloadUrl(content);
    if (url) {
      const link = document.createElement('a');
      link.href = url;
      link.download = content.fileName;
      link.target = '_blank';
      link.onclick = () => {
        setTimeout(() => window.URL.revokeObjectURL(url), 100);
      };
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert('Не удалось скачать файл');
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="saved-content-container">
        <div className="loading">Загрузка...</div>
      </div>
    );
  }

  if (!isAuthenticated || !isTutor) {
    return (
      <div className="saved-content-container">
        <div className="card">
          <h2>Доступ запрещён</h2>
          <p>Только репетиторы могут управлять сохранёнными файлами.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="saved-content-container">
      <div className="main-content">
        <h1>Мои сохранённые файлы</h1>
        <p className="subtitle">
          Здесь хранятся файлы, которые вы можете быстро добавлять к любым урокам.
        </p>

        <div className="card upload-card">
          <h3>Загрузить новый файл</h3>
          <form onSubmit={handleUpload} className="upload-form">
            <div className="form-group">
              <input
                id="file-upload"
                type="file"
                onChange={handleFileChange}
                required
                className="form-input"
              />
            </div>
            {uploadError && <div className="error-message">{uploadError}</div>}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!selectedFile || isUploading}
            >
              {isUploading ? 'Загрузка...' : 'Загрузить'}
            </button>
          </form>
        </div>

        <div className="saved-contents-list">
          {savedContents.length === 0 ? (
            <div className="empty-message">
              <p>У вас пока нет сохранённых файлов.</p>
              <p>Загрузите первый файл, чтобы он появился здесь.</p>
            </div>
          ) : (
            savedContents.map(content => (
              <div key={content.id} className="saved-content-item">
                <div className="saved-content-info">
                  <div className="saved-content-name">{content.fileName}</div>
                  <div className="saved-content-details">
                    <span>{(content.fileSize / 1024).toFixed(2)} KB</span>
                    <span>{new Date(content.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="saved-content-actions">
                  <button
                    className="btn btn-secondary btn-small"
                    onClick={() => handleDownload(content)}
                  >
                    Скачать
                  </button>
                  <button
                    className="btn btn-danger btn-small"
                    onClick={() => handleDelete(content.id)}
                    disabled={deletingId === content.id}
                  >
                    {deletingId === content.id ? 'Удаление...' : 'Удалить'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}