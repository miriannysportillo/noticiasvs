import { Wind, Facebook, Instagram, Youtube, Music2, Mail, Send, Settings } from 'lucide-react';
import { CATEGORIES } from '@/lib/categories';

type FooterProps = {
  onNavigateHome: () => void;
  onNavigateCategory: (category: string) => void;
  onNavigateAdmin: () => void;
};

export default function Footer({ onNavigateHome, onNavigateCategory, onNavigateAdmin }: FooterProps) {
  const socialLinks = [
    { label: 'Facebook', href: 'https://www.facebook.com/radiolibrevientosur', Icon: Facebook },
    { label: 'Instagram', href: 'https://www.instagram.com/vientosur885', Icon: Instagram },
    { label: 'TikTok', href: 'https://www.tiktok.com/@radiolibrevientosur', Icon: Music2 },
    { label: 'YouTube', href: 'https://www.youtube.com/@radiolibrevientosur9211', Icon: Youtube },
    { label: 'Telegram', href: 'https://t.me/radiolibrevientosur', Icon: Send },
  ];

  return (
    <footer id="site-footer" className="bg-stone-900 text-stone-300 mt-16 scroll-mt-4">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <button onClick={onNavigateHome} className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center">
                <Wind size={20} className="text-white" />
              </div>
              <div className="text-left leading-none">
                <div className="font-serif text-lg font-bold text-white">Viento Sur</div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-emerald-400 font-semibold mt-0.5">
                  Noticias
                </div>
              </div>
            </button>
            <p className="text-sm text-stone-400 leading-relaxed">
              Noticias del sur del continente. Periodismo independiente, rigor y compromiso con la verdad.
            </p>
            <div className="flex items-center gap-3 mt-4">
              {socialLinks.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-full bg-stone-800 hover:bg-emerald-600 flex items-center justify-center transition-colors"
                  aria-label={label}
                  title={label}
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
            <a
              href="mailto:radiolibrevientosur@gmail.com"
              className="inline-flex items-center gap-2 mt-4 text-sm text-stone-400 hover:text-emerald-400 transition-colors"
            >
              <Mail size={15} />
              radiolibrevientosur@gmail.com
            </a>
          </div>

          {/* Sections */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Secciones</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={onNavigateHome} className="text-sm text-stone-400 hover:text-emerald-400 transition-colors">
                  Portada
                </button>
              </li>
              {CATEGORIES.map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => onNavigateCategory(cat)}
                    className="text-sm text-stone-400 hover:text-emerald-400 transition-colors"
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Información</h4>
            <ul className="space-y-2">
              {['Sobre nosotros', 'Equipo editorial', 'Contacto', 'Publicidad', 'Trabaja con nosotros'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-stone-400 hover:text-emerald-400 transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Boletín</h4>
            <p className="text-sm text-stone-400 mb-3">
              Las noticias que importan, cada mañana en tu correo.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
              <input
                type="email"
                placeholder="tu@email.com"
                className="flex-1 px-3 py-2 bg-stone-800 border border-stone-700 rounded-lg text-white placeholder:text-stone-500 text-sm focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors"
                aria-label="Suscribir"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-stone-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-stone-500">
            © {new Date().getFullYear()} Noticias Viento Sur. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-4 text-xs text-stone-500">
            <a href="#" className="hover:text-emerald-400 transition-colors">Términos</a>
            <a href="#" className="hover:text-emerald-400 transition-colors">Privacidad</a>
            <a href="#" className="hover:text-emerald-400 transition-colors">Cookies</a>
            <button
              onClick={onNavigateAdmin}
              className="flex items-center gap-1 hover:text-emerald-400 transition-colors"
              aria-label="Panel de administración"
            >
              <Settings size={12} />
              Administrar
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
