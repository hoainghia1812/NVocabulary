'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react"
import Link from "next/link"
import { getVocabularySet, createVocabularyItems } from '@/lib/api/vocabulary'
import type { VocabularySet, CreateVocabularyItemData } from '@/lib/types'
import toast from 'react-hot-toast'

interface VocabularyItemForm extends Omit<CreateVocabularyItemData, 'set_id'> {
  id: string
}

export default function AddWordsPage() {
  const params = useParams()
  const router = useRouter()
  const setId = params.id as string

  const [set, setSet] = useState<VocabularySet | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [vocabularyItems, setVocabularyItems] = useState<VocabularyItemForm[]>([
    { id: '1', english: '', vietnamese: '', phonetic: '', type: '', example: '', synonyms: '' },
    { id: '2', english: '', vietnamese: '', phonetic: '', type: '', example: '', synonyms: '' }
  ])

  useEffect(() => {
    const loadSetData = async () => {
      try {
        setLoading(true)
        const setData = await getVocabularySet(setId)
        setSet(setData)
      } catch (err) {
        setError('Không thể tải thông tin bộ từ vựng')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadSetData()
  }, [setId])



  const addVocabularyItem = () => {
    const newId = (vocabularyItems.length + 1).toString()
    setVocabularyItems([
      ...vocabularyItems,
      { id: newId, english: '', vietnamese: '', phonetic: '', type: '', example: '', synonyms: '' }
    ])
  }

  const removeVocabularyItem = (id: string) => {
    if (vocabularyItems.length <= 1) return
    setVocabularyItems(vocabularyItems.filter(item => item.id !== id))
  }

  const updateVocabularyItem = (id: string, field: keyof VocabularyItemForm, value: string) => {
    setVocabularyItems(vocabularyItems.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError('')

      const validItems = vocabularyItems.filter(item => 
        item.english.trim() && item.vietnamese.trim()
      )

      if (validItems.length === 0) {
        throw new Error('Cần có ít nhất một từ vựng hợp lệ')
      }

      // Create vocabulary items
      const itemsToCreate: CreateVocabularyItemData[] = validItems.map(item => ({
        set_id: setId,
        english: item.english.trim(),
        vietnamese: item.vietnamese.trim(),
        phonetic: item.phonetic?.trim() || undefined,
        type: item.type?.trim() || undefined,
        example: item.example?.trim() || undefined,
        synonyms: item.synonyms?.trim() || undefined,
      }))

      await createVocabularyItems(itemsToCreate)

      // Show success message
      toast.success(`Đã thêm ${validItems.length} từ vựng thành công!`, {
        duration: 3000,
      })

      // Wait a bit for user to see the message then redirect
      setTimeout(() => {
        router.push(`/dashboard/study-sets/${setId}`)
      }, 1000)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi thêm từ vựng'
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

  if (error && !set) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Lỗi</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <Link href="/dashboard/study-sets">
          <Button variant="outline">Quay lại danh sách</Button>
        </Link>
      </div>
    )
  }

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
            <h1 className="text-3xl font-bold text-gray-900">Thêm từ vựng</h1>
            <p className="text-gray-600 mt-1">Thêm từ vựng vào bộ &quot;{set?.name}&quot;</p>
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? 'Đang lưu...' : 'Lưu từ vựng'}
        </Button>
      </div>

      {/* Vocabulary Items */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Từ vựng mới</CardTitle>
              <CardDescription>
                Thêm các từ vựng mới vào bộ này
              </CardDescription>
            </div>
            <Button type="button" onClick={addVocabularyItem} variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Thêm từ
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {vocabularyItems.map((item, index) => (
            <div key={item.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">Từ vựng #{index + 1}</h4>
                {vocabularyItems.length > 1 && (
                  <Button
                    type="button"
                    onClick={() => removeVocabularyItem(item.id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Tiếng Anh *
                  </label>
                  <Input
                    placeholder="hello"
                    value={item.english}
                    onChange={(e) => updateVocabularyItem(item.id, 'english', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Tiếng Việt *
                  </label>
                  <Input
                    placeholder="xin chào"
                    value={item.vietnamese}
                    onChange={(e) => updateVocabularyItem(item.id, 'vietnamese', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Phiên âm
                  </label>
                  <Input
                    placeholder="/həˈloʊ/"
                    value={item.phonetic}
                    onChange={(e) => updateVocabularyItem(item.id, 'phonetic', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Loại từ
                  </label>
                  <Input
                    placeholder="interjection"
                    value={item.type}
                    onChange={(e) => updateVocabularyItem(item.id, 'type', e.target.value)}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">
                    Ví dụ
                  </label>
                  <Input
                    placeholder="Hello, how are you?"
                    value={item.example}
                    onChange={(e) => updateVocabularyItem(item.id, 'example', e.target.value)}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">
                    Từ đồng nghĩa
                  </label>
                  <Input
                    placeholder="hi, hey, greetings"
                    value={item.synonyms}
                    onChange={(e) => updateVocabularyItem(item.id, 'synonyms', e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
} 