import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { addInscription, listInscriptions, newId, type Inscription, type InscriptionFiles } from '@/lib/store';
import { saveFile } from '@/lib/blob';
import { copyInscriptionToFirebase } from '@/lib/firebase';
import { getClientIp, parseUserAgent } from '@/lib/device';
import {
  ageFromBirthdate,
  checkDocumentFile,
  isEmail,
  isPhone,
  sanitizeText,
} from '@/lib/validation';

const FILE_FIELDS = ['identite', 'lettreParents', 'photoPasseport', 'certificatMedical', 'preuvePaiement'] as const;

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  const items = await listInscriptions();
  return NextResponse.json({ items });
}

/** Soumission publique du dossier d'inscription (multipart). */
export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const get = (k: string, max = 300) => sanitizeText(form.get(k), max);

    const nom = get('nom', 80);
    const prenom = get('prenom', 80);
    const postnom = get('postnom', 80);
    const dateNaissance = get('dateNaissance', 20);
    const sexe = get('sexe', 2).toUpperCase();
    const adresse = get('adresse', 300);
    const telephone = get('telephone', 30);
    const email = get('email', 120);
    const nationalite = get('nationalite', 60);
    const categorie = get('categorie', 60);
    const niveau = get('niveau', 60);
    const consent = form.get('consentRgpd') === 'on' || form.get('consentRgpd') === 'true';

    const errors: string[] = [];
    if (!nom) errors.push('Le nom est requis.');
    if (!prenom) errors.push('Le prénom est requis.');
    if (!dateNaissance) errors.push('La date de naissance est requise.');
    if (sexe !== 'M' && sexe !== 'F') errors.push('Le sexe est requis.');
    if (!adresse) errors.push('L’adresse est requise.');
    if (!isPhone(telephone)) errors.push('Numéro de téléphone invalide.');
    if (email && !isEmail(email)) errors.push('Adresse e-mail invalide.');
    if (!categorie) errors.push('La catégorie (Karaté / Full Contact) est requise.');
    if (!consent) errors.push('Le consentement RGPD est obligatoire.');

    const age = ageFromBirthdate(dateNaissance);
    if (age === null) errors.push('Date de naissance invalide.');
    else if (age < 7) errors.push('L’âge minimum pour s’inscrire est de 7 ans.');

    const isMinor = age !== null && age < 18;
    const parentNom = get('parentNom', 120);
    const parentTelephone = get('parentTelephone', 30);
    const parentLien = get('parentLien', 60);
    if (isMinor) {
      if (!parentNom) errors.push('Nom du parent/tuteur requis pour les mineurs.');
      if (!isPhone(parentTelephone)) errors.push('Téléphone du parent/tuteur invalide.');
    }

    // Fichiers
    const files: InscriptionFiles = {};
    const fileNames: Record<string, string> = {};
    for (const field of FILE_FIELDS) {
      const f = form.get(field);
      if (f && typeof f !== 'string' && f.size > 0) {
        const check = checkDocumentFile(f);
        if (!check.ok) {
          errors.push(check.error!);
          continue;
        }
        const url = await saveFile('inscriptions', f);
        (files as Record<string, string>)[field] = url;
        fileNames[field] = f.name.slice(0, 120);
      }
    }
    if (!files.identite) errors.push('La pièce d’identité est requise (JPG/PNG/PDF, max 5 Mo).');
    if (!files.photoPasseport) errors.push('La photo passeport est requise (JPG/PNG/PDF, max 5 Mo).');
    if (!files.certificatMedical) errors.push('Le certificat médical est requis (JPG/PNG/PDF, max 5 Mo).');
    if (!files.preuvePaiement) errors.push('La preuve de paiement est requise (capture d’écran).');
    if (isMinor && !files.lettreParents) {
      errors.push('La lettre d’adhésion des parents est requise pour les mineurs (7–17 ans).');
    }

    if (errors.length > 0) {
      return NextResponse.json({ error: 'Veuillez vérifier les champs manquants.', details: errors }, { status: 400 });
    }

    const device = parseUserAgent(req.headers.get('user-agent'));
    const ins: Inscription = {
      id: newId('ins-'),
      nom,
      postnom: postnom || undefined,
      prenom,
      dateNaissance,
      age: age!,
      sexe: sexe as 'M' | 'F',
      nationalite: nationalite || undefined,
      adresse,
      telephone,
      email: email || undefined,
      parentNom: parentNom || undefined,
      parentTelephone: parentTelephone || undefined,
      parentLien: parentLien || undefined,
      categorie,
      niveau: niveau || undefined,
      antecedentsMedicaux: get('antecedentsMedicaux', 1000) || undefined,
      personneUrgence: get('personneUrgence', 120) || undefined,
      telUrgence: get('telUrgence', 30) || undefined,
      files,
      fileNames,
      status: 'en_attente',
      consentRgpd: true,
      createdAt: new Date().toISOString(),
      deviceType: device.deviceType,
      phoneModel: device.phoneModel,
      ip: getClientIp(req.headers),
    };

    await addInscription(ins);

    // Copie cloud Firebase (best-effort, n'invalide jamais l'inscription)
    const copied = await copyInscriptionToFirebase(ins);
    if (copied) {
      // marquer la copie (sans casser si échec)
      try {
        const { listInscriptions: _l } = await import('@/lib/store');
        void _l;
      } catch { /* ignore */ }
    }

    return NextResponse.json(
      { ok: true, id: ins.id, message: 'Inscription validée ! Votre dossier sera examiné par le club.' },
      { status: 201 }
    );
  } catch (e) {
    console.error('[inscriptions POST]', e);
    return NextResponse.json({ error: 'Erreur serveur. Réessayez plus tard.' }, { status: 500 });
  }
}
