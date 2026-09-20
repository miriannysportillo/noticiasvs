import { Clock, ArrowRight } from 'lucide-react';
import type { Article } from '@/lib/supabase';
import { formatRelative } from '@/lib/utils';

type HeroSectionProps = {
  featured: Article[];
  onArticleClick: (article: Article) => void;
};

export default function HeroSection({ featured, onArticleClick }: HeroSectionProps) {
  if (featured.length === 0) return null;

  const [main, ...rest] = featured;
  const sideArticles = rest.slice(0, 3);

  return (
    <section className="bg-stone-50 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main featured */}
          <button
            onClick={() => onArticleClick(main)}
            className="lg:col-span-2 group relative overflow-hidden rounded-xl bg-stone-900 aspect-[16/10] lg:aspect-[16/9] text-left"
          >
            <img
              src={main.image_url}
              alt={main.title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
              <span className="inline-block px-3 py-1 bg-emerald-600 text-white text-xs font-semibold uppercase tracking-wider rounded-full mb-3">
                {main.category}
              </span>
              <h1 className="font-serif text-2xl lg:text-4xl font-bold text-white leading-tight mb-2 group-hover:text-emerald-300 transition-colors">
                {main.title}
              </h1>
              <p className="text-stone-200 text-sm lg:text-base line-clamp-2 mb-3 max-w-2xl">
                {main.excerpt}
              </p>
              <div className="flex items-center gap-3 text-stone-300 text-xs">
                <span className="font-medium">{main.author}</span>
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {formatRelative(main.published_at)}
                </span>
              </div>
            </div>
          </button>

          {/* Side articles */}
          <div className="flex flex-col gap-4">
            {sideArticles.map((article) => (
              <button
                key={article.id}
                onClick={() => onArticleClick(article)}
                className="group flex gap-3 items-start text-left bg-white rounded-lg p-3 hover:shadow-md transition-shadow border border-stone-200"
              >
                <div className="relative w-24 h-24 flex-shrink-0 overflow-hidden rounded-lg">
                  <img
                    src={article.image_url}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
                    {article.category}
                  </span>
                  <h3 className="font-serif text-sm font-bold text-stone-900 leading-snug mt-1 group-hover:text-emerald-700 transition-colors line-clamp-3">
                    {article.title}
                  </h3>
                  <span className="text-xs text-stone-500 mt-1 flex items-center gap-1">
                    <Clock size={11} />
                    {formatRelative(article.published_at)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
