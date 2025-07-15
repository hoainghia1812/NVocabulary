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
    { day: "Mon", studied: 45, learned: 12 },
    { day: "Tue", studied: 30, learned: 8 },
    { day: "Wed", studied: 60, learned: 15 },
    { day: "Thu", studied: 25, learned: 6 },
    { day: "Fri", studied: 50, learned: 14 },
    { day: "Sat", studied: 75, learned: 20 },
    { day: "Sun", studied: 40, learned: 10 }
  ]

  const achievements = [
    {
      id: 1,
      title: "First Steps",
      description: "Complete your first study session",
      icon: "🎯",
      earned: true,
      earnedDate: "2024-01-15"
    },
    {
      id: 2,
      title: "Week Warrior",
      description: "Study for 7 consecutive days",
      icon: "🔥",
      earned: true,
      earnedDate: "2024-01-20"
    },
    {
      id: 3,
      title: "Vocabulary Master",
      description: "Learn 100 new words",
      icon: "📚",
      earned: true,
      earnedDate: "2024-01-25"
    },
    {
      id: 4,
      title: "Perfect Score",
      description: "Get 100% accuracy in a study session",
      icon: "⭐",
      earned: false,
      progress: 95
    },
    {
      id: 5,
      title: "Speed Learner",
      description: "Complete 50 flashcards in under 5 minutes",
      icon: "⚡",
      earned: false,
      progress: 60
    },
    {
      id: 6,
      title: "Consistency Champion",
      description: "Study for 30 consecutive days",
      icon: "🏆",
      earned: false,
      progress: 23
    }
  ]

  const recentActivity = [
    {
      date: "Today",
      activities: [
        { time: "2 hours ago", action: "Completed Business English Vocabulary", score: "85%" },
        { time: "4 hours ago", action: "Studied Travel Phrases", score: "92%" }
      ]
    },
    {
      date: "Yesterday",
      activities: [
        { time: "Morning", action: "Reviewed Daily Conversation", score: "78%" },
        { time: "Evening", action: "Learned 15 new words", score: "100%" }
      ]
    },
    {
      date: "2 days ago",
      activities: [
        { time: "Afternoon", action: "Completed Academic Writing", score: "88%" }
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Progress & Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Track your learning journey and achievements
          </p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Words Learned</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalWords}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              {stats.totalWords}/{stats.weeklyGoal} weekly goal
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Flame className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.currentStreak} days</div>
            <p className="text-xs text-muted-foreground">
              Longest: {stats.longestStreak} days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Accuracy</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageAccuracy}%</div>
            <p className="text-xs text-muted-foreground">
              Across all study sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.floor(stats.totalStudyTime / 60)}h {stats.totalStudyTime % 60}m</div>
            <p className="text-xs text-muted-foreground">
              Total this month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Weekly Progress Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Progress</CardTitle>
            <CardDescription>
              Your study activity over the past week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {weeklyData.map((day, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-12 text-sm font-medium text-gray-600 dark:text-gray-300">
                    {day.day}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span>Study time: {day.studied}min</span>
                      <span>Words learned: {day.learned}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
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
        <Card>
          <CardHeader>
            <CardTitle>Study Sets Progress</CardTitle>
            <CardDescription>
              Completion status of your vocabulary sets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Overall Completion</span>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {stats.completedSets}/{stats.totalSets} sets
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-green-600 h-3 rounded-full" 
                  style={{ width: `${(stats.completedSets / stats.totalSets) * 100}%` }}
                ></div>
              </div>
              
              <div className="space-y-3 pt-4">
                {[
                  { name: "Business English", progress: 100, status: "Completed" },
                  { name: "Travel Phrases", progress: 100, status: "Completed" },
                  { name: "Daily Conversation", progress: 90, status: "In Progress" },
                  { name: "Academic Writing", progress: 45, status: "In Progress" },
                  { name: "Technology Terms", progress: 25, status: "Started" }
                ].map((set, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{set.name}</span>
                        <Badge variant={set.status === 'Completed' ? 'default' : 'secondary'}>
                          {set.status}
                        </Badge>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full ${
                            set.progress === 100 ? 'bg-green-600' : 'bg-blue-600'
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5" />
            <span>Achievements</span>
          </CardTitle>
          <CardDescription>
            Unlock badges by reaching study milestones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <div 
                key={achievement.id}
                className={`p-4 rounded-lg border-2 ${
                  achievement.earned 
                    ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20' 
                    : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <h3 className={`font-semibold ${
                      achievement.earned ? 'text-yellow-800 dark:text-yellow-200' : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {achievement.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {achievement.description}
                    </p>
                    {achievement.earned ? (
                      <Badge variant="secondary" className="mt-2">
                        Earned {achievement.earnedDate}
                      </Badge>
                    ) : (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span>Progress</span>
                          <span>{achievement.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                          <div 
                            className="bg-blue-600 h-1.5 rounded-full" 
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Recent Activity</span>
          </CardTitle>
          <CardDescription>
            Your learning activity over the past few days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {recentActivity.map((day, dayIndex) => (
              <div key={dayIndex} className="space-y-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {day.date}
                </h3>
                <div className="space-y-2">
                  {day.activities.map((activity, activityIndex) => (
                    <div key={activityIndex} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Brain className="h-4 w-4 text-blue-600" />
                        <div>
                          <span className="text-sm font-medium">{activity.action}</span>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{activity.time}</p>
                        </div>
                      </div>
                      <Badge variant="outline">
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