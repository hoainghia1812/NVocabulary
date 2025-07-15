export interface VocabularySet {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface VocabularyItem {
  id: string;
  set_id: string;
  english: string;
  vietnamese: string;
  phonetic?: string | null;
  type?: string | null;
  example?: string | null;
  synonyms?: string | null;
  audio_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface StudyProgress {
  id: string;
  user_id: string;
  item_id: string;
  last_reviewed: string;
  correct_count: number;
  incorrect_count: number;
}

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface CreateVocabularySetData {
  name: string;
  description?: string;
  is_public?: boolean;
}

export interface CreateVocabularyItemData {
  set_id: string;
  english: string;
  vietnamese: string;
  phonetic?: string;
  type?: string;
  example?: string;
  synonyms?: string;
  audio_url?: string;
}

export interface UpdateVocabularyItemData {
  english?: string;
  vietnamese?: string;
  phonetic?: string;
  type?: string;
  example?: string;
  synonyms?: string;
  audio_url?: string;
} 