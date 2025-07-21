'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ArrowLeft, Edit, Trash2, Plus, Play, Users, Lock, AlertTriangle } from "lucide-react"
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

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

  const openDeleteDialog = () => {
    setDeleteDialogOpen(true)
  }

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false)
    setDeleting(false)
  }

  const handleDelete = async () => {
    if (!set) return

    try {
      setDeleting(true)
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
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
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
            <Button variant="ghost" size="sm" className="w-fit hover:bg-sky-50">
              <ArrowLeft className="mr-2 h-4 w-4" />
            </Button>
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex items-start space-x-2 sm:items-center">
              <h1 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-cyan-500 break-words">{set.name}</h1>
              {set.is_public ? (
                <div title="Công khai" className="flex-shrink-0 mt-1 sm:mt-0 p-1 bg-green-100 rounded-full">
                  <Users className="h-4 w-4 text-green-600" />
                </div>
              ) : (
                <div title="Riêng tư" className="flex-shrink-0 mt-1 sm:mt-0 p-1 bg-gray-100 rounded-full">
                  <Lock className="h-4 w-4 text-gray-400" />
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
            <Button className="w-full sm:w-auto bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-lg hover:shadow-cyan-500/50 transition-shadow">
              <Play className="mr-2 h-4 w-4" />
              Bắt đầu học
            </Button>
          </Link>
          <div className="flex space-x-2">
            <Link href={`/dashboard/study-sets/${setId}/edit`} className="flex-1 sm:flex-none">
              <Button variant="outline" className="w-full border-sky-300 text-sky-700 hover:bg-sky-50">
                <Edit className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Chỉnh sửa</span>
                <span className="sm:hidden">Sửa</span>
              </Button>
            </Link>
            <div className="flex-1 sm:flex-none">
              <Button
                variant="outline"
                onClick={openDeleteDialog}
                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Xóa</span>
                <span className="sm:hidden">Xóa</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Xác nhận xóa
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Bạn có chắc chắn muốn xóa bộ từ vựng <span className="font-semibold">&ldquo;{set?.name}&rdquo;</span> không?
              <br />
              <span className="text-red-600 text-sm mt-1 block">Hành động này không thể hoàn tác và sẽ xóa tất cả {items.length} từ vựng bên trong.</span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={closeDeleteDialog}
              disabled={deleting}
              className="w-full sm:w-auto"
            >
              Hủy
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deleting}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting ? 'Đang xóa...' : 'Có, xóa ngay'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Set Info */}
      <Card className="bg-white/80 backdrop-blur-sm border-sky-100 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <CardTitle className="text-lg sm:text-xl text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-cyan-500">Thông tin bộ từ vựng</CardTitle>
            <Link href={`/dashboard/study-sets/${setId}/add-words`} className="w-full sm:w-auto">
              <Button variant="outline" size="sm" className="w-full sm:w-auto border-sky-300 text-sky-700 hover:bg-sky-50">
                <Plus className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Thêm từ vựng</span>
                <span className="sm:hidden">Thêm từ</span>
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div className="p-3 bg-gradient-to-r from-sky-50 to-cyan-50 rounded-lg border border-sky-200">
              <span className="text-sky-700 text-xs uppercase tracking-wide font-medium">Tạo lúc:</span>
              <p className="font-semibold text-gray-800 mt-1">{new Date(set.created_at).toLocaleDateString('vi-VN')}</p>
            </div>
            <div className="p-3 bg-gradient-to-r from-sky-50 to-cyan-50 rounded-lg border border-sky-200">
              <span className="text-sky-700 text-xs uppercase tracking-wide font-medium">Cập nhật:</span>
              <p className="font-semibold text-gray-800 mt-1">{new Date(set.updated_at).toLocaleDateString('vi-VN')}</p>
            </div>
            <div className="p-3 bg-gradient-to-r from-sky-50 to-cyan-50 rounded-lg border border-sky-200 sm:col-span-2 lg:col-span-1">
              <span className="text-sky-700 text-xs uppercase tracking-wide font-medium">Trạng thái:</span>
              <p className="font-semibold text-gray-800 mt-1">{set.is_public ? 'Công khai' : 'Riêng tư'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vocabulary Items */}
      <Card className="bg-white/80 backdrop-blur-sm border-sky-100 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg sm:text-xl text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-cyan-500">Danh sách từ vựng ({items.length})</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Tất cả từ vựng trong bộ này
          </CardDescription>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-center py-8 px-4">
              <p className="text-gray-500 mb-4 text-sm sm:text-base">Chưa có từ vựng nào</p>
              <Link href={`/dashboard/study-sets/${setId}/add-words`} className="w-full sm:w-auto inline-block">
                <Button className="w-full sm:w-auto bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-lg hover:shadow-cyan-500/50 transition-shadow">
                  <Plus className="mr-2 h-4 w-4" />
                  Thêm từ vựng đầu tiên
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={item.id} className="border border-sky-100 rounded-lg p-4 sm:p-6 hover:shadow-md hover:border-sky-200 transition-all duration-300 bg-gradient-to-r from-white to-sky-50/30">
                  <div className="space-y-4">
                    {/* English Word Section */}
                    <div className="space-y-2">
                      <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3">
                        <span className="text-xs text-sky-600 font-bold bg-sky-100 px-2 py-1 rounded-full">#{index + 1}</span>
                        <h3 className="font-bold text-lg sm:text-xl text-gray-900 break-words">{item.english}</h3>
                        {item.phonetic && (
                          <span className="text-sm text-sky-600 font-mono bg-sky-50 px-2 py-1 rounded">/{item.phonetic}/</span>
                        )}
                      </div>
                      {item.type && (
                        <span className="inline-block bg-gradient-to-r from-sky-100 to-cyan-100 text-sky-700 text-xs px-3 py-1 rounded-full font-medium border border-sky-200">
                          {item.type}
                        </span>
                      )}
                    </div>
                    
                    {/* Vietnamese Translation */}
                    <div className="border-l-4 border-gradient-to-b pl-4 bg-gradient-to-r from-sky-50 to-cyan-50 py-2 rounded-r-lg">
                      <h3 className="font-bold text-lg sm:text-xl text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-cyan-600 break-words">{item.vietnamese}</h3>
                    </div>
                  </div>

                  {/* Additional Info */}
                  {(item.example || item.synonyms) && (
                    <div className="mt-4 pt-4 border-t border-sky-100 space-y-3">
                      {item.example && (
                        <div className="p-3 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border border-amber-200">
                          <span className="text-sm font-semibold text-amber-800 block mb-1">💡 Ví dụ:</span>
                          <span className="text-sm italic text-amber-700 break-words">{item.example}</span>
                        </div>
                      )}
                      {item.synonyms && (
                        <div className="p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-200">
                          <span className="text-sm font-semibold text-emerald-800 block mb-1">🔗 Từ đồng nghĩa:</span>
                          <span className="text-sm text-emerald-700 break-words">{item.synonyms}</span>
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