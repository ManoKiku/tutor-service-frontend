'use client';

import { useState, useEffect, useCallback } from 'react';
import './tutors.css';
import TutorPostCard from '@/components/tutor-post-component';
import { getCategories } from '@/services/categories';
import { getCities } from '@/services/cities';
import { getSubjects } from '@/services/subjects';
import { getSubcategories } from '@/services/subcategories';
import { getTutorPosts } from '@/services/tutor-posts';

export default function TutorsPage() {
  const [posts, setPosts] = useState<TutorPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const [categoriesData, subcategoriesData, subjectsData, citiesData, postsData] = await Promise.all([
        getCategories(),
        getSubcategories(),
        getSubjects(),
        getCities(),
        getTutorPosts()
      ]);
      
      setCategories(categoriesData);
      setSubcategories(subcategoriesData);
      setSubjects(subjectsData);
      setCities(citiesData);
      setPosts(postsData);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSubcategories = subcategories.filter(
    subcat => !selectedCategory || subcat.categoryId === parseInt(selectedCategory)
  );

  const filteredSubjects = subjects.filter(
    subject => !selectedCategory || subject.subcategoryId === parseInt(selectedSubcategory)
  );

  const handleSearch = useCallback(async () => {
    setIsSearching(true);
    try {
      const params : TutorPostRequest = {
        subjectId: selectedSubject || undefined,
        cityId: selectedCity || undefined,
        status: 1,
        tags: undefined,
        minRate: undefined,
        maxRate: undefined,
        search: searchQuery.trim()

      };
      
      const results = await getTutorPosts(params);
      
      let filteredResults = results;
      
      setPosts(filteredResults);
    } catch (error) {
      console.error('Error searching posts:', error);
    } finally {
      setIsSearching(false);
    }
  }, [selectedSubject, selectedCity, searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch();
    }, 300); 

    return () => clearTimeout(timer);
  }, [selectedSubject, selectedCity, handleSearch]);

  const handleResetFilters = () => {
    setSelectedCategory('');
    setSelectedSubcategory('');
    setSelectedSubject('');
    setSelectedCity('');
    setSearchQuery('');
    loadInitialData();
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Загрузка данных...</p>
      </div>
    );
  }

  return (
    <div className="tutors-container">
      <div className="tutors-header">
        <h1>Поиск репетиторов</h1>
        <p>Найдите подходящего репетитора по вашим критериям</p>
      </div>

      <div className="tutors-layout">
        <aside className="filters-sidebar">
          <div className="filters-header">
            <h2>Фильтры</h2>
            <button 
              onClick={handleResetFilters} 
              className="btn btn-secondary btn-small"
            >
              Сбросить
            </button>
          </div>

          <div className="filters-list">
            <div className="filter-group">
              <label htmlFor="category" className="filter-label">
                Категория
              </label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setSelectedSubcategory('');
                  setSelectedSubject('');
                }}
                className="filter-select"
              >
                <option value="">Все категории</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="subcategory" className="filter-label">
                Подкатегория
              </label>
              <select
                id="subcategory"
                value={selectedSubcategory}
                onChange={(e) => setSelectedSubcategory(e.target.value)}
                disabled={!selectedCategory}
                className="filter-select"
              >
                <option value="">Все подкатегории</option>
                {filteredSubcategories.map((subcategory) => (
                  <option key={subcategory.id} value={subcategory.id}>
                    {subcategory.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="subject" className="filter-label">
                Предмет
              </label>
              <select
                id="subject"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                disabled={!selectedCategory}
                className="filter-select"
              >
                <option value="">Все предметы</option>
                {filteredSubjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="city" className="filter-label">
                Город
              </label>
              <select
                id="city"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="filter-select"
              >
                <option value="">Любой город</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </aside>

        <main className="search-results">
          <div className="search-bar">
            <div className="search-input-group">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Введите название услуги, имя репетитора или описание..."
                className="search-input"
              />
              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="btn btn-primary search-button"
              >
                {isSearching ? 'Поиск...' : 'Найти предложения'}
              </button>
            </div>
          </div>

          <div className="results-info">
            <p>
              Найдено: <strong>{posts.length}</strong> предложений
              {selectedCity && cities.find(c => c.id === parseInt(selectedCity)) && (
                <span> в городе <strong>{cities.find(c => c.id === parseInt(selectedCity))?.name}</strong></span>
              )}
            </p>
          </div>

          {posts.length > 0 ? (
            <div className="tutors-grid">
              {posts.map((post) => (
                <TutorPostCard key={post.id} post={post}/>
              ))}
            </div>
          ) : (
            <div className="no-results">
              <h3>По вашему запросу ничего не найдено</h3>
              <p>Попробуйте изменить параметры поиска или сбросить фильтры</p>
              <button onClick={handleResetFilters} className="btn btn-primary">
                Сбросить фильтры
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}