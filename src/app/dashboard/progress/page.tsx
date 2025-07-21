import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  TrendingUp, 
  Trophy, 
  Calendar,
  Clock,
  Brain,
  Target,
  BookOpen,
  Flame,
  Download
} from "lucide-react"

export default function ProgressPage() {
  // Mock data - in a real app, this would come from your database
  const weeklyData = [
    { day: "T2", studied: 45, learned: 12 },
    { day: "T3", studied: 30, learned: 8 },
    { day: "T4", studied: 60, learned: 15 },
    { day: "T5", studied: 25, learned: 6 },
    { day: "T6", studied: 50, learned: 14 },
    { day: "T7", studied: 75, learned: 20 },
    { day: "CN", studied: 40, learned: 10 }
  ]

  const achievements = [
    {
      id: 1,
      title: "Bước đầu tiên",
      description: "Hoàn thành phiên học đầu tiên của bạn",
      icon: "🎯",
      earned: true,
      earnedDate: "15/01/2024"
    },
    {
      id: 2,
      title: "Chiến binh tuần",
      description: "Học liên tục trong 7 ngày",
      icon: "🔥",
      earned: true,
      earnedDate: "20/01/2024"
    },
    {
      id: 3,
      title: "Bậc thầy từ vựng",
      description: "Học 100 từ mới",
      icon: "📚",
      earned: true,
      earnedDate: "25/01/2024"
    },
    {
      id: 4,
      title: "Điểm số hoàn hảo",
      description: "Đạt 100% chính xác trong một phiên học",
      icon: "⭐",
      earned: false,
      progress: 95
    },
    {
      id: 5,
      title: "Người học nhanh",
      description: "Hoàn thành 50 flashcard trong dưới 5 phút",
      icon: "⚡",
      earned: false,
      progress: 60
    },
    {
      id: 6,
      title: "Nhà vô địch kiên trì",
      description: "Học liên tục trong 30 ngày",
      icon: "🏆",
      earned: false,
      progress: 23
    }
  ]

  const recentActivity = [
    {
      date: "Hôm nay",
      activities: [
        { time: "2 giờ trước", action: "Hoàn thành Từ vựng Tiếng Anh Thương mại", score: "85%" },
        { time: "4 giờ trước", action: "Học Cụm từ Du lịch", score: "92%" }
      ]
    },
    {
      date: "Hôm qua",
      activities: [
        { time: "Sáng", action: "Ôn tập Hội thoại Hàng ngày", score: "78%" },
        { time: "Tối", action: "Học 15 từ mới", score: "100%" }
      ]
    },
    {
      date: "2 ngày trước",
      activities: [
        { time: "Chiều", action: "Hoàn thành Viết Học thuật", score: "88%" }
      ]
    }
  ]

  const stats = {
    totalWords: 248,
    weeklyGoal: 300,
    currentStreak: 7,
    longestStreak: 12,
    averageAccuracy: 87,
    totalStudyTime: 342,
    completedSets: 8,
    totalSets: 12
  }

  return (
    <div className="space-y-8 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-cyan-500">
            Tiến độ & Phân tích
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Theo dõi hành trình học tập và thành tích của bạn
          </p>
        </div>
        <Button 
          variant="outline"
          className="w-full sm:w-auto border-sky-300 text-sky-700 hover:bg-sky-50"
        >
          <Download className="h-4 w-4 mr-2" />
          Xuất báo cáo
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <Card className="bg-white/80 backdrop-blur-sm border-sky-100 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-700">Từ đã học</CardTitle>
            <BookOpen className="h-4 w-4 text-sky-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-cyan-500">
              {stats.totalWords}
            </div>
            <div className="flex items-center text-xs text-gray-600">
              <TrendingUp className="h-3 w-3 mr-1 text-emerald-500" />
              {stats.totalWords}/{stats.weeklyGoal} mục tiêu tuần
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-sky-100 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-700">Chuỗi hiện tại</CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">
              {stats.currentStreak} ngày
            </div>
            <p className="text-xs text-gray-600">
              Dài nhất: {stats.longestStreak} ngày
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-sky-100 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-700">Độ chính xác TB</CardTitle>
            <Target className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-500">
              {stats.averageAccuracy}%
            </div>
            <p className="text-xs text-gray-600">
              Trên tất cả phiên học
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-sky-100 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-700">Thời gian học</CardTitle>
            <Clock className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">
              {Math.floor(stats.totalStudyTime / 60)}h {stats.totalStudyTime % 60}m
            </div>
            <p className="text-xs text-gray-600">
              Tổng tháng này
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Weekly Progress Chart */}
        <Card className="bg-white/80 backdrop-blur-sm border-sky-100 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-cyan-500">
              Tiến độ tuần
            </CardTitle>
            <CardDescription className="text-sm sm:text-base text-gray-600">
              Hoạt động học tập của bạn trong tuần qua
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {weeklyData.map((day, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-8 sm:w-12 text-xs sm:text-sm font-medium text-gray-600">
                    {day.day}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span>Thời gian học: {day.studied}phút</span>
                      <span>Từ đã học: {day.learned}</span>
                    </div>
                    <div className="w-full bg-sky-100 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-sky-500 to-cyan-500 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${(day.studied / 75) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Study Sets Progress */}
        <Card className="bg-white/80 backdrop-blur-sm border-sky-100 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-cyan-500">
              Tiến độ bộ từ vựng
            </CardTitle>
            <CardDescription className="text-sm sm:text-base text-gray-600">
              Trạng thái hoàn thành các bộ từ vựng của bạn
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Tổng tiến độ</span>
                <span className="text-sm text-gray-600">
                  {stats.completedSets}/{stats.totalSets} bộ
                </span>
              </div>
              <div className="w-full bg-sky-100 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-green-500 h-3 rounded-full transition-all duration-300" 
                  style={{ width: `${(stats.completedSets / stats.totalSets) * 100}%` }}
                ></div>
              </div>
              
              <div className="space-y-3 pt-4">
                {[
                  { name: "Tiếng Anh Thương mại", progress: 100, status: "Hoàn thành" },
                  { name: "Cụm từ Du lịch", progress: 100, status: "Hoàn thành" },
                  { name: "Hội thoại Hàng ngày", progress: 90, status: "Đang học" },
                  { name: "Viết Học thuật", progress: 45, status: "Đang học" },
                  { name: "Thuật ngữ Công nghệ", progress: 25, status: "Đã bắt đầu" }
                ].map((set, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">{set.name}</span>
                        <Badge 
                          variant={set.status === 'Hoàn thành' ? 'default' : 'secondary'}
                          className={set.status === 'Hoàn thành' ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white' : 'bg-sky-100 text-sky-700'}
                        >
                          {set.status}
                        </Badge>
                      </div>
                      <div className="w-full bg-sky-100 rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            set.progress === 100 
                              ? 'bg-gradient-to-r from-emerald-500 to-green-500' 
                              : 'bg-gradient-to-r from-sky-500 to-cyan-500'
                          }`}
                          style={{ width: `${set.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Achievements */}
      <Card className="bg-white/80 backdrop-blur-sm border-sky-100 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <span className="text-lg sm:text-xl text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-cyan-500">
              Thành tích
            </span>
          </CardTitle>
          <CardDescription className="text-sm sm:text-base text-gray-600">
            Mở khóa huy hiệu bằng cách đạt được các cột mốc học tập
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <div 
                key={achievement.id}
                className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                  achievement.earned 
                    ? 'border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50 shadow-lg' 
                    : 'border-sky-200 bg-gradient-to-br from-sky-50 to-cyan-50'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <h3 className={`font-semibold ${
                      achievement.earned ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-orange-500' : 'text-gray-700'
                    }`}>
                      {achievement.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {achievement.description}
                    </p>
                    {achievement.earned ? (
                      <Badge variant="secondary" className="mt-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                        Đạt được {achievement.earnedDate}
                      </Badge>
                    ) : (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-600">Tiến độ</span>
                          <span className="text-gray-700 font-medium">{achievement.progress}%</span>
                        </div>
                        <div className="w-full bg-sky-100 rounded-full h-1.5">
                          <div 
                            className="bg-gradient-to-r from-sky-500 to-cyan-500 h-1.5 rounded-full transition-all duration-300" 
                            style={{ width: `${achievement.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="bg-white/80 backdrop-blur-sm border-sky-100 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-sky-600" />
            <span className="text-lg sm:text-xl text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-cyan-500">
              Hoạt động gần đây
            </span>
          </CardTitle>
          <CardDescription className="text-sm sm:text-base text-gray-600">
            Hoạt động học tập của bạn trong vài ngày qua
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {recentActivity.map((day, dayIndex) => (
              <div key={dayIndex} className="space-y-3">
                <h3 className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-gray-700 to-gray-600">
                  {day.date}
                </h3>
                <div className="space-y-2">
                  {day.activities.map((activity, activityIndex) => (
                    <div key={activityIndex} className="flex items-center justify-between p-3 bg-gradient-to-r from-sky-50 to-cyan-50 border border-sky-100 rounded-lg transition-all duration-200 hover:shadow-md">
                      <div className="flex items-center space-x-3">
                        <Brain className="h-4 w-4 text-sky-600" />
                        <div>
                          <span className="text-sm font-medium text-gray-700">{activity.action}</span>
                          <p className="text-xs text-gray-600">{activity.time}</p>
                        </div>
                      </div>
                      <Badge 
                        variant="outline"
                        className="border-sky-300 text-sky-700 bg-white/50"
                      >
                        {activity.score}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 