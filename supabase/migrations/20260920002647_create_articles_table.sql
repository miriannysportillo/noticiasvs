/*
# Create articles table for Noticias Viento Sur

1. New Tables
- `articles`
  - `id` (uuid, primary key)
  - `title` (text, not null) — article headline
  - `slug` (text, unique, not null) — URL-friendly identifier
  - `excerpt` (text, not null) — short summary shown in cards
  - `content` (text, not null) — full article body in HTML
  - `category` (text, not null) — section name (Politica, Tecnologia, etc.)
  - `author` (text, not null) — author name
  - `image_url` (text, not null) — hero image URL
  - `featured` (boolean, default false) — shown in hero section
  - `published_at` (timestamptz, default now()) — publication date
  - `created_at` (timestamptz, default now())

2. Security
- Enable RLS on `articles`.
- Allow anon + authenticated SELECT (public news site, no sign-in).
- Allow anon + authenticated INSERT/UPDATE/DELETE (single-tenant, no auth).
- All data is intentionally public/shared.

3. Seed Data
- 12 articles across 6 categories with real Pexels images.
*/

CREATE TABLE IF NOT EXISTS articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt text NOT NULL,
  content text NOT NULL,
  category text NOT NULL,
  author text NOT NULL,
  image_url text NOT NULL,
  featured boolean NOT NULL DEFAULT false,
  published_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_articles" ON articles;
CREATE POLICY "anon_select_articles" ON articles FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_articles" ON articles;
CREATE POLICY "anon_insert_articles" ON articles FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_articles" ON articles;
CREATE POLICY "anon_update_articles" ON articles FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_articles" ON articles;
CREATE POLICY "anon_delete_articles" ON articles FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_featured ON articles(featured);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at DESC);

INSERT INTO articles (title, slug, excerpt, content, category, author, image_url, featured, published_at) VALUES
(
  'El viento sur sopla con fuerza: cambios climáticos transforman la Patagonia',
  'viento-sur-cambios-climaticos-patagonia',
  'Un reporte desde el sur del continente muestra cómo los patrones de viento están reconfigurando el paisaje y la vida de sus habitantes.',
  '<p>Los vientos del sur, que durante siglos han moldeado la geografía de la Patagonia, ahora muestran patrones nunca antes registrados. Científicos del Instituto Austral de Investigaciones Climáticas han documentado un aumento del 15% en la velocidad promedio del viento durante los últimos cinco años.</p><p>"Lo que observamos es consistente con los modelos de cambio climático que predijeron una intensificación de los vientos del oeste en latitudes medias", explica la doctora Elena Vargas, investigadora principal del estudio.</p><p>Los efectos no se limitan a la meteorología. Las comunidades rurales han tenido que adaptar sus construcciones, la agricultura se ha visto obligada a cambiar sus ciclos de siembra, y el turismo de aventura ha experimentado un auge inesperado gracias a las condiciones ideales para deportes de viento.</p><p>El gobierno regional ha anunciado una inversión de 200 millones de pesos en infraestructura de energía eólica, aprovechando el recurso natural que, paradójicamente, el cambio climático ha intensificado.</p>',
  'Medio Ambiente',
  'María González',
  'https://images.pexels.com/photos/33149735/pexels-photo-33149735.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  true,
  NOW() - INTERVAL '2 hours'
),
(
  'Congreso debate nueva ley de transición energética en sesión histórica',
  'congreso-ley-transicion-energetica',
  'La propuesta busca establecer un marco legal para la salida progresiva de combustibles fósiles en los próximos veinte años.',
  '<p>El Congreso Nacional inició hoy el debate de la Ley de Transición Energética, considerada la legislación ambiental más ambiciosa de las últimas tres décadas. La propuesta contempla la reducción gradual del 70% en el uso de combustibles fósiles para el año 2045.</p><p>El ministro de Energía, Carlos Reyes, presentó el proyecto ante una cámara llena de observadores ciudadanos y representantes de empresas del sector. "Este es un compromiso que no puede esperar más", afirmó durante su intervención.</p><p>La oposición ha cuestionado la viabilidad económica del plan, argumentando que la transición podría generar pérdidas de empleo en sectores tradicionales. Sin embargo, los estudios independientes sugieren que por cada empleo perdido se crearían 2.3 nuevos puestos en energías renovables.</p><p>La votación final está programada para dentro de tres semanas, tras un periodo de audiencias públicas en todo el país.</p>',
  'Política',
  'Roberto Méndez',
  'https://images.pexels.com/photos/32386662/pexels-photo-32386662.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  true,
  NOW() - INTERVAL '5 hours'
),
(
  'Inteligencia artificial revoluciona el diagnóstico médico en hospitales públicos',
  'ia-diagnostico-medico-hospitales',
  'Un sistema pionero de IA reduce a minutos el tiempo de detección de enfermedades complejas en centros de salud estatales.',
  '<p>Cinco hospitales públicos del país han implementado un sistema de inteligencia artificial capaz de analizar imágenes médicas y emitir diagnósticos preliminares en menos de tres minutos. El proyecto, desarrollado en colaboración con la Universidad Nacional, ha demostrado una precisión del 94% en la detección temprana de tumores.</p><p>La doctora Patricia Núñez, jefa de radiología del Hospital Central, describe los resultados como "transformadores". "Lo que antes tomaba días ahora se resuelve en la sala de espera. Esto salva vidas, especialmente en regiones donde el acceso a especialistas es limitado."</p><p>El sistema utiliza redes neuronales entrenadas con más de un millón de imágenes médicas anonimizadas. Los especialistas revisan y confirman cada diagnóstico emitido por la IA, manteniendo el control humano sobre las decisiones clínicas.</p><p>El ministerio de Salud planea extender el programa a 20 hospitales adicionales durante el próximo año, con una inversión total de 50 millones de dólares.</p>',
  'Tecnología',
  'Ana Torres',
  'https://images.pexels.com/photos/30547606/pexels-photo-30547606.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  true,
  NOW() - INTERVAL '8 hours'
),
(
  'Selección nacional clasifica al mundial tras victoria épica en tiempo extra',
  'seleccion-clasifica-mundial-tiempo-extra',
  'Un gol en el minuto 118 desató la locura en el estadio y selló el pasaje al próximo mundial tras doce años de ausencia.',
  '<p>La selección nacional logró su clasificación al mundial en una noche que quedará grabada en la memoria deportiva del país. Con un gol de cabeza del delantero Matías Herrera en el minuto 118 de la prórroga, el equipo selló un triunfo 2-1 ante un rival que nunca dejó de complicar.</p><p>El estadio, repleto con 65.000 espectadores, estalló en una celebración que se extendió por horas. Las calles de las principales ciudades se llenaron de hinchas que corearon el nombre del equipo hasta la madrugada.</p><p>"Sabíamos que este grupo tenía algo especial. Los jugadores dejaron el alma en la cancha y el público los llevó en volandas", declaró el entrenador al final del encuentro, con los ojos humedecidos.</p><p>La federación de fútbol confirmó que la plantilla de 26 jugadores se anunciará la próxima semana, tras un último periodo de evaluación de los futbolistas en sus respectivos clubes.</p>',
  'Deportes',
  'Diego Fernández',
  'https://images.pexels.com/photos/32471037/pexels-photo-32471037.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  true,
  NOW() - INTERVAL '12 hours'
),
(
  'El mercado financiero reacciona con cautela ante nuevos datos de inflación',
  'mercado-financiero-inflacion-datos',
  'El índice de precios al consumidor registró una variación menor a la esperada, pero los analistas mantienen reservas.',
  '<p>Los mercados financieros cerraron la jornada con una leve subida tras conocerse que la inflación mensual se situó en el 0.8%, por debajo del 1.2% que anticipaban los analistas. El índice principal avanzó un 0.7%, mientras que el dólar se mantuvo estable frente a la moneda local.</p><p>Economistas de distintos sectores coinciden en que si bien el dato es positivo, no debe interpretarse como un cambio de tendencia. "Un mes no hace una tendencia. Necesitamos ver al menos tres meses consecutivos para hablar de una desaceleración sostenida", advirtió la economista Laura Cárdenas.</p><p>El Banco Central mantendrá su próxima reunión de política monetaria en dos semanas. Los operadores de mercado anticipan que la tasa de interés se mantendrá sin cambios, aunque algunos esperan un ajuste menor si los datos de empleo confirman la tendencia.</p><p>Las acciones del sector energético lideraron las ganancias, seguidas por las empresas de consumo, que se beneficiaron de la mejora en las expectativas de gasto de los hogares.</p>',
  'Economía',
  'Javier Ríos',
  'https://images.pexels.com/photos/35118208/pexels-photo-35118208.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  false,
  NOW() - INTERVAL '1 day'
),
(
  'Exposición de arte contemporáneo bate récords de visitantes en su primera semana',
  'exposicion-arte-contemporaneo-records',
  'La muestra reúne obras de 40 artistas de la región y ha superado las expectativas de público más optimistas.',
  '<p>La exposición "Vientos del Sur: Voces Contemporáneas" ha recibido más de 12.000 visitantes en su primera semana, batiendo todos los récords del Museo de Arte Moderno. La muestra reúne 120 obras de 40 artistas provenientes de siete países de la región.</p><p>La curadora, Sofía Ramírez, concibió la exposición como un diálogo entre generaciones y disciplinas. "Queríamos mostrar que el arte contemporáneo del sur no es una sola voz, sino un coro de perspectivas que dialogan entre sí y con el mundo", explicó durante la inauguración.</p><p>Entre las obras destacadas se encuentran instalaciones interactivas, video-arte, pintura de gran formato y esculturas que utilizan materiales reciclados. La pieza central, un mural colectivo de 30 metros, fue creado durante tres días por los artistas en vivo, con la participación del público.</p><p>La exposición permanecerá abierta hasta finales de año, con un programa de visitas guiadas, talleres para escolares y conferencias con los artistas cada jueves.</p>',
  'Cultura',
  'Lucía Vega',
  'https://images.pexels.com/photos/1671016/pexels-photo-1671016.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  false,
  NOW() - INTERVAL '1 day'
),
(
  'Sequía histórica afecta a comunidades rurales del norte del país',
  'sequia-historica-comunidades-rurales',
  'Las lluvias no llegan desde hace ocho meses y los reservorios están al 20% de su capacidad.',
  '<p>Las comunidades rurales del norte del país enfrentan la peor sequía de los últimos cuarenta años. Los reservorios de agua están al 20% de su capacidad y los cultivos de secano se han perdido casi en su totalidad.</p><p>Más de 15.000 familias han solicitado asistencia gubernamental de emergencia. El gobierno ha declarado zona de catástrofe agrícola a tres provincias, lo que libera fondos de ayuda y facilidades crediticias para los productores afectados.</p><p>"Mi familia ha trabajado esta tierra por cuatro generaciones y nunca habíamos visto algo así. Si no llueve pronto, no sabemos qué va a pasar con el ganado", cuenta don José Aramburu, un productor de 68 años.</p><p>Los meteorólogos prevén que las lluvias podrían llegar en las próximas semanas, pero advierten de que el déficit acumulado es tan grande que la recuperación será lenta y difícil.</p>',
  'Medio Ambiente',
  'María González',
  'https://images.pexels.com/photos/35279538/pexels-photo-35279538.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  false,
  NOW() - INTERVAL '2 days'
),
(
  'Nueva plataforma digital conecta a productores locales con consumidores urbanos',
  'plataforma-digital-productores-locales',
  'La aplicación permite comprar directamente de pequeños productores, eliminando intermediarios y mejorando los márgenes.',
  '<p>Un grupo de jóvenes emprendedores ha lanzado una plataforma digital que conecta directamente a pequeños productores rurales con consumidores de las grandes ciudades. La aplicación, llamada "Del Campo", ya cuenta con 3.000 productores registrados y más de 50.000 usuarios activos.</p><p>El modelo elimina hasta cuatro eslabones de intermediación, lo que permite a los productores aumentar sus ingresos entre un 30% y un 50%, mientras los consumidores acceden a productos frescos a precios hasta un 20% menores que en los supermercados.</p><p>"La idea nació cuando vimos que los productores de mi pueblo vendían sus tomates a 200 pesos el kilo y en la ciudad costaban 1.500. Alguien se estaba quedando con la diferencia y no eran ni el productor ni el consumidor", explica Felipe Contreras, cofundador de la startup.</p><p>La plataforma ha recibido una ronda de inversión de 2 millones de dólares y planea expandirse a tres países vecinos en los próximos meses.</p>',
  'Tecnología',
  'Ana Torres',
  'https://images.pexels.com/photos/12939552/pexels-photo-12939552.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  false,
  NOW() - INTERVAL '2 days'
),
(
  'Reforma educativa propone enseñanza bilingüe obligatoria desde primaria',
  'reforma-educativa-bilingue-primaria',
  'El proyecto de ley busca que todos los estudiantes del sector público aprendan un segundo idioma desde los seis años.',
  '<p>El Ministerio de Educación presentó un proyecto de reforma que haría obligatoria la enseñanza bilingüe desde el primer año de primaria. La iniciativa contempla la contratación de 5.000 nuevos docentes y la creación de un programa de capacitación para los maestros en ejercicio.</p><p>La ministra de Educación, Gabriela Soto, defendió la propuesta señalando que "el dominio de un segundo idioma ya no es un lujo, es una herramienta esencial para la vida profesional y personal en un mundo globalizado".</p><p>La reforma ha generado debate entre los especialistas. Mientras algunos celebran la medida como un paso hacia la equidad, otros advierten que sin la infraestructura adecuada podría convertirse en una imposición sin resultados reales. La asociación de profesores ha pedido garantías de que los maestros recibirán la formación necesaria antes de la implementación.</p><p>El plan piloto comenzaría en 50 escuelas el próximo año lectivo, con una extensión gradual al resto del país en cuatro años.</p>',
  'Política',
  'Roberto Méndez',
  'https://images.pexels.com/photos/14128895/pexels-photo-14128895.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  false,
  NOW() - INTERVAL '3 days'
),
(
  'El fútbol femenino vive su mejor momento con cifras récord de audiencia',
  'futbol-femenino-audiencia-record',
  'La liga femenina ha triplicado sus espectadores en estadios y duplicado la audiencia televisiva en una sola temporada.',
  '<p>La liga femenina de fútbol ha cerrado su temporada más exitosa, con cifras que triplican los espectadores en estadios y duplican la audiencia televisiva respecto al año anterior. El partido final, disputado ante 35.000 personas, fue el evento deportivo más visto de la jornada.</p><p>La capitana del equipo campeón, Valentina Cruz, destacó el crecimiento del deporte: "Hace cinco años jugábamos ante familiares y amigos. Hoy llenamos estadios. El cambio es real y no tiene marcha atrás."</p><p>Los clubes han incrementado sus inversiones en las categorías femeninas, con salarios profesionales y contratos de patrocinio que el año pasado eran impensables. Tres jugadoras han sido fichadas por clubes europeos en los últimos meses.</p><p>La federación anunció que la próxima temporada contará con dos equipos más, ampliando la liga a 14 clubes, y que se negociará un nuevo contrato de televisión que refleje el crecimiento de la audiencia.</p>',
  'Deportes',
  'Diego Fernández',
  'https://images.pexels.com/photos/1884576/pexels-photo-1884576.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  false,
  NOW() - INTERVAL '3 days'
),
(
  'Santiago lidera el ranking de ciudades con mejor calidad de vida de la región',
  'santiago-calidad-vida-ranking',
  'El informe anual ubica a la capital en el primer puesto regional y entre las 50 mejores del mundo.',
  '<p>Santiago ha sido elegida como la ciudad con mejor calidad de vida de la región en el informe anual del Instituto Internacional de Desarrollo Urbano. La capital subió doce puestos respecto al año anterior y se sitúa entre las 50 mejores del mundo por primera vez en su historia.</p><p>El informe destaca la expansión del transporte público, con la nueva red de metro que conecta zonas periféricas antes desatendidas, y la creación de 200 hectáreas de áreas verdes en los últimos tres años. También valora el crecimiento económico sostenido y la mejora en los indicadores de seguridad ciudadana.</p><p>Sin embargo, el estudio también señala desafíos pendientes: la contaminación atmosférica en invierno, la desigualdad entre comunas y el costo de la vivienda, que ha aumentado un 40% en cinco años, dificultando el acceso de las familias jóvenes a la propiedad.</p><p>El alcalde anunció que los resultados "refuerzan el compromiso de seguir invirtiendo en infraestructura verde, movilidad sostenible y vivienda asequible para que la mejora sea para todos los vecinos, no solo para algunos".</p>',
  'Economía',
  'Javier Ríos',
  'https://images.pexels.com/photos/37136626/pexels-photo-37136626.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  false,
  NOW() - INTERVAL '4 days'
),
(
  'Festival de cine independiente proyecta 80 películas de 25 países',
  'festival-cine-independiente-80-peliculas',
  'La edición número 18 del festival consolida a la ciudad como punto de encuentro del cine autoral latinoamericano.',
  '<p>El Festival de Cine Independiente del Sur abre sus puertas con una programación que incluye 80 películas de 25 países, consolidándose como uno de los puntos de encuentro más importantes del cine autoral latinoamericano. La inauguración será con una película de un director local que compitió en Cannes.</p><p>El director del festival, Tomás Aguirre, explicó que "el cine independiente del sur está viviendo un momento extraordinario. Nunca antes habíamos tenido tantas películas con tanta calidad y tanta diversidad de voces en una sola edición".</p><p>La programación incluye secciones competitivas, retrospectivas, cine al aire libre y actividades formativas con realizadores de todo el mundo. Se otorgarán premios en siete categorías, con un jurado internacional compuesto por directores, guionistas y críticos de prestigio.</p><p>Las entradas para las funciones de inauguración y clausura se agotaron en menos de 24 horas, pero el festival mantiene un sistema de entradas liberadas que se ponen a disposición media hora antes de cada función.</p>',
  'Cultura',
  'Lucía Vega',
  'https://images.pexels.com/photos/16813271/pexels-photo-16813271.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  false,
  NOW() - INTERVAL '4 days'
)
ON CONFLICT (slug) DO NOTHING;