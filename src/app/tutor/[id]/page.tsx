'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getTutorProfileById, getTutorsCities } from '@/services/tutors';
import { getTutorPostsByTutorId } from '@/services/tutor-posts';
import Link from 'next/link';
import '../tutor-profile.css';
import { getUserById } from '@/services/users';
import { User } from '@/types/auth';
import { createChatWithTutor, isHaveChatWithTutor } from '@/services/chats';
import { appConfig } from '../../../../next.config';
import { getReviewsByTutor, createReview, updateReview, deleteReview, getReviewByTutorAndUser } from '@/services/reviews';
import { FaStar, FaRegStar, FaStarHalfAlt, FaEdit, FaTrash, FaCity } from 'react-icons/fa';

export default function PublicTutorProfilePage() {
  const params = useParams();
  const { user, isAuthenticated, tutorProfile } = useAuth();
  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [tutorAccount, setAccount] = useState<User | null>(null);
  const [posts, setPosts] = useState<TutorPost[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [chat, setChat] = useState<Chat | undefined | null>(undefined);
  const chatRef = useRef<Chat | undefined | null>(null);

  const [reviews, setReviews] = useState<ReviewDto[]>([]);
  const [totalReviews, setTotalReviews] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [userReview, setUserReview] = useState<ReviewDto | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'reviews'>('info');

  useEffect(() => {
    chatRef.current = chat;
  }, [chat]);

  const handleClick = async () => {
    const currentChat = chatRef.current;
    const createChat = async (c: Chat | null) => {
      if (c == null) {
        if (confirm("Вы хотите создать чат с репетитором?")) {
          await createChatWithTutor(tutor?.id!);
          window.location.href = "/chats";
        }
      } else {
        window.location.href = "/chats";
      }
    };
    if (currentChat == undefined) {
      const chat = await isHaveChatWithTutor(tutor?.id!);
      await createChat(chat);
      return;
    }
    await createChat(currentChat!);
  };

  const loadReviews = async (tutorId: string) => {
    try {
      const result = await getReviewsByTutor(tutorId);
      setReviews(result.reviews);
      setTotalReviews(result.total);
      const avg = result.reviews.reduce((sum, r) => sum + r.rating, 0) / (result.reviews.length || 1);
      setAverageRating(avg);
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  };

  const loadUserReview = async (tutorId: string) => {
    if (!user) return;
    try {
      const review = await getReviewByTutorAndUser(tutorId, user.id);
      if (review) {
        setUserReview(review);
        setReviewText(review.text);
        setReviewRating(review.rating);
      } else {
        setUserReview(null);
        setReviewText('');
        setReviewRating(5);
      }
    } catch (error) {
      setUserReview(null);
    }
  };

  const handleSubmitReview = async () => {
    if (!user || !tutor) return;
    if (!reviewText.trim()) {
      alert('Введите текст отзыва');
      return;
    }
    setIsSubmittingReview(true);
    try {
      if (userReview) {
        await updateReview(userReview.id, { rating: reviewRating, text: reviewText });
        alert('Отзыв обновлён');
      } else {
        await createReview({ tutorProfileId: tutor.id, rating: reviewRating, text: reviewText });
        alert('Отзыв добавлен');
      }
      await loadReviews(tutor.id);
      await loadUserReview(tutor.id);
      setShowReviewForm(false);
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Ошибка при сохранении отзыва');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!userReview || !confirm('Удалить ваш отзыв?')) return;
    try {
      await deleteReview(userReview.id);
      await loadReviews(tutor!.id);
      await loadUserReview(tutor!.id);
      setShowReviewForm(false);
      alert('Отзыв удалён');
    } catch (error) {
      console.error(error);
      alert('Ошибка при удалении отзыва');
    }
  };

  const renderStars = (rating: number) => {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    const empty = 5 - full - (half ? 1 : 0);
    return (
      <div className="rating-stars">
        {[...Array(full)].map((_, i) => <FaStar key={i} className="star star-filled" />)}
        {half && <FaStarHalfAlt className="star star-half" />}
        {[...Array(empty)].map((_, i) => <FaRegStar key={i} className="star star-empty" />)}
      </div>
    );
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const tutorId = params.id as string;
        if (tutorProfile?.id == tutorId) {
          window.location.href = "/tutor/profile";
          return;
        }
        const tutorData = await getTutorProfileById(tutorId);
        setTutor(tutorData);
        if (tutorData) {
          const tutorAccountData = await getUserById(tutorData.userId);
          setAccount(tutorAccountData);
          const tutorCities = await getTutorsCities(tutorId);
          setCities(tutorCities);
          await loadReviews(tutorId);
          if (user) await loadUserReview(tutorId);
        }
        if (user && tutorData && user.id === tutorData.userId) {
          setIsOwner(true);
        }
        const tutorPosts = await getTutorPostsByTutorId(tutorId);
        const publishedPosts = tutorPosts.filter(post => post.status === 1);
        setPosts(publishedPosts);
      } catch (error) {
        console.error('Error loading tutor profile:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [params.id, user]);

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

  if (!tutor) {
    return (
      <div className="container">
        <div className="main-content">
          <h1>Профиль не найден</h1>
          <p>Репетитор с таким ID не существует.</p>
          <Link href="/tutors" className="btn btn-primary">Найти репетиторов</Link>
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
              {tutorAccount?.avatarUrl ? 
                <img src={appConfig.serverUrl + tutorAccount.avatarUrl} className="user-avatar-image" alt="avatar" /> : 
                <div className="avatar-icon">{tutorAccount?.firstName?.[0] || 'Р'}</div>
              }
            </div>
            <div className="profile-info">
              <h1 className="profile-name">
                {tutorAccount ? `${tutorAccount.firstName} ${tutorAccount.lastName}` : 'Репетитор'}
              </h1>
              
              <div className="profile-rating">
                {renderStars(averageRating)}
                <span className="rating-value">{averageRating.toFixed(1)}</span>
                <span className="reviews-count">({totalReviews} {totalReviews === 1 ? 'отзыв' : 'отзывов'})</span>
              </div>

              <div className="profile-details-grid">
                <div className="profile-detail">
                  <h3>Образование</h3>
                  <p>{tutor.education || 'Не указано'}</p>
                </div>
                <div className="profile-detail">
                  <h3>Опыт работы</h3>
                  <p>{tutor.experienceYears || 0} лет</p>
                </div>
                <div className="profile-detail">
                  <h3>Стоимость</h3>
                  <p className="hourly-rate">{tutor.hourlyRate || 0} р. /час</p>
                </div>
              </div>

              {cities.length > 0 && (
                <div className="profile-cities">
                  <h3><FaCity /> Города</h3>
                  <div className="cities-list">
                    {cities.map(city => (
                      <span key={city.id} className="city-tag">{city.name}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="profile-bio">
                <h3>О себе</h3>
                <div className="bio-text">{tutor.bio || 'Описание пока не добавлено'}</div>
              </div>

              {isAuthenticated && !isOwner && (
                <button onClick={handleClick} className="btn btn-primary">Написать репетитору</button>
              )}
              {!isAuthenticated && (
                <Link href="/login" className="btn btn-primary">Войдите, чтобы написать</Link>
              )}
            </div>
          </div>
        </div>

        <div className="profile-tabs">
          <button className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`} onClick={() => setActiveTab('info')}>
            Объявления
          </button>
          <button className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>
            Отзывы ({totalReviews})
          </button>
        </div>

        {activeTab === 'info' && (
          <div className="tutor-posts card">
            <h2>Объявления репетитора</h2>
            {posts.length === 0 ? (
              <div className="no-posts">У репетитора пока нет активных объявлений</div>
            ) : (
              <div className="posts-grid">
                {posts.map((post) => (
                  <div key={post.id} className="post-card card-shadow">
                    <div className="post-header">
                      <div>
                        <h3 className="post-title">{post.subjectName}</h3>
                        <span className="status-badge status-published">Опубликовано</span>
                      </div>
                      <div className="post-rate">{post.hourlyRate} р. /час</div>
                    </div>
                    <p className="post-description">{post.description}</p>
                    {post.tags.length > 0 && (
                      <div className="post-tags">
                        {post.tags.map((tag, idx) => <span key={idx} className="tag">{tag.name}</span>)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="reviews-section card">
            <div className="reviews-header">
              <h2>Отзывы о репетиторе</h2>
              {isAuthenticated && !isOwner && (
                <button className="btn btn-secondary btn-small" onClick={() => setShowReviewForm(!showReviewForm)}>
                  {userReview ? 'Редактировать отзыв' : 'Написать отзыв'}
                </button>
              )}
            </div>

            {isAuthenticated && !isOwner && showReviewForm && (
              <div className="review-form card">
                <h3>{userReview ? 'Редактировать отзыв' : 'Добавить отзыв'}</h3>
                <div className="form-group">
                  <label>Оценка</label>
                  <div className="rating-input">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button key={star} type="button" className="star-btn" onClick={() => setReviewRating(star)}>
                        {star <= reviewRating ? <FaStar className="star-filled" /> : <FaRegStar className="star-empty" />}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label>Текст отзыва</label>
                  <textarea className="form-input" rows={4} value={reviewText} onChange={e => setReviewText(e.target.value)} />
                </div>
                <div className="form-actions">
                  <button className="btn btn-primary" onClick={handleSubmitReview} disabled={isSubmittingReview}>
                    {isSubmittingReview ? 'Сохранение...' : (userReview ? 'Обновить' : 'Оставить отзыв')}
                  </button>
                  {userReview && (
                    <button className="btn btn-danger" onClick={handleDeleteReview}>Удалить отзыв</button>
                  )}
                  <button className="btn btn-secondary" onClick={() => setShowReviewForm(false)}>Отмена</button>
                </div>
              </div>
            )}

            <div className="reviews-list">
              {reviews.length === 0 ? (
                <div className="no-reviews">Пока нет отзывов. Будьте первым!</div>
              ) : (
                reviews.map(review => (
                  <div key={review.id} className="review-item">
                    <div className="review-header">
                      <div className="review-user">
                        {review.avatarUrl ? <img src={appConfig.serverUrl + review.avatarUrl} alt="" className='review-avatar' /> : <div className="review-avatar">{review.userName[0]}</div>}
                        <strong>{review.userName}</strong>
                      </div>
                      <div className="review-rating">{renderStars(review.rating)}</div>
                      <div className="review-date">{new Date(review.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div className="review-text">{review.text}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}