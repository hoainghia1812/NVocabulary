'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Play, Shuffle, Clock, Target, BookOpen, PenTool } from "lucide-react"
import Link from "next/link"
import { getVocabularySet, getVocabularyItems } from '@/lib/api/vocabulary'
import type { VocabularySet, VocabularyItem } from '@/lib/types'

const studyMethods = [
  {
    id: 'flashcards',
    title: 'Thẻ ghi nhớ',
    description: 'Lật thẻ để học từ vựng cơ bản',
    icon: BookOpen,
    color: 'bg-blue-500',
    recommended: true
  },
  {
    id: 'learn',
    title: 'Học',
    description: 'Học thích ứng dựa trên độ khó',
    icon: Target,
    color: 'bg-green-500',
    recommended: false
  },
  {
    id: 'test',
    title: 'Kiểm tra',
    description: 'Kiểm tra kiến thức với câu hỏi trắc nghiệm',
    icon: PenTool,
    color: 'bg-purple-500',
    recommended: false
  },
  {
    id: 'match',
    title: 'Ghép thẻ',
    description: 'Ghép các từ với định nghĩa nhanh nhất có thể',
    icon: Shuffle,
    color: 'bg-orange-500',
    recommended: false
  },
  {
    id: 'spell',
    title: 'Chính tả',
    description: 'Luyện tập viết chính xác từ vựng',
    icon: PenTool,
    color: 'bg-pink-500',
    recommended: false
  },
  {
    id: 'comprehensive',
    title: 'Tổng hợp',
    description: 'Kết hợp trắc nghiệm và chính tả',
    icon: Clock,
    color: 'bg-red-500',
    recommended: false
  }
]

export default function StudyPage() {
  const params = useParams()
  const router = useRouter()
  const setId = params.id as string

  const [set, setSet] = useState<VocabularySet | null>(null)
  const [items, setItems] = useState<VocabularyItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [setData, itemsData] = await Promise.all([
          getVocabularySet(setId),
          getVocabularyItems(setId)
        ])
        setSet(setData)
        setItems(itemsData)
      } catch (err) {
        setError('Không thể tải dữ liệu học tập')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [setId])

  const handleStartStudy = (methodId: string) => {
    router.push(`/dashboard/study-sets/${setId}/study/${methodId}`)
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

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có từ vựng</h3>
        <p className="text-gray-500 mb-4">Bộ từ vựng này chưa có từ vựng nào để học</p>
        <Link href={`/dashboard/study-sets/${setId}`}>
          <Button variant="outline">Quay lại bộ từ vựng</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
        <Link href={`/dashboard/study-sets/${setId}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-3xl font-bold text-gray-900">Chọn cách học</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 truncate">
            {set.name} • {items.length} từ vựng
          </p>
        </div>
      </div>

      {/* Study Methods Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {studyMethods.map((method) => {
          const IconComponent = method.icon
          return (
            <Card 
              key={method.id} 
              className={`relative cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
                method.recommended ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => handleStartStudy(method.id)}
            >
              {method.recommended && (
                <div className="absolute -top-2 left-3 sm:left-4 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                  Khuyến nghị
                </div>
              )}
              
              <CardHeader className="pb-3 sm:pb-4 p-3 sm:p-6">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className={`p-2 sm:p-3 rounded-lg ${method.color}`}>
                    <IconComponent className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base sm:text-lg truncate">{method.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-3 sm:p-6 pt-0">
                <CardDescription className="text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
                  {method.description}
                </CardDescription>
                
                <Button 
                  className="w-full text-sm sm:text-base"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleStartStudy(method.id)
                  }}
                >
                  <Play className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  Bắt đầu
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Study Stats */}
      <Card>
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="text-lg sm:text-xl">Thống kê học tập</CardTitle>
          <CardDescription className="text-sm">
            Tiến độ học tập của bạn với bộ từ vựng này
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-blue-600">{items.length}</div>
              <div className="text-xs sm:text-sm text-blue-800">Tổng từ vựng</div>
            </div>
            <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-green-600">0</div>
              <div className="text-xs sm:text-sm text-green-800">Đã thành thạo</div>
            </div>
            <div className="bg-orange-50 p-3 sm:p-4 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-orange-600">0</div>
              <div className="text-xs sm:text-sm text-orange-800">Đang học</div>
            </div>
            <div className="bg-red-50 p-3 sm:p-4 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-red-600">0</div>
              <div className="text-xs sm:text-sm text-red-800">Cần ôn tập</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 