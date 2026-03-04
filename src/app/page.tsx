'use client'
import Link from 'next/link';
import './home.css';
import { useAuth } from '@/hooks/useAuth';

export default function Home() {
  const {isAuthenticated} = useAuth();

  return (
    <div className="home-container">
      <section className="hero-section">
        <h1>Найдите идеального репетитора для любых целей</h1>
        <p>Более 1000 профессиональных репетиторов по всем предметам и направлениям</p>
        <div className="hero-actions">
          <Link href="/tutors" className="btn btn-primary">
            Найти репетитора
          </Link>
          {!isAuthenticated &&(
          <Link href="/register?role=1" className="btn btn-secondary">
            Стать репетитором
          </Link>
          )}

        </div>
      </section>

      <section className="features-section">
        <h2>Почему выбирают Repetitor.by</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>Большой выбор уроков</h3>
            <p>Поиск даже по узким специальностям</p>
          </div>
          
          <div className="feature-card">
            <h3>Удобная работа с уроками</h3>
            <p>Возможность создавать уроки и прикреплять задания</p>
          </div>
          
          <div className="feature-card">
            <h3>Чаты с репетитором</h3>
            <p>Возможность написать репетитору и обговорить детали обучения</p>
          </div>
          
          <div className="feature-card">
            <h3>Удобная платформа для репетиторов</h3>
            <p>Объявления, чаты, уроки, ученики - все в одном месте!</p>
          </div>
        </div>
      </section>

      <section className="popular-subjects">
        <h2>Популярные предметы</h2>
        <div className="subjects-grid">
          <div className="subject-card">
            <h3>Математика</h3>
            <p>Школьная программа, ЕГЭ, высшая математика</p>
            <span className="subject-count">250+ репетиторов</span>
          </div>
          
          <div className="subject-card">
            <h3>Английский язык</h3>
            <p>Разговорный, бизнес-английский, подготовка к экзаменам</p>
            <span className="subject-count">180+ репетиторов</span>
          </div>
          
          <div className="subject-card">
            <h3>Физика</h3>
            <p>Школьная программа, олимпиадная физика, вузовский курс</p>
            <span className="subject-count">120+ репетиторов</span>
          </div>
          
          <div className="subject-card">
            <h3>Программирование</h3>
            <p>Python, JavaScript, Java, C++ с нуля до продвинутого уровня</p>
            <span className="subject-count">90+ репетиторов</span>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <h2>Начните обучение уже сегодня</h2>
        <p>Пройдите бесплатное пробное занятие с выбранным репетитором</p>
        <Link href="/register" className="btn btn-primary btn-large">
          Начать обучение
        </Link>
      </section>
    </div>
  );
}