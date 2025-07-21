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
    color: 'bg-gradient-to-br from-sky-500 to-cyan-500',
    hoverColor: 'hover:from-sky-600 hover:to-cyan-600',
    recommended: true
  },
  {
    id: 'learn',
    title: 'Học',
    description: 'Học thích ứng dựa trên độ khó',
    icon: Target,
    color: 'bg-gradient-to-br from-emerald-500 to-green-500',
    hoverColor: 'hover:from-emerald-600 hover:to-green-600',
    recommended: false
  },
  {
    id: 'test',
    title: 'Kiểm tra',
    description: 'Kiểm tra kiến thức với câu hỏi trắc nghiệm',
    icon: PenTool,
    color: 'bg-gradient-to-br from-violet-500 to-purple-500',
    hoverColor: 'hover:from-violet-600 hover:to-purple-600',
    recommended: false
  },
  {
    id: 'match',
    title: 'Ghép thẻ',
    description: 'Ghép các từ với định nghĩa nhanh nhất có thể',
    icon: Shuffle,
    color: 'bg-gradient-to-br from-amber-500 to-orange-500',
    hoverColor: 'hover:from-amber-600 hover:to-orange-600',
    recommended: false
  },
  {
    id: 'spell',
    title: 'Chính tả',
    description: 'Luyện tập viết chính xác từ vựng',
    icon: PenTool,
    color: 'bg-gradient-to-br from-pink-500 to-rose-500',
    hoverColor: 'hover:from-pink-600 hover:to-rose-600',
    recommended: false
  },
  {
    id: 'comprehensive',
    title: 'Tổng hợp',
    description: 'Kết hợp trắc nghiệm và chính tả',
    icon: Clock,
    color: 'bg-gradient-to-br from-red-500 to-rose-500',
    hoverColor: 'hover:from-red-600 hover:to-rose-600',
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
          <Button variant="outline" className="border-sky-300 text-sky-700 hover:bg-sky-50">Quay lại danh sách</Button>
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
          <Button variant="outline" className="border-sky-300 text-sky-700 hover:bg-sky-50">Quay lại bộ từ vựng</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
        <Link href={`/dashboard/study-sets/${setId}`}>
          <Button variant="ghost" size="sm" className="w-fit hover:bg-sky-50">
            <ArrowLeft className="mr-2 h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-cyan-500">
            Chọn cách học
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 truncate">
            <span className="font-medium text-sky-700">{set.name}</span> • {items.length} từ vựng
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
              className={`relative cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 bg-white/80 backdrop-blur-sm border-sky-100 hover:border-sky-200 ${
                method.recommended ? 'ring-2 ring-sky-400 shadow-lg shadow-sky-500/20' : ''
              }`}
              onClick={() => handleStartStudy(method.id)}
            >
              {method.recommended && (
                <div className="absolute -top-2 left-3 sm:left-4 bg-gradient-to-r from-sky-500 to-cyan-500 text-white text-xs px-3 py-1 rounded-full font-semibold shadow-lg">
                  💡 Khuyến nghị
                </div>
              )}
              
              <CardHeader className="pb-3 sm:pb-4 p-3 sm:p-6">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className={`p-2 sm:p-3 rounded-xl ${method.color} ${method.hoverColor} transition-all duration-300 shadow-lg`}>
                    <IconComponent className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base sm:text-lg truncate text-gray-800">{method.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-3 sm:p-6 pt-0">
                <CardDescription className="text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 text-gray-600">
                  {method.description}
                </CardDescription>
                
                <Button 
                  className="w-full text-sm sm:text-base bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 hover:from-sky-600 hover:to-cyan-600"
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
      <Card className="bg-white/80 backdrop-blur-sm border-sky-100 shadow-lg">
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="text-lg sm:text-xl text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-cyan-500">
            Thống kê học tập
          </CardTitle>
          <CardDescription className="text-sm text-gray-600">
            Tiến độ học tập của bạn với bộ từ vựng này
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-gradient-to-br from-sky-50 to-cyan-50 border border-sky-200 p-3 sm:p-4 rounded-xl hover:shadow-md transition-shadow duration-300">
              <div className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-cyan-600">{items.length}</div>
              <div className="text-xs sm:text-sm text-sky-700 font-medium">Tổng từ vựng</div>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 p-3 sm:p-4 rounded-xl hover:shadow-md transition-shadow duration-300">
              <div className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-600">0</div>
              <div className="text-xs sm:text-sm text-emerald-700 font-medium">Đã thành thạo</div>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 p-3 sm:p-4 rounded-xl hover:shadow-md transition-shadow duration-300">
              <div className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">0</div>
              <div className="text-xs sm:text-sm text-amber-700 font-medium">Đang học</div>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 p-3 sm:p-4 rounded-xl hover:shadow-md transition-shadow duration-300">
              <div className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-rose-600">0</div>
              <div className="text-xs sm:text-sm text-red-700 font-medium">Cần ôn tập</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 