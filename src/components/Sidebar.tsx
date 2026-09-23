import { TrendingUp, Mail, Clock } from 'lucide-react';
import type { Article } from '@/lib/supabase';
import { formatRelative } from '@/lib/utils';
import NewsletterSignup from '@/components/NewsletterSignup';

type SidebarProps = {
  trending: Article[];
  onArticleClick: (article: Article) => void;
};

export default function Sidebar({ trending, onArticleClick }: SidebarProps) {
  return (
    <aside className="space-y-6">
      {/* Trending */}
      <div className="bg-white rounded-xl border border-stone-200 p-5">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-stone-200">
          <TrendingUp size={20} className="text-emerald-600" />
          <h3 className="font-serif text-lg font-bold text-stone-900">Lo más leído</h3>
        </div>
        <div className="space-y-4">
          {trending.map((article, idx) => (
            <button
              key={article.id}
              onClick={() => onArticleClick(article)}
              className="group flex gap-3 items-start w-full text-left"
            >
              <span className="font-serif text-2xl font-bold text-emerald-600/30 group-hover:text-emerald-600 transition-colors leading-none flex-shrink-0 w-7">
                {idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-stone-900 leading-snug group-hover:text-emerald-700 transition-colors line-clamp-3">
                  {article.title}
                </h4>
                <span className="text-xs text-stone-500 mt-1 flex items-center gap-1">
                  <Clock size={11} />
                  {formatRelative(article.published_at)}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Newsletter */}
      <div className="bg-gradient-to-br from-stone-900 to-stone-800 rounded-xl p-6 text-white">
        <div className="flex items-center gap-2 mb-3">
          <Mail size={20} className="text-emerald-400" />
          <h3 className="font-serif text-lg font-bold">El Boletín del Sur</h3>
        </div>
        <p className="text-sm text-stone-300 mb-4 leading-relaxed">
          Recibe cada mañana un resumen de las noticias más importantes, directamente en tu correo.
        </p>
        <NewsletterSignup variant="sidebar" />
        <p className="text-xs text-stone-400 mt-3 text-center">
          Sin spam. Cancela cuando quieras.
        </p>
      </div>
    </aside>
  );
}
