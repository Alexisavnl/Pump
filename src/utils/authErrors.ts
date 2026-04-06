const ERROR_MESSAGES: Record<string, string> = {
  'auth/invalid-credential': 'Email ou mot de passe incorrect',
  'auth/email-already-in-use': 'Un compte existe déjà avec cet email',
  'auth/weak-password': 'Le mot de passe doit faire au moins 6 caractères',
  'auth/invalid-email': 'Adresse email invalide',
  'auth/network-request-failed': 'Vérifiez votre connexion internet',
  'auth/too-many-requests': 'Trop de tentatives, réessayez plus tard',
  'auth/user-not-found': 'Email ou mot de passe incorrect',
  'auth/wrong-password': 'Email ou mot de passe incorrect',
  'auth/popup-closed-by-user': '',
};

export function getAuthErrorMessage(code: string): string {
  return ERROR_MESSAGES[code] ?? 'Une erreur est survenue';
}
