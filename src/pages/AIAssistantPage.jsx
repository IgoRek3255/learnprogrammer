import { useState, useRef, useEffect } from 'react';
import api from '../services/api.js';
import { Bot, Send, User, AlertCircle } from 'lucide-react';

export default function AIAssistantPage() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Привіт! Я AI-помічник з програмування. Став мені будь-яке запитання про код, алгоритми, мови програмування — я допоможу!' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/ai/ask', { prompt: input });
      const aiMsg = { role: 'assistant', content: res.data.response };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      setError('Не вдалося отримати відповідь');
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Вибачте, сталася помилка. Спробуйте ще раз.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Bot size={28} className="text-indigo-600" />
          AI-помічник
        </h1>
        <p className="text-gray-500 mt-1">Ставте запитання з програмування та отримуйте пояснення</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="h-[500px] overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot size={16} className="text-indigo-600" />
                </div>
              )}
              <div className={`max-w-[80%] rounded-xl px-4 py-3 text-sm ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-md'
                  : 'bg-gray-100 text-gray-800 rounded-bl-md'
              }`}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <User size={16} className="text-white" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <Bot size={16} className="text-indigo-600" />
              </div>
              <div className="bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-500">
                <span className="animate-pulse">Думаю...</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {error && (
          <div className="px-4 pb-2">
            <div className="flex items-center gap-1.5 text-red-600 text-xs">
              <AlertCircle size={14} />
              {error}
            </div>
          </div>
        )}

        <div className="border-t border-gray-100 p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Напишіть запитання..."
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition flex items-center gap-2"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
