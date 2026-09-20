import { Clock } from 'lucide-react';
import type { Article } from '@/lib/supabase';
import { formatRelative } from '@/lib/utils';

type ArticleCardProps = {
  article: Article;
  onClick: (article: Article) => void;
  variant?: 'default' | 'compact';
};

export default function ArticleCard({ article, onClick, variant = 'default' }: ArticleCardProps) {
  if (variant === 'compact') {
    return (
      <button
        onClick={() => onClick(article)}
        className="group flex gap-3 items-start text-left w-full"
      >
        <div className="relative w-20 h-20 flex-shrink-0 overflow-hidden rounded-lg">
          <img
            src={article.image_url}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">
            {article.category}
          </span>
          <h4 className="font-serif text-sm font-bold text-stone-900 leading-snug mt-0.5 group-hover:text-emerald-700 transition-colors line-clamp-3">
            {article.title}
          </h4>
          <span className="text-xs text-stone-500 mt-1 flex items-center gap-1">
            <Clock size={11} />
            {formatRelative(article.published_at)}
          </span>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={() => onClick(article)}
      className="group flex flex-col text-left bg-white rounded-xl overflow-hidden border border-stone-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={article.image_url}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <span className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold text-emerald-700 uppercase tracking-wider rounded-full">
          {article.category}
        </span>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-serif text-lg font-bold text-stone-900 leading-tight group-hover:text-emerald-700 transition-colors line-clamp-3">
          {article.title}
        </h3>
        <p className="text-sm text-stone-600 mt-2 line-clamp-2 flex-1">
          {article.excerpt}
        </p>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-stone-100">
          <span className="text-xs font-medium text-stone-700">{article.author}</span>
          <span className="text-xs text-stone-500 flex items-center gap-1">
            <Clock size={12} />
            {formatRelative(article.published_at)}
          </span>
        </div>
      </div>
    </button>
  );
}
