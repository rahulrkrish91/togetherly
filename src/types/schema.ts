export type FamilyRole = 'admin' | 'member';
export type MessageType = 'text' | 'image' | 'video' | 'audio';

export interface User {
  id: string;
  displayName: string;
  email: string;
  photoURL: string | null;
}

export interface FamilyMember {
  id: string;
  familyId: string;
  userId: string;
  role: FamilyRole;
}

export interface Message {
  id: string;
  familyId: string;
  senderId: string;
  type: MessageType;
  text: string | null;
  mediaUrl: string | null;
  createdAt: number;
}
