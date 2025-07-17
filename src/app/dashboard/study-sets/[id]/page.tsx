'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit, Trash2, Plus, Play, Users, Lock } from "lucide-react"
import Link from "next/link"
import { getVocabularySet, getVocabularyItems, deleteVocabularySet } from '@/lib/api/vocabulary'
import type { VocabularySet, VocabularyItem } from '@/lib/types'
import toast from 'react-hot-toast'

export default function StudySetDetailPage() {
  const params = useParams()
  const router = useRouter()
  const setId = params.id as string

  const [set, setSet] = useState<VocabularySet | null>(null)
  const [items, setItems] = useState<VocabularyItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadSetData = useCallback(async () => {
    try {
      setLoading(true)
      const [setData, itemsData] = await Promise.all([
        getVocabularySet(setId),
        getVocabularyItems(setId)
      ])
      setSet(setData)
      setItems(itemsData)
    } catch (err) {
      setError('Không thể tải bộ từ vựng')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [setId])

  useEffect(() => {
    loadSetData()
  }, [loadSetData])

  const handleDelete = async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa bộ từ vựng này?')) return

    try {
      await deleteVocabularySet(setId)
      toast.success('Đã xóa bộ từ vựng thành công!')
      setTimeout(() => {
        router.push('/dashboard/study-sets')
      }, 1000)
    } catch (err) {
      const errorMessage = 'Không thể xóa bộ từ vựng'
      setError(errorMessage)
      toast.error(errorMessage)
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !set) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Lỗi</h3>
        <p className="text-gray-500 mb-4">{error || 'Không tìm thấy bộ từ vựng'}</p>
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
          <Link href="/dashboard/study-sets">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại
            </Button>
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-3xl font-bold text-gray-900">{set.name}</h1>
              {set.is_public ? (
                <div title="Công khai">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
              ) : (
                <div title="Riêng tư">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
              )}
            </div>
            <p className="text-gray-600 mt-1">
              {set.description || 'Không có mô tả'} • {items.length} từ vựng
            </p>
          </div>
        </div>

        <div className="flex space-x-2">
          <Link href={`/dashboard/study-sets/${setId}/study`}>
            <Button>
              <Play className="mr-2 h-4 w-4" />
              Bắt đầu học
            </Button>
          </Link>
          <Link href={`/dashboard/study-sets/${setId}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Chỉnh sửa
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={handleDelete}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Xóa
          </Button>
        </div>
      </div>

      {/* Set Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Thông tin bộ từ vựng</CardTitle>
            <Link href={`/dashboard/study-sets/${setId}/add-words`}>
              <Button variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Thêm từ vựng
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Tạo lúc:</span>
              <p className="font-medium">{new Date(set.created_at).toLocaleDateString('vi-VN')}</p>
            </div>
            <div>
              <span className="text-gray-500">Cập nhật:</span>
              <p className="font-medium">{new Date(set.updated_at).toLocaleDateString('vi-VN')}</p>
            </div>
            <div>
              <span className="text-gray-500">Trạng thái:</span>
              <p className="font-medium">{set.is_public ? 'Công khai' : 'Riêng tư'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vocabulary Items */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách từ vựng ({items.length})</CardTitle>
          <CardDescription>
            Tất cả từ vựng trong bộ này
          </CardDescription>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Chưa có từ vựng nào</p>
              <Link href={`/dashboard/study-sets/${setId}/add-words`}>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Thêm từ vựng đầu tiên
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={item.id} className="border rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm text-gray-500">#{index + 1}</span>
                        <h3 className="font-semibold text-lg">{item.english}</h3>
                        {item.phonetic && (
                          <span className="text-sm text-gray-500">/{item.phonetic}/</span>
                        )}
                      </div>
                      {item.type && (
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mb-2">
                          {item.type}
                        </span>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-lg text-blue-600">{item.vietnamese}</h3>
                    </div>
                  </div>

                  {(item.example || item.synonyms) && (
                    <div className="mt-3 pt-3 border-t space-y-2">
                      {item.example && (
                        <div>
                          <span className="text-sm font-medium text-gray-600">Ví dụ: </span>
                          <span className="text-sm italic">{item.example}</span>
                        </div>
                      )}
                      {item.synonyms && (
                        <div>
                          <span className="text-sm font-medium text-gray-600">Từ đồng nghĩa: </span>
                          <span className="text-sm">{item.synonyms}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 