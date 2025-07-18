'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { BookOpen, Search, Edit, Trash2, Eye, Users, Lock, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { getVocabularySets, deleteVocabularySet } from '@/lib/api/vocabulary'
import { useAuth } from '@/contexts/AuthContext'
import type { VocabularySet } from '@/lib/types'

export default function StudySetsPage() {
  const { user } = useAuth()
  const [sets, setSets] = useState<VocabularySet[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [setToDelete, setSetToDelete] = useState<VocabularySet | null>(null)
  const [deleting, setDeleting] = useState(false)

  const loadVocabularySets = useCallback(async () => {
    if (!user) return
    
    try {
      setLoading(true)
      const data = await getVocabularySets(user.id)
      setSets(data)
    } catch (err) {
      setError('Không thể tải danh sách bộ từ vựng')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadVocabularySets()
  }, [loadVocabularySets])

  const openDeleteDialog = (set: VocabularySet) => {
    setSetToDelete(set)
    setDeleteDialogOpen(true)
  }

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false)
    setSetToDelete(null)
    setDeleting(false)
  }

  const handleDelete = async () => {
    if (!setToDelete) return

    try {
      setDeleting(true)
      await deleteVocabularySet(setToDelete.id)
      setSets(sets.filter(set => set.id !== setToDelete.id))
      closeDeleteDialog()
    } catch (err) {
      setError('Không thể xóa bộ từ vựng')
      console.error(err)
      setDeleting(false)
    }
  }

  const filteredSets = sets.filter(set =>
    set.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (set.description && set.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:p-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-start sm:space-y-0 gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-cyan-500">
            Bộ từ vựng của tôi
          </h1>
          <p className="text-sm sm:text-base text-gray-600">Quản lý và tổ chức các bộ từ vựng của bạn</p>
        </div>
        <Link href="/dashboard/study-sets/new" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-lg hover:shadow-cyan-500/50 transition-shadow">
            <span className="hidden sm:inline">Tạo bộ từ vựng mới</span>
            <span className="sm:hidden">Tạo mới</span>
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Tìm kiếm bộ từ vựng..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-white/50 border-sky-200 focus:ring-sky-500 focus:border-sky-500"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Xác nhận xóa
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Bạn có chắc chắn muốn xóa bộ từ vựng <span className="font-semibold">&ldquo;{setToDelete?.name}&rdquo;</span> không?
              <br />
              <span className="text-red-600 text-sm mt-1 block">Hành động này không thể hoàn tác.</span>
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

      {/* Vocabulary Sets Grid */}
      {filteredSets.length === 0 ? (
        <Card className="text-center py-12 bg-white/80 backdrop-blur-sm border-sky-100 shadow-lg">
          <CardContent>
            <BookOpen className="mx-auto h-12 w-12 text-sky-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'Không tìm thấy bộ từ vựng nào' : 'Chưa có bộ từ vựng nào'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm 
                ? 'Thử tìm kiếm với từ khóa khác' 
                : 'Hãy tạo bộ từ vựng đầu tiên để bắt đầu học'}
            </p>
            {!searchTerm && (
              <Link href="/dashboard/study-sets/new">
                <Button className="bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-lg hover:shadow-cyan-500/50 transition-shadow">
                  Tạo bộ từ vựng đầu tiên
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredSets.map((set) => (
            <Card key={set.id} className="hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm border-sky-100 hover:border-sky-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg text-gray-900 truncate">{set.name}</CardTitle>
                    <CardDescription className="mt-1 text-sm line-clamp-2">
                      {set.description || 'Không có mô tả'}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-1 ml-2 flex-shrink-0">
                    {set.is_public ? (
                      <div title="Công khai" className="p-1 bg-green-100 rounded-full">
                        <Users className="h-3 w-3 text-green-600" />
                      </div>
                    ) : (
                      <div title="Riêng tư" className="p-1 bg-gray-100 rounded-full">
                        <Lock className="h-3 w-3 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-xs text-gray-500">
                    Tạo: {new Date(set.created_at).toLocaleDateString('vi-VN')}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Link href={`/dashboard/study-sets/${set.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full border-sky-300 text-sky-700 hover:bg-sky-50">
                      <Eye className="mr-1 h-3 w-3" />
                      <span className="hidden sm:inline">Xem</span>
                    </Button>
                  </Link>
                  <Link href={`/dashboard/study-sets/${set.id}/edit`}>
                    <Button variant="outline" size="sm" className="border-sky-300 text-sky-700 hover:bg-sky-50">
                      <Edit className="h-3 w-3" />
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openDeleteDialog(set)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 