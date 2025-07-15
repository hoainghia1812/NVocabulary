'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react"
import Link from "next/link"
import { 
  getVocabularySet, 
  getVocabularyItems, 
  updateVocabularySet,
  updateVocabularyItem,
  createVocabularyItem,
  deleteVocabularyItem
} from '@/lib/api/vocabulary'
import type { VocabularyItem, CreateVocabularyItemData, UpdateVocabularyItemData } from '@/lib/types'
import toast from 'react-hot-toast'

interface VocabularyItemForm extends Omit<VocabularyItem, 'created_at' | 'updated_at'> {
  isNew?: boolean
  toDelete?: boolean
}

export default function EditStudySetPage() {
  const params = useParams()
  const router = useRouter()
  const setId = params.id as string

  const [setData, setSetData] = useState({
    name: '',
    description: '',
    is_public: false
  })
  const [items, setItems] = useState<VocabularyItemForm[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [set, vocabularyItems] = await Promise.all([
          getVocabularySet(setId),
          getVocabularyItems(setId)
        ])
        
        setSetData({
          name: set.name,
          description: set.description || '',
          is_public: set.is_public
        })
        setItems(vocabularyItems)
      } catch (err) {
        setError('Không thể tải bộ từ vựng')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [setId])



  const addVocabularyItem = () => {
    const newItem: VocabularyItemForm = {
      id: `temp-${Date.now()}`,
      set_id: setId,
      english: '',
      vietnamese: '',
      phonetic: '',
      type: '',
      example: '',
      synonyms: '',
      isNew: true
    }
    setItems([...items, newItem])
  }

  const updateVocabularyItemField = (id: string, field: keyof VocabularyItemForm, value: string) => {
    setItems(items.map(item => 
      item.id === id 
        ? { ...item, [field]: value }
        : item
    ))
  }

  const markItemForDeletion = (id: string) => {
    const item = items.find(item => item.id === id)
    if (item?.isNew) {
      // If it's a new item, just remove it from the list
      setItems(items.filter(item => item.id !== id))
    } else {
      // Mark existing item for deletion
      setItems(items.map(item => 
        item.id === id 
          ? { ...item, toDelete: !item.toDelete }
          : item
      ))
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError('')

      // Validate set data
      if (!setData.name.trim()) {
        throw new Error('Tên bộ từ vựng là bắt buộc')
      }

      // Update set information
      await updateVocabularySet(setId, setData)

      // Process vocabulary items
      const promises: Promise<unknown>[] = []

      // Delete marked items
      const itemsToDelete = items.filter(item => item.toDelete && !item.isNew)
      itemsToDelete.forEach(item => {
        promises.push(deleteVocabularyItem(item.id))
      })

      // Update existing items
      const itemsToUpdate = items.filter(item => !item.isNew && !item.toDelete)
      itemsToUpdate.forEach(item => {
        const updateData: UpdateVocabularyItemData = {
          english: item.english.trim(),
          vietnamese: item.vietnamese.trim(),
          phonetic: item.phonetic?.trim() || undefined,
          type: item.type?.trim() || undefined,
          example: item.example?.trim() || undefined,
          synonyms: item.synonyms?.trim() || undefined,
        }
        promises.push(updateVocabularyItem(item.id, updateData))
      })

      // Create new items
      const newItems = items.filter(item => item.isNew && !item.toDelete && item.english.trim() && item.vietnamese.trim())
      newItems.forEach(item => {
        const createData: CreateVocabularyItemData = {
          set_id: setId,
          english: item.english.trim(),
          vietnamese: item.vietnamese.trim(),
          phonetic: item.phonetic?.trim() || undefined,
          type: item.type?.trim() || undefined,
          example: item.example?.trim() || undefined,
          synonyms: item.synonyms?.trim() || undefined,
        }
        promises.push(createVocabularyItem(createData))
      })

      await Promise.all(promises)

      // Show success message
      toast.success('Đã cập nhật bộ từ vựng thành công!', {
        duration: 3000,
      })

      // Wait a bit for user to see the message then redirect
      setTimeout(() => {
        router.push(`/dashboard/study-sets/${setId}`)
      }, 1000)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi lưu'
      setError(errorMessage)
      toast.error(errorMessage)
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const activeItems = items.filter(item => !item.toDelete)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href={`/dashboard/study-sets/${setId}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Chỉnh sửa bộ từ vựng</h1>
            <p className="text-gray-600 mt-1">Cập nhật thông tin và từ vựng</p>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button onClick={handleSave} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </div>
      </div>

      {/* Set Information */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin bộ từ vựng</CardTitle>
          <CardDescription>
            Cập nhật tên và mô tả cho bộ từ vựng
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-gray-700">
              Tên bộ từ vựng *
            </label>
            <Input
              id="name"
              value={setData.name}
              onChange={(e) => setSetData({ ...setData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium text-gray-700">
              Mô tả (tùy chọn)
            </label>
            <Input
              id="description"
              value={setData.description}
              onChange={(e) => setSetData({ ...setData, description: e.target.value })}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isPublic"
              checked={setData.is_public}
              onChange={(e) => setSetData({ ...setData, is_public: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="isPublic" className="text-sm text-gray-700">
              Chia sẻ công khai
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Vocabulary Items */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Từ vựng ({activeItems.length})</CardTitle>
              <CardDescription>
                Chỉnh sửa, thêm hoặc xóa từ vựng
              </CardDescription>
            </div>
            <Button type="button" onClick={addVocabularyItem} variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Thêm từ
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeItems.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Chưa có từ vựng nào</p>
              <Button onClick={addVocabularyItem}>
                <Plus className="mr-2 h-4 w-4" />
                Thêm từ vựng đầu tiên
              </Button>
            </div>
          ) : (
            activeItems.map((item, index) => (
              <div key={item.id} className={`border rounded-lg p-4 space-y-3 ${item.toDelete ? 'opacity-50 bg-red-50' : ''}`}>
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">
                    Từ vựng #{index + 1} {item.isNew && <span className="text-green-600">(Mới)</span>}
                  </h4>
                  <Button
                    type="button"
                    onClick={() => markItemForDeletion(item.id)}
                    variant="ghost"
                    size="sm"
                    className={item.toDelete ? "text-green-600 hover:text-green-700" : "text-red-600 hover:text-red-700 hover:bg-red-50"}
                  >
                    {item.toDelete ? 'Khôi phục' : <Trash2 className="h-4 w-4" />}
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Tiếng Anh *</label>
                    <Input
                      value={item.english}
                      onChange={(e) => updateVocabularyItemField(item.id, 'english', e.target.value)}
                      disabled={item.toDelete}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Tiếng Việt *</label>
                    <Input
                      value={item.vietnamese}
                      onChange={(e) => updateVocabularyItemField(item.id, 'vietnamese', e.target.value)}
                      disabled={item.toDelete}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Phiên âm</label>
                    <Input
                      value={item.phonetic || ''}
                      onChange={(e) => updateVocabularyItemField(item.id, 'phonetic', e.target.value)}
                      disabled={item.toDelete}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Loại từ</label>
                    <Input
                      value={item.type || ''}
                      onChange={(e) => updateVocabularyItemField(item.id, 'type', e.target.value)}
                      disabled={item.toDelete}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">Ví dụ</label>
                    <Input
                      value={item.example || ''}
                      onChange={(e) => updateVocabularyItemField(item.id, 'example', e.target.value)}
                      disabled={item.toDelete}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">Từ đồng nghĩa</label>
                    <Input
                      value={item.synonyms || ''}
                      onChange={(e) => updateVocabularyItemField(item.id, 'synonyms', e.target.value)}
                      disabled={item.toDelete}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
} 