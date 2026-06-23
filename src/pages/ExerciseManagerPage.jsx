import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import { FileCode, Plus, Edit2, Trash2, Check, X, ArrowLeft } from 'lucide-react';

export default function ExerciseManagerPage() {
  const { topicId } = useParams();
  const [topic, setTopic] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', difficulty: '', description: '' });
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', type: 'CODE', difficulty: 'BEGINNER',
    templateCode: '', testCode: '', solution: '', orderIndex: 0,
  });

  useEffect(() => {
    Promise.all([
      api.get(`/topics/${topicId}`),
      api.get(`/exercises/topic/${topicId}`),
    ])
      .then(([topicRes, exRes]) => {
        setTopic(topicRes.data);
        setExercises(exRes.data);
      })
      .catch(() => setError('Failed to load'))
      .finally(() => setLoading(false));
  }, [topicId]);

  async function handleCreate(e) {
    e.preventDefault();
    try {
      await api.post('/exercises', { ...form, topicId, orderIndex: exercises.length });
      setShowCreate(false);
      setForm({ title: '', description: '', type: 'CODE', difficulty: 'BEGINNER', templateCode: '', testCode: '', solution: '', orderIndex: 0 });
      const res = await api.get(`/exercises/topic/${topicId}`);
      setExercises(res.data);
    } catch { setError('Failed to create exercise'); }
  }

  async function handleUpdate(id) {
    try {
      await api.put(`/exercises/${id}`, editForm);
      setEditingId(null);
      const res = await api.get(`/exercises/topic/${topicId}`);
      setExercises(res.data);
    } catch { setError('Failed to update exercise'); }
  }

  function startEditing(ex) {
    setEditingId(ex.id);
    setEditForm({ title: ex.title, difficulty: ex.difficulty, description: ex.description });
  }

  async function handleDelete(id) {
    if (!confirm('Delete this exercise?')) return;
    try {
      await api.delete(`/exercises/${id}`);
      setExercises(exercises.filter(e => e.id !== id));
    } catch { setError('Failed to delete exercise'); }
  }

  if (loading) return <LoadingSpinner text="Завантаження..." />;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link to={`/courses/${topic?.courseId}`} className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-1">
          <ArrowLeft size={16} /> Назад до курсу
        </Link>
      </div>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Вправи: {topic?.title}</h1>
          <p className="text-gray-500 mt-1">Створюйте та редагуйте вправи</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition text-sm">
          <Plus size={18} /> Нова вправа
        </button>
      </div>

      <ErrorMessage message={error} onClose={() => setError('')} />

      {showCreate && (
        <form onSubmit={handleCreate} className="bg-indigo-50 border border-indigo-200 rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Нова вправа</h3>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Назва</label>
              <input type="text" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" required />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Опис</label>
              <textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" rows={2} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Тип</label>
              <select value={form.type} onChange={(e) => setForm({...form, type: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                <option value="CODE">Код</option>
                <option value="QUIZ">Тест</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Складність</label>
              <select value={form.difficulty} onChange={(e) => setForm({...form, difficulty: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                <option value="BEGINNER">Початковий</option>
                <option value="INTERMEDIATE">Середній</option>
                <option value="ADVANCED">Складний</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Шаблон коду</label>
              <textarea value={form.templateCode} onChange={(e) => setForm({...form, templateCode: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none" rows={4} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Тестовий код</label>
              <textarea value={form.testCode} onChange={(e) => setForm({...form, testCode: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none" rows={4}
                placeholder='console.log(myFunction(1) === 2 ? "PASS" : "FAIL");' />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Рішення (код)</label>
              <textarea value={form.solution} onChange={(e) => setForm({...form, solution: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none" rows={4} />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">Створити</button>
            <button type="button" onClick={() => setShowCreate(false)} className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition">Скасувати</button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {exercises.map((ex) => (
          editingId === ex.id ? (
            <div key={ex.id} className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
              <div className="grid md:grid-cols-2 gap-3 mb-3">
                <input type="text" value={editForm.title} onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                <select value={editForm.difficulty} onChange={(e) => setEditForm({...editForm, difficulty: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="BEGINNER">Початковий</option>
                  <option value="INTERMEDIATE">Середній</option>
                  <option value="ADVANCED">Складний</option>
                </select>
                <div className="md:col-span-2">
                  <textarea value={editForm.description} onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" rows={2} />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleUpdate(ex.id)} className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-1"><Check size={16} /> Зберегти</button>
                <button onClick={() => setEditingId(null)} className="border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg text-sm flex items-center gap-1"><X size={16} /> Скасувати</button>
              </div>
            </div>
          ) : (
            <div key={ex.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:border-indigo-100 transition">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FileCode size={16} className="text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{ex.title}</h3>
                    <p className="text-gray-500 text-sm mt-0.5">{ex.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        ex.difficulty === 'BEGINNER' ? 'bg-green-100 text-green-700' :
                        ex.difficulty === 'INTERMEDIATE' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {ex.difficulty === 'BEGINNER' ? 'Початковий' : ex.difficulty === 'INTERMEDIATE' ? 'Середній' : 'Складний'}
                      </span>
                      <span className="text-xs text-gray-400">{ex.type === 'CODE' ? 'Код' : 'Тест'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                    <button onClick={() => startEditing(ex)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"><Edit2 size={16} /></button>
                  <button onClick={() => handleDelete(ex.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          )
        ))}
        {exercises.length === 0 && !showCreate && (
          <p className="text-center py-12 text-gray-400">Немає вправ. Створіть першу!</p>
        )}
      </div>
    </div>
  );
}
