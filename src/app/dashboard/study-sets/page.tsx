'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BookOpen, Plus, Search, Edit, Trash2, Eye, Users, Lock } from "lucide-react"
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

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bộ từ vựng này?')) return

    try {
      await deleteVocabularySet(id)
      setSets(sets.filter(set => set.id !== id))
    } catch (err) {
      setError('Không thể xóa bộ từ vựng')
      console.error(err)
    }
  }

  const filteredSets = sets.filter(set =>
    set.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (set.description && set.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bộ từ vựng của tôi</h1>
          <p className="text-gray-600 mt-1">Quản lý và tổ chức các bộ từ vựng của bạn</p>
        </div>
        <Link href="/dashboard/study-sets/new">
        <Button>
            <Plus className="mr-2 h-4 w-4" />
            Tạo bộ từ vựng mới
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
            className="pl-10"
          />
        </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Vocabulary Sets Grid */}
      {filteredSets.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <BookOpen className="mx-auto h-12 w-12 text-gray-300 mb-4" />
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
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Tạo bộ từ vựng đầu tiên
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSets.map((set) => (
          <Card key={set.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                    <CardTitle className="text-lg">{set.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {set.description || 'Không có mô tả'}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-1 ml-2">
                    {set.is_public ? (
                      <div title="Công khai">
                      <Users className="h-4 w-4 text-green-600" />
                      </div>
                    ) : (
                      <div title="Riêng tư">
                      <Lock className="h-4 w-4 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm text-gray-500">
                    Ngày tạo: {new Date(set.created_at).toLocaleDateString('vi-VN')}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Link href={`/dashboard/study-sets/${set.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="mr-2 h-3 w-3" />
                      Xem
                  </Button>
                  </Link>
                  <Link href={`/dashboard/study-sets/${set.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Edit className="h-3 w-3" />
                  </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(set.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
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