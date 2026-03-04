'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getTutorPostsByTutorId, createTutorPost, deleteTutorPost } from '@/services/tutor-posts';
import Link from 'next/link';
import '../tutor-profile.css';
import { getCategories } from '@/services/categories';
import { getSubcategories } from '@/services/subcategories';
import { getSubjects } from '@/services/subjects';
import { updateTutorProfile } from '@/services/tutors';
import { saveTutorProfile } from '@/lib/auth';

export default function TutorProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, tutorProfile } = useAuth();
  const [tutor, setTutor] = useState<Tutor>();
  const [posts, setPosts] = useState<TutorPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
    const [editData, setEditData] = useState<UpdateTutorRequest>({
    bio: '',
    education: '',
    experienceYears: 0,
    hourlyRate: 0
  });
  const [newPost, setNewPost] = useState({
    description: '',
    subjectId: '',
    tagsIds: [] as number[],
  });
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);


  useEffect(() => {
    const loadData = async () => {      
      try {
        if (tutorProfile) {
          setTutor(tutorProfile);
          setIsOwner(true);

          setEditData({
            bio: tutorProfile.bio || '',
            education: tutorProfile.education || '',
            experienceYears: tutorProfile.experienceYears || 0,
            hourlyRate: tutorProfile.hourlyRate || 0
          });
          
          const tutorPosts = await getTutorPostsByTutorId(tutorProfile.id);
          setPosts(tutorPosts);
        }
        else
        {
          const request : UpdateTutorRequest = {
            bio : '',
            education: '',
            experienceYears: 0,
            hourlyRate: 0
          };
          const profile = await updateTutorProfile(request);
          setTutor(profile);
        }
      } catch (error) {
        console.error('Error loading tutor profile:', error);
      } finally {
        setLoading(false);
      }
    };

    if (tutorProfile) {
      loadData();
    }
  }, [tutorProfile]);

  useEffect(() => {
    if (showModal) {
      loadCategories();
    }
  }, [showModal]);

  const loadCategories = async () => {
    try {
      const [cats, subcats, subs] = await Promise.all([
        getCategories(),
        getSubcategories(),
        getSubjects()
      ]);
      setCategories(cats);
      setSubcategories(subcats);
      setSubjects(subs);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Вы уверены, что хотите удалить это объявление?')) return;
    
    try {
      await deleteTutorPost(postId);
      setPosts(posts.filter(post => post.id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Ошибка при удалении объявления');
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.subjectId || !newPost.description) {
      alert('Заполните все обязательные поля');
      return;
    }

    try {
      const createdPost = await createTutorPost({
        subjectId: parseInt(newPost.subjectId),
        description: newPost.description,
        tagIds: newPost.tagsIds
      });

      setPosts([...posts, createdPost]);
      setShowModal(false);
      setNewPost({
        description: '',
        subjectId: '',
        tagsIds: []
      });
      setSelectedCategory('');
      setSelectedSubcategory('');
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Ошибка при создании объявления');
    }
  };

  const handleUpdateProfile = async () => {
    if (!editData.bio.trim() || !editData.education.trim()) {
      alert('Заполните все обязательные поля');
      return;
    }

    setUpdatingProfile(true);
    try {
      const updatedProfile = await updateTutorProfile(editData);
      
      setTutor(updatedProfile);
      
      setEditData({
        bio: updatedProfile.bio || '',
        education: updatedProfile.education || '',
        experienceYears: updatedProfile.experienceYears || 0,
        hourlyRate: updatedProfile.hourlyRate || 0
      });
      
      saveTutorProfile(updatedProfile);
      
      setShowEditModal(false);
      alert('Профиль успешно обновлен!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Ошибка при обновлении профиля');
    } finally {
      setUpdatingProfile(false);
    }
  };


  const filteredSubjects = subjects.filter((subject: any) => {
    if (selectedSubcategory) {
      return subject.subcategoryId === parseInt(selectedSubcategory);
    }
    if (selectedCategory) {
      const subcatIds = subcategories
        .filter((sc: any) => sc.categoryId === parseInt(selectedCategory))
        .map((sc: any) => sc.id);
      return subcatIds.includes(subject.subcategoryId);
    }
    return true;
  });

  const getStatusText = (status: number) => {
    switch (status) {
      case 0: return 'На модерации';
      case 1: return 'Опубликовано';
      case 2: return 'Отклонено';
      default: return 'Неизвестно';
    }
  };

  const getStatusClass = (status: number) => {
    switch (status) {
      case 0: return 'status-moderation';
      case 1: return 'status-published';
      case 2: return 'status-rejected';
      default: return 'status-unknown';
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="main-content">
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Загрузка профиля...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!tutor && isOwner) {
    return (
      <div className="container">
        <div className="main-content">
          <h1>Профиль репетитора</h1>
          <p>Сначала создайте профиль репетитора.</p>
          <Link href="/tutor/create-profile" className="btn btn-primary">
            Создать профиль
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="main-content">
        <div className="tutor-profile-header card">
          <div className="profile-header-grid">
            <div className="avatar-placeholder">
              <div className="avatar-icon">{user?.firstName[0]}</div>
            </div>
            
            <div className="profile-info">
              {user && (
                <div className="profile-header-row">
                  <h1 className="profile-name">{user.firstName} {user.lastName}</h1>
                   {isOwner && (
                    <button
                      onClick={() => setShowEditModal(true)}
                      className="btn btn-secondary btn-small"
                    >
                      Редактировать
                    </button>
                  )}
                </div>
              )}
              
              <div className="profile-details-grid">
                <div className="profile-detail">
                  <h3>Образование</h3>
                  <p>{tutor?.education || 'Не указано'}</p>
                </div>
                <div className="profile-detail">
                  <h3>Опыт работы</h3>
                  <p>{tutor?.experienceYears || 0} лет</p>
                </div>
                <div className="profile-detail">
                  <h3>Стоимость</h3>
                  <p className="hourly-rate">{tutor?.hourlyRate || 0} ₽/час</p>
                </div>
              </div>
              
              <div className="profile-bio">
                <h3>О себе</h3>
                <div className="bio-text">
                  {tutor?.bio || 'Описание пока не добавлено'}
                </div>
              </div>
              
              {!isOwner && isAuthenticated && (
                <button
                  onClick={() => router.push(`/chat?tutor=${tutor?.id}`)}
                  className="btn btn-primary"
                >
                  Написать репетитору
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="tutor-posts card">
          <div className="posts-header">
            <h2>Мои объявления</h2>
            {isOwner && (
              <button
                onClick={() => setShowModal(true)}
                className="btn btn-primary"
              >
                + Добавить объявление
              </button>
            )}
          </div>
          
          {posts.length === 0 ? (
            <div className="no-posts">
              Пока нет объявлений
            </div>
          ) : (
            <div className="posts-grid">
              {posts.map((post) => (
                <div key={post.id} className="post-card card-shadow">
                  <div className="post-header">
                    <div>
                      <h3 className="post-title">{post.subjectName}</h3>
                      <span className={`status-badge ${getStatusClass(post.status)}`}>
                        {getStatusText(post.status)}
                      </span>
                    </div>
                    {isOwner && (
                      <div className="post-actions">
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="btn btn-danger btn-small"
                        >
                          Удалить
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <p className="post-description text-truncate-2">
                    {post.description}
                  </p>
                  
                  <div className="post-footer">
                    <div className="post-rate">
                      {post.hourlyRate} ₽/час
                    </div>
                    
                    {post.tags.length > 0 && (
                      <div className="post-tags">
                        {post.tags.map((tag, index) => (
                          <span key={index} className="tag">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {post.status === 2 && post.adminComment && (
                    <div className="admin-comment">
                      <strong>Комментарий модератора:</strong> {post.adminComment}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Создать объявление</h2>
              <button
                onClick={() => setShowModal(false)}
                className="modal-close"
              >
                &times;
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Категория</label>
                <select
                  className="form-input"
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setSelectedSubcategory('');
                    setNewPost({ ...newPost, subjectId: '' });
                  }}
                >
                  <option value="">Выберите категорию</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Подкатегория</label>
                <select
                  className="form-input"
                  value={selectedSubcategory}
                  onChange={(e) => {
                    setSelectedSubcategory(e.target.value);
                    setNewPost({ ...newPost, subjectId: '' });
                  }}
                  disabled={!selectedCategory}
                >
                  <option value="">Выберите подкатегорию</option>
                  {subcategories
                    .filter((sc) => sc.categoryId === parseInt(selectedCategory))
                    .map((sc) => (
                      <option key={sc.id} value={sc.id}>
                        {sc.name}
                      </option>
                    ))}
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Предмет</label>
                <select
                  className="form-input"
                  value={newPost.subjectId}
                  onChange={(e) => setNewPost({ ...newPost, subjectId: e.target.value })}
                  disabled={!selectedCategory || (!selectedSubcategory && subcategories.length > 0)}
                >
                  <option value="">Выберите предмет</option>
                  {filteredSubjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Описание</label>
                <textarea
                  className="form-input"
                  value={newPost.description}
                  onChange={(e) => setNewPost({ ...newPost, description: e.target.value })}
                  placeholder="Опишите ваше предложение..."
                  rows={4}
                />
              </div>
            
            
              <div className="modal-actions">
                <button
                  onClick={handleCreatePost}
                  className="btn btn-primary"
                  disabled={!newPost.subjectId || !newPost.description}
                >
                  Создать объявление
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary"
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Редактировать профиль</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="modal-close"
                disabled={updatingProfile}
              >
                &times;
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Образование</label>
                <input
                  type="text"
                  className="form-input"
                  value={editData.education}
                  onChange={(e) => setEditData({...editData, education: e.target.value})}
                  placeholder="Укажите ваше образование"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Опыт работы (лет)</label>
                <input
                  type="number"
                  className="form-input"
                  value={editData.experienceYears}
                  onChange={(e) => setEditData({...editData, experienceYears: parseInt(e.target.value) || 0})}
                  min="0"
                  max="50"
                  placeholder="Укажите опыт работы"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Стоимость за час (₽)</label>
                <input
                  type="number"
                  className="form-input"
                  value={editData.hourlyRate}
                  onChange={(e) => setEditData({...editData, hourlyRate: parseInt(e.target.value) || 0})}
                  min="0"
                  placeholder="Укажите стоимость занятий"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">О себе</label>
                <textarea
                  className="form-input"
                  value={editData.bio}
                  onChange={(e) => setEditData({...editData, bio: e.target.value})}
                  placeholder="Расскажите о себе, своем подходе к обучению, профессиональных навыках..."
                  rows={6}
                />
              </div>
            
              <div className="modal-actions">
                <button
                  onClick={handleUpdateProfile}
                  className="btn btn-primary"
                  disabled={updatingProfile || !editData.education.trim() || !editData.bio.trim()}
                >
                  {updatingProfile ? 'Сохранение...' : 'Сохранить изменения'}
                </button>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="btn btn-secondary"
                  disabled={updatingProfile}
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}