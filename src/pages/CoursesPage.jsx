import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api.js';
import { BookOpen, ChevronRight } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/courses')
      .then((res) => setCourses(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Завантаження курсів..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Курси</h1>
        <p className="text-gray-500 mt-1">Оберіть курс для початку навчання</p>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <BookOpen size={64} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg">Поки немає доступних курсів</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Link
              key={course.id}
              to={`/courses/${course.id}`}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-indigo-100 transition group overflow-hidden"
            >
              <div className="h-40 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <BookOpen size={48} className="text-white/70" />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition">
                  {course.title}
                </h3>
                <p className="text-gray-500 text-sm mt-2 line-clamp-2">{course.description}</p>
                <div className="flex items-center justify-between mt-4 text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    <BookOpen size={14} />
                    {course._count?.topics || 0} тем
                  </span>
                  <span className="flex items-center gap-1 text-indigo-600 font-medium">
                    Почати <ChevronRight size={16} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
