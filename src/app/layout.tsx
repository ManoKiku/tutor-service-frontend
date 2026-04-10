'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userName, setUserName] = useState<string>('');
  const { user, logout, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      const name = `${user.firstName} ${user.lastName}`.trim();
      setUserName(name || user.email);
    } else {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const userData = JSON.parse(userStr);
          const name = `${userData.firstName} ${userData.lastName}`.trim();
          setUserName(name || userData.email);
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
    }
  }, [user]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeSidebar();
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  const isTutorUser = user?.role === 1 || user?.role === 'Tutor';
  const isAdminUser = user?.role === 2 || user?.role === 'Admin';

  return (
    <html lang="ru">
      <body>
        <div className={`container ${isSidebarOpen ? 'sidebar-open' : ''}`}>
          <header className="header">
            <div className="header-left">
              <button 
                className="burger-menu" 
                onClick={toggleSidebar}
                aria-label="Открыть меню"
              >
                <span className="burger-line"></span>
                <span className="burger-line"></span>
                <span className="burger-line"></span>
              </button>
            </div>
            
            <div className="header-center">
              <h1 className="logo">Repetitor.by</h1>
            </div>
            
            <div className="header-right">
              {userName ? (
                <span className="user-name-header">{userName}</span>
              ) : (
                <a href="/login" className="login-link">Войти</a>
              )}
            </div>
          </header>

          <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
              <div className="sidebar-logo">Repetitor.by</div>
              {userName && (
                <div className="sidebar-user">
                  <div className="user-avatar">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="user-info">
                    <div className="user-name">{userName}</div>
                    <div className="user-email">{user?.email}</div>
                  </div>
                </div>
              )}
            </div>

            <nav className="sidebar-nav">
              <ul>
                <li>
                  <a 
                    href="/" 
                    className={`nav-link ${isActive('/') ? 'active' : ''}`}
                    onClick={closeSidebar}
                  >
                    Главная
                  </a>
                </li>
                
                {isAuthenticated && (
                  <>
                    <li>
                      <a 
                        href="/chats" 
                        className={`nav-link ${isActive('/chats') ? 'active' : ''}`}
                        onClick={closeSidebar}
                      >
                        Чаты
                      </a>
                    </li>
                    
                    <li>
                      <a 
                        href="/tutors" 
                        className={`nav-link ${isActive('/tutors') ? 'active' : ''}`}
                        onClick={closeSidebar}
                      >
                        Поиск репетитора
                      </a>
                    </li>

                    {!isTutorUser ? (
                    <li>
                      <a 
                        href="/relations" 
                        className={`nav-link ${isActive('/relations') ? 'active' : ''}`}
                        onClick={closeSidebar}
                      >
                        Мои репетиторы
                      </a>
                    </li>
                    ) : (
                    <li>
                      <a 
                        href="/relations" 
                        className={`nav-link ${isActive('/relations') ? 'active' : ''}`}
                        onClick={closeSidebar}
                      >
                        Мои ученики
                      </a>
                    </li>
                    ) }


                    {isTutorUser && (
                      <>
                        <li>
                          <a 
                            href="/tutor/profile" 
                            className={`nav-link ${isActive('/tutor/profile') ? 'active' : ''}`}
                            onClick={closeSidebar}
                          >
                            Мой профиль
                          </a>
                        </li>
                      </>
                    )}

                    {isTutorUser && (
                      <>
                        <li>
                          <a 
                            href="/saved-content" 
                            className={`nav-link ${isActive('/saved-content') ? 'active' : ''}`}
                            onClick={closeSidebar}
                          >
                            Сохраненные файлы
                          </a>
                        </li>
                      </>
                    )}
                  </>
                )}

                {isAdminUser && (
                  <>
                    <li>
                      <a 
                        href="/admin" 
                        className={`nav-link ${isActive('/admin') ? 'active' : ''}`}
                        onClick={closeSidebar}
                      >
                        Админ панель
                      </a>
                    </li>
                  </>
                )}

                {!isAuthenticated && (
                  <>
                    <li>
                      <a 
                        href="/login" 
                        className={`nav-link ${isActive('/login') ? 'active' : ''}`}
                        onClick={closeSidebar}
                      >
                        Войти
                      </a>
                    </li>
                    <li>
                      <a 
                        href="/register" 
                        className={`nav-link ${isActive('/register') ? 'active' : ''}`}
                        onClick={closeSidebar}
                      >
                        Регистрация
                      </a>
                    </li>
                  </>
                )}
              </ul>
            </nav>

            {isAuthenticated && (
              <div className="sidebar-footer">
                <button className="logout-btn" onClick={handleLogout}>
                  Выход
                </button>
              </div>
            )}
          </aside>

          {isSidebarOpen && (
            <div className="sidebar-overlay" onClick={closeSidebar}></div>
          )}

          <main className="main-content">
            {children}
          </main>

          <footer className="footer">
            <div className="footer-content">
              <div className="footer-section">
                <h3>Repetitor.by</h3>
                <p>Платформа для поиска и взаимодействия с репетиторами</p>
              </div>
              
              <div className="footer-section">
                <h4>Контакты</h4>
                <p>Email: 1227335@mtp.by</p>
                <p>Телефон: +375 (29) 538-03-71</p>
              </div>
              
              <div className="footer-section">
                <h4>Ссылки</h4>
                <a href="/tutors">Поиск</a>
              </div>
            </div>
            
            <div className="footer-bottom">
              <p>&copy; {new Date().getFullYear()} Repetitor.by. Все права защищены.</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}