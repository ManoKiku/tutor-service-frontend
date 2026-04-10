'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';

import { 
  getLessons, 
  createLesson, 
  deleteLesson 
} from '@/services/lessons';

import './relations.css';
import { getAssignmentsByLessonId, uploadAssignment, deleteAssignment, getAssigmentDownloadUrl, uploadAssignmentFromSavedContent } from '@/services/assignments';
import { getMyStudents, getMyTutors, deleteRelation } from '@/services/relation';
import { User } from '@/types/auth';
import { appConfig } from '../../../next.config';
import { deleteSavedContent, getSavedContent } from '@/services/saved-content';

export default function RelationsPage() {
  const { user, tutorProfile, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const [isTutor, setIsTutor] = useState(false);
  const [relations, setRelations] = useState<Relation[]>([]);
  const [selectedRelation, setSelectedRelation] = useState<Relation | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddLessonForm, setShowAddLessonForm] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [newLesson, setNewLesson] = useState({
    title: '',
    startTime: '',
    endTime: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [savedContents, setSavedContents] = useState<SavedContentDto[] | null>(null);
  const [showSavedContentSelector, setShowSavedContentSelector] = useState(false);
  const [isLoadingSavedContents, setIsLoadingSavedContents] = useState(false);

  useEffect(() => {
    if (user) {
      const userIsTutor = user.role === 1 || user.role === 'Tutor' || tutorProfile !== null;
      setIsTutor(userIsTutor);
    }
  }, [user, tutorProfile]);

  const loadRelations = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      let data: Relation[] | null = null;
      
      if (isTutor) {
        data = await getMyStudents();
      } else {
        data = await getMyTutors();
      }
      
      if (data) {
        setRelations(data);
        if (data.length > 0 && !selectedRelation) {
          setSelectedRelation(data[0]);
        }
      }
    } catch (error) {
      console.error('Error loading relations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, isTutor, selectedRelation]);

  const loadLessons = useCallback(async () => {
    if (!selectedRelation || !user) return;

    try {
      const request : GetLessonsRequest = {
        userId: user.id,
        tutorId: isTutor ? user.id : selectedRelation.tutorId,
        studentId: isTutor ? selectedRelation.studentId : user.id,
        status: undefined,
        startDate: undefined,
        endDate: undefined
      };
      
      const lessonsData = await getLessons(request);
      setLessons(lessonsData || []);
      setSelectedLesson(null);
      setAssignments([]);
    } catch (error) {
      console.error('Error loading lessons:', error);
    }
  }, [selectedRelation, user, isTutor]);

  const loadAssignments = useCallback(async () => {
    if (!selectedLesson) return;

    try {
      const assignmentsData = await getAssignmentsByLessonId(selectedLesson.id);
      setAssignments(assignmentsData || []);
    } catch (error) {
      console.error('Error loading assignments:', error);
    }
  }, [selectedLesson]);

  const loadSavedContents = useCallback(async () => {
    if (!isTutor) return;
    try {
      setIsLoadingSavedContents(true);
      const contents = await getSavedContent();
      setSavedContents(contents || []);
    } catch (error) {
      console.error('Error loading saved contents:', error);
    } finally {
      setIsLoadingSavedContents(false);
    }
  }, [isTutor]);

  useEffect(() => {
    if (showSavedContentSelector && isTutor && savedContents === null && !isLoadingSavedContents) {
      loadSavedContents();
    }
  }, [showSavedContentSelector, isTutor, savedContents, isLoadingSavedContents, loadSavedContents]);

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      loadRelations();
    }
  }, [isAuthenticated, authLoading, loadRelations]);

  useEffect(() => {
    if (selectedRelation) {
      loadLessons();
    }
  }, [selectedRelation, loadLessons]);

  useEffect(() => {
    if (selectedLesson) {
      loadAssignments();
    }
  }, [selectedLesson, loadAssignments]);

  const handleDeleteRelation = async (relation: Relation) => {
    if (confirm('Вы уверены, что хотите удалить ученика из списка?')) {
      try {
        const success = await deleteRelation(relation.studentId);
        if (success) {
          setRelations(relations.filter(r => r.id !== relation.id));
          if (selectedRelation?.id ===  relation.id) {
            setSelectedRelation(null);
            setLessons([]);
            setSelectedLesson(null);
          }
        }
      } catch (error) {
        console.error('Error deleting relation:', error);
        alert('Ошибка при удалении ученика');
      }
    }
  };

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRelation || !user) return;

    try {
      const lessonData : CreateLessonRequest = {
        studentId: selectedRelation.studentId,
        startTime: new Date(newLesson.startTime),
        endTime: new Date(newLesson.endTime),
        title: newLesson.title
      };

      const createdLesson = await createLesson(lessonData);
      if (createdLesson) {
        setLessons([...lessons, createdLesson]);
        setNewLesson({ title: '', startTime: '', endTime: '' });
        setShowAddLessonForm(false);
      }
    } catch (error) {
      console.error('Error creating lesson:', error);
      alert('Ошибка при создании урока');
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (confirm('Вы уверены, что хотите удалить урок?')) {
      try {
        await deleteLesson(lessonId);
        setLessons(lessons.filter(l => l.id !== lessonId));
        if (selectedLesson?.id === lessonId) {
          setSelectedLesson(null);
          setAssignments([]);
        }
      } catch (error) {
        console.error('Error deleting lesson:', error);
        alert('Ошибка при удалении урока');
      }
    }
  };

  const handleUploadFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLesson || !selectedFile) return;

    try {
      const assignmentData = {
        lessonId: selectedLesson.id,
        file: selectedFile
      };

      await uploadAssignment(assignmentData);
      await loadAssignments();
      setSelectedFile(null);
      setShowUploadForm(false);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Ошибка при загрузке файла');
    }
  };

  const handleDeleteFile = async (assignmentId: string) => {
    if (confirm('Вы уверены, что хотите удалить файл?')) {
      try {
        await deleteAssignment(assignmentId);
        setAssignments(assignments.filter(a => a.id !== assignmentId));
      } catch (error) {
        console.error('Error deleting file:', error);
        alert('Ошибка при удалении файла');
      }
    }
  };

    const handleAddFromSavedContent = async (savedContentId: string) => {
    if (!selectedLesson) return;
    try {
      await uploadAssignmentFromSavedContent(savedContentId, selectedLesson.id);
      await loadAssignments();
      setShowUploadForm(false);
      setShowSavedContentSelector(false);
    } catch (error) {
      console.error('Error adding assignment from saved content:', error);
      alert('Ошибка при добавлении файла из сохранённых');
    }
  };

  const handleDownloadFile = async (assignment: Assignment) => {
    const url = await getAssigmentDownloadUrl(assignment);
    if (url) {
      const link = document.createElement('a');
      link.href = url;
      link.download = assignment.fileName || 'file';
      link.target = '_blank';
      
      link.onclick = () => {
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
        }, 100);
      };
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  const getPersonFromRelation = (relation: Relation): string | undefined => {
    return isTutor ? relation.studentName : relation.tutorName;
  };

  if (authLoading) {
    return (
      <div className="container">
        <div className="main-content">
          <div className="loading">Загрузка...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container">
        <div className="main-content">
          <div className="card">
            <h2>Доступ запрещен</h2>
            <p>Пожалуйста, войдите в систему для доступа к этой странице.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="main-content">
        <h1>{isTutor ? 'Мои ученики' : 'Мои репетиторы'}</h1>
        
        <div className="relations-page">
          <div className="relations-sidebar">
            <div className="sidebar-header">
              <h2>{isTutor ? 'Ученики' : 'Репетиторы'}</h2>
              {isLoading && <span className="loading-small">Загрузка...</span>}
            </div>
            <div className="relations-list">
              {relations.length === 0 ? (
                <div className="empty-message">
                  {isTutor ? 'У вас пока нет учеников' : 'У вас пока нет репетиторов'}
                </div>
              ) : (
                relations.map(relation => {
                  const person = getPersonFromRelation(relation);
                  const isSelected = selectedRelation?.id === relation.id;
                  return (
                    <div 
                      key={relation.id} 
                      className={`relation-item ${isSelected ? 'selected' : ''}`}
                      onClick={() => setSelectedRelation(relation)}
                    >
                      <div className="relation-avatar">
                        {person?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="relation-info">
                        <div className="relation-name">{person}</div>
                      </div>
                      {isTutor && (
                        <div className="relation-actions">
                          <button 
                            className="btn-icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteRelation(relation);
                            }}
                            title="Удалить ученика"
                          >
                            <span className="dots">⋯</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="relations-main">
            {selectedRelation ? (
              <>
                <div className="selected-person-header">
                  <div className="selected-person-info">
                    <div className="selected-person-avatar">
                      {getPersonFromRelation(selectedRelation)?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <h3>{getPersonFromRelation(selectedRelation)}</h3>
                    </div>
                  </div>
                  {isTutor && (
                    <button 
                      className="btn btn-primary"
                      onClick={() => setShowAddLessonForm(!showAddLessonForm)}
                    >
                      {showAddLessonForm ? 'Отмена' : 'Добавить урок'}
                    </button>
                  )}
                </div>

                {showAddLessonForm && isTutor && (
                  <div className="card add-lesson-form">
                    <h4>Добавить новый урок</h4>
                    <form onSubmit={handleCreateLesson}>
                      <div className="form-group">
                        <label>Название урока</label>
                        <input
                          type="text"
                          value={newLesson.title}
                          onChange={(e) => setNewLesson({...newLesson, title: e.target.value})}
                          required
                          className="form-input"
                        />
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Дата и время начала</label>
                          <input
                            type="datetime-local"
                            value={newLesson.startTime}
                            onChange={(e) => setNewLesson({...newLesson, startTime: e.target.value})}
                            required
                            className="form-input"
                          />
                        </div>
                        <div className="form-group">
                          <label>Дата и время окончания</label>
                          <input
                            type="datetime-local"
                            value={newLesson.endTime}
                            onChange={(e) => setNewLesson({...newLesson, endTime: e.target.value})}
                            required
                            className="form-input"
                          />
                        </div>
                      </div>
                      <div className="form-actions">
                        <button type="submit" className="btn btn-primary">Создать урок</button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="lessons-section">
                  <h4>Уроки</h4>
                  {lessons.length === 0 ? (
                    <div className="empty-message">Уроков пока нет</div>
                  ) : (
                    <div className="lessons-list">
                      {lessons.map(lesson => (
                        <div 
                          key={lesson.id} 
                          className={`lesson-item ${selectedLesson?.id === lesson.id ? 'active' : ''}`}
                          onClick={() => setSelectedLesson(lesson)}
                        >
                          <div className="lesson-content">
                            <div className="lesson-title">{lesson.title}</div>
                            <div className="lesson-details">
                              <span className="lesson-date">
                                {new Date(lesson.startTime).toLocaleDateString()} • 
                                {new Date(lesson.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </span>
                            </div>
                          </div>
                          {isTutor && (
                            <button 
                              className="btn-icon btn-danger"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteLesson(lesson.id);
                              }}
                              title="Удалить урок"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {selectedLesson && (
                  <div className="assignments-section">
                    <div className="assignments-header">
                      <h4>Файлы урока: {selectedLesson.title}</h4>
                      {isTutor && (
                        <button 
                          className="btn btn-secondary btn-small"
                          onClick={() => {
                            setShowUploadForm(!showUploadForm);
                            setShowSavedContentSelector(false);
                          }}
                        >
                          {showUploadForm ? 'Отмена' : 'Добавить файл'}
                        </button>
                      )}
                    </div>

                    {showUploadForm && isTutor && (
                      <div className="card upload-file-form">
                        <div className="upload-tabs">
                          <button
                            type="button"
                            className={`tab-button ${!showSavedContentSelector ? 'active' : ''}`}
                            onClick={() => setShowSavedContentSelector(false)}
                          >
                            Загрузить новый
                          </button>
                          <button
                            type="button"
                            className={`tab-button ${showSavedContentSelector ? 'active' : ''}`}
                            onClick={() => setShowSavedContentSelector(true)}
                          >
                            Выбрать из сохранённых
                          </button>
                        </div>

                        {!showSavedContentSelector ? (
                          <form onSubmit={handleUploadFile}>
                            <div className="form-group">
                              <label>Выберите файл</label>
                              <input
                                type="file"
                                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                required
                                className="form-input"
                              />
                            </div>
                            <div className="form-actions">
                              <button type="submit" className="btn btn-primary" disabled={!selectedFile}>
                                Загрузить
                              </button>
                            </div>
                          </form>
                        ) : (
                          <div className="saved-contents-list">
                            {isLoadingSavedContents && <div className="loading-small">Загрузка списка...</div>}
                            {!isLoadingSavedContents && savedContents && savedContents.length === 0 && (
                              <div className="empty-message">Нет сохранённых файлов. Сначала загрузите файлы в раздел "Мои файлы".</div>
                            )}
                            {savedContents && savedContents.map(content => (
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
                                    className="btn btn-primary btn-small"
                                    onClick={() => handleAddFromSavedContent(content.id)}
                                  >
                                    Добавить к уроку
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="assignments-list">
                      {assignments.length === 0 ? (
                        <div className="empty-message">Файлов пока нет</div>
                      ) : (
                        assignments.map(assignment => (
                          <div key={assignment.id} className="assignment-item">
                            <div className="assignment-info">
                              <div className="assignment-name">{assignment.fileName}</div>
                              <div className="assignment-details">
                                <span className="assignment-size">
                                  {(assignment.fileSize / 1024).toFixed(2)} KB
                                </span>
                                <span className="assignment-date">
                                  {new Date(assignment.uploadedAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <div className="assignment-actions">
                              <button 
                                onClick={() => handleDownloadFile(assignment)}
                                className="btn btn-secondary btn-small"
                              >
                                Скачать
                              </button>
                              {isTutor && (
                                <button 
                                  className="btn btn-danger btn-small"
                                  onClick={() => handleDeleteFile(assignment.id)}
                                >
                                  Удалить
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">👤</div>
                <h3>Выберите {isTutor ? 'ученика' : 'репетитора'}</h3>
                <p>
                  {isTutor 
                    ? 'Выберите ученика из списка слева для просмотра уроков и файлов'
                    : 'Выберите репетитора из списка слева для просмотра уроков и файлов'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}