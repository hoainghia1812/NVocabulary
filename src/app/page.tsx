'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { BookOpen, Brain, Trophy, Users, ArrowRight, Play, Star, UserPlus, LogIn } from 'lucide-react'

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [showAuthDialog, setShowAuthDialog] = useState(false)

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  const handleMobileStart = () => {
    setShowAuthDialog(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Image src="/logo.png" alt="Logo NVocabulary" width={32} height={32} className="object-contain" priority />
            <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-cyan-500">NVocabulary</span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-600 hover:text-sky-700 transition-colors">
              Tính năng
            </a>
            <a href="#about" className="text-gray-600 hover:text-sky-700 transition-colors">
              Giới thiệu
            </a>
          </nav>
          <div className="flex items-center space-x-4">
            {/* Desktop buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost" className="hover:text-sky-700">Đăng nhập</Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-lg hover:shadow-cyan-500/50 transition-shadow">Bắt đầu</Button>
              </Link>
            </div>
            {/* Mobile button */}
            <div className="md:hidden">
              <Button 
                onClick={handleMobileStart}
                className="bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-lg hover:shadow-cyan-500/50 transition-shadow"
              >
                Bắt đầu
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Auth Dialog */}
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold text-gray-800">
              Chào mừng đến với NVocabulary
            </DialogTitle>
            <DialogDescription className="text-center text-gray-600">
              Chọn một tùy chọn để tiếp tục
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-6">
            <Link href="/signup" className="block">
              <Button 
                className="w-full bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-lg hover:shadow-cyan-500/50 transition-shadow h-12 text-base"
                onClick={() => setShowAuthDialog(false)}
              >
                <UserPlus className="mr-2 h-5 w-5" />
                Tạo tài khoản mới
              </Button>
            </Link>
            <Link href="/login" className="block">
              <Button 
                variant="outline" 
                className="w-full border-sky-300 text-sky-700 hover:bg-sky-50 h-12 text-base"
                onClick={() => setShowAuthDialog(false)}
              >
                <LogIn className="mr-2 h-5 w-5" />
                Đã có tài khoản
              </Button>
            </Link>
          </div>
        </DialogContent>
      </Dialog>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Học từ vựng
            <span className="bg-gradient-to-r from-sky-600 to-cyan-500 bg-clip-text text-transparent block">
              Hiệu quả hơn bao giờ hết
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Học thông minh với flashcards AI, lặp lại có khoảng cách và lộ trình học cá nhân hóa. 
            Tham gia cùng hàng nghìn học viên đang thành thạo từ vựng Anh-Việt.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {/* Desktop buttons */}
            <div className="hidden md:flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/signup">
                <Button size="lg" className="text-lg px-8 py-6 bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-lg hover:shadow-cyan-500/50 transition-shadow">
                  Bắt đầu học miễn phí
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-sky-300 text-sky-700 hover:bg-sky-50">
                <Play className="mr-2 h-5 w-5" />
                Xem demo
              </Button>
            </div>
            {/* Mobile button */}
            <div className="md:hidden">
              <Button 
                size="lg" 
                onClick={handleMobileStart}
                className="text-lg px-8 py-6 bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-lg hover:shadow-cyan-500/50 transition-shadow"
              >
                Bắt đầu học miễn phí
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
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
            <Card className="hover:shadow-lg transition-shadow border-sky-100">
              <CardHeader>
                <Brain className="h-12 w-12 text-sky-600 mb-4" />
                <CardTitle>Flashcards thông minh</CardTitle>
                <CardDescription>
                  Flashcards được hỗ trợ AI thích ứng với tốc độ học của bạn và tập trung vào điểm yếu
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-sky-100">
              <CardHeader>
                <Trophy className="h-12 w-12 text-emerald-600 mb-4" />
                <CardTitle>Theo dõi tiến độ</CardTitle>
                <CardDescription>
                  Theo dõi tiến độ trực quan với phân tích chi tiết để giám sát sự cải thiện theo thời gian
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-sky-100">
              <CardHeader>
                <Users className="h-12 w-12 text-cyan-600 mb-4" />
                <CardTitle>Bộ từ vựng</CardTitle>
                <CardDescription>
                  Tạo bộ từ vựng tùy chỉnh hoặc chọn từ hàng nghìn bộ sưu tập từ vựng có sẵn
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-sky-100">
              <CardHeader>
                <BookOpen className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>Lặp lại có khoảng cách</CardTitle>
                <CardDescription>
                  Thuật toán lặp lại có khoảng cách được chứng minh khoa học để ghi nhớ lâu dài
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-sky-100">
              <CardHeader>
                <Star className="h-12 w-12 text-amber-500 mb-4" />
                <CardTitle>Nhiều chế độ học</CardTitle>
                <CardDescription>
                  Flashcards, trò chơi ghép nối và bài tập viết để duy trì sự hấp dẫn trong học tập
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-sky-100">
              <CardHeader>
                <ArrowRight className="h-12 w-12 text-slate-600 mb-4" />
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
      <section className="py-20 bg-gradient-to-r from-sky-600 to-cyan-600 text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">10K+</div>
              <div className="text-sky-100">Người học tích cực</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">1M+</div>
              <div className="text-sky-100">Từ đã học</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50K+</div>
              <div className="text-sky-100">Bộ từ vựng</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">98%</div>
              <div className="text-sky-100">Tỉ lệ thành công</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-sky-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Sẵn sàng thay đổi cách học của bạn?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Tham gia cùng hàng nghìn học viên thành công và bắt đầu hành trình thành thạo từ vựng ngay hôm nay.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {/* Desktop buttons */}
            <div className="hidden md:flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="text-lg px-8 py-6 bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-lg hover:shadow-cyan-500/50 transition-shadow">
                  Bắt đầu học ngay
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-sky-300 text-sky-700 hover:bg-sky-50">
                  Đã có tài khoản?
                </Button>
              </Link>
            </div>
            {/* Mobile button */}
            <div className="md:hidden">
              <Button 
                size="lg" 
                onClick={handleMobileStart}
                className="text-lg px-8 py-6 bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-lg hover:shadow-cyan-500/50 transition-shadow"
              >
                Bắt đầu học ngay
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Image src="/logo.png" alt="Logo NVocabulary" width={24} height={24} className="object-contain" />
            <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-400">NVocabulary</span>
          </div>
          <p className="text-gray-400">© 2025 NVocabulary. Được phát triển bởi PN7.</p>
        </div>
      </footer>
    </div>
  )
}
