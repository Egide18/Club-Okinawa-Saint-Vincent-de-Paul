import { redirect } from 'next/navigation';

/** Ancienne URL conservée pour compatibilité (favoris, liens externes). */
export default function InscriptionRedirect() {
  redirect('/pre-inscription');
}
