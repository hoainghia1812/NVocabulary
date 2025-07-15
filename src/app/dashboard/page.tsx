'use client'

import { useState, useEffect } from 'react'
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Brain, Trophy, TrendingUp, Plus, ArrowRight, Clock } from "lucide-react"
import Link from "next/link"
import { useAuth } from '@/contexts/AuthContext'

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalSets: 0,
    wordsLearned: 0,
    studyStreak: 0,
    accuracy: 0
  })

  // Mock data for now - will be replaced with real API calls
  useEffect(() => {
    // Simulate loading stats
    setStats({
      totalSets: 5,
      wordsLearned: 120,
      studyStreak: 3,
      accuracy: 85
    })
  }, [])

  const userName = user?.email?.split('@')[0] || 'Bạn'

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-4 sm:p-6 md:p-8 text-white">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">Chào mừng trở lại, {userName}!</h1>
        <p className="text-blue-100 mb-4 sm:mb-6 text-sm sm:text-base">Sẵn sàng tiếp tục hành trình học từ vựng chưa?</p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <Link href="/dashboard/study">
            <Button className="bg-white text-blue-600 hover:bg-blue-50 w-full sm:w-auto">
              <Brain className="mr-2 h-4 w-4" />
              Tiếp tục học
            </Button>
          </Link>
          <Link href="/dashboard/study-sets/new">
            <Button variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Tạo bộ từ vựng mới
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
        <Card>
          <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">Tổng số bộ từ</CardTitle>
              <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
            </div>
            <div className="text-lg sm:text-2xl font-bold">{stats.totalSets}</div>
            <CardDescription className="text-xs">Bộ từ vựng</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">Từ đã học</CardTitle>
              <Brain className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
            </div>
            <div className="text-lg sm:text-2xl font-bold">{stats.wordsLearned}</div>
            <CardDescription className="text-xs">Từ vựng</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">Chuỗi học tập</CardTitle>
              <Trophy className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-600" />
            </div>
            <div className="text-lg sm:text-2xl font-bold">{stats.studyStreak}</div>
            <CardDescription className="text-xs">ngày liên tiếp</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">Độ chính xác</CardTitle>
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600" />
            </div>
            <div className="text-lg sm:text-2xl font-bold">{stats.accuracy}%</div>
            <CardDescription className="text-xs">trung bình</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Recent Activity & Study Sets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Recent Study Sets */}
          <Card>
          <CardHeader className="p-3 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <CardTitle className="text-lg sm:text-xl">Bộ từ vựng gần đây</CardTitle>
              <Link href="/dashboard/study-sets">
                <Button variant="ghost" size="sm" className="self-start sm:self-center">
                  Xem tất cả
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </div>
            </CardHeader>
          <CardContent className="space-y-4 p-3 sm:p-6 pt-0">
            <div className="text-center py-6 sm:py-8 text-gray-500">
              <BookOpen className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-300 mb-3 sm:mb-4" />
              <p className="text-sm">Chưa có bộ từ vựng nào</p>
              <Link href="/dashboard/study-sets/new">
                <Button variant="outline" size="sm" className="mt-2">
                  <Plus className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  Tạo bộ từ vựng đầu tiên
                    </Button>
              </Link>
                  </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="p-3 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">Hoạt động gần đây</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-3 sm:p-6 pt-0">
            <div className="text-center py-6 sm:py-8 text-gray-500">
              <Clock className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-300 mb-3 sm:mb-4" />
              <p className="text-sm">Chưa có hoạt động nào</p>
              <p className="text-xs text-gray-400 mt-1">Bắt đầu học để xem lịch sử hoạt động</p>
                </div>
            </CardContent>
          </Card>
        </div>

      {/* Quick Actions */}
          <Card>
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="text-lg sm:text-xl">Hành động nhanh</CardTitle>
          <CardDescription className="text-sm">Quay lại hành trình học tập của bạn</CardDescription>
            </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            <Link href="/dashboard/study">
              <div className="p-3 sm:p-4 border rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors cursor-pointer">
                <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mb-2 sm:mb-3" />
                <h3 className="font-medium mb-1 text-sm sm:text-base">Tiếp tục học</h3>
                <p className="text-xs sm:text-sm text-gray-500">Học từ chỗ bạn dừng lại</p>
              </div>
            </Link>

            <Link href="/dashboard/study-sets/new">
              <div className="p-3 sm:p-4 border rounded-lg hover:bg-green-50 hover:border-green-200 transition-colors cursor-pointer">
                <Plus className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 mb-2 sm:mb-3" />
                <h3 className="font-medium mb-1 text-sm sm:text-base">Tạo bộ từ vựng</h3>
                <p className="text-xs sm:text-sm text-gray-500">Xây dựng bộ từ vựng riêng</p>
                  </div>
            </Link>

            <Link href="/dashboard/progress">
              <div className="p-3 sm:p-4 border rounded-lg hover:bg-purple-50 hover:border-purple-200 transition-colors cursor-pointer">
                <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 mb-2 sm:mb-3" />
                <h3 className="font-medium mb-1 text-sm sm:text-base">Xem tiến độ</h3>
                <p className="text-xs sm:text-sm text-gray-500">Theo dõi hành trình học tập</p>
                  </div>
            </Link>
                </div>
            </CardContent>
          </Card>
    </div>
  )
} 