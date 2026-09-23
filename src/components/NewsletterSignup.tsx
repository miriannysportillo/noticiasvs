import { useState } from 'react';
import { Loader2, Send } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type NewsletterSignupProps = {
  variant?: 'footer' | 'sidebar';
};

export default function NewsletterSignup({ variant = 'sidebar' }: NewsletterSignupProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setStatus('error');
      setMessage('Escribe un correo electrónico válido.');
      return;
    }

    setStatus('loading');
    setMessage('');

    const { error } = await supabase.rpc('subscribe_to_newsletter', {
      subscriber_email: normalizedEmail,
      subscriber_source: variant,
    });

    if (error) {
      setStatus('error');
      setMessage(error.code === '42P01'
        ? 'El boletín aún no está configurado en Supabase.'
        : 'No pudimos completar la suscripción. Inténtalo de nuevo.');
      return;
    }

    setEmail('');
    setStatus('success');
    setMessage('Listo. Tu correo quedó suscrito al boletín.');
  };

  const isFooter = variant === 'footer';

  return (
    <>
      <form onSubmit={handleSubmit} className={isFooter ? 'flex gap-2' : 'space-y-3'}>
        <input
          type="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (status !== 'idle') {
              setStatus('idle');
              setMessage('');
            }
          }}
          placeholder="tu@email.com"
          aria-label="Correo electrónico para el boletín"
          disabled={status === 'loading'}
          className={isFooter
            ? 'flex-1 min-w-0 px-3 py-2 bg-stone-800 border border-stone-700 rounded-lg text-white placeholder:text-stone-500 text-sm focus:outline-none focus:border-emerald-500 disabled:opacity-60'
            : 'w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-stone-400 text-sm focus:outline-none focus:border-emerald-400 focus:bg-white/15 transition-colors disabled:opacity-60'}
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className={isFooter
            ? 'px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors disabled:opacity-60'
            : 'w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60'}
          aria-label="Suscribir al boletín"
        >
          {status === 'loading' ? <Loader2 size={16} className="mx-auto animate-spin" /> : isFooter ? <Send size={16} /> : 'Suscribirme gratis'}
        </button>
      </form>
      {message && (
        <p className={`mt-2 text-xs ${status === 'success' ? 'text-emerald-400' : 'text-red-300'}`} role="status">
          {message}
        </p>
      )}
    </>
  );
}
