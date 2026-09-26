import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Save, Loader2, ArrowLeft, Star, Upload, LogOut, LockKeyhole, Eye, Search, Download } from 'lucide-react';
import { supabase, type Article, type Author, type Session } from '@/lib/supabase';
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
  status: 'draft' | 'published';
};

type AuthorFormData = {
  name: string;
  role: string;
  bio: string;
  avatar: string;
  socialLinks: string;
};

type RegisterFormData = {
  email: string;
  password: string;
  fullName: string;
  authorName: string;
  role: 'admin' | 'editor';
};

type NewsletterSubscriber = {
  id: string;
  email: string;
  status: 'active' | 'unsubscribed';
  source: string;
  subscribed_at: string;
  updated_at: string;
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
  status: 'draft',
};

const EMPTY_AUTHOR_FORM: AuthorFormData = {
  name: '',
  role: 'Columnista',
  bio: '',
  avatar: '',
  socialLinks: '',
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

function getCurrentRole(session: Session | null): 'admin' | 'editor' {
  const metadata = {
    ...(session?.user?.user_metadata ?? {}),
    ...(session?.user?.app_metadata ?? {}),
  } as Record<string, unknown>;

  const role = String(metadata.role ?? metadata.userRole ?? metadata.access ?? 'editor').toLowerCase();
  return role === 'admin' ? 'admin' : 'editor';
}

function getCurrentAuthorName(session: Session | null): string {
  const metadata = {
    ...(session?.user?.user_metadata ?? {}),
    ...(session?.user?.app_metadata ?? {}),
  } as Record<string, unknown>;

  const raw = metadata.author_name ?? metadata.authorName ?? metadata.full_name ?? metadata.name ?? '';
  return String(raw).trim();
}

export default function AdminPanel({ onBack }: AdminPanelProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState<string | null>(null);
  const [registerForm, setRegisterForm] = useState<RegisterFormData>({
    email: '',
    password: '',
    fullName: '',
    authorName: '',
    role: 'editor',
  });
  const [showAuthorForm, setShowAuthorForm] = useState(false);
  const [editingAuthorId, setEditingAuthorId] = useState<string | null>(null);
  const [authorForm, setAuthorForm] = useState<AuthorFormData>(EMPTY_AUTHOR_FORM);
  const [authorError, setAuthorError] = useState<string | null>(null);
  const [savingAuthor, setSavingAuthor] = useState(false);
  const [articleSort, setArticleSort] = useState<'recent' | 'views'>('recent');
  const [articleQuery, setArticleQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [adminNotice, setAdminNotice] = useState<string | null>(null);
  const [newsletterSubscribers, setNewsletterSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [newsletterStatusFilter, setNewsletterStatusFilter] = useState<'all' | 'active' | 'unsubscribed'>('active');
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterSubject, setNewsletterSubject] = useState('');
  const [newsletterContent, setNewsletterContent] = useState('');
  const [newsletterSending, setNewsletterSending] = useState(false);
  const [newsletterSendMessage, setNewsletterSendMessage] = useState<string | null>(null);

  const currentRole = getCurrentRole(session);
  const currentAuthorName = getCurrentAuthorName(session);
  const canManageAll = currentRole === 'admin';
  const canManageOwnProfile = currentRole === 'editor' && Boolean(currentAuthorName);

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
      setArticles((data ?? []).map((article) => ({ ...article, views: article.views ?? 0 })));
    }
    setLoading(false);
  };

  const fetchAuthors = async () => {
    const { data } = await supabase.from('authors').select('*').order('name');
    setAuthors((data as Author[] | null) ?? []);
  };

  const fetchNewsletterSubscribers = async () => {
    if (!canManageAll) {
      setNewsletterSubscribers([]);
      return;
    }

    setNewsletterLoading(true);
    const { data } = await supabase.rpc('list_newsletter_subscribers');
    setNewsletterSubscribers((data as NewsletterSubscriber[] | null) ?? []);
    setNewsletterLoading(false);
  };

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setAuthLoading(false);
      if (data.session) {
        fetchArticles();
        fetchAuthors();
        fetchNewsletterSubscribers();
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (nextSession) {
        fetchArticles();
        fetchAuthors();
        fetchNewsletterSubscribers();
      }
      else setArticles([]);
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [canManageAll]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setRegisterSuccess(null);
    setLoggingIn(true);

    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) setAuthError('No se pudo iniciar sesión. Revisa tu correo y contraseña.');
    setLoggingIn(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setRegisterSuccess(null);
    setRegistering(true);

    const cleanedEmail = registerForm.email.trim();
    const cleanedFullName = registerForm.fullName.trim();
    const cleanedAuthorName = registerForm.authorName.trim() || cleanedFullName;

    if (!cleanedEmail || !registerForm.password || !cleanedFullName || !cleanedAuthorName) {
      setAuthError('Nombre completo, email, contraseña y nombre de autor son obligatorios.');
      setRegistering(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: cleanedEmail,
      password: registerForm.password,
      options: {
        data: {
          role: 'editor',
          full_name: cleanedFullName,
          author_name: cleanedAuthorName,
        },
      },
    });

    if (error) {
      const errorMessage = error.message.toLowerCase();
      setAuthError(errorMessage.includes('email') && errorMessage.includes('rate limit')
        ? 'Supabase alcanzó el límite de correos de confirmación. Espera antes de volver a intentarlo; si continúa, configura SMTP personalizado en Supabase Auth.'
        : error.message || 'No se pudo crear la cuenta.');
      setRegistering(false);
      return;
    }

    if (data.session && session) {
      const { error: restoreError } = await supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      });
      if (restoreError) {
        setAuthError('La cuenta se creó, pero no se pudo restaurar tu sesión. Vuelve a iniciar sesión como administrador.');
        setRegistering(false);
        return;
      }
    }

    if (registerForm.role === 'admin') {
      const { error: roleError } = await supabase.rpc('set_user_role', {
        target_email: cleanedEmail,
        target_role: 'admin',
      });
      if (roleError) {
        setAuthError(`La cuenta se creó como editor, pero no se pudo asignar el rol de administrador: ${roleError.message}`);
        setRegistering(false);
        return;
      }
    }

    const initials = cleanedAuthorName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || 'AU';

    await supabase.from('authors').upsert(
      {
        name: cleanedAuthorName,
        role: 'Editor',
        bio: `Perfil de ${cleanedFullName}.`,
        avatar: initials,
        social_links: [],
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'name' }
    );

    const roleLabel = registerForm.role === 'admin' ? 'administrador' : 'editor';
    const successMessage = `Cuenta de ${roleLabel} creada. Revisa el correo para confirmar la cuenta.`;
    setRegisterSuccess(successMessage);
    setAdminNotice(successMessage);
    setRegisterForm({
      email: '',
      password: '',
      fullName: '',
      authorName: '',
      role: 'editor',
    });
    setShowRegister(false);
    setRegistering(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const openNewAuthorForm = () => {
    if (!canManageAll && !canManageOwnProfile) {
      setAuthorError('No tienes permisos para gestionar autores.');
      return;
    }
    if (!canManageAll) {
      const ownProfile = authors.find((author) => author.name === currentAuthorName);
      if (!ownProfile) {
        setAuthorError('Tu perfil de autor aún no existe. Contacta al administrador.');
        return;
      }
      openEditAuthorForm(ownProfile);
      return;
    }
    setAuthorForm(EMPTY_AUTHOR_FORM);
    setEditingAuthorId(null);
    setAuthorError(null);
    setShowAuthorForm(true);
  };

  const openEditAuthorForm = (author: Author) => {
    if (!canManageAll && author.name !== currentAuthorName) {
      setAuthorError('Solo puedes editar tu propio perfil de autor.');
      return;
    }
    setAuthorForm({
      name: author.name,
      role: author.role,
      bio: author.bio,
      avatar: author.avatar,
      socialLinks: author.social_links.map((link) => `${link.label}|${link.url}|${link.platform}`).join('\n'),
    });
    setEditingAuthorId(author.id);
    setAuthorError(null);
    setShowAuthorForm(true);
  };

  const closeAuthorForm = () => {
    setShowAuthorForm(false);
    setEditingAuthorId(null);
    setAuthorForm(EMPTY_AUTHOR_FORM);
    setAuthorError(null);
  };

  const handleSaveAuthor = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthorError(null);
    if (!canManageAll && authorForm.name.trim() !== currentAuthorName) {
      setAuthorError('Solo puedes editar tu propio perfil de autor.');
      return;
    }
    if (!authorForm.name.trim() || !authorForm.role.trim() || !authorForm.bio.trim()) {
      setAuthorError('Nombre, rol y biografía son obligatorios.');
      return;
    }
    if (!canManageAll && !editingAuthorId) {
      setAuthorError('Los editores no pueden crear perfiles nuevos.');
      return;
    }

    const socialLinks = authorForm.socialLinks
      .split('\n')
      .map((line) => line.trim().split('|'))
      .filter((parts) => parts.length === 3 && parts[0] && parts[1] && ['x', 'linkedin', 'instagram', 'youtube', 'web'].includes(parts[2]))
      .map(([label, url, platform]) => ({ label, url, platform }));
    const payload = {
      name: authorForm.name.trim(),
      role: authorForm.role.trim(),
      bio: authorForm.bio.trim(),
      avatar: authorForm.avatar.trim() || authorForm.name.trim().slice(0, 2).toUpperCase(),
      social_links: socialLinks,
      updated_at: new Date().toISOString(),
    };

    setSavingAuthor(true);
    const result = editingAuthorId
      ? await supabase.from('authors').update(payload).eq('id', editingAuthorId)
      : await supabase.from('authors').insert(payload);
    if (result.error) {
      setAuthorError(
        result.error.code === 'PGRST205'
          ? 'La tabla de autores aún no está creada. Ejecuta la migración 20260920023000_add_authors.sql en Supabase.'
          : 'No se pudo guardar el autor. Verifica que el nombre no esté repetido.'
      );
    } else {
      closeAuthorForm();
      fetchAuthors();
    }
    setSavingAuthor(false);
  };

  const openNewForm = () => {
    if (!canManageAll && !canManageOwnProfile) {
      setFormError('No tienes permisos para crear artículos.');
      return;
    }
    setForm({
      ...EMPTY_FORM,
      author: canManageAll ? EMPTY_FORM.author : currentAuthorName,
    });
    setEditingId(null);
    setFormError(null);
    setShowForm(true);
  };

  const openEditForm = (article: Article) => {
    if (!canManageAll && article.author !== currentAuthorName) {
      setFormError('Solo puedes editar tus propios artículos.');
      return;
    }
    setForm({
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      content: article.content,
      category: article.category,
      author: article.author,
      image_url: article.image_url,
      featured: article.featured,
      status: article.status,
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

    if (!canManageAll && !canManageOwnProfile) {
      setFormError('No tienes permisos para guardar noticias.');
      return;
    }

    if (!canManageAll && form.author.trim() !== currentAuthorName) {
      setFormError('Un editor solo puede trabajar con su propio perfil de autor.');
      return;
    }

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
      const articleData = {
        title: form.title.trim(),
        slug,
        excerpt: form.excerpt.trim(),
        content: contentHtml,
        category: form.category,
        author: form.author.trim(),
        image_url: form.image_url.trim(),
        featured: form.featured,
        status: form.status,
        updated_at: new Date().toISOString(),
      };
      let result = await supabase
        .from('articles')
        .update(articleData)
        .eq('id', editingId);

      if (result.error?.code === '42703') {
        const { status, updated_at, ...legacyArticleData } = articleData;
        void status;
        void updated_at;
        result = await supabase.from('articles').update(legacyArticleData).eq('id', editingId);
      }

      if (result.error) {
        setFormError('No se pudo guardar. Verifica que el slug no esté repetido.');
      } else {
        closeForm();
        fetchArticles();
      }
    } else {
      const articleData = {
        title: form.title.trim(),
        slug,
        excerpt: form.excerpt.trim(),
        content: contentHtml,
        category: form.category,
        author: form.author.trim(),
        image_url: form.image_url.trim(),
        featured: form.featured,
        status: form.status,
      };
      let result = await supabase
        .from('articles')
        .insert(articleData);

      if (result.error?.code === '42703') {
        const { status, ...legacyArticleData } = articleData;
        void status;
        result = await supabase.from('articles').insert(legacyArticleData);
      }

      if (result.error) {
        setFormError('No se pudo crear. Verifica que el slug no esté repetido.');
      } else {
        closeForm();
        fetchArticles();
      }
    }

    setSaving(false);
  };

  const handleDelete = async (article: Article) => {
    if (!canManageAll) {
      setFormError('Los editores no pueden eliminar artículos.');
      return;
    }
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

  const handleNewsletterStatusChange = async (subscriber: NewsletterSubscriber) => {
    const nextStatus = subscriber.status === 'active' ? 'unsubscribed' : 'active';
    const action = nextStatus === 'active' ? 'reactivar' : 'dar de baja';
    if (!confirm(`¿Quieres ${action} a ${subscriber.email}?`)) {
      return;
    }

    setNewsletterLoading(true);
    const { error } = await supabase.rpc('set_newsletter_subscriber_status', {
      target_id: subscriber.id,
      target_status: nextStatus,
    });
    if (!error) {
      await fetchNewsletterSubscribers();
    } else {
      alert(error.message || 'No se pudo actualizar la suscripción.');
      setNewsletterLoading(false);
    }
  };

  const handleExportNewsletter = () => {
    const rows = newsletterSubscribers.map((subscriber) => [
      subscriber.email,
      subscriber.status,
      subscriber.source,
      new Date(subscriber.subscribed_at).toLocaleString('es-ES'),
    ]);
    const csv = [
      ['email', 'estado', 'origen', 'suscrito_en'],
      ...rows,
    ].map((row) => row.map((value) => `"${value.replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'suscriptores-boletin.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSendNewsletter = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNewsletterSendMessage(null);
    setNewsletterSending(true);

    const { data, error } = await supabase.functions.invoke('send-newsletter', {
      body: {
        subject: newsletterSubject,
        content: newsletterContent,
      },
    });

    setNewsletterSending(false);
    if (error || data?.error) {
      setNewsletterSendMessage(error?.message || data?.error || 'No se pudo enviar el boletín.');
      return;
    }

    setNewsletterSubject('');
    setNewsletterContent('');
    setNewsletterSendMessage(`Boletín enviado a ${data.sent} suscriptor${data.sent === 1 ? '' : 'es'}.`);
  };

  const visibleArticles = [...articles]
    .filter((article) => canManageAll || article.author === currentAuthorName)
    .filter((article) => statusFilter === 'all' || article.status === statusFilter)
    .filter((article) => {
      const query = articleQuery.trim().toLowerCase();
      return !query || [article.title, article.author, article.category].some((value) => value.toLowerCase().includes(query));
    })
    .sort((left, right) => articleSort === 'views'
      ? (right.views ?? 0) - (left.views ?? 0)
      : new Date(right.published_at).getTime() - new Date(left.published_at).getTime());

  if (authLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white border border-stone-200 rounded-2xl shadow-xl p-8">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-5">
            <LockKeyhole size={24} />
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-700 mb-2">Viento Sur</p>
          <h1 className="font-serif text-2xl font-bold text-stone-900 mb-2">Acceso editorial</h1>
          <p className="text-sm text-stone-500 mb-6">Inicia sesión para gestionar las noticias del sitio.</p>
          {authError && <p className="px-3 py-2 mb-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{authError}</p>}
          <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Correo electrónico</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Contraseña</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loggingIn}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-semibold disabled:opacity-50"
              >
                {loggingIn && <Loader2 size={16} className="animate-spin" />}
                Entrar al panel
              </button>
          </form>
          <button onClick={onBack} className="w-full mt-2 text-sm text-stone-500 hover:text-emerald-700">Volver al sitio público</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Admin header */}
      <div className="bg-stone-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-stone-800 rounded-lg transition-colors"
              aria-label="Volver al sitio"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="font-serif text-lg sm:text-xl font-bold">Panel de Administración</h1>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <span className="hidden sm:inline text-xs text-stone-400 mr-2">{session.user.email}</span>
            <span className={`hidden sm:inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${canManageAll ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
              {canManageAll ? 'Admin' : 'Editor'}
            </span>
            {canManageAll && (
              <button
                onClick={openNewAuthorForm}
                className="flex items-center gap-2 px-3 py-2 bg-stone-700 hover:bg-stone-600 rounded-lg text-sm font-semibold transition-colors"
                aria-label="Gestionar autores"
                title="Gestionar autores"
              >
                <Pencil size={18} />
              </button>
            )}
            {canManageAll && (
              <button
                onClick={() => setShowImport(true)}
                className="p-2.5 bg-stone-700 hover:bg-stone-600 rounded-lg transition-colors"
                aria-label="Importar desde Blogger"
                title="Importar desde Blogger"
              >
                <Upload size={18} />
              </button>
            )}
            {canManageAll && (
              <button
                onClick={() => {
                  setShowRegister(true);
                  setAuthError(null);
                  setRegisterSuccess(null);
                }}
                className="p-2.5 bg-stone-700 hover:bg-stone-600 rounded-lg transition-colors"
                aria-label="Crear usuario editorial"
                title="Crear usuario editorial"
              >
                <Plus size={18} />
              </button>
            )}
            <button
              onClick={openNewForm}
              className="p-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors"
              aria-label="Nueva noticia"
              title="Nueva noticia"
            >
              <Plus size={18} />
            </button>
            <button
              onClick={handleLogout}
              className="p-2 text-stone-300 hover:text-white hover:bg-stone-800 rounded-lg transition-colors"
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              <div className="bg-white border border-stone-200 rounded-xl p-4">
                <p className="text-xs uppercase tracking-wider text-stone-500">Artículos</p>
                <p className="mt-1 text-2xl font-bold text-stone-900">{articles.length}</p>
              </div>
              <div className="bg-white border border-stone-200 rounded-xl p-4">
                <p className="text-xs uppercase tracking-wider text-stone-500">Publicados</p>
                <p className="mt-1 text-2xl font-bold text-emerald-700">{articles.filter((article) => article.status === 'published').length}</p>
              </div>
              <div className="bg-white border border-stone-200 rounded-xl p-4">
                <p className="text-xs uppercase tracking-wider text-stone-500">Vistas totales</p>
                <p className="mt-1 text-2xl font-bold text-stone-900">{articles.reduce((total, article) => total + (article.views ?? 0), 0).toLocaleString('es-ES')}</p>
              </div>
            </div>
            <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-stone-500">Gestiona el contenido editorial</p>
              <div className="grid grid-cols-1 gap-2 sm:flex sm:items-center">
                <label className="relative block sm:w-48">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    value={articleQuery}
                    onChange={(event) => setArticleQuery(event.target.value)}
                    placeholder="Buscar noticias"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-stone-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                    aria-label="Buscar noticias"
                  />
                </label>
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value as 'all' | 'published' | 'draft')}
                  className="w-full sm:w-auto px-3 py-2 bg-white border border-stone-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                  aria-label="Filtrar por estado"
                >
                  <option value="all">Todos</option>
                  <option value="published">Publicados</option>
                  <option value="draft">Borradores</option>
                </select>
                <select
                  value={articleSort}
                  onChange={(event) => setArticleSort(event.target.value as 'recent' | 'views')}
                  className="w-full sm:w-auto px-3 py-2 bg-white border border-stone-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                  aria-label="Ordenar noticias"
                >
                  <option value="recent">Recientes</option>
                  <option value="views">Más vistas</option>
                </select>
              </div>
            </div>
            {(canManageAll ? authors : authors.filter((author) => author.name === currentAuthorName)).length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-serif text-lg font-bold text-stone-900">{canManageAll ? 'Autores' : 'Mi perfil'}</h2>
                  <span className="text-xs text-stone-500">
                    {canManageAll ? `${authors.length} perfil${authors.length !== 1 ? 'es' : ''}` : 'Solo lectura y edición personal'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(canManageAll ? authors : authors.filter((author) => author.name === currentAuthorName)).map((author) => (
                    <button
                      key={author.id}
                      type="button"
                      onClick={() => openEditAuthorForm(author)}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm text-stone-700 hover:border-emerald-500 hover:text-emerald-700 transition-colors"
                    >
                      <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold">
                        {author.avatar || author.name.slice(0, 2).toUpperCase()}
                      </span>
                      {author.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {adminNotice && (
              <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800" role="status">
                {adminNotice}
              </div>
            )}

            {canManageAll && (
              <div className="mb-6 rounded-2xl border border-stone-200 bg-white p-4">
                <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="font-serif text-lg font-bold text-stone-900">Suscriptores del boletín</h2>
                    <p className="text-xs text-stone-500 mt-1">Gestiona los correos registrados en “El Boletín del Sur”.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={newsletterStatusFilter}
                      onChange={(event) => setNewsletterStatusFilter(event.target.value as 'all' | 'active' | 'unsubscribed')}
                      className="px-2.5 py-2 border border-stone-300 rounded-lg text-sm bg-white focus:outline-none focus:border-emerald-500"
                      aria-label="Filtrar suscriptores"
                    >
                      <option value="active">Activos</option>
                      <option value="unsubscribed">Dados de baja</option>
                      <option value="all">Todos</option>
                    </select>
                    <button
                      type="button"
                      onClick={handleExportNewsletter}
                      disabled={newsletterSubscribers.length === 0}
                      className="inline-flex items-center gap-2 px-3 py-2 border border-stone-300 rounded-lg text-sm text-stone-700 hover:border-emerald-500 hover:text-emerald-700 disabled:opacity-40"
                      title="Exportar suscriptores"
                    >
                      <Download size={15} />
                      Exportar
                    </button>
                  </div>
                </div>
                {newsletterLoading ? (
                  <div className="flex items-center gap-2 py-4 text-sm text-stone-500">
                    <Loader2 size={16} className="animate-spin" /> Cargando suscriptores...
                  </div>
                ) : newsletterSubscribers.filter((subscriber) => newsletterStatusFilter === 'all' || subscriber.status === newsletterStatusFilter).length === 0 ? (
                  <p className="text-sm text-stone-500 py-3">No hay suscriptores en este filtro.</p>
                ) : (
                  <div className="space-y-2">
                    {newsletterSubscribers
                      .filter((subscriber) => newsletterStatusFilter === 'all' || subscriber.status === newsletterStatusFilter)
                      .map((subscriber) => (
                        <div key={subscriber.id} className="flex flex-col gap-2 border border-stone-200 rounded-lg p-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-stone-900 truncate">{subscriber.email}</p>
                            <p className="text-xs text-stone-500">{new Date(subscriber.subscribed_at).toLocaleDateString('es-ES')} · {subscriber.source}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleNewsletterStatusChange(subscriber)}
                            className={`self-end sm:self-center px-2.5 py-1.5 rounded-lg border text-xs font-medium ${subscriber.status === 'active'
                              ? 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
                              : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
                          >
                            {subscriber.status === 'active' ? 'Dar de baja' : 'Reactivar'}
                          </button>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {canManageAll && (
              <div className="mb-6 rounded-2xl border border-stone-200 bg-white p-4">
                <div className="mb-4">
                  <h2 className="font-serif text-lg font-bold text-stone-900">Enviar boletín</h2>
                  <p className="text-xs text-stone-500 mt-1">El mensaje se enviará únicamente a suscriptores activos.</p>
                </div>
                <form onSubmit={handleSendNewsletter} className="space-y-3">
                  <input
                    type="text"
                    value={newsletterSubject}
                    onChange={(event) => setNewsletterSubject(event.target.value)}
                    placeholder="Asunto del boletín"
                    maxLength={160}
                    className="w-full px-3 py-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                    required
                  />
                  <textarea
                    value={newsletterContent}
                    onChange={(event) => setNewsletterContent(event.target.value)}
                    placeholder="Escribe el contenido. Cada línea se convertirá en un párrafo."
                    maxLength={10000}
                    rows={6}
                    className="w-full px-3 py-2.5 border border-stone-300 rounded-lg text-sm resize-y focus:outline-none focus:border-emerald-500"
                    required
                  />
                  {newsletterSendMessage && (
                    <p className={`text-sm ${newsletterSendMessage.startsWith('Boletín enviado') ? 'text-emerald-700' : 'text-red-700'}`} role="status">
                      {newsletterSendMessage}
                    </p>
                  )}
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={newsletterSending}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-semibold disabled:opacity-50"
                    >
                      {newsletterSending && <Loader2 size={16} className="animate-spin" />}
                      Enviar boletín
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="space-y-3">
              {visibleArticles.length === 0 ? (
                <div className="bg-white border border-dashed border-stone-300 rounded-xl p-8 text-center text-sm text-stone-500">
                  No hay noticias que coincidan con estos filtros.
                </div>
              ) : visibleArticles.map((article) => (
                <div
                  key={article.id}
                  className="flex items-center gap-4 bg-white rounded-xl border border-stone-200 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden">
                    <img src={article.image_url} alt={article.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
                        {article.category}
                      </span>
                      {article.featured && (
                        <span className="flex items-center gap-1 text-xs text-amber-600 font-semibold">
                          <Star size={12} className="fill-amber-500 text-amber-500" />
                          Destacada
                        </span>
                      )}
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${article.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {article.status === 'published' ? 'Publicado' : 'Borrador'}
                      </span>
                    </div>
                    <h3 className="font-serif text-sm font-bold text-stone-900 line-clamp-1">
                      {article.title}
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">{article.author}</p>
                    <span className="inline-flex items-center gap-1 mt-2 text-xs text-stone-500">
                      <Eye size={13} />
                      {(article.views ?? 0).toLocaleString('es-ES')} vistas
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => openEditForm(article)}
                      className="p-2 text-stone-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                      aria-label="Editar"
                    >
                      <Pencil size={18} />
                    </button>
                    {canManageAll && (
                      <button
                        onClick={() => handleDelete(article)}
                        className="p-2 text-stone-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        aria-label="Borrar"
                        title="Borrar noticia"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
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

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Estado editorial</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as 'draft' | 'published' })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500 bg-white"
                >
                  <option value="draft">Guardar como borrador</option>
                  <option value="published">Publicar ahora</option>
                </select>
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

      {showRegister && canManageAll && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200">
              <div>
                <h2 className="font-serif text-lg font-bold text-stone-900">Crear usuario editorial</h2>
                <p className="text-xs text-stone-500 mt-1">Elige el rol inicial de la cuenta.</p>
              </div>
              <button
                onClick={() => setShowRegister(false)}
                className="p-2 text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded-lg"
                aria-label="Cerrar"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleRegister} className="px-6 py-5 space-y-4">
              {authError && <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{authError}</div>}
              {registerSuccess && <div className="px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-700">{registerSuccess}</div>}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Correo electrónico</label>
                <input
                  type="email"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm((current) => ({ ...current, email: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Contraseña temporal</label>
                <input
                  type="password"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm((current) => ({ ...current, password: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Nombre completo</label>
                  <input
                    type="text"
                    value={registerForm.fullName}
                    onChange={(e) => setRegisterForm((current) => ({ ...current, fullName: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Nombre de autor</label>
                  <input
                    type="text"
                    value={registerForm.authorName}
                    onChange={(e) => setRegisterForm((current) => ({ ...current, authorName: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                    placeholder="Ej: Ana López"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Rol de usuario</label>
                <select
                  value={registerForm.role}
                  onChange={(event) => setRegisterForm((current) => ({ ...current, role: event.target.value as RegisterFormData['role'] }))}
                  className="w-full px-3 py-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500 bg-white"
                >
                  <option value="editor">Editor</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                La asignación de administrador requiere permisos de administrador activos.
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setShowRegister(false)}
                  className="px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={registering}
                  className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg disabled:opacity-50"
                >
                  {registering && <Loader2 size={16} className="animate-spin" />}
                  Crear {registerForm.role === 'admin' ? 'administrador' : 'editor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAuthorForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200">
              <h2 className="font-serif text-lg font-bold text-stone-900">
                {editingAuthorId ? 'Editar autor' : 'Nuevo autor'}
              </h2>
              <button onClick={closeAuthorForm} className="p-2 text-stone-500 hover:text-stone-700 rounded-lg" aria-label="Cerrar">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveAuthor} className="px-6 py-5 space-y-4">
              {authorError && <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{authorError}</div>}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Nombre *</label>
                  <input value={authorForm.name} onChange={(e) => setAuthorForm({ ...authorForm, name: e.target.value })} className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Rol *</label>
                  <input value={authorForm.role} onChange={(e) => setAuthorForm({ ...authorForm, role: e.target.value })} className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Biografía *</label>
                <textarea value={authorForm.bio} onChange={(e) => setAuthorForm({ ...authorForm, bio: e.target.value })} rows={4} className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm resize-y" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Iniciales del avatar</label>
                <input value={authorForm.avatar} onChange={(e) => setAuthorForm({ ...authorForm, avatar: e.target.value })} maxLength={4} className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm" placeholder="MG" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Redes sociales</label>
                <textarea value={authorForm.socialLinks} onChange={(e) => setAuthorForm({ ...authorForm, socialLinks: e.target.value })} rows={3} className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm resize-y" placeholder="X|https://x.com/usuario|x" />
                <p className="text-xs text-stone-500 mt-1">Una por línea: etiqueta|URL|plataforma. Plataformas: x, linkedin, instagram, youtube o web.</p>
              </div>
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-stone-200">
                <button type="button" onClick={closeAuthorForm} className="px-4 py-2 text-sm text-stone-600 hover:bg-stone-100 rounded-lg">Cancelar</button>
                <button type="submit" disabled={savingAuthor} className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg disabled:opacity-50">
                  {savingAuthor ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Guardar autor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
