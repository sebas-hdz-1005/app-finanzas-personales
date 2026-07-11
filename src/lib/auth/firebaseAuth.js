/**
 * Autenticación con Firebase Authentication (email/contraseña).
 * Se importa dinámicamente sólo en modo firebase.
 */
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { getFirebase } from '@/lib/firebase/config';

function toPublicUser(u) {
  return u
    ? { uid: u.uid, email: u.email, displayName: u.displayName, photoURL: u.photoURL || null }
    : null;
}

export function onAuthChange(cb) {
  const { auth } = getFirebase();
  return onAuthStateChanged(auth, (u) => cb(toPublicUser(u)));
}

export function getCurrentUser() {
  const { auth } = getFirebase();
  return toPublicUser(auth.currentUser);
}

export async function signIn(email, password) {
  const { auth } = getFirebase();
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return toPublicUser(cred.user);
}

export async function signUp(name, email, password) {
  const { auth } = getFirebase();
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  if (name) await updateProfile(cred.user, { displayName: name });
  return toPublicUser(cred.user);
}

export async function signOutUser() {
  const { auth } = getFirebase();
  await signOut(auth);
}

export async function sendReset(email) {
  const { auth } = getFirebase();
  await sendPasswordResetEmail(auth, email);
  return true;
}
