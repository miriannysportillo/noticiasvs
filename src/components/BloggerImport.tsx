import { useState, useRef } from 'react';
import { Upload, Loader2, CheckCircle, AlertCircle, FileUp, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { CATEGORIES } from '@/lib/categories';

type BloggerImportProps = {
  onClose: () => void;
  onImported: () => void;
};

type ParsedEntry = {
  title: string;
  content: string;
  author: string;
  publishedAt: string;
  labels: string[];
  slug: string;
  imageUrl: string;
  excerpt: string;
};

type ImportResult = {
  total: number;
  imported: number;
  skipped: number;
  errors: string[];
};

const DEFAULT_IMAGE = 'https://images.pexels.com/photos/9059257/pexels-photo-9059257.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

function stripHtml(html: string): string {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

function extractFirstImage(html: string): string {
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match ? match[1] : '';
}

function mapCategory(labels: string[]): string {
  for (const label of labels) {
    const lower = label.toLowerCase().trim();
    if (lower.includes('poli')) return 'Política';
    if (lower.includes('tecno')) return 'Tecnología';
    if (lower.includes('deport') || lower.includes('futbol') || lower.includes('deporte')) return 'Deportes';
    if (lower.includes('econo') || lower.includes('finan')) return 'Economía';
    if (lower.includes('cultura') || lower.includes('arte') || lower.includes('cine') || lower.includes('musica')) return 'Cultura';
    if (lower.includes('medio') || lower.includes('clima') || lower.includes('ambiente')) return 'Medio Ambiente';
  }
  return 'Cultura';
}

function parseBloggerXml(xmlText: string): ParsedEntry[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, 'text/xml');

  const parseError = doc.querySelector('parsererror');
  if (parseError) {
    throw new Error('El archivo no es un XML válido. Asegúrate de exportar desde Blogger en formato XML.');
  }

  const entries = Array.from(doc.querySelectorAll('entry'));
  const results: ParsedEntry[] = [];

  for (const entry of entries) {
    const titleEl = entry.querySelector('title');
    const contentEl = entry.querySelector('content');
    const publishedEl = entry.querySelector('published');
    const authorEl = entry.querySelector('author > name');

    const title = titleEl?.textContent?.trim() || '';
    if (!title) continue;

    const content = contentEl?.textContent?.trim() || '';
    if (!content) continue;

    const author = authorEl?.textContent?.trim() || 'Autor';
    const publishedAt = publishedEl?.textContent?.trim() || new Date().toISOString();

    const labels: string[] = [];
    entry.querySelectorAll('category').forEach((cat) => {
      const term = cat.getAttribute('term') || '';
      if (term && !term.startsWith('http') && term !== 'kind#post') {
        labels.push(term);
      }
    });

    const imageUrl = extractFirstImage(content) || DEFAULT_IMAGE;
    const excerpt = stripHtml(content).slice(0, 200).trim() + '...';
    const slug = slugify(title);

    results.push({ title, content, author, publishedAt, labels, slug, imageUrl, excerpt });
  }

  return results;
}

export default function BloggerImport({ onClose, onImported }: BloggerImportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [parsedEntries, setParsedEntries] = useState<ParsedEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [defaultCategory, setDefaultCategory] = useState<string>(CATEGORIES[0]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!selected.name.endsWith('.xml')) {
      setError('El archivo debe ser un XML exportado desde Blogger.');
      return;
    }

    setError(null);
    setFile(selected);
    setResult(null);
    setParsedEntries([]);

    setParsing(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string;
        const entries = parseBloggerXml(text);
        if (entries.length === 0) {
          setError('No se encontraron entradas en el archivo. Asegúrate de que sea una exportación de Blogger.');
        } else {
          setParsedEntries(entries);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo leer el archivo.');
      }
      setParsing(false);
    };
    reader.onerror = () => {
      setError('No se pudo leer el archivo.');
      setParsing(false);
    };
    reader.readAsText(selected);
  };

  const handleImport = async () => {
    if (parsedEntries.length === 0) return;

    setImporting(true);
    setError(null);

    const rows = parsedEntries.map((entry) => ({
      title: entry.title,
      slug: entry.slug,
      excerpt: entry.excerpt,
      content: entry.content,
      category: mapCategory(entry.labels) === 'Cultura' && entry.labels.length === 0 ? defaultCategory : mapCategory(entry.labels),
      author: entry.author,
      image_url: entry.imageUrl,
      featured: false,
      published_at: entry.publishedAt,
    }));

    const { error: insertError } = await supabase
      .from('articles')
      .upsert(rows, { onConflict: 'slug', ignoreDuplicates: true });

    if (insertError) {
      setError('No se pudo completar la importación. Verifica tu conexión e inténtalo de nuevo.');
    } else {
      const imported = rows.length;
      setResult({
        total: parsedEntries.length,
        imported,
        skipped: parsedEntries.length - imported,
        errors: [],
      });
      onImported();
    }

    setImporting(false);
  };

  const reset = () => {
    setFile(null);
    setParsedEntries([]);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <Upload size={20} className="text-emerald-600" />
            <h2 className="font-serif text-lg font-bold text-stone-900">Importar desde Blogger</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {error && (
            <div className="flex items-start gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {result ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 mx-auto bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle size={36} className="text-emerald-600" />
              </div>
              <h3 className="font-serif text-lg font-bold text-stone-900 mb-2">
                Importación completada
              </h3>
              <p className="text-sm text-stone-600 mb-4">
                Se importaron <strong>{result.imported}</strong> de <strong>{result.total}</strong> entradas.
                {result.skipped > 0 && ` ${result.skipped} ya existían y se omitieron.`}
              </p>
              <button
                onClick={() => {
                  reset();
                  onClose();
                }}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                Listo
              </button>
            </div>
          ) : (
            <>
              {/* Instructions */}
              <div className="bg-stone-50 border border-stone-200 rounded-lg p-4 text-sm text-stone-600 space-y-2">
                <p className="font-semibold text-stone-800">Cómo exportar tu blog de Blogger:</p>
                <ol className="list-decimal list-inside space-y-1 text-stone-600">
                  <li>Entra a Blogger.com y ve a tu blog</li>
                  <li>Ve a <strong>Configuración</strong> y busca la sección <strong>"Hacer copia de seguridad del contenido"</strong></li>
                  <li>Haz clic en <strong>"Descargar el blog"</strong> — se descargará un archivo XML</li>
                  <li>Sube ese archivo aquí abajo</li>
                </ol>
              </div>

              {/* File input */}
              {!parsedEntries.length && (
                <div>
                  <label
                    className="flex flex-col items-center justify-center border-2 border-dashed border-stone-300 rounded-xl py-10 cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/50 transition-colors"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xml"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    {parsing ? (
                      <div className="flex flex-col items-center gap-2 text-stone-500">
                        <Loader2 size={32} className="animate-spin text-emerald-600" />
                        <span className="text-sm">Leyendo archivo...</span>
                      </div>
                    ) : file ? (
                      <div className="flex flex-col items-center gap-2 text-emerald-600">
                        <FileUp size={32} />
                        <span className="text-sm font-medium">{file.name}</span>
                        <span className="text-xs text-stone-400">Cambia el archivo</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-stone-400">
                        <FileUp size={32} />
                        <span className="text-sm font-medium">Haz clic para seleccionar el XML</span>
                        <span className="text-xs">Archivo de exportación de Blogger (.xml)</span>
                      </div>
                    )}
                  </label>
                </div>
              )}

              {/* Preview */}
              {parsedEntries.length > 0 && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                      Categoría por defecto
                    </label>
                    <p className="text-xs text-stone-500 mb-2">
                      Se asigna a las entradas que no tengan etiquetas reconocibles en Blogger.
                    </p>
                    <select
                      value={defaultCategory}
                      onChange={(e) => setDefaultCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500 bg-white"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="border border-stone-200 rounded-lg overflow-hidden">
                    <div className="bg-stone-50 px-4 py-2 border-b border-stone-200 flex items-center justify-between">
                      <span className="text-sm font-semibold text-stone-700">
                        {parsedEntries.length} entradas encontradas
                      </span>
                      <button
                        onClick={reset}
                        className="text-xs text-stone-500 hover:text-red-600 transition-colors"
                      >
                        Cambiar archivo
                      </button>
                    </div>
                    <div className="max-h-48 overflow-y-auto divide-y divide-stone-100">
                      {parsedEntries.slice(0, 20).map((entry, i) => (
                        <div key={i} className="px-4 py-2.5 flex items-center gap-3">
                          <div className="w-10 h-10 flex-shrink-0 rounded overflow-hidden bg-stone-100">
                            <img src={entry.imageUrl} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-stone-800 line-clamp-1">{entry.title}</p>
                            <p className="text-xs text-stone-500">
                              {entry.author} · {new Date(entry.publishedAt).toLocaleDateString('es-ES')}
                            </p>
                          </div>
                          <span className="text-xs text-emerald-600 font-medium flex-shrink-0">
                            {mapCategory(entry.labels) === 'Cultura' && entry.labels.length === 0 ? defaultCategory : mapCategory(entry.labels)}
                          </span>
                        </div>
                      ))}
                      {parsedEntries.length > 20 && (
                        <div className="px-4 py-2 text-xs text-stone-400 text-center">
                          ...y {parsedEntries.length - 20} entradas más
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-stone-200">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleImport}
                  disabled={importing || parsedEntries.length === 0}
                  className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
                >
                  {importing ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                  Importar {parsedEntries.length > 0 ? `${parsedEntries.length} ` : ''}entradas
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
