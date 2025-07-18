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
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
          <Link href="/dashboard/study-sets">
            <Button variant="ghost" size="sm" className="w-fit">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại
            </Button>
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex items-start space-x-2 sm:items-center">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 break-words">{set.name}</h1>
              {set.is_public ? (
                <div title="Công khai" className="flex-shrink-0 mt-1 sm:mt-0">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
              ) : (
                <div title="Riêng tư" className="flex-shrink-0 mt-1 sm:mt-0">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
              )}
            </div>
            <p className="text-sm sm:text-base text-gray-600 mt-1 break-words">
              {set.description || 'Không có mô tả'} • {items.length} từ vựng
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 lg:flex-shrink-0">
          <Link href={`/dashboard/study-sets/${setId}/study`} className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto">
              <Play className="mr-2 h-4 w-4" />
              Bắt đầu học
            </Button>
          </Link>
          <div className="flex space-x-2">
            <Link href={`/dashboard/study-sets/${setId}/edit`} className="flex-1 sm:flex-none">
              <Button variant="outline" className="w-full">
                <Edit className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Chỉnh sửa</span>
                <span className="sm:hidden">Sửa</span>
              </Button>
            </Link>
            <div className="flex-1 sm:flex-none">
              <Button
                variant="outline"
                onClick={handleDelete}
                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Xóa</span>
                <span className="sm:hidden">Xóa</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Set Info */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <CardTitle className="text-lg sm:text-xl">Thông tin bộ từ vựng</CardTitle>
            <Link href={`/dashboard/study-sets/${setId}/add-words`} className="w-full sm:w-auto">
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Thêm từ vựng</span>
                <span className="sm:hidden">Thêm từ</span>
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div className="p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-500 text-xs uppercase tracking-wide">Tạo lúc:</span>
              <p className="font-medium mt-1">{new Date(set.created_at).toLocaleDateString('vi-VN')}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-500 text-xs uppercase tracking-wide">Cập nhật:</span>
              <p className="font-medium mt-1">{new Date(set.updated_at).toLocaleDateString('vi-VN')}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg sm:col-span-2 lg:col-span-1">
              <span className="text-gray-500 text-xs uppercase tracking-wide">Trạng thái:</span>
              <p className="font-medium mt-1">{set.is_public ? 'Công khai' : 'Riêng tư'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vocabulary Items */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg sm:text-xl">Danh sách từ vựng ({items.length})</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Tất cả từ vựng trong bộ này
          </CardDescription>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-center py-8 px-4">
              <p className="text-gray-500 mb-4 text-sm sm:text-base">Chưa có từ vựng nào</p>
              <Link href={`/dashboard/study-sets/${setId}/add-words`} className="w-full sm:w-auto inline-block">
                <Button className="w-full sm:w-auto">
                  <Plus className="mr-2 h-4 w-4" />
                  Thêm từ vựng đầu tiên
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={item.id} className="border rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow">
                  <div className="space-y-4">
                    {/* English Word Section */}
                    <div className="space-y-2">
                      <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3">
                        <span className="text-xs text-gray-500 font-medium">#{index + 1}</span>
                        <h3 className="font-semibold text-lg sm:text-xl text-gray-900 break-words">{item.english}</h3>
                        {item.phonetic && (
                          <span className="text-sm text-gray-500 font-mono">/{item.phonetic}/</span>
                        )}
                      </div>
                      {item.type && (
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          {item.type}
                        </span>
                      )}
                    </div>
                    
                    {/* Vietnamese Translation */}
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h3 className="font-semibold text-lg sm:text-xl text-blue-600 break-words">{item.vietnamese}</h3>
                    </div>
                  </div>

                  {/* Additional Info */}
                  {(item.example || item.synonyms) && (
                    <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                      {item.example && (
                        <div className="p-3 bg-yellow-50 rounded-lg">
                          <span className="text-sm font-medium text-yellow-800 block mb-1">Ví dụ:</span>
                          <span className="text-sm italic text-yellow-700 break-words">{item.example}</span>
                        </div>
                      )}
                      {item.synonyms && (
                        <div className="p-3 bg-green-50 rounded-lg">
                          <span className="text-sm font-medium text-green-800 block mb-1">Từ đồng nghĩa:</span>
                          <span className="text-sm text-green-700 break-words">{item.synonyms}</span>
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