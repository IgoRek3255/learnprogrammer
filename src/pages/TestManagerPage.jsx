import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import { Plus, Edit2, Trash2, Check, X, ArrowLeft, ClipboardList, Eye } from 'lucide-react';

const QUESTION_TYPES = [
  { value: 'SINGLE_CHOICE', label: 'Один вибір' },
  { value: 'MULTIPLE_CHOICE', label: 'Множинний вибір' },
  { value: 'TRUE_FALSE', label: 'Правда/Неправда' },
];

export default function TestManagerPage() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', timeLimit: 0, passingScore: 60, published: false,
  });
  const [selectedTest, setSelectedTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [editQuestionIdx, setEditQuestionIdx] = useState(-1);
  const [editQ, setEditQ] = useState({ text: '', type: 'SINGLE_CHOICE', points: 1, options: [] });

  useEffect(() => {
    Promise.all([
      api.get(`/courses/${courseId}`),
      api.get(`/tests?courseId=${courseId}`),
    ])
      .then(([courseRes, testRes]) => {
        setCourse(courseRes.data);
        setTests(testRes.data);
      })
      .catch(() => setError('Failed to load'))
      .finally(() => setLoading(false));
  }, [courseId]);

  async function handleCreate(e) {
    e.preventDefault();
    try {
      await api.post('/tests', { ...form, courseId });
      setShowCreate(false);
      setForm({ title: '', description: '', timeLimit: 0, passingScore: 60, published: false });
      const res = await api.get(`/tests?courseId=${courseId}`);
      setTests(res.data);
    } catch { setError('Failed to create test'); }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this test and all its questions?')) return;
    try {
      await api.delete(`/tests/${id}`);
      setTests(tests.filter(t => t.id !== id));
      if (selectedTest?.id === id) setSelectedTest(null);
    } catch { setError('Failed to delete test'); }
  }

  function selectTest(test) {
    setSelectedTest(test);
    api.get(`/tests/${test.id}`)
      .then(res => setQuestions(res.data.questions || []))
      .catch(() => setError('Failed to load questions'));
  }

  function addQuestion() {
    setQuestions([...questions, {
      _temp: true, text: '', type: 'SINGLE_CHOICE', points: 1, options: [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
      ],
    }]);
    setEditQuestionIdx(questions.length);
    setEditQ({ text: '', type: 'SINGLE_CHOICE', points: 1, options: [{ text: '', isCorrect: false }, { text: '', isCorrect: false }] });
  }

  function editQuestion(idx) {
    const q = questions[idx];
    setEditQuestionIdx(idx);
    setEditQ({
      text: q.text || '',
      type: q.type || 'SINGLE_CHOICE',
      points: q.points || 1,
      options: (q.options || []).map(o => ({ text: o.text || '', isCorrect: o.isCorrect || false })),
    });
  }

  function addOption() {
    setEditQ({ ...editQ, options: [...editQ.options, { text: '', isCorrect: false }] });
  }

  function removeOption(idx) {
    const opts = editQ.options.filter((_, i) => i !== idx);
    setEditQ({ ...editQ, options: opts });
  }

  function setOptionText(idx, text) {
    const opts = editQ.options.map((o, i) => i === idx ? { ...o, text } : o);
    setEditQ({ ...editQ, options: opts });
  }

  function setOptionCorrect(idx) {
    if (editQ.type === 'SINGLE_CHOICE' || editQ.type === 'TRUE_FALSE') {
      const opts = editQ.options.map((o, i) => ({ ...o, isCorrect: i === idx }));
      setEditQ({ ...editQ, options: opts });
    } else {
      const opts = editQ.options.map((o, i) => i === idx ? { ...o, isCorrect: !o.isCorrect } : o);
      setEditQ({ ...editQ, options: opts });
    }
  }

  async function saveQuestion() {
    if (!editQ.text.trim()) { setError('Question text is required'); return; }

    if (selectedTest && !questions[editQuestionIdx]?._temp) {
      const existingQ = questions[editQuestionIdx];
      try {
        const res = await api.put(`/tests/${selectedTest.id}/questions/${existingQ.id}`, editQ);
        const updated = [...questions];
        updated[editQuestionIdx] = res.data;
        setQuestions(updated);
        setEditQuestionIdx(-1);
      } catch { setError('Failed to update question'); }
    } else if (selectedTest) {
      try {
        const res = await api.post(`/tests/${selectedTest.id}/questions`, editQ);
        const updated = [...questions];
        updated[editQuestionIdx] = res.data;
        setQuestions(updated);
        setEditQuestionIdx(-1);
      } catch { setError('Failed to add question'); }
    } else {
      const updated = [...questions];
      updated[editQuestionIdx] = { ...editQ, _temp: true };
      setQuestions(updated);
      setEditQuestionIdx(-1);
    }
  }

  async function deleteQuestion(idx) {
    const q = questions[idx];
    if (!q._temp && selectedTest) {
      try {
        await api.delete(`/tests/${selectedTest.id}/questions/${q.id}`);
      } catch { setError('Failed to delete question'); }
    }
    setQuestions(questions.filter((_, i) => i !== idx));
  }

  async function publishTest(test, publish) {
    try {
      await api.put(`/tests/${test.id}`, { published: publish });
      const res = await api.get(`/tests?courseId=${courseId}`);
      setTests(res.data);
      if (selectedTest?.id === test.id) {
        setSelectedTest({ ...selectedTest, published: publish });
      }
    } catch { setError('Failed to update test'); }
  }

  if (loading) return <LoadingSpinner text="Loading tests..." />;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link to={`/courses/${courseId}`} className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-1">
          <ArrowLeft size={16} /> Назад до курсу
        </Link>
      </div>

      {!selectedTest ? (
        <>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Тести: {course?.title}</h1>
              <p className="text-gray-500 mt-1">Створюйте тести для перевірки знань</p>
            </div>
            <button onClick={() => setShowCreate(!showCreate)}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition text-sm">
              <Plus size={18} /> Новий тест
            </button>
          </div>

          <ErrorMessage message={error} onClose={() => setError('')} />

          {showCreate && (
            <form onSubmit={handleCreate} className="bg-indigo-50 border border-indigo-200 rounded-xl p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">Новий тест</h3>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ліміт часу (хв)</label>
                  <input type="number" value={form.timeLimit} onChange={(e) => setForm({...form, timeLimit: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" min="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Прохідний бал (%)</label>
                  <input type="number" value={form.passingScore} onChange={(e) => setForm({...form, passingScore: parseInt(e.target.value) || 60})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" min="0" max="100" />
                </div>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">Створити</button>
                <button type="button" onClick={() => setShowCreate(false)} className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition">Скасувати</button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {tests.map((test) => (
              <div key={test.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:border-indigo-100 transition">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <ClipboardList size={20} className="text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{test.title}</h3>
                      <p className="text-gray-500 text-sm mt-0.5">{test.description}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${test.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {test.published ? 'Опубліковано' : 'Чернетка'}
                        </span>
                        <span className="text-xs text-gray-400">{test._count?.questions || 0} питань</span>
                        <span className="text-xs text-gray-400">{test._count?.attempts || 0} спроб</span>
                        {test.timeLimit > 0 && <span className="text-xs text-gray-400">{test.timeLimit} хв</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => selectTest(test)} className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded" title="Редагувати питання">
                      <Edit2 size={16} />
                    </button>
                    {test.published ? (
                      <button onClick={() => publishTest(test, false)} className="p-1.5 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded" title="Зняти з публікації">
                        <X size={16} />
                      </button>
                    ) : (
                      <button onClick={() => publishTest(test, true)} className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded" title="Опублікувати">
                        <Check size={16} />
                      </button>
                    )}
                    <button onClick={() => handleDelete(test.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                  </div>
                </div>
              </div>
            ))}
            {tests.length === 0 && !showCreate && (
              <p className="text-center py-12 text-gray-400">Немає тестів. Створіть перший тест!</p>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between mb-6">
            <div>
              <button onClick={() => setSelectedTest(null)} className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-1 mb-2">
                <ArrowLeft size={16} /> Назад до тестів
              </button>
              <h1 className="text-2xl font-bold text-gray-900">{selectedTest.title}</h1>
              <p className="text-gray-500 text-sm">{selectedTest.description}</p>
            </div>
            <button onClick={addQuestion}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition text-sm">
              <Plus size={18} /> Додати питання
            </button>
          </div>

          <ErrorMessage message={error} onClose={() => setError('')} />

          <div className="space-y-4">
            {questions.map((q, idx) => (
              <div key={idx} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                {editQuestionIdx === idx ? (
                  <div className="bg-yellow-50 border-l-4 border-l-yellow-400 p-5">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Текст питання</label>
                        <textarea value={editQ.text} onChange={(e) => setEditQ({...editQ, text: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" rows={2} />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Тип</label>
                          <select value={editQ.type} onChange={(e) => setEditQ({...editQ, type: e.target.value, options: editQ.type !== e.target.value ? [{ text: '', isCorrect: false }, { text: '', isCorrect: false }] : editQ.options })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                            {QUESTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Бали</label>
                          <input type="number" value={editQ.points} onChange={(e) => setEditQ({...editQ, points: parseInt(e.target.value) || 1})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" min="1" />
                        </div>
                      </div>
                      {editQ.type !== 'TEXT' && (
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Варіанти відповідей</label>
                          <div className="space-y-2">
                            {editQ.options.map((opt, oi) => (
                              <div key={oi} className="flex items-center gap-2">
                                <input type={editQ.type === 'SINGLE_CHOICE' || editQ.type === 'TRUE_FALSE' ? 'radio' : 'checkbox'}
                                  name="correct" checked={opt.isCorrect}
                                  onChange={() => setOptionCorrect(oi)}
                                  className="text-indigo-600 focus:ring-indigo-500" />
                                <input type="text" value={opt.text} onChange={(e) => setOptionText(oi, e.target.value)}
                                  placeholder={`Варіант ${oi + 1}`}
                                  className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm" />
                                <button onClick={() => removeOption(oi)} className="text-red-400 hover:text-red-600 p-1"><X size={14} /></button>
                              </div>
                            ))}
                          </div>
                          <button onClick={addOption} className="mt-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium">+ Додати варіант</button>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button onClick={saveQuestion} className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-1"><Check size={16} /> Зберегти</button>
                      <button onClick={() => setEditQuestionIdx(-1)} className="border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg text-sm">Скасувати</button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-gray-400">#{idx + 1}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                            {QUESTION_TYPES.find(t => t.value === q.type)?.label || q.type}
                          </span>
                          <span className="text-xs text-gray-400">{q.points || 1} бал</span>
                        </div>
                        <p className="text-gray-900 text-sm">{q.text}</p>
                        {q.options?.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {q.options.map((opt, oi) => (
                              <div key={oi} className="flex items-center gap-2 text-sm">
                                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${opt.isCorrect ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                  {opt.isCorrect ? '✓' : ''}
                                </span>
                                <span className={opt.isCorrect ? 'text-green-700 font-medium' : 'text-gray-600'}>{opt.text}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 ml-3">
                        <button onClick={() => editQuestion(idx)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"><Edit2 size={14} /></button>
                        <button onClick={() => deleteQuestion(idx)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {questions.length === 0 && (
              <p className="text-center py-12 text-gray-400">Немає питань. Додайте перше питання!</p>
            )}
          </div>

          {questions.length > 0 && editQuestionIdx === -1 && (
            <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-sm text-gray-500">
                Всього питань: <strong>{questions.length}</strong> |
                Макс. балів: <strong>{questions.reduce((s, q) => s + (q.points || 1), 0)}</strong>
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}