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
    <div className="space-y-6 sm:space-y-8 p-4 sm:p-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-sky-500 via-cyan-500 to-blue-500 rounded-xl p-4 sm:p-6 md:p-8 text-white shadow-xl">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">Chào mừng trở lại, {userName}!</h1>
        <p className="text-sky-100 mb-4 sm:mb-6 text-sm sm:text-base">Sẵn sàng tiếp tục hành trình học từ vựng chưa?</p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <Link href="/dashboard/study">
            <Button className="bg-white text-sky-600 hover:bg-sky-50 w-full sm:w-auto shadow-md">
              <Brain className="mr-2 h-4 w-4" />
              Tiếp tục học
            </Button>
          </Link>
          <Link href="/dashboard/study-sets/new">
            <Button 
              variant="outline" 
              className="border-2 border-white/60 text-white hover:bg-white/20 hover:border-white/80 backdrop-blur-md w-full sm:w-auto shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              <Plus className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
              Tạo bộ từ vựng mới
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
        <Card className="bg-white/80 backdrop-blur-sm border-sky-100 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-700">Tổng số bộ từ</CardTitle>
              <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 text-sky-600" />
            </div>
            <div className="text-lg sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-cyan-500">
              {stats.totalSets}
            </div>
            <CardDescription className="text-xs text-gray-600">Bộ từ vựng</CardDescription>
          </CardHeader>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-sky-100 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-700">Từ đã học</CardTitle>
              <Brain className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-600" />
            </div>
            <div className="text-lg sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-500">
              {stats.wordsLearned}
            </div>
            <CardDescription className="text-xs text-gray-600">Từ vựng</CardDescription>
          </CardHeader>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-sky-100 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-700">Chuỗi học tập</CardTitle>
              <Trophy className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500" />
            </div>
            <div className="text-lg sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-500">
              {stats.studyStreak}
            </div>
            <CardDescription className="text-xs text-gray-600">ngày liên tiếp</CardDescription>
          </CardHeader>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-sky-100 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-700">Độ chính xác</CardTitle>
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600" />
            </div>
            <div className="text-lg sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">
              {stats.accuracy}%
            </div>
            <CardDescription className="text-xs text-gray-600">trung bình</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Recent Activity & Study Sets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Recent Study Sets */}
        <Card className="bg-white/80 backdrop-blur-sm border-sky-100 shadow-lg">
          <CardHeader className="p-3 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <CardTitle className="text-lg sm:text-xl text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-cyan-500">
                Bộ từ vựng gần đây
              </CardTitle>
              <Link href="/dashboard/study-sets">
                <Button variant="ghost" size="sm" className="self-start sm:self-center hover:bg-sky-50 text-sky-700">
                  Xem tất cả
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-3 sm:p-6 pt-0">
            <div className="text-center py-6 sm:py-8 text-gray-500">
              <BookOpen className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-sky-300 mb-3 sm:mb-4" />
              <p className="text-sm text-gray-600">Chưa có bộ từ vựng nào</p>
              <Link href="/dashboard/study-sets/new">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2 border-sky-300 text-sky-700 hover:bg-sky-50"
                >
                  <Plus className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  Tạo bộ từ vựng đầu tiên
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-white/80 backdrop-blur-sm border-sky-100 shadow-lg">
          <CardHeader className="p-3 sm:p-6">
            <CardTitle className="text-lg sm:text-xl text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-cyan-500">
              Hoạt động gần đây
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-3 sm:p-6 pt-0">
            <div className="text-center py-6 sm:py-8 text-gray-500">
              <Clock className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-sky-300 mb-3 sm:mb-4" />
              <p className="text-sm text-gray-600">Chưa có hoạt động nào</p>
              <p className="text-xs text-gray-400 mt-1">Bắt đầu học để xem lịch sử hoạt động</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-white/80 backdrop-blur-sm border-sky-100 shadow-lg">
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="text-lg sm:text-xl text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-cyan-500">
            Hành động nhanh
          </CardTitle>
          <CardDescription className="text-sm text-gray-600">Quay lại hành trình học tập của bạn</CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            <Link href="/dashboard/study">
              <div className="p-3 sm:p-4 border border-sky-100 bg-gradient-to-br from-sky-50 to-cyan-50 rounded-lg hover:border-sky-200 hover:shadow-md transition-all duration-200 cursor-pointer">
                <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-sky-600 mb-2 sm:mb-3" />
                <h3 className="font-medium mb-1 text-sm sm:text-base text-gray-800">Tiếp tục học</h3>
                <p className="text-xs sm:text-sm text-gray-600">Học từ chỗ bạn dừng lại</p>
              </div>
            </Link>

            <Link href="/dashboard/study-sets/new">
              <div className="p-3 sm:p-4 border border-emerald-100 bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg hover:border-emerald-200 hover:shadow-md transition-all duration-200 cursor-pointer">
                <Plus className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-600 mb-2 sm:mb-3" />
                <h3 className="font-medium mb-1 text-sm sm:text-base text-gray-800">Tạo bộ từ vựng</h3>
                <p className="text-xs sm:text-sm text-gray-600">Xây dựng bộ từ vựng riêng</p>
              </div>
            </Link>

            <Link href="/dashboard/progress">
              <div className="p-3 sm:p-4 border border-purple-100 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg hover:border-purple-200 hover:shadow-md transition-all duration-200 cursor-pointer">
                <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 mb-2 sm:mb-3" />
                <h3 className="font-medium mb-1 text-sm sm:text-base text-gray-800">Xem tiến độ</h3>
                <p className="text-xs sm:text-sm text-gray-600">Theo dõi hành trình học tập</p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 