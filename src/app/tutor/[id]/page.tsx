'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getTutorProfileById } from '@/services/tutors';
import { getTutorPostsByTutorId } from '@/services/tutor-posts';
import Link from 'next/link';
import '../tutor-profile.css';
import { getUserById } from '@/services/users';
import { User } from '@/types/auth';
import { createChatWithTutor, isHaveChatWithTutor } from '@/services/chats';


export default function PublicTutorProfilePage() {
  const params = useParams();
  const { user, isAuthenticated, tutorProfile } = useAuth();
  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [tutorAccount, setAccount] = useState<User | null>(null);
  const [posts, setPosts] = useState<TutorPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [chat, setChat] = useState<Chat | undefined | null>(undefined);
  const chatRef = useRef<Chat | undefined | null>(null);

  useEffect(() => {
    chatRef.current = chat;
  }, [chat])

  const handleClick = async () => {
    const currentChat = chatRef.current;

    const createChat = async (c: Chat | null) => {
      if(c == null)
      {
        if(confirm("Вы хотите создать чат с репетитором?"))
        {
          await createChatWithTutor(tutor?.id!);
          window.location.href = "/chats";
        }
      }
      else {
        window.location.href = "/chats";
      }
    } 

    if(currentChat == undefined)
    {
      const chat = await isHaveChatWithTutor(tutor?.id!);

      await createChat(chat);

      return;
    }
    
    await createChat(currentChat!);
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        const tutorId = params.id as string;

        if(tutorProfile?.id == tutorId)
        {
          window.location.href = "/tutor/profile";
          return;
        }

        const tutorData = await getTutorProfileById(tutorId);
        setTutor(tutorData);
        if(tutorData)
        {
            const tutorAccountData = await getUserById(tutorData.userId);
            setAccount(tutorAccountData);
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
  }, [params.id, user   ]);

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
          <Link href="/tutors" className="btn btn-primary">
            Найти репетиторов
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
              <div className="avatar-icon">{tutorAccount?.firstName[0]}</div>
            </div>
            
            <div className="profile-info">
              <h1 className="profile-name">
                {(tutorAccount?.firstName + ' ' + tutorAccount?.lastName) || 'Репетитор'}
              </h1>
              
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
                  <p className="hourly-rate">{tutor.hourlyRate || 0} ₽/час</p>
                </div>
              </div>
              
              <div className="profile-bio">
                <h3>О себе</h3>
                <div className="bio-text">
                  {tutor.bio || 'Описание пока не добавлено'}
                </div>
              </div>
              
              {isAuthenticated && !isOwner && (
                <button
                  onClick={handleClick}
                  className="btn btn-primary"
                >
                  Написать репетитору
                </button>
              )}
              
              {!isAuthenticated && (
                <Link href="/login" className="btn btn-primary">
                  Войдите, чтобы написать
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="tutor-posts card">
          <h2>Объявления репетитора</h2>
          
          {posts.length === 0 ? (
            <div className="no-posts">
              У репетитора пока нет активных объявлений
            </div>
          ) : (
            <div className="posts-grid">
              {posts.map((post) => (
                <div key={post.id} className="post-card card-shadow">
                  <div className="post-header">
                    <div>
                      <h3 className="post-title">{post.subjectName}</h3>
                      <span className="status-badge status-published">
                        Опубликовано
                      </span>
                    </div>
                    <div className="post-rate">
                      {post.hourlyRate} ₽/час
                    </div>
                  </div>
                  
                  <p className="post-description">
                    {post.description}
                  </p>
                  
                  {post.tags.length > 0 && (
                    <div className="post-tags">
                      {post.tags.map((tag: string, index: number) => (
                        <span key={index} className="tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}