import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../store/authContext.jsx';
import api from '../services/api.js';
import { Code2, Brain, Zap, BarChart3, Users, Shield, ArrowRight, BookOpen, Sparkles, ChevronRight } from 'lucide-react';

export default function HomePage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    if (user) {
      api.get('/courses').then(r => setCourses(r.data)).catch(() => {});
    }
  }, [user]);

  const features = [
    { icon: Code2, title: 'Інтерактивні вправи', desc: 'Пишіть код прямо в браузері з підсвіткою синтаксису та миттєвим зворотним зв\'язком' },
    { icon: Brain, title: 'AI-помічник', desc: 'Розумний помічник на основі GPT пояснить помилки, дасть підказки та відповість на запитання' },
    { icon: Zap, title: 'Автоматична перевірка', desc: 'Миттєва перевірка рішень з детальним аналізом помилок та рекомендаціями' },
    { icon: BarChart3, title: 'Відстеження прогресу', desc: 'Статистика виконаних вправ, оцінки та аналітика успішності навчання' },
    { icon: Users, title: 'Ролі користувачів', desc: 'Підтримка студентів, викладачів та адміністраторів з різними правами доступу' },
    { icon: Shield, title: 'Безпека та надійність', desc: 'JWT автентифікація, захищене зберігання даних та rate limiting' },
  ];

  const stats = [
    { value: '2', label: 'Курси' },
    { value: '3', label: 'Ролі' },
    { value: 'AI', label: 'Помічник' },
    { value: 'JS/Python', label: 'Мови' },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="max-w-7xl mx-auto px-4 py-28 sm:px-6 lg:px-8 text-center relative">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm text-indigo-200 mb-8">
            <Sparkles size={16} /> Нова версія з AI-помічником
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-tight">
            Вивчайте програмування<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-purple-200">з AI-помічником</span>
          </h1>
          <p className="text-xl text-indigo-200 mb-10 max-w-2xl mx-auto leading-relaxed">
            Інтерактивний тренажер з автоматичною перевіркою коду, 
            покроковими підказками та розумним AI-асистентом для ефективного навчання.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            {user ? (
              <>
                <Link to="/courses" className="bg-white text-indigo-700 px-8 py-3.5 rounded-xl font-semibold text-lg hover:bg-indigo-50 transition flex items-center gap-2 shadow-lg shadow-indigo-900/20">
                  Продовжити навчання <ArrowRight size={20} />
                </Link>
                <Link to="/ai-assistant" className="border-2 border-white/30 text-white px-8 py-3.5 rounded-xl font-semibold text-lg hover:bg-white/10 transition flex items-center gap-2">
                  <Brain size={20} /> AI помічник
                </Link>
              </>
            ) : (
              <>
                <Link to="/register" className="bg-white text-indigo-700 px-8 py-3.5 rounded-xl font-semibold text-lg hover:bg-indigo-50 transition shadow-lg shadow-indigo-900/20 flex items-center gap-2">
                  Почати навчання безкоштовно <ArrowRight size={20} />
                </Link>
                <Link to="/login" className="border-2 border-white/30 text-white px-8 py-3.5 rounded-xl font-semibold text-lg hover:bg-white/10 transition">
                  Увійти
                </Link>
              </>
            )}
          </div>
        </div>
        <div className="h-2 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400" />
      </section>

      {/* Stats bar */}
      <section className="border-b border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-8">
            {stats.map((s, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl font-bold text-indigo-600">{s.value}</p>
                <p className="text-sm text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Чому LearnProgrammer?</h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Сучасна платформа для вивчення програмування з використанням передових технологій
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <div key={i} className="group bg-white rounded-2xl p-7 shadow-sm border border-gray-100 hover:shadow-lg hover:border-indigo-100 transition-all duration-300">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-5 group-hover:bg-indigo-600 transition-colors">
                <f.icon size={24} className="text-indigo-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Available courses for logged-in users */}
      {user && courses.length > 0 && (
        <section className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Доступні курси</h2>
                <p className="text-gray-500 mt-1">Оберіть курс для початку навчання</p>
              </div>
              <Link to="/courses" className="text-indigo-600 hover:text-indigo-700 font-medium text-sm flex items-center gap-1">
                Всі курси <ChevronRight size={16} />
              </Link>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.slice(0, 3).map((course) => (
                <Link key={course.id} to={`/courses/${course.id}`}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-indigo-100 transition group overflow-hidden">
                  <div className="h-36 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <BookOpen size={40} className="text-white/60" />
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition">{course.title}</h3>
                    <p className="text-gray-500 text-sm mt-1.5 line-clamp-2">{course.description}</p>
                    <div className="flex items-center justify-between mt-4 text-sm">
                      <span className="text-gray-400 flex items-center gap-1"><BookOpen size={14} /> {course._count?.topics || 0} тем</span>
                      <span className="text-indigo-600 font-medium flex items-center gap-1">Почати <ChevronRight size={16} /></span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-14">Як це працює</h2>
        <div className="grid md:grid-cols-3 gap-10">
          {[
            { step: '1', title: 'Оберіть курс', desc: 'Перегляньте доступні курси та оберіть тему, яку хочете вивчати' },
            { step: '2', title: 'Виконайте вправу', desc: 'Напишіть код у вбудованому редакторі та запустіть перевірку' },
            { step: '3', title: 'Отримайте фідбек', desc: 'AI-помічник проаналізує помилки та допоможе виправити їх' },
          ].map((item, i) => (
            <div key={i} className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <span className="text-2xl font-bold text-indigo-600">{item.step}</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">Готові почати?</h2>
          <p className="text-indigo-200 mb-8 text-lg max-w-xl mx-auto">
            Приєднуйтесь до студентів, які вже вивчають програмування з AI-помічником
          </p>
          {!user ? (
            <Link to="/register" className="bg-white text-indigo-700 px-8 py-3.5 rounded-xl font-semibold text-lg hover:bg-indigo-50 transition inline-flex items-center gap-2 shadow-xl">
              Зареєструватись безкоштовно <ArrowRight size={20} />
            </Link>
          ) : (
            <Link to="/courses" className="bg-white text-indigo-700 px-8 py-3.5 rounded-xl font-semibold text-lg hover:bg-indigo-50 transition inline-flex items-center gap-2 shadow-xl">
              До курсів <ArrowRight size={20} />
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 text-center text-sm">
        <p>LearnProgrammer &copy; {new Date().getFullYear()} — Інтерактивний тренажер програмування</p>
      </footer>
    </div>
  );
}
