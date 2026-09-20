import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Save, Loader2, ArrowLeft, Star, Upload } from 'lucide-react';
import { supabase, type Article } from '@/lib/supabase';
import { CATEGORIES } from '@/lib/categories';
import BloggerImport from '@/components/BloggerImport';

type AdminPanelProps = {
  onBack: () => void;
};

type FormData = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  image_url: string;
  featured: boolean;
};

const EMPTY_FORM: FormData = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  category: CATEGORIES[0],
  author: '',
  image_url: '',
  featured: false,
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export default function AdminPanel({ onBack }: AdminPanelProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showImport, setShowImport] = useState(false);

  const fetchArticles = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('published_at', { ascending: false });
    if (error) {
      setError('No se pudieron cargar los artículos.');
    } else {
      setArticles(data ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const openNewForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setFormError(null);
    setShowForm(true);
  };

  const openEditForm = (article: Article) => {
    setForm({
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      content: article.content,
      category: article.category,
      author: article.author,
      image_url: article.image_url,
      featured: article.featured,
    });
    setEditingId(article.id);
    setFormError(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!form.title.trim() || !form.excerpt.trim() || !form.content.trim() || !form.author.trim() || !form.image_url.trim()) {
      setFormError('Todos los campos son obligatorios.');
      return;
    }

    const slug = form.slug.trim() || slugify(form.title);
    const contentHtml = form.content
      .split('\n')
      .filter((p) => p.trim())
      .map((p) => `<p>${p.trim()}</p>`)
      .join('');

    setSaving(true);

    if (editingId) {
      const { error } = await supabase
        .from('articles')
        .update({
          title: form.title.trim(),
          slug,
          excerpt: form.excerpt.trim(),
          content: contentHtml,
          category: form.category,
          author: form.author.trim(),
          image_url: form.image_url.trim(),
          featured: form.featured,
        })
        .eq('id', editingId);

      if (error) {
        setFormError('No se pudo guardar. Verifica que el slug no esté repetido.');
      } else {
        closeForm();
        fetchArticles();
      }
    } else {
      const { error } = await supabase
        .from('articles')
        .insert({
          title: form.title.trim(),
          slug,
          excerpt: form.excerpt.trim(),
          content: contentHtml,
          category: form.category,
          author: form.author.trim(),
          image_url: form.image_url.trim(),
          featured: form.featured,
        });

      if (error) {
        setFormError('No se pudo crear. Verifica que el slug no esté repetido.');
      } else {
        closeForm();
        fetchArticles();
      }
    }

    setSaving(false);
  };

  const handleDelete = async (article: Article) => {
    if (!confirm(`¿Seguro que quieres borrar "${article.title}"? Esta acción no se puede deshacer.`)) {
      return;
    }
    const { error } = await supabase.from('articles').delete().eq('id', article.id);
    if (error) {
      alert('No se pudo borrar el artículo.');
    } else {
      fetchArticles();
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Admin header */}
      <div className="bg-stone-900 text-white">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-stone-800 rounded-lg transition-colors"
              aria-label="Volver al sitio"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="font-serif text-xl font-bold">Panel de Administración</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowImport(true)}
              className="flex items-center gap-2 px-4 py-2 bg-stone-700 hover:bg-stone-600 rounded-lg text-sm font-semibold transition-colors"
            >
              <Upload size={18} />
              Importar desde Blogger
            </button>
            <button
              onClick={openNewForm}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-semibold transition-colors"
            >
              <Plus size={18} />
              Nueva noticia
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-stone-600 text-lg mb-4">{error}</p>
            <button
              onClick={fetchArticles}
              className="px-5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors"
            >
              Reintentar
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm text-stone-500 mb-4">
              {articles.length} artículo{articles.length !== 1 ? 's' : ''} en total
            </p>
            <div className="space-y-3">
              {articles.map((article) => (
                <div
                  key={article.id}
                  className="flex items-center gap-4 bg-white rounded-xl border border-stone-200 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden">
                    <img src={article.image_url} alt={article.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
                        {article.category}
                      </span>
                      {article.featured && (
                        <span className="flex items-center gap-1 text-xs text-amber-600 font-semibold">
                          <Star size={12} className="fill-amber-500 text-amber-500" />
                          Destacada
                        </span>
                      )}
                    </div>
                    <h3 className="font-serif text-sm font-bold text-stone-900 line-clamp-1">
                      {article.title}
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">{article.author}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => openEditForm(article)}
                      className="p-2 text-stone-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                      aria-label="Editar"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(article)}
                      className="p-2 text-stone-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      aria-label="Borrar"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modal form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200">
              <h2 className="font-serif text-lg font-bold text-stone-900">
                {editingId ? 'Editar noticia' : 'Nueva noticia'}
              </h2>
              <button
                onClick={closeForm}
                className="p-2 text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
                aria-label="Cerrar"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="px-6 py-5 space-y-4">
              {formError && (
                <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Título *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => {
                    setForm({ ...form, title: e.target.value });
                    if (!editingId) setForm((f) => ({ ...f, slug: slugify(e.target.value) }));
                  }}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                  placeholder="Título de la noticia"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Categoría *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500 bg-white"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Autor *</label>
                  <input
                    type="text"
                    value={form.author}
                    onChange={(e) => setForm({ ...form, author: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                    placeholder="Nombre del autor"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  URL de la imagen *
                </label>
                <input
                  type="url"
                  value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                  placeholder="https://..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Resumen *</label>
                <textarea
                  value={form.excerpt}
                  onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500 resize-none"
                  placeholder="Breve descripción que aparece en las tarjetas"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Contenido * <span className="text-stone-400 font-normal">(un párrafo por línea)</span>
                </label>
                <textarea
                  value={form.content.replace(/<p>/g, '').replace(/<\/p>\n?/g, '\n').trim()}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  rows={6}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500 resize-y"
                  placeholder="Escribe el contenido completo. Cada línea será un párrafo."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Slug <span className="text-stone-400 font-normal">(se genera solo)</span>
                </label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                  placeholder="url-de-la-noticia"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                  className="w-4 h-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-sm font-medium text-stone-700 flex items-center gap-1">
                  <Star size={14} className="text-amber-500" />
                  Marcar como noticia destacada (aparece en la portada)
                </span>
              </label>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {editingId ? 'Guardar cambios' : 'Publicar noticia'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showImport && (
        <BloggerImport
          onClose={() => setShowImport(false)}
          onImported={fetchArticles}
        />
      )}
    </div>
  );
}
