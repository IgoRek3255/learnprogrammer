import { useState, useEffect } from 'react';
import api from '../services/api.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import { User, Calendar, CheckCircle, TrendingUp } from 'lucide-react';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/auth/profile'),
      api.get(`/analytics/progress`),
    ])
      .then(([profileRes, progressRes]) => {
        setProfile(profileRes.data);
        setName(profileRes.data.name);
        setProgress(progressRes.data);
      })
      .catch(() => setError('Помилка завантаження'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const res = await api.put('/auth/profile', { name });
      setProfile(res.data);
      setSuccess('Профіль оновлено');
    } catch {
      setError('Помилка оновлення');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner text="Завантаження профілю..." />;

  const completed = progress.filter(p => p.completed).length;
  const avgScore = progress.length > 0
    ? Math.round(progress.reduce((s, p) => s + (p.score || 0), 0) / progress.length)
    : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Профіль</h1>
      </div>

      <div className="grid md:grid-cols-[1fr_2fr] gap-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 text-center">
          <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User size={36} className="text-indigo-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">{profile?.name}</h2>
          <p className="text-gray-500 text-sm">{profile?.email}</p>
          <span className="inline-block mt-2 text-xs px-3 py-1 rounded-full font-medium bg-indigo-100 text-indigo-700">
            {profile?.role === 'ADMIN' ? 'Адміністратор' : profile?.role === 'TEACHER' ? 'Викладач' : 'Студент'}
          </span>
          <div className="mt-4 text-xs text-gray-400 flex items-center justify-center gap-1">
            <Calendar size={12} />
            Зареєстровано: {new Date(profile?.createdAt).toLocaleDateString('uk-UA')}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Статистика</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <CheckCircle size={20} className="text-green-600 mx-auto mb-1" />
                <p className="text-2xl font-bold text-green-600">{completed}</p>
                <p className="text-xs text-green-600">Виконано</p>
              </div>
              <div className="bg-indigo-50 rounded-lg p-3 text-center">
                <TrendingUp size={20} className="text-indigo-600 mx-auto mb-1" />
                <p className="text-2xl font-bold text-indigo-600">{avgScore}%</p>
                <p className="text-xs text-indigo-600">Середня оцінка</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Редагувати профіль</h3>
            <ErrorMessage message={error} onClose={() => setError('')} />
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg text-sm mb-4">
                {success}
              </div>
            )}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ім'я</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition"
              >
                {saving ? 'Збереження...' : 'Зберегти'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
