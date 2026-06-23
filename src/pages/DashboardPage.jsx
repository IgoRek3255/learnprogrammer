import { useState, useEffect } from 'react';
import api from '../services/api.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { BookOpen, Users, FileCode, BarChart3, Clock, ClipboardList } from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [testAttempts, setTestAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/analytics/dashboard'),
      api.get('/tests/attempts'),
    ])
      .then(([statsRes, attemptsRes]) => {
        setStats(statsRes.data);
        setTestAttempts(attemptsRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Завантаження дашборду..." />;

  const cards = [
    { icon: BookOpen, label: 'Курси', value: stats?.totalCourses || 0, color: 'bg-indigo-100 text-indigo-600' },
    { icon: Users, label: 'Користувачі', value: stats?.totalUsers || 0, color: 'bg-green-100 text-green-600' },
    { icon: FileCode, label: 'Вправи', value: stats?.totalExercises || 0, color: 'bg-purple-100 text-purple-600' },
    { icon: BarChart3, label: 'Рішень', value: stats?.totalSubmissions || 0, color: 'bg-orange-100 text-orange-600' },
  ];

  const roleColors = {
    ADMIN: 'bg-purple-100 text-purple-700',
    TEACHER: 'bg-blue-100 text-blue-700',
    STUDENT: 'bg-green-100 text-green-700',
  };

  const passedTests = testAttempts.filter(a => a.status === 'COMPLETED' && a.score >= a.test.passingScore).length;
  const totalTests = testAttempts.filter(a => a.status === 'COMPLETED').length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Дашборд</h1>
        <p className="text-gray-500 mt-1">Панель керування системою</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${card.color}`}>
              <card.icon size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-gray-500 text-sm">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users size={18} />
            Користувачі за ролями
          </h3>
          <div className="space-y-3">
            {stats?.roleDistribution?.map((r) => (
              <div key={r.role} className="flex items-center justify-between">
                <span className={`text-sm px-2 py-1 rounded-md font-medium ${roleColors[r.role]}`}>
                  {r.role === 'ADMIN' ? 'Адміністратор' : r.role === 'TEACHER' ? 'Викладач' : 'Студент'}
                </span>
                <span className="text-lg font-bold text-gray-900">{r._count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock size={18} />
            Останні рішення
          </h3>
          <div className="space-y-3">
            {stats?.recentSubmissions?.slice(0, 5).map((s) => (
              <div key={s.id} className="flex items-center justify-between text-sm">
                <div className="min-w-0 flex-1">
                  <p className="text-gray-900 truncate font-medium">{s.user?.name}</p>
                  <p className="text-gray-400 truncate">{s.exercise?.title}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ml-2 flex-shrink-0 ${
                  s.status === 'PASSED' ? 'bg-green-100 text-green-700' :
                  s.status === 'FAILED' ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {s.status === 'PASSED' ? '✔' : s.status === 'FAILED' ? '✘' : '⏳'}
                </span>
              </div>
            ))}
            {(!stats?.recentSubmissions || stats.recentSubmissions.length === 0) && (
              <p className="text-gray-400 text-sm text-center py-4">Немає рішень</p>
            )}
          </div>
        </div>
      </div>

      {testAttempts.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ClipboardList size={18} className="text-purple-500" />
            Результати тестів
          </h3>
          <div className="space-y-3">
            {testAttempts.slice(0, 10).map((a) => (
              <div key={a.id} className="flex items-center justify-between text-sm">
                <div className="min-w-0 flex-1">
                  <p className="text-gray-900 truncate font-medium">{a.test?.title}</p>
                  <p className="text-gray-400 truncate">Спроба: {new Date(a.startedAt).toLocaleDateString('uk-UA')}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ml-2 flex-shrink-0 ${
                  a.status === 'COMPLETED'
                    ? (a.score >= a.test.passingScore ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {a.status === 'COMPLETED'
                    ? `${Math.round((a.score / a.maxScore) * 100)}%`
                    : '⏳'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
