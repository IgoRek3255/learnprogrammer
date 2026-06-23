import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-8xl font-bold text-indigo-600 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Сторінку не знайдено</h2>
        <p className="text-gray-500 mb-8">Сторінка, яку ви шукаєте, не існує або була видалена.</p>
        <Link to="/" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition">
          <Home size={20} />
          На головну
        </Link>
      </div>
    </div>
  );
}
