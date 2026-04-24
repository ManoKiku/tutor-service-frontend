'use client';

import { useState, useEffect } from 'react';
import styles from './admin.module.css';
import { getCategories, createCategory, deleteCategory } from '@/services/categories';
import { getSubcategories, createSubcategories, deleteSubcategories } from '@/services/subcategories';
import { getSubjects, createSubject, deleteSubject } from '@/services/subjects';
import { getTutorPosts, deleteTutorPost, moderateTutorPost } from '@/services/tutor-posts';
import { getUsers, deleteUser } from '@/services/users';
import { User } from '@/types/auth';
import { isAdmin } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { rootTaskDispose } from 'next/dist/build/swc/generated-native';
import AuthGuard from '@/components/auth-guard';
import { createTag, deleteTag, getTags } from '@/services/tags';

interface Tag {
  id: number;
  name: string;
}

interface CreateTagRequest {
  name: string;
}

type EntityType = 'categories' | 'subcategories' | 'subjects' | 'tags' | 'users' | 'moderation';

export default function AdminPage() {
  const router = useRouter();
  const [selectedEntity, setSelectedEntity] = useState<EntityType>('categories');
  const [loading, setLoading] = useState(false);
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [tutorPosts, setTutorPosts] = useState<TutorPost[]>([]);
  
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newSubcategory, setNewSubcategory] = useState({ name: '', categoryId: 0 });
  const [newSubject, setNewSubject] = useState({ name: '', subcategoryId: 0 });
  const [newTagName, setNewTagName] = useState('');

  if(!isAdmin())
  {
    router.push("/")
    return;
  }

  useEffect(() => {
    loadData();
  }, [selectedEntity]);

  const loadData = async () => {
    setLoading(true);
    try {
      switch (selectedEntity) {
        case 'categories':
          const cats = await getCategories();
          setCategories(cats);
          break;
        case 'subcategories':
          const subs = await getSubcategories();
          setSubcategories(subs);
          const allCats = await getCategories();
          setCategories(allCats);
          break;
        case 'subjects':
          const subjs = await getSubjects();
          setSubjects(subjs);
          const allSubs = await getSubcategories();
          setSubcategories(allSubs);
          break;
        case 'tags':
          const tagList = await getTags();
          setTags(tagList);
          break;
        case 'users':
          const userList = await getUsers();
          setUsers(userList);
          break;
        case 'moderation':
          const posts = await getTutorPosts({status: 0, subjectId: undefined, cityId: undefined, search: undefined, tags: undefined, minRate: undefined, maxRate: undefined});
          setTutorPosts(posts);
          break;
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      await createCategory({ name: newCategoryName });
      setNewCategoryName('');
      loadData();
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  const handleCreateSubcategory = async () => {
    if (!newSubcategory.name.trim() || newSubcategory.categoryId === 0) return;
    try {
      await createSubcategories({
        categoryId: newSubcategory.categoryId,
        name: newSubcategory.name
      });
      setNewSubcategory({ name: '', categoryId: 0 });
      loadData();
    } catch (error) {
      console.error('Error creating subcategory:', error);
    }
  };

  const handleCreateSubject = async () => {
    if (!newSubject.name.trim() || newSubject.subcategoryId === 0) return;
    try {
      await createSubject({
        subcategoryId: newSubject.subcategoryId,
        name: newSubject.name
      });
      setNewSubject({ name: '', subcategoryId: 0 });
      loadData();
    } catch (error) {
      console.error('Error creating subject:', error);
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    await createTag({name: newTagName});
    setNewTagName('');
    loadData();
  };

  const handleDeleteCategory = async (id: number) => {
    if (confirm('Удалить категорию?')) {
      try {
        await deleteCategory(id);
        loadData();
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };

  const handleDeleteSubcategory = async (id: number) => {
    if (confirm('Удалить подкатегорию?')) {
      try {
        await deleteSubcategories(id);
        loadData();
      } catch (error) {
        console.error('Error deleting subcategory:', error);
      }
    }
  };

  const handleDeleteSubject = async (id: number) => {
    if (confirm('Удалить предмет?')) {
      try {
        await deleteSubject(id);
        loadData();
      } catch (error) {
        console.error('Error deleting subject:', error);
      }
    }
  };

  const handleDeleteTag = async (id: number) => {
    if (confirm('Удалить тег?')) {
      await deleteTag(id)
      loadData();
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm('Удалить пользователя?')) {
      try {
        await deleteUser(id);
        loadData();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleDeletePost = async (id: string) => {
    if (confirm('Удалить объявление?')) {
      try {
        await deleteTutorPost(id);
        loadData();
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    }
  };

  const handleModeratePost = async (id: string, status: number) => {
    try {
      await moderateTutorPost(id, status);
      loadData();
    } catch (error) {
      console.error('Error moderating post:', error);
    }
  };

  const renderContent = () => {
    if (loading) {
      return <div className="alert alert-info">Загрузка...</div>;
    }

    switch (selectedEntity) {
      case 'categories':
        return (
          <div>
            <div className="card">
              <h3>Добавить категорию</h3>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Название категории"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="form-input"
                />
              </div>
              <button onClick={handleCreateCategory} className="btn btn-primary">
                Добавить категорию
              </button>
            </div>

            <div className="card">
              <h3>Список категорий</h3>
              <ul className={styles.entityList}>
                {categories.map(cat => (
                  <li key={cat.id} className={styles.entityItem}>
                    <div>
                      <strong>{cat.name}</strong>
                      <em>Id: {cat.id}</em>
                    </div>  
                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="btn btn-danger btn-small"
                    >
                      Удалить
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );

      case 'subcategories':
        return (
          <div>
            <div className="card">
              <h3>Добавить подкатегорию</h3>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Название подкатегории"
                  value={newSubcategory.name}
                  onChange={(e) => setNewSubcategory({...newSubcategory, name: e.target.value})}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <select
                  value={newSubcategory.categoryId}
                  onChange={(e) => setNewSubcategory({...newSubcategory, categoryId: Number(e.target.value)})}
                  className="form-input"
                >
                  <option value={0}>Выберите категорию</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}, Id: {cat.id}</option>
                  ))}
                </select>
              </div>
              <button onClick={handleCreateSubcategory} className="btn btn-primary">
                Добавить подкатегорию
              </button>
            </div>

            <div className="card">
              <h3>Список подкатегорий</h3>
              <ul className={styles.entityList}>
                {subcategories.map(sub => (
                  <li key={sub.id} className={styles.entityItem}>
                    <div>
                      <strong>{sub.name}</strong>
                      <em>Id: {sub.id}</em>
                      <div className={styles.subInfo}>
                        Категория: {categories.find(c => c.id === sub.categoryId)?.name}, Id: {sub.categoryId}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteSubcategory(sub.id)}
                      className="btn btn-danger btn-small"
                    >
                      Удалить
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );

      case 'subjects':
        return (
          <div>
            <div className="card">
              <h3>Добавить предмет</h3>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Название предмета"
                  value={newSubject.name}
                  onChange={(e) => setNewSubject({...newSubject, name: e.target.value})}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <select
                  value={newSubject.subcategoryId}
                  onChange={(e) => setNewSubject({...newSubject, subcategoryId: Number(e.target.value)})}
                  className="form-input"
                >
                  <option value={0}>Выберите подкатегорию</option>
                  {subcategories.map(sub => (
                    <option key={sub.id} value={sub.id}>{sub.name}, Id: {sub.id}</option>
                  ))}
                </select>
              </div>
              <button onClick={handleCreateSubject} className="btn btn-primary">
                Добавить предмет
              </button>
            </div>

            <div className="card">
              <h3>Список предметов</h3>
              <ul className={styles.entityList}>
                {subjects.map(subject => (
                  <li key={subject.id} className={styles.entityItem}>
                    <div>
                      <strong>{subject.name}</strong>
                      <em>Id: {subject.id}</em>
                      <div className={styles.subInfo}>
                        Подкатегория: {subcategories.find(sc => sc.id === subject.subcategoryId)?.name}, Id: {subject.subcategoryId}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteSubject(subject.id)}
                      className="btn btn-danger btn-small"
                    >
                      Удалить
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );

      case 'tags':
        return (
          <div>
            <div className="card">
              <h3>Добавить тег</h3>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Название тега"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  className="form-input"
                />
              </div>
              <button onClick={handleCreateTag} className="btn btn-primary">
                Добавить тег
              </button>
            </div>

            <div className="card">
              <h3>Список тегов</h3>
              <ul className={styles.entityList}>
                {tags.map(tag => (
                  <li key={tag.id} className={styles.entityItem}>
                    <span>{tag.name}</span>
                    <button
                      onClick={() => handleDeleteTag(tag.id)}
                      className="btn btn-danger btn-small"
                    >
                      Удалить
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );

      case 'users':
        return (
          <div className="card">
            <h3>Пользователи</h3>
            <ul className={styles.entityList}>
              {users.map(user => (
                <li key={user.id} className={styles.entityItem}>
                  <div>
                    <strong>{user.firstName} {user.lastName}</strong>
                    <div className={styles.subInfo}>
                      {user.email} • {user.role === 0 ? 'Студент' : user.role === 1 ? 'Репетитор' : 'Админ'}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="btn btn-danger btn-small"
                  >
                    Удалить
                  </button>
                </li>
              ))}
            </ul>
          </div>
        );

      case 'moderation':
        return (
          <div className="card">
            <h3>Объявления на модерации</h3>
            <ul className={styles.entityList}>
              {tutorPosts.map(post => (
                <li key={post.id} className={styles.entityItem}>
                  <div className={styles.postContent}>
                    <strong>{post.subjectName}</strong>
                    <div className={styles.subInfo}>
                      Репетитор: {post.tutorName}
                    </div>
                    <p className="text-truncate-2">{post.description}</p>
                    <div className={styles.postMeta}>
                      Ставка: ${post.hourlyRate}/час • 
                      Статус: {post.status === 0 ? 'На модерации' : post.status === 1 ? 'Одобрено' : 'Отклонено'}
                    </div>
                  </div>
                  <div className={styles.postActions}>
                    {post.status === 0 && (
                      <>
                        <button
                          onClick={() => handleModeratePost(post.id, 1)}
                          className="btn btn-primary btn-small"
                        >
                          Одобрить
                        </button>
                        <button
                          onClick={() => handleModeratePost(post.id, 2)}
                          className="btn btn-secondary btn-small"
                        >
                          Отклонить
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="btn btn-danger btn-small"
                    >
                      Удалить
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        );
    }
  };

  return (
    <div className={styles.adminContainer}>
      <div className={styles.sidebar}>
        <h2 className={styles.sidebarTitle}>Типы</h2>
        <nav className={styles.sidebarNav}>
          <button
            className={`${styles.sidebarButton} ${selectedEntity === 'categories' ? styles.active : ''}`}
            onClick={() => setSelectedEntity('categories')}
          >
            Категории
          </button>
          <button
            className={`${styles.sidebarButton} ${selectedEntity === 'subcategories' ? styles.active : ''}`}
            onClick={() => setSelectedEntity('subcategories')}
          >
            Подкатегории
          </button>
          <button
            className={`${styles.sidebarButton} ${selectedEntity === 'subjects' ? styles.active : ''}`}
            onClick={() => setSelectedEntity('subjects')}
          >
            Предметы
          </button>
          <button
            className={`${styles.sidebarButton} ${selectedEntity === 'tags' ? styles.active : ''}`}
            onClick={() => setSelectedEntity('tags')}
          >
            Теги
          </button>
          <button
            className={`${styles.sidebarButton} ${selectedEntity === 'users' ? styles.active : ''}`}
            onClick={() => setSelectedEntity('users')}
          >
            Пользователи
          </button>
          <button
            className={`${styles.sidebarButton} ${selectedEntity === 'moderation' ? styles.active : ''}`}
            onClick={() => setSelectedEntity('moderation')}
          >
            Модерация
          </button>
        </nav>
      </div>

      <div className={styles.mainContent}>
        <h1 className={styles.pageTitle}>
          {selectedEntity === 'categories' && 'Управление категориями'}
          {selectedEntity === 'subcategories' && 'Управление подкатегориями'}
          {selectedEntity === 'subjects' && 'Управление предметами'}
          {selectedEntity === 'tags' && 'Управление тегами'}
          {selectedEntity === 'users' && 'Управление пользователями'}
          {selectedEntity === 'moderation' && 'Модерация объявлений'}
        </h1>
        
        {renderContent()}
      </div>
    </div>
  );
}
