import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import {
  addInscription,
  generatePreCode,
  isPreCodeTaken,
  listInscriptions,
  newId,
  type ContactIdentite,
  type Inscription,
} from '@/lib/store';
import { saveFile } from '@/lib/blob';
import { copyInscriptionToFirebase } from '@/lib/firebase';
import { getClientIp, parseUserAgent } from '@/lib/device';
import {
  ageFromBirthdate,
  checkPhotoFile,
  isPhone,
  sanitizeText,
} from '@/lib/validation';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  const items = await listInscriptions();
  return NextResponse.json({ items });
}

/** Soumission publique d'une PRÉ-INSCRIPTION (multipart). */
export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const get = (k: string, max = 300) => sanitizeText(form.get(k), max);

    const nom = get('nom', 80);
    const postnom = get('postnom', 80);
    const prenom = get('prenom', 80);
    const dateNaissance = get('dateNaissance', 20);
    const consent = form.get('consentRgpd') === 'on' || form.get('consentRgpd') === 'true';

    const errors: string[] = [];
    if (!nom) errors.push('Le nom du candidat est requis.');
    if (!prenom) errors.push('Le prénom du candidat est requis.');
    if (!dateNaissance) errors.push('La date de naissance est requise.');
    if (!consent) errors.push('Le consentement RGPD est obligatoire.');

    // Vérification de l'âge
    const age = ageFromBirthdate(dateNaissance);
    if (age === null) {
      errors.push('Date de naissance invalide.');
    } else {
      if (age < 7) errors.push('L’âge minimum pour la pré-inscription est de 7 ans.');
      if (age > 100) errors.push('Date de naissance invraisemblable, veuillez la vérifier.');
      if (new Date(dateNaissance) > new Date()) errors.push('La date de naissance ne peut pas être dans le futur.');
    }

    const isMinor = age !== null && age < 18;

    // Identité conditionnelle : responsable (mineur) OU urgence (majeur)
    const contactOf = (prefix: string): ContactIdentite => ({
      nom: get(`${prefix}Nom`, 80),
      prenom: get(`${prefix}Prenom`, 80),
      adresse: get(`${prefix}Adresse`, 300),
      telephone: get(`${prefix}Telephone`, 30),
    });

    let responsable: ContactIdentite | undefined;
    let urgence: ContactIdentite | undefined;

    if (age !== null) {
      if (isMinor) {
        responsable = contactOf('resp');
        if (!responsable.nom) errors.push('Nom du responsable requis (candidat mineur).');
        if (!responsable.prenom) errors.push('Prénom du responsable requis (candidat mineur).');
        if (!responsable.adresse) errors.push('Adresse du responsable requise (candidat mineur).');
        if (!isPhone(responsable.telephone)) errors.push('Numéro de téléphone du responsable invalide.');
      } else {
        urgence = contactOf('urg');
        if (!urgence.nom) errors.push('Nom de la personne à contacter en cas d’urgence requis.');
        if (!urgence.prenom) errors.push('Prénom de la personne à contacter en cas d’urgence requis.');
        if (!urgence.adresse) errors.push('Adresse de la personne à contacter en cas d’urgence requise.');
        if (!isPhone(urgence.telephone)) errors.push('Numéro de téléphone du contact d’urgence invalide.');
      }
    }

    // Photo du candidat
    let photo: string | undefined;
    let photoName: string | undefined;
    const f = form.get('photo');
    if (f && typeof f !== 'string' && f.size > 0) {
      const check = checkPhotoFile(f);
      if (!check.ok) {
        errors.push(check.error!);
      } else {
        photo = await saveFile('pre-inscriptions', f);
        photoName = f.name.slice(0, 120);
      }
    } else {
      errors.push('La photo du candidat est requise (JPG, JPEG ou PNG, max 5 Mo).');
    }

    if (errors.length > 0) {
      return NextResponse.json({ error: 'Veuillez vérifier les champs manquants.', details: errors }, { status: 400 });
    }

    // Code unique à 8 caractères
    let code = generatePreCode();
    for (let i = 0; i < 10 && (await isPreCodeTaken(code)); i++) {
      code = generatePreCode();
    }

    const device = parseUserAgent(req.headers.get('user-agent'));
    const ins: Inscription = {
      id: newId('pre-'),
      code,
      type: 'pre-inscription',
      nom,
      postnom: postnom || undefined,
      prenom,
      dateNaissance,
      age: age!,
      responsable,
      urgence,
      photo,
      photoName,
      status: 'en_attente',
      consentRgpd: true,
      createdAt: new Date().toISOString(),
      deviceType: device.deviceType,
      phoneModel: device.phoneModel,
      ip: getClientIp(req.headers),
    };

    await addInscription(ins);

    // Copie cloud Firebase (best-effort)
    await copyInscriptionToFirebase(ins);

    return NextResponse.json(
      { ok: true, id: ins.id, code, message: 'Pré-inscription enregistrée ! Conservez précieusement votre code.' },
      { status: 201 }
    );
  } catch (e) {
    console.error('[pre-inscriptions POST]', e);
    return NextResponse.json({ error: 'Erreur serveur. Réessayez plus tard.' }, { status: 500 });
  }
}
