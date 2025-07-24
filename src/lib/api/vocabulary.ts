import { supabase } from '../supabase/client'
import type { 
  VocabularySet, 
  VocabularyItem, 
  CreateVocabularySetData, 
  CreateVocabularyItemData,
  UpdateVocabularyItemData 
} from '../types'

// Vocabulary Sets API
export async function getVocabularySets(userId?: string) {
  let query = supabase
    .from('vocabulary_sets')
    .select('*')
    .order('created_at', { ascending: false })

  if (userId) {
    query = query.eq('user_id', userId)
  }

  const { data, error } = await query
  if (error) throw error
  return data as VocabularySet[]
}

export async function getVocabularySet(id: string) {
  const { data, error } = await supabase
    .from('vocabulary_sets')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as VocabularySet
}

export async function createVocabularySet(setData: CreateVocabularySetData) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('vocabulary_sets')
    .insert({
      ...setData,
      user_id: user.id
    })
    .select()
    .single()

  if (error) throw error
  return data as VocabularySet
}

export async function updateVocabularySet(id: string, setData: Partial<CreateVocabularySetData>) {
  const { data, error } = await supabase
    .from('vocabulary_sets')
    .update(setData)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as VocabularySet
}

export async function deleteVocabularySet(id: string) {
  const { error } = await supabase
    .from('vocabulary_sets')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Vocabulary Items API
export async function getVocabularyItems(setId: string) {
  const { data, error } = await supabase
    .from('vocabulary_items')
    .select('*')
    .eq('set_id', setId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as VocabularyItem[]
}

export async function getVocabularyItem(id: string) {
  const { data, error } = await supabase
    .from('vocabulary_items')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as VocabularyItem
}

export async function createVocabularyItem(itemData: CreateVocabularyItemData) {
  const { data, error } = await supabase
    .from('vocabulary_items')
    .insert(itemData)
    .select()
    .single()

  if (error) throw error
  return data as VocabularyItem
}

export async function updateVocabularyItem(id: string, itemData: UpdateVocabularyItemData) {
  const { data, error } = await supabase
    .from('vocabulary_items')
    .update(itemData)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as VocabularyItem
}

export async function deleteVocabularyItem(id: string) {
  const { error } = await supabase
    .from('vocabulary_items')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Batch operations
export async function createVocabularyItems(items: CreateVocabularyItemData[]) {
  const { data, error } = await supabase
    .from('vocabulary_items')
    .insert(items)
    .select()

  if (error) throw error
  return data as VocabularyItem[]
}

// Create vocabulary set with items in one transaction
export async function createVocabularySetWithItems(
  setData: CreateVocabularySetData, 
  items: Omit<CreateVocabularyItemData, 'set_id'>[]
) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  // Create the set first
  const { data: newSet, error: setError } = await supabase
    .from('vocabulary_sets')
    .insert({
      ...setData,
      user_id: user.id
    })
    .select()
    .single()

  if (setError) throw setError

  // If there are items, create them
  if (items.length > 0) {
    const itemsToCreate: CreateVocabularyItemData[] = items.map(item => ({
      ...item,
      set_id: newSet.id
    }))

    const { error: itemsError } = await supabase
      .from('vocabulary_items')
      .insert(itemsToCreate)

    if (itemsError) {
      // If items creation fails, delete the set to maintain consistency
      await supabase.from('vocabulary_sets').delete().eq('id', newSet.id)
      throw itemsError
    }
  }

  return newSet as VocabularySet
}

// Public vocabulary sets
export async function getPublicVocabularySets() {
  const { data, error } = await supabase
    .from('vocabulary_sets')
    .select('*')
    .eq('is_public', true)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as VocabularySet[]
} 

// Get all vocabulary items from all user's sets
export async function getAllUserVocabularyItems() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('vocabulary_items')
    .select(`
      *,
      vocabulary_sets!inner(user_id)
    `)
    .eq('vocabulary_sets.user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as VocabularyItem[]
} 