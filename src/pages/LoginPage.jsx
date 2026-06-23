import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/authContext.jsx';
import { Code2, Eye, EyeOff } from 'lucide-react';
import ErrorMessage from '../components/ErrorMessage.jsx';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/courses');
    } catch (err) {
      setError(err.response?.data?.error || 'Помилка входу');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Code2 size={48} className="mx-auto text-indigo-600" />
          <h1 className="text-3xl font-bold text-gray-900 mt-4">LearnProgrammer</h1>
          <p className="text-gray-500 mt-1">Інтерактивний тренажер програмування</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Вхід</h2>
          <ErrorMessage message={error} onClose={() => setError('')} />

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-sm"
                placeholder="your@email.com"
                required
              />
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-sm"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Вхід...' : 'Увійти'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Немає акаунта?{' '}
            <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-medium">
              Зареєструватись
            </Link>
          </p>

          <div className="mt-6 p-3 bg-gray-50 rounded-lg text-xs text-gray-500">
            <p className="font-medium mb-1">Тестові обліковки:</p>
            <p>admin@learnprog.com / admin123</p>
            <p>teacher@learnprog.com / teacher123</p>
            <p>student@learnprog.com / student123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
