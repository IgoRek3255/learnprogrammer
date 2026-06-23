import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import api from '../services/api.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import { Play, Lightbulb, Bot, CheckCircle, XCircle, Clock, Send, Code2, Sparkles } from 'lucide-react';

export default function ExercisePage() {
  const { exerciseId } = useParams();
  const [exercise, setExercise] = useState(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [hint, setHint] = useState('');
  const [hintLoading, setHintLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiProvider, setAiProvider] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [showAi, setShowAi] = useState(false);
  const [aiExplainLoading, setAiExplainLoading] = useState(false);
  const [aiExplain, setAiExplain] = useState('');
  const [aiExplainProvider, setAiExplainProvider] = useState('');

  useEffect(() => {
    api.get(`/exercises/${exerciseId}`)
      .then((res) => {
        setExercise(res.data);
        setCode(res.data.templateCode || '');
      })
      .catch(() => setError('Не вдалося завантажити вправу'))
      .finally(() => setLoading(false));
  }, [exerciseId]);

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    setResult(null);
    setAiExplain('');
    setAiExplainProvider('');
    try {
      const res = await api.post(`/exercises/${exerciseId}/submit`, { code });
      setResult(res.data);
    } catch {
      setError('Помилка при перевірці рішення');
    } finally {
      setSubmitting(false);
    }
  }, [code, exerciseId]);

  const handleAiExplain = useCallback(async () => {
    if (!result || result.status === 'PASSED') return;
    setAiExplainLoading(true);
    setAiExplain('');
    try {
      const res = await api.post('/ai/ask', {
        prompt: `Я зробив помилку у вправі "${exercise.title}". Ось мій код:\n\n${code}\n\nОсь результат перевірки: ${result.feedback}. Поясни, що я зробив не так, і як це виправити. Не давай готового рішення — тільки підказки.`,
        exerciseId,
      });
      setAiExplain(res.data.response);
      setAiExplainProvider(res.data.provider || '');
    } catch {
      setAiExplain('Не вдалося отримати пояснення. Спробуйте ще раз.');
      setAiExplainProvider('');
    } finally {
      setAiExplainLoading(false);
    }
  }, [result, code, exercise, exerciseId]);

  const handleHint = useCallback(async () => {
    setHintLoading(true);
    try {
      const res = await api.get(`/ai/hints/${exerciseId}`);
      setHint(res.data.hint);
      setShowHint(true);
    } catch {
      setHint('Підказка недоступна');
      setShowHint(true);
    } finally {
      setHintLoading(false);
    }
  }, [exerciseId]);

  const handleAiAsk = useCallback(async () => {
    if (!aiQuestion.trim()) return;
    setAiLoading(true);
    try {
      const res = await api.post('/ai/ask', {
        prompt: aiQuestion,
        exerciseId,
      });
      setAiResponse(res.data.response);
      setAiProvider(res.data.provider || '');
      setShowAi(true);
    } catch {
      setAiResponse('Не вдалося отримати відповідь');
      setAiProvider('');
      setShowAi(true);
    } finally {
      setAiLoading(false);
    }
  }, [aiQuestion, exerciseId]);

  if (loading) return <LoadingSpinner text="Завантаження вправи..." />;
  if (!exercise) return <div className="text-center py-16 text-gray-500">Вправу не знайдено</div>;

  const statusColors = {
    PASSED: 'bg-green-100 border-green-200 text-green-700',
    FAILED: 'bg-red-100 border-red-200 text-red-700',
    PENDING: 'bg-yellow-100 border-yellow-200 text-yellow-700',
    ERROR: 'bg-red-100 border-red-200 text-red-700',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-4">
        <Link to={`/courses/${exercise.topicId}`} className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
          ← Назад до теми
        </Link>
      </div>

      <div className="grid lg:grid-cols-[1fr_400px] gap-6">
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h1 className="text-xl font-bold text-gray-900">{exercise.title}</h1>
                <p className="text-gray-500 text-sm mt-1">{exercise.description}</p>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${
                exercise.difficulty === 'BEGINNER' ? 'bg-green-100 text-green-700' :
                exercise.difficulty === 'INTERMEDIATE' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {exercise.difficulty === 'BEGINNER' ? 'Початковий' :
                 exercise.difficulty === 'INTERMEDIATE' ? 'Середній' : 'Складний'}
              </span>
            </div>
            {exercise.progress?.completed && (
              <div className="flex items-center gap-1.5 text-green-600 text-sm font-medium mt-2">
                <CheckCircle size={16} />
                Виконано (оцінка: {exercise.progress.score}%)
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-gray-900 text-gray-300 px-4 py-2 text-sm font-mono flex items-center justify-between">
              <span>Редактор коду</span>
              <span className="text-gray-500">JavaScript</span>
            </div>
            <Editor
              height="400px"
              defaultLanguage="javascript"
              theme="vs-dark"
              value={code}
              onChange={(val) => setCode(val || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
              }}
            />
          </div>

          <div className="flex gap-3 flex-wrap">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition text-sm"
            >
              {submitting ? 'Перевірка...' : <><Play size={18} /> Запустити</>}
            </button>
            <button
              onClick={handleHint}
              disabled={hintLoading}
              className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 transition text-sm"
            >
              <Lightbulb size={18} className="text-yellow-500" />
              {hintLoading ? 'Завантаження...' : 'Підказка'}
            </button>
          </div>

          {result && (
            <div className={`rounded-xl border p-4 ${statusColors[result.status] || 'bg-gray-50 border-gray-200'}`}>
              <div className="flex items-center gap-2 font-medium mb-1">
                {result.status === 'PASSED' ? <CheckCircle size={20} /> :
                 result.status === 'FAILED' ? <XCircle size={20} /> :
                 <Clock size={20} />}
                <span>
                  {result.status === 'PASSED' ? 'Правильно! 🎉' :
                   result.status === 'FAILED' ? 'Є помилки' :
                   result.status === 'PENDING' ? 'Перевіряється...' : 'Помилка'}
                </span>
                {result.score !== null && (
                  <span className={`ml-auto font-bold text-lg ${result.score >= 80 ? 'text-green-600' : result.score >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {result.score}%
                  </span>
                )}
              </div>
              {result.feedback && (
                <p className="text-sm mt-1 opacity-80">{result.feedback}</p>
              )}

              {result.status !== 'PASSED' && (
                <div className="mt-3">
                  <button
                    onClick={handleAiExplain}
                    disabled={aiExplainLoading}
                    className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium px-3 py-1.5 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition"
                  >
                    {aiExplainLoading ? (
                      'AI аналізує...'
                    ) : (
                      <><Sparkles size={16} /> Поясни помилку з AI</>
                    )}
                  </button>
                </div>
              )}

              {aiExplain && (
                <div className="mt-3 bg-indigo-50 border border-indigo-200 rounded-lg p-4 text-sm text-gray-700">
                  <div className="flex items-center gap-2 font-medium text-indigo-700 mb-2">
                    <Bot size={16} />
                    AI пояснення
                    {aiExplainProvider && (
                      <span className="ml-auto rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-indigo-600">
                        {aiExplainProvider === 'gemini' ? 'Gemini' : 'Локальна відповідь'}
                      </span>
                    )}
                  </div>
                  <p className="whitespace-pre-wrap leading-relaxed">{aiExplain}</p>
                </div>
              )}
            </div>
          )}

          <ErrorMessage message={error} onClose={() => setError('')} />
        </div>

        <div className="space-y-4">
          {showHint && hint && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-center gap-2 text-yellow-700 font-medium mb-2">
                <Lightbulb size={18} />
                Підказка
              </div>
              <p className="text-yellow-800 text-sm">{hint}</p>
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-gray-900 font-medium">
                <Bot size={18} className="text-indigo-600" />
                AI-помічник
              </div>
              {showAi && (
                <button onClick={() => setShowAi(false)} className="text-sm text-gray-400 hover:text-gray-600">
                  Сховати
                </button>
              )}
            </div>

            {showAi && aiResponse && (
              <div className="bg-indigo-50 rounded-lg p-3 mb-4 text-sm text-gray-700 whitespace-pre-wrap">
                {aiProvider && (
                  <div className="mb-2 flex justify-end">
                    <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-indigo-600">
                      {aiProvider === 'gemini' ? 'Gemini' : 'Локальна відповідь'}
                    </span>
                  </div>
                )}
                {aiResponse}
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                placeholder="Запитай про цю вправу..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                onKeyDown={(e) => e.key === 'Enter' && handleAiAsk()}
              />
              <button
                onClick={handleAiAsk}
                disabled={aiLoading || !aiQuestion.trim()}
                className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
              >
                <Send size={18} />
              </button>
            </div>
            {aiLoading && <p className="text-xs text-gray-400 mt-2">AI думає...</p>}
          </div>

          {exercise.hints?.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Code2 size={16} />
                Покрокові підказки
              </h3>
              <div className="space-y-2">
                {exercise.hints.map((h, i) => (
                  <details key={h.id} className="group">
                    <summary className="text-sm text-indigo-600 cursor-pointer hover:text-indigo-700 font-medium">
                      Підказка {i + 1}
                    </summary>
                    <p className="text-sm text-gray-600 mt-1 pl-4">{h.content}</p>
                  </details>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
