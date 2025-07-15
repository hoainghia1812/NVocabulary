'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Brain, Trophy, Users, ArrowRight, Play, Star } from 'lucide-react'

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">StudyN</span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">
              Tính năng
            </a>
            <a href="#about" className="text-gray-600 hover:text-gray-900 transition-colors">
              Giới thiệu
            </a>
          </nav>
                     <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost">Đăng nhập</Button>
            </Link>
            <Link href="/signup">
              <Button>Bắt đầu</Button>
            </Link>
           </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Học từ vựng
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block">
              Hiệu quả hơn bao giờ hết
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Học thông minh với flashcards AI, lặp lại có khoảng cách và lộ trình học cá nhân hóa. 
            Tham gia cùng hàng nghìn học viên đang thành thạo từ vựng Anh-Việt.
          </p>
                     <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/signup">
             <Button size="lg" className="text-lg px-8 py-6">
                Bắt đầu học miễn phí
                 <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
               </Link>
             <Button size="lg" variant="outline" className="text-lg px-8 py-6">
               <Play className="mr-2 h-5 w-5" />
              Xem demo
             </Button>
           </div>
          <div className="mt-12 flex items-center justify-center space-x-8 text-sm text-gray-500">
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-400 mr-1" />
              <span>Đánh giá 4.9/5</span>
            </div>
            <div>10,000+ Người học</div>
            <div>100% Miễn phí</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Mọi thứ bạn cần để học
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Các tính năng mạnh mẽ được thiết kế để tăng tốc hành trình học từ vựng của bạn
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Brain className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>Flashcards thông minh</CardTitle>
                <CardDescription>
                  Flashcards được hỗ trợ AI thích ứng với tốc độ học của bạn và tập trung vào điểm yếu
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Trophy className="h-12 w-12 text-green-600 mb-4" />
                <CardTitle>Theo dõi tiến độ</CardTitle>
                <CardDescription>
                  Theo dõi tiến độ trực quan với phân tích chi tiết để giám sát sự cải thiện theo thời gian
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="h-12 w-12 text-purple-600 mb-4" />
                <CardTitle>Bộ từ vựng</CardTitle>
                <CardDescription>
                  Tạo bộ từ vựng tùy chỉnh hoặc chọn từ hàng nghìn bộ sưu tập từ vựng có sẵn
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <BookOpen className="h-12 w-12 text-orange-600 mb-4" />
                <CardTitle>Lặp lại có khoảng cách</CardTitle>
                <CardDescription>
                  Thuật toán lặp lại có khoảng cách được chứng minh khoa học để ghi nhớ lâu dài
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Star className="h-12 w-12 text-yellow-600 mb-4" />
                <CardTitle>Nhiều chế độ học</CardTitle>
                <CardDescription>
                  Flashcards, trò chơi ghép nối và bài tập viết để duy trì sự hấp dẫn trong học tập
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <ArrowRight className="h-12 w-12 text-red-600 mb-4" />
                <CardTitle>Truy cập offline</CardTitle>
                <CardDescription>
                  Tải xuống bộ từ vựng và tiếp tục học ngay cả khi không có kết nối internet
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">10K+</div>
              <div className="text-blue-100">Người học tích cực</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">1M+</div>
              <div className="text-blue-100">Từ đã học</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50K+</div>
              <div className="text-blue-100">Bộ từ vựng</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">98%</div>
              <div className="text-blue-100">Tỉ lệ thành công</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Sẵn sàng thay đổi cách học của bạn?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Tham gia cùng hàng nghìn học viên thành công và bắt đầu hành trình thành thạo từ vựng ngay hôm nay.
          </p>
                     <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
             <Button size="lg" className="text-lg px-8 py-6">
                Bắt đầu học ngay
             </Button>
            </Link>
            <Link href="/login">
             <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                Đã có tài khoản?
             </Button>
            </Link>
           </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
                <BookOpen className="h-6 w-6 text-blue-400" />
                <span className="text-xl font-bold">StudyN</span>
          </div>
          <p className="text-gray-400">© 2024 StudyN. Tất cả quyền được bảo lưu.</p>
        </div>
      </footer>
    </div>
  )
}
