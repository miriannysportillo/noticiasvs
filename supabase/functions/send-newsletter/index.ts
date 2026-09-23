import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

const escapeHtml = (value: string) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return json({ error: 'Método no permitido.' }, 405);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  const fromEmail = Deno.env.get('NEWSLETTER_FROM_EMAIL');

  if (!supabaseUrl || !anonKey || !serviceRoleKey || !resendApiKey || !fromEmail) {
    return json({ error: 'Faltan secretos de configuración del boletín.' }, 500);
  }

  const authorization = request.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer ')) {
    return json({ error: 'Sesión requerida.' }, 401);
  }

  const token = authorization.replace('Bearer ', '');
  const authClient = createClient(supabaseUrl, anonKey);
  const { data: userData, error: userError } = await authClient.auth.getUser(token);
  const user = userData.user;
  const role = String(
    user?.app_metadata?.role ?? user?.user_metadata?.role ?? 'editor',
  ).toLowerCase();

  if (userError || !user || role !== 'admin') {
    return json({ error: 'Solo un administrador puede enviar boletines.' }, 403);
  }

  let payload: { subject?: string; content?: string };
  try {
    payload = await request.json();
  } catch {
    return json({ error: 'El contenido enviado no es válido.' }, 400);
  }

  const subject = payload.subject?.trim() ?? '';
  const content = payload.content?.trim() ?? '';
  if (subject.length < 3 || subject.length > 160 || content.length < 10 || content.length > 10000) {
    return json({ error: 'El asunto o el contenido no cumplen los límites permitidos.' }, 400);
  }

  const serviceClient = createClient(supabaseUrl, serviceRoleKey);
  const { data: subscribers, error: subscribersError } = await serviceClient
    .from('newsletter_subscribers')
    .select('email')
    .eq('status', 'active');

  if (subscribersError) {
    return json({ error: 'No se pudieron cargar los suscriptores activos.' }, 500);
  }

  const emails = (subscribers ?? []).map((subscriber) => subscriber.email).filter(Boolean);
  if (emails.length === 0) {
    return json({ error: 'No hay suscriptores activos.' }, 400);
  }

  const paragraphs = content
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p style="font-size:16px;line-height:1.6;color:#292524">${escapeHtml(paragraph)}</p>`)
    .join('');
  const html = `<div style="font-family:Arial,sans-serif;max-width:640px;margin:auto"><h1 style="color:#065f46">${escapeHtml(subject)}</h1>${paragraphs}<hr style="border:0;border-top:1px solid #e7e5e4;margin-top:32px"><p style="font-size:12px;color:#78716c">Viento Sur · Boletín de noticias</p></div>`;

  let sent = 0;
  for (let index = 0; index < emails.length; index += 50) {
    const batch = emails.slice(index, index + 50);
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [fromEmail],
        bcc: batch,
        subject,
        html,
      }),
    });

    if (!resendResponse.ok) {
      const details = await resendResponse.text();
      console.error('Resend error:', details);
      return json({ error: 'El proveedor de correo rechazó el envío.', sent }, 502);
    }
    sent += batch.length;
  }

  return json({ sent });
});
