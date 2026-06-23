import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../store/authContext.jsx';
import api from '../services/api.js';
import { ChevronRight, FileCode, CheckCircle, BookOpen, Settings } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

function renderContent(content) {
  const blocks = content.split(/(```[\s\S]*?```)/g);
  return blocks.map((block, i) => {
    if (block.startsWith('```')) {
      const lines = block.split('\n');
      const lang = lines[0].replace('```', '').trim();
      const code = lines.slice(1, -1).join('\n');
      return (
        <div key={i} className="bg-gray-900 rounded-lg overflow-hidden my-3">
          {lang && <div className="px-4 py-1.5 text-xs text-gray-400 bg-gray-800 border-b border-gray-700">{lang}</div>}
          <pre className="p-4 overflow-x-auto text-sm text-gray-100 font-mono leading-relaxed"><code>{code}</code></pre>
        </div>
      );
    }
    const lines = block.split('\n').filter(l => l.trim());
    return lines.map((line, j) => {
      if (line.startsWith('# ')) return <h1 key={`${i}-${j}`} className="text-2xl font-bold text-gray-900 mt-6 mb-3">{line.slice(2)}</h1>;
      if (line.startsWith('## ')) return <h2 key={`${i}-${j}`} className="text-xl font-semibold text-gray-900 mt-5 mb-2">{line.slice(3)}</h2>;
      if (line.startsWith('### ')) return <h3 key={`${i}-${j}`} className="text-lg font-semibold text-gray-900 mt-4 mb-2">{line.slice(4)}</h3>;
      if (line.startsWith('- ')) return <li key={`${i}-${j}`} className="text-gray-600 ml-4 list-disc">{line.slice(2)}</li>;
      if (line.startsWith('> ')) return <blockquote key={`${i}-${j}`} className="border-l-4 border-indigo-300 bg-indigo-50 px-4 py-2 my-2 text-gray-700 italic">{line.slice(2)}</blockquote>;
      const formatted = line.replace(/`([^`]+)`/g, '<code class="bg-gray-100 text-indigo-600 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>');
      return <p key={`${i}-${j}`} className="text-gray-600 mb-2" dangerouslySetInnerHTML={{ __html: formatted }} />;
    });
  });
}

export default function TopicDetailPage() {
  const { user } = useAuth();
  const { courseId, topicId } = useParams();
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/topics/${topicId}`)
      .then((res) => setTopic(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [topicId]);

  const renderedContent = useMemo(() => topic && renderContent(topic.content), [topic]);

  if (loading) return <LoadingSpinner text="Завантаження теми..." />;
  if (!topic) return <div className="text-center py-16 text-gray-500">Тему не знайдено</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link to={`/courses/${courseId}`} className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
          ← Назад до курсу
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
        <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
          <BookOpen size={16} />
          <span>Тема</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{topic.title}</h1>
        <div className="max-w-none text-gray-600 leading-relaxed">
          {renderedContent}
        </div>
      </div>

      <h2 className="text-xl font-semibold text-gray-900 mb-4">Вправи</h2>
      <div className="space-y-3">
        {topic.exercises?.map((ex, idx) => (
          <Link
            key={ex.id}
            to={`/exercises/${ex.id}`}
            className="block bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:border-indigo-100 hover:shadow-md transition"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${ex.progress?.completed ? 'bg-green-100' : 'bg-gray-100'}`}>
                  {ex.progress?.completed ? (
                    <CheckCircle size={18} className="text-green-600" />
                  ) : (
                    <span className="text-gray-500 font-medium text-sm">{idx + 1}</span>
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{ex.title}</h3>
                  <p className="text-gray-500 text-sm mt-0.5">{ex.description}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      ex.difficulty === 'BEGINNER' ? 'bg-green-100 text-green-700' :
                      ex.difficulty === 'INTERMEDIATE' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {ex.difficulty === 'BEGINNER' ? 'Початковий' :
                       ex.difficulty === 'INTERMEDIATE' ? 'Середній' : 'Складний'}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <FileCode size={12} />
                      {ex.type === 'CODE' ? 'Код' : 'Тест'}
                    </span>
                  </div>
                </div>
              </div>
              <ChevronRight size={20} className="text-gray-300 flex-shrink-0" />
            </div>
          </Link>
        ))}
        {(!topic.exercises || topic.exercises.length === 0) && (
          <p className="text-center py-8 text-gray-400">Вправи ще не додані</p>
        )}

        {(user?.role === 'ADMIN' || user?.role === 'TEACHER') && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <Link
              to={`/admin/exercises/${topicId}`}
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition text-sm"
            >
              <Settings size={18} />
              Управління вправами
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
