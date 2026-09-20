# Noticias Viento Sur — Documentación y Guía de Usuario

## Índice

1. [Descripción General](#descripción-general)
2. [Características Principales](#características-principales)
3. [Estructura del Sitio](#estructura-del-sitio)
4. [Guía de Uso por Función](#guía-de-uso-por-función)
   - [Portada](#portada)
   - [Sección de Noticias Destacadas](#sección-de-noticias-destacadas)
   - [Cintillo de Última Hora](#cintillo-de-última-hora)
   - [Navegación por Categorías](#navegación-por-categorías)
   - [Buscador de Noticias](#buscador-de-noticias)
   - [Lectura de un Artículo](#lectura-de-un-artículo)
   - [Artículos Relacionados](#artículos-relacionados)
   - [Barra Lateral — Lo Más Leído](#barra-lateral--lo-más-leído)
   - [Barra Lateral — Boletín del Sur](#barra-lateral--boletín-del-sur)
   - [Enlaces Rápidos de Categorías](#enlaces-rápidos-de-categorías)
   - [Pie de Página](#pie-de-página)
5. [Categorías Disponibles](#categorías-disponibles)
6. [Diseño y Experiencia de Usuario](#diseño-y-experiencia-de-usuario)
7. [Tecnologías Utilizadas](#tecnologías-utilizadas)
8. [Preguntas Frecuentes](#preguntas-frecuentes)

---

## Descripción General

**Noticias Viento Sur** es un sitio web de noticias digitales enfocado en el sur del continente latinoamericano. Ofrece periodismo independiente con cobertura de política, tecnología, deportes, economía, cultura y medio ambiente. El sitio está diseñado como un periódico digital moderno, con una estética limpia y profesional inspirada en los mejores medios de comunicación en línea.

El sitio carga sus artículos desde una base de datos en tiempo real, lo que significa que el contenido se actualiza dinámicamente sin necesidad de recargar la página.

---

## Características Principales

| Característica | Descripción |
|---|---|
| **Portada dinámica** | Muestra noticias destacadas con imágenes a gran escala y un listado de últimas noticias |
| **6 secciones temáticas** | Política, Tecnología, Deportes, Economía, Cultura y Medio Ambiente |
| **Buscador integrado** | Filtra noticias por título, autor, categoría o contenido |
| **Vista de artículo completo** | Cada noticia abre en su propia página con foto, contenido y relacionados |
| **Cintillo de última hora** | Barra animada con los titulares más recientes en movimiento continuo |
| **Barra lateral con widgets** | "Lo más leído" y formulario de suscripción al boletín |
| **Diseño responsive** | Se adapta perfectamente a móviles, tablets y escritorio |
| **Navegación fluida** | Transiciones suaves entre páginas, scroll automático al cambiar de vista |
| **Manejo de errores** | Mensaje de error con botón de reintentar si falla la carga de datos |
| **12 artículos precargados** | Contenido editorial completo con fotos reales |

---

## Estructura del Sitio

```
Noticias Viento Sur
├── Encabezado
│   ├── Barra superior (fecha, edición digital, indicador EN VIVO)
│   ├── Logo "Viento Sur"
│   ├── Menú de navegación (Portada + 6 categorías)
│   └── Buscador
├── Cintillo de Última Hora (animado)
├── Contenido Principal
│   ├── [Portada] Sección destacada + Últimas noticias + Barra lateral
│   ├── [Categoría] Noticias filtradas por categoría + Barra lateral
│   ├── [Búsqueda] Resultados de búsqueda + Barra lateral
│   └── [Artículo] Artículo completo + Relacionados
├── Enlaces rápidos de categorías
└── Pie de página
    ├── Información del medio
    ├── Secciones
    ├── Enlaces informativos
    ├── Formulario de boletín
    └── Redes sociales
```

---

## Guía de Uso por Función

### Portada

**Qué es:** La página principal del sitio, lo primero que ve cualquier visitante.

**Cómo usarla:**
1. Al entrar al sitio, verás la portada automáticamente.
2. En la parte superior aparece la sección de noticias destacadas con una imagen grande a la izquierda y tres noticias secundarias a la derecha.
3. Debajo, bajo el título "Últimas noticias", se muestran todas las noticias no destacadas en una cuadrícula de tarjetas.
4. A la derecha de las últimas noticias, la barra lateral muestra "Lo más leído" y el formulario del boletín.
5. Para volver a la portada desde cualquier parte del sitio, haz clic en el logo "Viento Sur" en la esquina superior izquierda o en "Portada" en el menú de navegación.

---

### Sección de Noticias Destacadas

**Qué es:** El bloque superior de la portada con las noticias más importantes del momento.

**Cómo usarla:**
1. La noticia principal ocupa dos tercios del ancho con una imagen grande, su categoría, título, resumen, autor y tiempo de publicación.
2. A la derecha aparecen tres noticias secundarias con miniatura de imagen, categoría, título y tiempo.
3. Haz clic en cualquier noticia destacada (la principal o las laterales) para abrir el artículo completo.

**Nota:** Las noticias destacadas se identifican en la base de datos con la etiqueta "featured" y se muestran automáticamente en esta sección.

---

### Cintillo de Última Hora

**Qué es:** Una barra verde debajo del encabezado que desplaza los titulares más recientes de forma continua.

**Cómo usarla:**
1. Los titulares se mueven de derecha a izquierda automáticamente.
2. Si pasas el cursor del ratón sobre la barra, el movimiento se detiene para que puedas leer con calma.
3. El cintillo solo aparece en la portada, en las páginas de categoría y en los resultados de búsqueda; no se muestra cuando estás leyendo un artículo individual.

---

### Navegación por Categorías

**Qué es:** El sistema para filtrar noticias por tema.

**Cómo usarla:**
1. En el menú de navegación del encabezado (barra blanca superior), verás los botones de cada categoría: Política, Tecnología, Deportes, Economía, Cultura y Medio Ambiente.
2. Haz clic en cualquiera de ellas para ver solo las noticias de esa categoría.
3. La página mostrará el nombre de la categoría como título y debajo las tarjetas de noticias correspondientes.
4. También encontrarás botones de acceso rápido a las categorías al final del contenido, antes del pie de página, en forma de píldoras redondeadas.
5. En el pie de página, bajo "Secciones", también puedes acceder a cada categoría.

**En móvil:** El menú de navegación se oculta. Toca el icono de tres líneas (hamburguesa) en la esquina superior izquierda para desplegar el menú completo con todas las categorías.

---

### Buscador de Noticias

**Qué es:** Una herramienta para encontrar noticias por palabras clave.

**Cómo usarla:**
1. En el encabezado, verás un icono de lupa en la esquina superior derecha.
2. **En escritorio:** Haz clic en la lupa y se desplegará un campo de texto. Escribe tu búsqueda y presiona Enter o haz clic en la lupa nuevamente.
3. **En móvil:** Toca la lupa y aparecerá un campo de texto. Escribe y presiona Enter.
4. También puedes buscar desde el menú hamburguesa desplegable en móvil.
5. Los resultados mostrarán todas las noticias que contengan tu palabra en el título, el resumen, el nombre del autor o la categoría.
6. Si no hay resultados, verás un mensaje de "No se encontraron noticias".
7. La búsqueda no distingue mayúsculas de minúsculas.

---

### Lectura de un Artículo

**Qué es:** La vista completa de una noticia individual.

**Cómo usarla:**
1. Haz clic en cualquier noticia (destacada, tarjeta, o en la barra lateral) para abrirla.
2. Verás:
   - Un botón "Volver a noticias" en la parte superior para regresar.
   - La etiqueta de categoría en verde.
   - El título completo en grande.
   - Un resumen del artículo.
   - La información del autor (con inicial en un círculo), la fecha de publicación y el tiempo relativo ("hace X horas").
   - Botones para compartir e imprimir en la esquina derecha.
   - La imagen principal del artículo a gran tamaño.
   - El contenido completo del artículo en párrafos.
3. Al terminar de leer, haz clic en "Volver a noticias" para regresar a la portada.

---

### Artículos Relacionados

**Qué es:** Tres noticias sugeridas de la misma categoría que aparecen al final de cada artículo.

**Cómo usarla:**
1. Después del contenido del artículo, verás una sección titulada "Relacionados".
2. Se muestran tres tarjetas con miniatura, categoría y título de noticias de la misma sección.
3. Haz clic en cualquiera para leerla. La página hará scroll automático hacia arriba y cargará el nuevo artículo.

---

### Barra Lateral — Lo Más Leído

**Qué es:** Un widget que muestra las cinco noticias más populares del momento.

**Cómo usarla:**
1. En la barra lateral derecha (en escritorio) o debajo del contenido principal (en móvil), verás el bloque "Lo más leído" con un icono de tendencia.
2. Cada noticia aparece numerada del 1 al 5 con un número grande en verde.
3. Cada elemento muestra el título y el tiempo de publicación.
4. Haz clic en cualquier título para abrir el artículo completo.
5. La selección de noticias destacadas se actualiza dinámicamente cada vez que cargas la página.

---

### Barra Lateral — Boletín del Sur

**Qué es:** Un formulario de suscripción al boletín electrónico del medio.

**Cómo usarla:**
1. Debajo de "Lo más leído", verás un bloque oscuro titulado "El Boletín del Sur".
2. Introduce tu correo electrónico en el campo de texto.
3. Haz clic en el botón "Suscribirme gratis".
4. Verás la nota "Sin spam. Cancela cuando quieras." debajo del botón.

**Nota:** El formulario está preparado visualmente. Para activar el envío real de correos, se necesita conectar un servicio de email.

---

### Enlaces Rápidos de Categorías

**Qué es:** Botones redondeados al final del contenido para cambiar rápidamente de sección.

**Cómo usarla:**
1. Antes del pie de página, verás seis botones con el nombre de cada categoría.
2. Haz clic en cualquiera para filtrar las noticias por esa sección.
3. Estos botones aparecen en la portada, en las páginas de categoría y en los resultados de búsqueda, pero no en la vista de artículo individual.

---

### Pie de Página

**Qué es:** La sección inferior del sitio con enlaces, información y redes sociales.

**Cómo usarla:**
1. **Columna "Viento Sur":** Muestra el logo, una descripción del medio y los iconos de redes sociales (Facebook, Twitter, Instagram, YouTube). Pasa el cursor sobre un icono para ver el efecto hover.
2. **Columna "Secciones":** Lista de enlaces a la portada y a cada una de las seis categorías.
3. **Columna "Información":** Enlaces a páginas informativas (Sobre nosotros, Equipo editorial, Contacto, Publicidad, Trabaja con nosotros).
4. **Columna "Boletín":** Un segundo formulario de suscripción al boletín con un campo de email y un botón de envío.
5. En la parte inferior del pie de página, verás el año y los derechos reservados, junto con enlaces a Términos, Privacidad y Cookies.

---

## Categorías Disponibles

| Categoría | Cobertura |
|---|---|
| **Política** | Congreso, leyes, reformas, gobierno, elecciones |
| **Tecnología** | Inteligencia artificial, innovación, startups, digitalización |
| **Deportes** | Fútbol, selecciones nacionales, ligas, torneos |
| **Economía** | Mercados, inflación, finanzas, inversiones, empleo |
| **Cultura** | Arte, cine, exposiciones, festivales, literatura |
| **Medio Ambiente** | Cambio climático, sequía, energía renovable, conservación |

---

## Diseño y Experiencia de Usuario

### Paleta de Colores
- **Color principal:** Verde esmeralda (transmite frescura, naturaleza y el "viento sur")
- **Neutros:** Tonos piedra (stone) para fondos y texto
- **Acentos:** Blanco para tarjetas y secciones, negro para superposiciones de imágenes

### Tipografía
- **Titulares:** Fuente serif (Georgia/Cambria) para evocar la estética de un periódico tradicional
- **Cuerpo de texto:** Fuente sans-serif del sistema para máxima legibilidad

### Animaciones y Microinteracciones
- Las imágenes de las tarjetas se amplían ligeramente al pasar el cursor (efecto zoom)
- El encabezado se vuelve semi-transparente con desenfoque al hacer scroll
- El cintillo de última hora se detiene al pasar el cursor
- Las tarjetas se elevan con sombra al pasar el cursor
- Scroll suave al cambiar entre vistas
- Transiciones de color en botones y enlaces

### Responsive
- **Escritorio (1024px+):** Navegación completa visible, cuadrícula de 2 columnas para noticias, barra lateral fija
- **Tablet (640px–1023px):** Cuadrícula de 2 columnas, barra lateral debajo del contenido
- **Móvil (<640px):** Menú hamburguesa, una sola columna, barra lateral al final

---

## Tecnologías Utilizadas

| Tecnología | Función |
|---|---|
| **React + TypeScript** | Framework de la aplicación |
| **Vite** | Servidor de desarrollo y compilación |
| **Tailwind CSS** | Estilos y diseño responsive |
| **Supabase** | Base de datos para almacenar y recuperar artículos |
| **Lucide React** | Iconografía |
| **Pexels** | Imágenes de stock para los artículos |

---

## Preguntas Frecuentes

**¿Necesito una cuenta para leer las noticias?**
No. El sitio es de acceso libre. No requiere registro ni inicio de sesión.

**¿Las noticias se actualizan solas?**
Sí. Las noticias se cargan desde una base de datos cada vez que entras al sitio. Si se agregan nuevos artículos, aparecerán automáticamente.

**¿Puedo buscar noticias de una fecha específica?**
El buscador filtra por palabras clave en el título, resumen, autor y categoría. No tiene filtro por fecha en esta versión.

**¿El boletín funciona?**
El formulario del boletín está preparado visualmente. Para activar el envío real de correos electrónicos, es necesario conectar un servicio de email (como Mailchimp o SendGrid).

**¿Puedo compartir un artículo?**
La vista de artículo incluye un botón de compartir. La funcionalidad de compartir en redes sociales se puede activar conectándolo a las APIs correspondientes.

**¿Qué pasa si no carga el sitio?**
Si hay un problema de conexión con la base de datos, verás un mensaje de error con un botón "Reintentar". Haz clic en él para intentar cargar las noticias nuevamente.

**¿El sitio funciona en el móvil?**
Sí. El diseño se adapta a cualquier tamaño de pantalla. En móvil, el menú de navegación se convierte en un menú desplegable (hamburguesa) y todo el contenido se reorganiza en una sola columna.
