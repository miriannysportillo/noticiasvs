import { ArrowLeft, Clock, Share2, Printer, Globe, Instagram, Linkedin, Youtube, Twitter } from 'lucide-react';
import type { Article } from '@/lib/supabase';
import { formatDate, formatRelative } from '@/lib/utils';
import { getAuthorProfile, type AuthorProfile } from '@/lib/authors';

type ArticleDetailProps = {
  article: Article;
  related: Article[];
  onBack: () => void;
  onArticleClick: (article: Article) => void;
  onAuthorClick: (authorName: string) => void;
  authorProfile?: AuthorProfile;
};

export default function ArticleDetail({ article, related, onBack, onArticleClick, onAuthorClick, authorProfile: loadedProfile }: ArticleDetailProps) {
  const authorProfile = loadedProfile ?? getAuthorProfile(article.author);
  const socialIcon = (platform: string) => {
    switch (platform) {
      case 'x':
        return <Twitter size={16} />;
      case 'linkedin':
        return <Linkedin size={16} />;
      case 'instagram':
        return <Instagram size={16} />;
      case 'youtube':
        return <Youtube size={16} />;
      default:
        return <Globe size={16} />;
    }
  };

  return (
    <article className="max-w-3xl mx-auto px-4 py-8">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-stone-600 hover:text-emerald-600 transition-colors mb-6"
      >
        <ArrowLeft size={18} />
        Volver a noticias
      </button>

      <span className="inline-block px-3 py-1 bg-emerald-600 text-white text-xs font-semibold uppercase tracking-wider rounded-full mb-4">
        {article.category}
      </span>

      <h1 className="font-serif text-3xl lg:text-4xl font-bold text-stone-900 leading-tight mb-4">
        {article.title}
      </h1>

      <p className="text-lg text-stone-600 leading-relaxed mb-6">
        {article.excerpt}
      </p>

      <div className="flex items-center justify-between flex-wrap gap-4 pb-6 mb-6 border-b border-stone-200">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onAuthorClick(article.author)}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white font-bold text-sm hover:scale-105 transition-transform"
            aria-label={`Ver perfil de ${article.author}`}
          >
            {article.author.charAt(0)}
          </button>
          <div>
            <button
              type="button"
              onClick={() => onAuthorClick(article.author)}
              className="text-sm font-semibold text-stone-900 hover:text-emerald-700 transition-colors"
            >
              {article.author}
            </button>
            <div className="text-xs text-stone-500 flex items-center gap-2">
              <span>{formatDate(article.published_at)}</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Clock size={11} />
                {formatRelative(article.published_at)}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 text-stone-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" aria-label="Compartir">
            <Share2 size={18} />
          </button>
          <button className="p-2 text-stone-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" aria-label="Imprimir">
            <Printer size={18} />
          </button>
        </div>
      </div>

      <div className="rounded-xl overflow-hidden mb-8 aspect-[16/9]">
        <img
          src={article.image_url}
          alt={article.title}
          className="w-full h-full object-cover"
        />
      </div>

      <div
        className="prose prose-lg max-w-none text-stone-800 leading-relaxed space-y-4
                   [&>p]:text-base [&>p]:leading-relaxed [&>p]:text-stone-700"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />

      {authorProfile && (
        <aside className="mt-12 rounded-2xl border border-stone-200 bg-stone-50 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center text-lg font-bold">
              {authorProfile.avatar}
            </div>
            <div className="flex-1">
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-700 font-semibold">Autor</p>
              <h3 className="font-serif text-2xl font-bold text-stone-900">{authorProfile.name}</h3>
              <p className="text-sm text-stone-600">{authorProfile.role}</p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-stone-700">{authorProfile.bio}</p>
          {authorProfile.socialLinks.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {authorProfile.socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:border-emerald-500 hover:text-emerald-700 transition-colors"
                >
                  {socialIcon(link.platform)}
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </aside>
      )}

      {related.length > 0 && (
        <div className="mt-12 pt-8 border-t border-stone-200">
          <h3 className="font-serif text-xl font-bold text-stone-900 mb-5">Relacionados</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {related.map((rel) => (
              <button
                key={rel.id}
                onClick={() => onArticleClick(rel)}
                className="group flex flex-col text-left"
              >
                <div className="relative aspect-[16/10] overflow-hidden rounded-lg mb-2">
                  <img
                    src={rel.image_url}
                    alt={rel.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">
                  {rel.category}
                </span>
                <h4 className="font-serif text-sm font-bold text-stone-900 leading-snug mt-1 group-hover:text-emerald-700 transition-colors line-clamp-3">
                  {rel.title}
                </h4>
              </button>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
