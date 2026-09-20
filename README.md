# noticiasvs

[![Open in Bolt](https://bolt.new/static/open-in-bolt.svg)](https://bolt.new/~/sb1-r9sspq8m)

## Configuración de Supabase

La aplicación se conecta al proyecto Supabase indicado en las variables de entorno, no a la cuenta de GitHub. Para vincularla a tu propia cuenta:

1. Entra a [supabase.com](https://supabase.com) con la cuenta que quieres usar.
2. Crea un proyecto nuevo desde **New project**.
3. En **Project Settings > API**, copia la **Project URL** y la clave pública **anon**.
4. Copia `.env.example` como `.env` y reemplaza ambos valores.
5. En el **SQL Editor** del proyecto nuevo, ejecuta estas migraciones en orden:
	- `supabase/migrations/20260920002647_create_articles_table.sql`
	- `supabase/migrations/20260920020000_add_editorial_workflow.sql`
	- `supabase/migrations/20260920023000_add_authors.sql`
	- `supabase/migrations/20260920024000_add_article_views.sql`
6. Crea el usuario editor en **Authentication > Users > Add user**.

El archivo `.env` está excluido de Git y nunca debe subirse al repositorio. La conexión del repositorio GitHub se mantiene en `origin`; Supabase y GitHub son servicios separados. El botón **Open in Bolt** solo abre el proyecto en Bolt y no determina la cuenta Supabase utilizada.
