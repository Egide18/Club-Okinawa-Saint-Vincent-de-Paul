import { NextRequest, NextResponse } from 'next/server';
import { getInscriptionByCode } from '@/lib/store';

/**
 * Fiche publique de pré-inscription, accessible uniquement via le code
 * à 8 caractères (équivalent d'un mot de passe de consultation).
 * Les métadonnées techniques (IP…) ne sont jamais exposées.
 */
export async function GET(_req: NextRequest, { params }: { params: { code: string } }) {
  const ins = await getInscriptionByCode(params.code || '');
  if (!ins) {
    return NextResponse.json({ error: 'Code introuvable. Vérifiez les 8 caractères et réessayez.' }, { status: 404 });
  }
  return NextResponse.json({
    fiche: {
      code: ins.code,
      nom: ins.nom,
      postnom: ins.postnom || '',
      prenom: ins.prenom,
      dateNaissance: ins.dateNaissance,
      age: ins.age,
      isMinor: ins.age < 18,
      responsable: ins.responsable || null,
      urgence: ins.urgence || null,
      photo: ins.photo || null,
      status: ins.status,
      createdAt: ins.createdAt,
    },
  });
}
