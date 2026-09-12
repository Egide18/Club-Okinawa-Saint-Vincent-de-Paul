'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Printer, Download, Loader2, AlertTriangle, ArrowLeft, Search } from 'lucide-react';
import FichePreinscription, { type FicheData } from '@/components/FichePreinscription';

export default function FichePage() {
  const params = useParams();
  const router = useRouter();
  const code = String(params.code || '').toUpperCase();
  const [fiche, setFiche] = useState<FicheData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);
  const [lookup, setLookup] = useState('');
  const sheetWrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/pre-inscriptions/${encodeURIComponent(code)}`, { cache: 'no-store' });
        const data = await res.json();
        if (cancelled) return;
        if (res.ok) setFiche(data.fiche);
        else setError(data.error || 'Fiche introuvable.');
      } catch {
        if (!cancelled) setError('Erreur réseau. Vérifiez votre connexion.');
      }
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [code]);

  const downloadPdf = useCallback(async () => {
    const el = document.getElementById('fiche-print');
    if (!el) return;
    setExporting(true);
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);
      const canvas = await html2canvas(el, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
      });
      const img = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageW = 210;
      const pageH = 297;
      const imgH = (canvas.height * pageW) / canvas.width;
      // Si la fiche dépasse une page, on la réduit pour tenir sur une seule page A4.
      const ratio = imgH > pageH ? pageH / imgH : 1;
      pdf.addImage(img, 'PNG', 0, 0, pageW * ratio, imgH * ratio);
      pdf.save(`fiche-pre-inscription-${code}.pdf`);
    } catch (e) {
      console.error('[pdf]', e);
      alert('Export PDF impossible pour le moment. Utilisez le bouton Imprimer puis « Enregistrer au format PDF ».');
    }
    setExporting(false);
  }, [code]);

  return (
    <div className="min-h-screen bg-stone-200 pb-16 pt-24 sm:pt-28">
      {/* Barre d'outils */}
      <div className="print-hidden mx-auto mb-6 flex max-w-[210mm] flex-wrap items-center justify-between gap-3 px-4">
        <button
          onClick={() => router.push('/pre-inscription')}
          className="inline-flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 shadow-sm transition hover:bg-stone-50"
        >
          <ArrowLeft className="h-4 w-4" /> Retour
        </button>
        {fiche && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-bold text-white shadow transition hover:bg-stone-700"
            >
              <Printer className="h-4 w-4" /> Imprimer
            </button>
            <button
              onClick={downloadPdf}
              disabled={exporting}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-bold text-white shadow transition hover:bg-blue-600 disabled:opacity-60"
            >
              {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              {exporting ? 'Génération…' : 'Télécharger en PDF'}
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="mx-auto flex max-w-[210mm] flex-col items-center gap-3 px-4 py-24 text-stone-500">
          <Loader2 className="h-10 w-10 animate-spin text-blue-700" />
          <p className="text-sm font-medium">Chargement de votre fiche…</p>
        </div>
      ) : error || !fiche ? (
        <div className="mx-auto max-w-md px-4">
          <div className="rounded-2xl border border-red-200 bg-white p-8 text-center shadow">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
            <h1 className="mt-3 text-xl font-bold text-stone-900">Fiche introuvable</h1>
            <p className="mt-1 text-sm text-stone-500">{error}</p>
            <form
              className="mt-5 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (lookup.trim()) router.push(`/pre-inscription/${lookup.trim().toUpperCase()}`);
              }}
            >
              <input
                value={lookup}
                onChange={(e) => setLookup(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8))}
                placeholder="Code à 8 caractères"
                className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-center font-mono text-lg font-bold tracking-[0.2em] text-stone-900 outline-none focus:border-blue-600"
                maxLength={8}
              />
              <button className="rounded-xl bg-blue-700 px-4 text-white hover:bg-blue-600" aria-label="Rechercher">
                <Search className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div ref={sheetWrap} className="px-2 sm:px-4">
          <FichePreinscription fiche={fiche} />
        </div>
      )}

      <p className="print-hidden mx-auto mt-6 max-w-[210mm] px-4 text-center text-xs text-stone-500">
        Astuce : le bouton « Imprimer » permet aussi d’enregistrer la fiche au format PDF depuis la boîte de dialogue
        d’impression.
      </p>
    </div>
  );
}
