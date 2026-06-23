import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import { BookOpen, Layers, Plus, Edit2, Trash2, Check, X, ChevronRight } from 'lucide-react';

export default function CourseManagerPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editCourse, setEditCourse] = useState({ title: '', description: '', published: false });
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', imageUrl: '', published: false });

  useEffect(() => { loadCourses(); }, []);

  function loadCourses() {
    setLoading(true);
    api.get('/courses')
      .then((res) => setCourses(res.data))
      .catch(() => setError('Failed to load courses'))
      .finally(() => setLoading(false));
  }

  function startEdit(course) {
    setEditingId(course.id);
    setEditCourse({ title: course.title, description: course.description, published: course.published });
  }

  async function handleCreate(e) {
    e.preventDefault();
    try {
      await api.post('/courses', form);
      setShowCreate(false);
      setForm({ title: '', description: '', imageUrl: '', published: false });
      loadCourses();
    } catch { setError('Failed to create course'); }
  }

  async function handleUpdate(id) {
    try {
      await api.put(`/courses/${id}`, editCourse);
      setEditingId(null);
      loadCourses();
    } catch { setError('Failed to update course'); }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this course and all its content?')) return;
    try {
      await api.delete(`/courses/${id}`);
      loadCourses();
    } catch { setError('Failed to delete course'); }
  }

  if (loading) return <LoadingSpinner text="Loading courses..." />;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Управління курсами</h1>
          <p className="text-gray-500 mt-1">Створюйте та редагуйте курси</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition text-sm">
          <Plus size={18} /> Новий курс
        </button>
      </div>

      <ErrorMessage message={error} onClose={() => setError('')} />

      {showCreate && (
        <form onSubmit={handleCreate} className="bg-indigo-50 border border-indigo-200 rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Новий курс</h3>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Назва</label>
              <input type="text" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL зображення</label>
              <input type="text" value={form.imageUrl} onChange={(e) => setForm({...form, imageUrl: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="/courses/javascript.svg" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Опис</label>
              <textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" rows={3} required />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="published" checked={form.published} onChange={(e) => setForm({...form, published: e.target.checked})}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
              <label htmlFor="published" className="text-sm text-gray-700">Опублікувати</label>
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">Створити</button>
            <button type="button" onClick={() => setShowCreate(false)} className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition">Скасувати</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-5 py-3 text-sm font-medium text-gray-500">Назва</th>
              <th className="text-left px-5 py-3 text-sm font-medium text-gray-500 hidden md:table-cell">Опис</th>
              <th className="text-center px-5 py-3 text-sm font-medium text-gray-500">Статус</th>
              <th className="text-right px-5 py-3 text-sm font-medium text-gray-500">Дії</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {courses.map((course) => (
              <tr key={course.id} className="hover:bg-gray-50 transition">
                {editingId === course.id ? (
                  <>
                    <td className="px-5 py-3"><input type="text" value={editCourse.title} onChange={(e) => setEditCourse({...editCourse, title: e.target.value})}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500 outline-none" /></td>
                    <td className="px-5 py-3 hidden md:table-cell"><input type="text" value={editCourse.description} onChange={(e) => setEditCourse({...editCourse, description: e.target.value})}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" /></td>
                    <td className="px-5 py-3 text-center">
                      <select value={editCourse.published} onChange={(e) => setEditCourse({...editCourse, published: e.target.value === 'true'})}
                        className="text-sm border border-gray-300 rounded px-2 py-1">
                        <option value="true">Published</option>
                        <option value="false">Draft</option>
                      </select>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => handleUpdate(course.id)} className="p-1.5 text-green-600 hover:bg-green-50 rounded"><Check size={16} /></button>
                        <button onClick={() => setEditingId(null)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded"><X size={16} /></button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <BookOpen size={18} className="text-indigo-500" />
                        <Link to={`/courses/${course.id}`} className="font-medium text-gray-900 hover:text-indigo-600 transition">{course.title}</Link>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-500 hidden md:table-cell truncate max-w-xs">{course.description}</td>
                    <td className="px-5 py-3 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${course.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {course.published ? 'Опубліковано' : 'Чернетка'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => startEdit(course)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(course.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                        <Link to={`/admin/topics/${course.id}`} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded" title="Управління темами"><Layers size={16} /></Link>
                        <Link to={`/courses/${course.id}`} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"><ChevronRight size={16} /></Link>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {courses.length === 0 && <p className="text-center py-12 text-gray-400">Немає курсів. Створіть перший!</p>}
      </div>
    </div>
  );
}
