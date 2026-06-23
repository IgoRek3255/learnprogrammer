import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import { ClipboardList, Clock, CheckCircle, XCircle, AlertTriangle, ArrowLeft, Send } from 'lucide-react';

export default function TestPage() {
  const { testId } = useParams();
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [result, setResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    api.get(`/tests/${testId}`)
      .then((res) => {
        setTest(res.data);
        if (res.data.attempt?.status === 'IN_PROGRESS') {
          setAttempt(res.data.attempt);
          const saved = {};
          for (const a of res.data.attempt.answers || []) {
            saved[a.questionId] = a.value.includes(',') ? a.value.split(',') : a.value;
          }
          setAnswers(saved);
          if (res.data.timeLimit > 0) {
            const elapsed = (Date.now() - new Date(res.data.attempt.startedAt).getTime()) / 60000;
            setTimeLeft(Math.max(0, res.data.timeLimit - elapsed));
          }
        } else if (res.data.attempt?.status === 'COMPLETED') {
          setCompleted(true);
          setResult(res.data.attempt);
        }
      })
      .catch(() => setError('Failed to load test'))
      .finally(() => setLoading(false));
  }, [testId]);

  useEffect(() => {
    if (timeLeft !== null && timeLeft > 0 && !completed) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleComplete();
            return 0;
          }
          return prev - 1 / 60;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [timeLeft, completed]);

  const startAttempt = useCallback(async () => {
    try {
      const res = await api.post(`/tests/${testId}/start`);
      setAttempt(res.data);
      if (test.timeLimit > 0) setTimeLeft(test.timeLimit);
    } catch {
      setError('Failed to start test');
    }
  }, [testId, test]);

  const handleAnswer = useCallback(async (questionId, value) => {
    if (!attempt) return;
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);

    try {
      await api.post(`/tests/attempts/${attempt.id}/answer`, { questionId, value });
    } catch {
      // silently save
    }
  }, [attempt, answers]);

  const handleComplete = useCallback(async () => {
    if (!attempt || submitting) return;
    setSubmitting(true);
    clearInterval(timerRef.current);
    try {
      const res = await api.post(`/tests/attempts/${attempt.id}/complete`);
      setResult(res.data);
      setCompleted(true);
      setAttempt(null);
    } catch {
      setError('Failed to complete test');
    } finally {
      setSubmitting(false);
    }
  }, [attempt, submitting]);

  function formatTime(minutes) {
    if (minutes === null || minutes === undefined) return '';
    const m = Math.floor(minutes);
    const s = Math.round((minutes - m) * 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  function getOptionLabel(idx) {
    return String.fromCharCode(65 + idx);
  }

  const questionTypeLabels = {
    SINGLE_CHOICE: 'Один вибір',
    MULTIPLE_CHOICE: 'Множинний вибір',
    TRUE_FALSE: 'Правда/Неправда',
    TEXT: 'Текст',
  };

  if (loading) return <LoadingSpinner text="Завантаження тесту..." />;
  if (!test) return <div className="text-center py-16 text-gray-500">Тест не знайдено</div>;

  if (completed && result) {
    const passed = result.score >= result.test.passingScore;
    const total = result.maxScore;
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Link to={`/courses/${test.courseId}`} className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-1 mb-6">
          <ArrowLeft size={16} /> Назад до курсу
        </Link>

        <div className={`rounded-2xl p-8 text-center ${passed ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          {passed ? (
            <CheckCircle size={48} className="mx-auto text-green-500 mb-3" />
          ) : (
            <XCircle size={48} className="mx-auto text-red-500 mb-3" />
          )}
          <h2 className={`text-2xl font-bold ${passed ? 'text-green-800' : 'text-red-800'}`}>
            {passed ? 'Тест пройдено!' : 'Тест не пройдено'}
          </h2>
          <p className={`text-lg mt-2 ${passed ? 'text-green-600' : 'text-red-600'}`}>
            Ваш результат: {result.score} / {total} балів ({Math.round((result.score / total) * 100)}%)
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Прохідний бал: {result.test.passingScore}%
          </p>
        </div>

        {result.answers?.length > 0 && (
          <div className="mt-8 space-y-4">
            <h3 className="font-semibold text-gray-900">Деталі:</h3>
            {result.test.questions?.map((q, qi) => {
              const answer = result.answers.find(a => a.questionId === q.id);
              const isCorrect = answer?.isCorrect;
              return (
                <div key={q.id} className={`rounded-xl border p-4 ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <div className="flex items-start gap-2">
                    {isCorrect ? <CheckCircle size={18} className="text-green-500 mt-0.5 flex-shrink-0" /> : <XCircle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />}
                    <div>
                      <p className="text-sm font-medium text-gray-900">{q.text}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {isCorrect ? 'Правильно' : 'Неправильно'} ({q.points} бал)
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Link to={`/courses/${test.courseId}`} className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-1 mb-6">
          <ArrowLeft size={16} /> Назад до курсу
        </Link>

        <ErrorMessage message={error} onClose={() => setError('')} />

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
          <ClipboardList size={48} className="mx-auto text-purple-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{test.title}</h1>
          <p className="text-gray-500 mb-6">{test.description}</p>

          <div className="flex items-center justify-center gap-6 mb-8 text-sm">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{test.questions?.length || 0}</p>
              <p className="text-gray-500">питань</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{test.questions?.reduce((s, q) => s + q.points, 0) || 0}</p>
              <p className="text-gray-500">макс. балів</p>
            </div>
            {test.timeLimit > 0 && (
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{test.timeLimit}</p>
                <p className="text-gray-500">хвилин</p>
              </div>
            )}
          </div>

          <button onClick={startAttempt}
            className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-indigo-700 transition text-lg">
            Розпочати тест
          </button>
        </div>
      </div>
    );
  }

  const selectedAnswered = Object.keys(answers).length;
  const totalQuestions = test.questions?.length || 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <ErrorMessage message={error} onClose={() => setError('')} />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{test.title}</h1>
        </div>
        <div className="flex items-center gap-4">
          {test.timeLimit > 0 && (
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${timeLeft < 5 ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-gray-100 text-gray-700'}`}>
              <Clock size={16} />
              {formatTime(timeLeft)}
            </div>
          )}
          <span className="text-sm text-gray-500">
            {selectedAnswered}/{totalQuestions} відповідей
          </span>
        </div>
      </div>

      <div className="space-y-6 mb-8">
        {test.questions?.map((q, idx) => (
          <div key={q.id} className={`bg-white rounded-xl border p-5 ${answers[q.id] !== undefined && answers[q.id] !== '' ? 'border-indigo-200 bg-indigo-50/30' : 'border-gray-100'}`}>
            <div className="flex items-start gap-2 mb-3">
              <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded mt-0.5">#{idx + 1}</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{q.text}</p>
                <span className="text-xs text-gray-400">{questionTypeLabels[q.type]} · {q.points} бал</span>
              </div>
            </div>

            {q.type === 'TRUE_FALSE' && (
              <div className="flex gap-3 ml-6">
                {['true', 'false'].map(val => (
                  <button key={val}
                    onClick={() => handleAnswer(q.id, val === 'true' ? 'true' : 'false')}
                    className={`px-6 py-2 rounded-lg text-sm font-medium border transition ${answers[q.id] === (val === 'true' ? 'true' : 'false') ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-300'}`}>
                    {val === 'true' ? 'Правда' : 'Неправда'}
                  </button>
                ))}
              </div>
            )}

            {(q.type === 'SINGLE_CHOICE') && (
              <div className="space-y-2 ml-6">
                {q.options?.map((opt, oi) => (
                  <label key={opt.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${answers[q.id] === opt.id ? 'bg-indigo-50 border-indigo-300' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" name={`q-${q.id}`} checked={answers[q.id] === opt.id}
                      onChange={() => handleAnswer(q.id, opt.id)} className="text-indigo-600 focus:ring-indigo-500" />
                    <span className="text-sm text-gray-700">
                      <span className="font-medium text-gray-400 mr-2">{getOptionLabel(oi)}.</span>
                      {opt.text}
                    </span>
                  </label>
                ))}
              </div>
            )}

            {q.type === 'MULTIPLE_CHOICE' && (
              <div className="space-y-2 ml-6">
                {q.options?.map((opt, oi) => {
                  const selected = Array.isArray(answers[q.id]) ? answers[q.id] : [];
                  const checked = selected.includes(opt.id);
                  return (
                    <label key={opt.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${checked ? 'bg-indigo-50 border-indigo-300' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
                      <input type="checkbox" checked={checked}
                        onChange={() => {
                          const arr = Array.isArray(answers[q.id]) ? [...answers[q.id]] : [];
                          const idx2 = arr.indexOf(opt.id);
                          idx2 >= 0 ? arr.splice(idx2, 1) : arr.push(opt.id);
                          handleAnswer(q.id, arr);
                        }}
                        className="text-indigo-600 focus:ring-indigo-500 rounded" />
                      <span className="text-sm text-gray-700">
                        <span className="font-medium text-gray-400 mr-2">{getOptionLabel(oi)}.</span>
                        {opt.text}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="sticky bottom-6 bg-white rounded-xl border border-gray-200 shadow-lg p-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Відповідей: {selectedAnswered}/{totalQuestions}
        </p>
        <button onClick={handleComplete} disabled={submitting}
          className="flex items-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition">
          {submitting ? 'Завершення...' : <><Send size={18} /> Завершити тест</>}
        </button>
      </div>
    </div>
  );
}