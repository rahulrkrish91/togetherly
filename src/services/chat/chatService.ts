import {
  addDoc,
  collection,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  startAfter,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import {
  getDownloadURL,
  ref,
  uploadBytesResumable,
  type UploadTask,
  type UploadTaskSnapshot,
} from 'firebase/storage';
import { db } from '../firebase/firestore';
import { storage } from '../firebase/storage';

export type ChatMessageType = 'text' | 'image' | 'video';

export interface ChatMessage {
  id: string;
  familyId: string;
  senderId: string;
  senderLabel?: string;
  type: ChatMessageType;
  text?: string | null;
  mediaUrl?: string | null;
  uploadStatus?: 'pending' | 'uploaded' | 'failed';
  createdAt?: unknown;
}

const PAGE_SIZE = 20;

export function subscribeLatestMessages(
  familyId: string,
  onChange: (messages: ChatMessage[], lastVisible: QueryDocumentSnapshot<DocumentData> | null) => void,
  onError: (error: Error) => void
) {
  const q = query(
    collection(db, 'messages'),
    where('familyId', '==', familyId),
    orderBy('createdAt', 'desc'),
    limit(PAGE_SIZE)
  );

  return onSnapshot(
    q,
    (snap) => {
      const messages = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ChatMessage, 'id'>) }));
      onChange(messages, snap.docs[snap.docs.length - 1] ?? null);
    },
    (e) => onError(e as Error)
  );
}

export async function loadOlderMessages(
  familyId: string,
  cursor: QueryDocumentSnapshot<DocumentData> | null
) {
  if (!cursor) return { items: [] as ChatMessage[], nextCursor: null };

  const q = query(
    collection(db, 'messages'),
    where('familyId', '==', familyId),
    orderBy('createdAt', 'desc'),
    startAfter(cursor),
    limit(PAGE_SIZE)
  );

  const snap = await getDocs(q);
  return {
    items: snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ChatMessage, 'id'>) })),
    nextCursor: snap.docs[snap.docs.length - 1] ?? null,
  };
}

export async function sendTextMessage(params: {
  familyId: string;
  senderId: string;
  senderLabel: string;
  text: string;
}) {
  await addDoc(collection(db, 'messages'), {
    familyId: params.familyId,
    senderId: params.senderId,
    senderLabel: params.senderLabel,
    type: 'text',
    text: params.text,
    mediaUrl: null,
    uploadStatus: 'uploaded',
    createdAt: serverTimestamp(),
  });
}

export function uploadMediaWithProgress(
  uri: string,
  filePath: string,
  onProgress: (progress: number) => void,
  onError: (error: Error) => void,
  onComplete: (url: string) => void
) {
  const storageRef = ref(storage, filePath);

  fetch(uri)
    .then((res) => res.blob())
    .then((blob) => {
      const uploadTask: UploadTask = uploadBytesResumable(storageRef, blob);
      uploadTask.on(
        'state_changed',
        (snapshot: UploadTaskSnapshot) => {
          const progress = snapshot.totalBytes
            ? Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
            : 0;
          onProgress(progress);
        },
        (error) => onError(error as Error),
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          onComplete(url);
        }
      );
    })
    .catch((error) => onError(error as Error));
}

export async function sendMediaMessage(params: {
  familyId: string;
  senderId: string;
  senderLabel: string;
  type: 'image' | 'video';
  mediaUrl: string;
}) {
  await addDoc(collection(db, 'messages'), {
    familyId: params.familyId,
    senderId: params.senderId,
    senderLabel: params.senderLabel,
    type: params.type,
    text: null,
    mediaUrl: params.mediaUrl,
    uploadStatus: 'uploaded',
    createdAt: serverTimestamp(),
  });
}
