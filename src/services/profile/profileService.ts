import { updateProfile, type User } from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db } from '../firebase/firestore';
import { storage } from '../firebase/storage';

export async function uploadAvatar(
  userId: string,
  uri: string,
  onProgress: (progress: number) => void
): Promise<string> {
  const storageRef = ref(storage, `avatars/${userId}/${Date.now()}.jpg`);
  const blob = await fetch(uri).then((res) => res.blob());

  return new Promise((resolve, reject) => {
    const task = uploadBytesResumable(storageRef, blob);
    task.on(
      'state_changed',
      (snapshot) => {
        const progress = snapshot.totalBytes
          ? Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
          : 0;
        onProgress(progress);
      },
      reject,
      async () => {
        resolve(await getDownloadURL(task.snapshot.ref));
      }
    );
  });
}

export async function saveUserProfile(user: User, payload: { displayName: string; photoURL?: string | null }) {
  await updateProfile(user, {
    displayName: payload.displayName,
    photoURL: payload.photoURL ?? user.photoURL,
  });

  await setDoc(
    doc(db, 'users', user.uid),
    {
      displayName: payload.displayName,
      photoURL: payload.photoURL ?? user.photoURL ?? null,
      email: user.email ?? null,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}
