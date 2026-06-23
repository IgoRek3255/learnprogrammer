import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import { Plus, Edit2, Trash2, Check, X, ArrowLeft, FileCode } from 'lucide-react';

export default function TopicManagerPage() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', content: '' });
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', orderIndex: 0 });

  useEffect(() => {
    Promise.all([
      api.get(`/courses/${courseId}`),
      api.get(`/topics/course/${courseId}`),
    ])
      .then(([courseRes, topicRes]) => {
        setCourse(courseRes.data);
        setTopics(topicRes.data);
      })
      .catch(() => setError('Failed to load'))
      .finally(() => setLoading(false));
  }, [courseId]);

  async function handleCreate(e) {
    e.preventDefault();
    try {
      await api.post('/topics', { ...form, courseId, orderIndex: topics.length });
      setShowCreate(false);
      setForm({ title: '', content: '', orderIndex: 0 });
      const res = await api.get(`/topics/course/${courseId}`);
      setTopics(res.data);
    } catch { setError('Failed to create topic'); }
  }

  async function handleUpdate(id) {
    try {
      await api.put(`/topics/${id}`, editForm);
      setEditingId(null);
      const res = await api.get(`/topics/course/${courseId}`);
      setTopics(res.data);
    } catch { setError('Failed to update topic'); }
  }

  function startEditing(topic) {
    setEditingId(topic.id);
    setEditForm({ title: topic.title, content: topic.content });
  }

  async function handleDelete(id) {
    if (!confirm('Delete this topic and all its exercises?')) return;
    try {
      await api.delete(`/topics/${id}`);
      setTopics(topics.filter(t => t.id !== id));
    } catch { setError('Failed to delete topic'); }
  }

  if (loading) return <LoadingSpinner text="Завантаження..." />;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link to={`/courses/${courseId}`} className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-1">
          <ArrowLeft size={16} /> Назад до курсу
        </Link>
      </div>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Теми: {course?.title}</h1>
          <p className="text-gray-500 mt-1">Створюйте та редагуйте теми курсу</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition text-sm">
          <Plus size={18} /> Нова тема
        </button>
      </div>

      <ErrorMessage message={error} onClose={() => setError('')} />

      {showCreate && (
        <form onSubmit={handleCreate} className="bg-indigo-50 border border-indigo-200 rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Нова тема</h3>
          <div className="space-y-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Назва теми</label>
              <input type="text" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Вміст (Markdown-подібний)</label>
              <textarea value={form.content} onChange={(e) => setForm({...form, content: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none" rows={10}
                placeholder={'# Заголовок\n\nОпис теми...\n\n```javascript\nconsole.log("hello");\n```'} />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">Створити</button>
            <button type="button" onClick={() => setShowCreate(false)} className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition">Скасувати</button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {topics.map((topic, idx) => (
          editingId === topic.id ? (
            <div key={topic.id} className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
              <div className="space-y-3 mb-3">
                <input type="text" value={editForm.title} onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                <textarea value={editForm.content} onChange={(e) => setEditForm({...editForm, content: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono" rows={6} />
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleUpdate(topic.id)} className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-1"><Check size={16} /> Зберегти</button>
                <button onClick={() => setEditingId(null)} className="border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg text-sm flex items-center gap-1"><X size={16} /> Скасувати</button>
              </div>
            </div>
          ) : (
            <div key={topic.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:border-indigo-100 transition">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-indigo-600 font-semibold text-sm">{idx + 1}</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{topic.title}</h3>
                    <p className="text-gray-500 text-sm mt-0.5">
                      {topic._count?.exercises || 0} вправ
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link to={`/admin/exercises/${topic.id}`}
                    className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded" title="Управління вправами">
                    <FileCode size={16} />
                  </Link>
                  <button onClick={() => startEditing(topic)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"><Edit2 size={16} /></button>
                  <button onClick={() => handleDelete(topic.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          )
        ))}
        {topics.length === 0 && !showCreate && (
          <p className="text-center py-12 text-gray-400">Немає тем. Створіть першу тему для цього курсу!</p>
        )}
      </div>
    </div>
  );
}
