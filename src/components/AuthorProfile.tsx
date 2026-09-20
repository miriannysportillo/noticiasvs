import { ArrowLeft, Globe, Instagram, Linkedin, Twitter, Youtube } from 'lucide-react';
import type { Article } from '@/lib/supabase';
import { getAuthorProfile, type AuthorProfile as AuthorProfileData } from '@/lib/authors';

type AuthorProfileProps = {
  authorName: string;
  articles: Article[];
  onBack: () => void;
  onArticleClick: (article: Article) => void;
  profile?: AuthorProfileData;
};

export default function AuthorProfile({ authorName, articles, onBack, onArticleClick, profile: loadedProfile }: AuthorProfileProps) {
  const profile = loadedProfile ?? getAuthorProfile(authorName);

  const socialLinks = profile?.socialLinks ?? [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-stone-600 hover:text-emerald-600 transition-colors mb-6"
      >
        <ArrowLeft size={18} />
        Volver a noticias
      </button>

      <div className="rounded-2xl border border-stone-200 bg-stone-50 p-6 md:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center text-2xl font-bold shadow-lg">
            {profile?.avatar ?? authorName.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1">
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-700 font-semibold">Autor</p>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-stone-900 mt-1">{authorName}</h1>
            <p className="text-sm text-stone-600 mt-1">{profile?.role ?? 'Columnista'}</p>
          </div>
        </div>

        <p className="mt-6 text-base leading-relaxed text-stone-700">{profile?.bio ?? 'Perfil del autor disponible próximamente.'}</p>

        {socialLinks.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {socialLinks.map((link) => {
              const icon = (() => {
                switch (link.platform) {
                  case 'x': return <Twitter size={16} />;
                  case 'linkedin': return <Linkedin size={16} />;
                  case 'instagram': return <Instagram size={16} />;
                  case 'youtube': return <Youtube size={16} />;
                  default: return <Globe size={16} />;
                }
              })();

              return (
                <a
                  key={link.label}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:border-emerald-500 hover:text-emerald-700 transition-colors"
                >
                  {icon}
                  {link.label}
                </a>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-10">
        <h2 className="font-serif text-2xl font-bold text-stone-900 mb-5">Artículos de {authorName}</h2>

        {articles.length === 0 ? (
          <div className="rounded-xl border border-dashed border-stone-200 bg-white p-6 text-sm text-stone-500">
            Este autor aún no tiene artículos publicados.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {articles.map((article) => (
              <button
                key={article.id}
                onClick={() => onArticleClick(article)}
                className="group flex flex-col text-left overflow-hidden rounded-xl border border-stone-200 bg-white hover:shadow-lg transition-all duration-300"
              >
                <div className="aspect-[16/10] overflow-hidden">
                  <img src={article.image_url} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="p-4">
                  <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">{article.category}</span>
                  <h3 className="mt-2 font-serif text-lg font-bold text-stone-900 leading-snug group-hover:text-emerald-700 transition-colors">{article.title}</h3>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
