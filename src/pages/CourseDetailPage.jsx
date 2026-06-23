import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../store/authContext.jsx';
import api from '../services/api.js';
import { BookOpen, ChevronRight, Settings, Layers, ClipboardList } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

export default function CourseDetailPage() {
  const { user } = useAuth();
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/courses/${courseId}`),
      api.get(`/tests?courseId=${courseId}`),
    ])
      .then(([courseRes, testsRes]) => {
        setCourse(courseRes.data);
        setTests(testsRes.data.filter(t => t.published || user?.role === 'ADMIN' || user?.role === 'TEACHER'));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [courseId, user]);

  const isTeacherOrAdmin = user?.role === 'ADMIN' || user?.role === 'TEACHER';

  if (loading) return <LoadingSpinner text="Завантаження курсу..." />;
  if (!course) return <div className="text-center py-16 text-gray-500">Курс не знайдено</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link to="/courses" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
          ← Назад до курсів
        </Link>
      </div>

      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl p-8 text-white mb-8">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen size={24} />
          <span className="text-indigo-200 text-sm">{course.topics?.length || 0} тем</span>
        </div>
        <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
        <p className="text-indigo-100 text-lg">{course.description}</p>
      </div>

      <div className="flex items-center gap-4 mb-6 flex-wrap">
        {isTeacherOrAdmin && (
          <>
            <Link to={`/admin/topics/${courseId}`} className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
              <Layers size={16} /> Управління темами
            </Link>
            <Link to={`/admin/tests/${courseId}`} className="inline-flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition">
              <ClipboardList size={16} /> Управління тестами
            </Link>
            <Link to="/admin/courses" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 text-sm font-medium border border-indigo-200 px-4 py-2 rounded-lg hover:bg-indigo-50 transition">
              <Settings size={16} /> Управління курсами
            </Link>
          </>
        )}
      </div>

      {tests.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ClipboardList size={20} className="text-purple-500" />
            Тести
          </h2>
          <div className="space-y-3">
            {tests.map((test) => (
              <Link key={test.id} to={`/tests/${test.id}`}
                className="block bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:border-purple-100 hover:shadow-md transition">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <ClipboardList size={20} className="text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{test.title}</h3>
                      <p className="text-gray-500 text-sm mt-0.5">{test.description}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-gray-400">{test._count?.questions || 0} питань</span>
                        {test.timeLimit > 0 && <span className="text-xs text-gray-400">{test.timeLimit} хв</span>}
                        <span className="text-xs text-gray-400">Прохідний: {test.passingScore}%</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-gray-300 flex-shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <h2 className="text-xl font-semibold text-gray-900 mb-4">Теми курсу</h2>
      <div className="space-y-3">
        {course.topics?.map((topic, idx) => (
          <div key={topic.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-indigo-600 font-semibold text-sm">{idx + 1}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{topic.title}</h3>
                    <p className="text-gray-500 text-sm mt-1">
                      {topic._count?.exercises || 0} вправ
                    </p>
                  </div>
                </div>
                <Link
                  to={`/courses/${courseId}/topics/${topic.id}`}
                  className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 text-sm font-medium flex-shrink-0"
                >
                  Перейти <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
