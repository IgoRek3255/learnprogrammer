import { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[50vh] flex items-center justify-center px-4">
          <div className="text-center">
            <AlertTriangle size={48} className="mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Щось пішло не так</h2>
            <p className="text-gray-500 mb-6">Сталася неочікувана помилка. Спробуйте оновити сторінку.</p>
            <button
              onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition"
            >
              <RefreshCw size={18} />
              Оновити
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
