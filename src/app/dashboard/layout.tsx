'use client'

import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { BookOpen, Home, Book, BarChart3, LogOut, Plus, Search, Bell, User, Menu, X } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)



  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const navigation = [
    { name: 'Tổng quan', href: '/dashboard', icon: Home },
    { name: 'Bộ từ vựng', href: '/dashboard/study-sets', icon: Book },
    { name: 'Luyện gõ', href: '/dashboard/study', icon: BookOpen },
    { name: 'Tiến độ', href: '/dashboard/progress', icon: BarChart3 },
  ]

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Top Navigation */}
        <header className="bg-white border-b shadow-sm sticky top-0 z-50">
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Menu button - All devices */}
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
              
              <Link href="/dashboard" className="flex items-center space-x-2">
                <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                <span className="text-lg sm:text-xl font-bold text-gray-900">StudyN</span>
              </Link>
            </div>
            
            <div className="flex-1 max-w-lg mx-4 sm:mx-8 hidden lg:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Tìm kiếm bộ từ vựng..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button variant="ghost" size="icon" className="hidden sm:flex">
                <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-700 hidden sm:block">
                  {user?.email?.split('@')[0]}
                </span>
              </div>
            </div>
          </div>
        </header>

        <div className="flex relative">
          {/* Sidebar Overlay */}
          {sidebarOpen && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar */}
          {true && (
            <aside className={`
              fixed inset-y-0 left-0 z-50 w-64 bg-white border-r 
              transform transition-transform duration-300 ease-in-out
              ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
              top-[65px] sm:top-[73px]
              h-[calc(100vh-65px)] sm:h-[calc(100vh-73px)]
              overflow-hidden
            `}>
            <div className="h-full flex flex-col">
              {/* Scrollable Navigation */}
              <nav className="p-4 sm:p-6 space-y-2 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {navigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <item.icon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                      <span className="text-sm sm:text-base">{item.name}</span>
                    </Link>
                  )
                })}

                <div className="pt-3 sm:pt-4 border-t border-gray-200">
                  <Link href="/dashboard/study-sets/new" onClick={() => setSidebarOpen(false)}>
                    <Button className="w-full justify-start text-sm sm:text-base">
                      <Plus className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      Tạo bộ từ vựng mới
                    </Button>
                  </Link>
                </div>
              </nav>

              {/* Fixed Bottom Section */}
              <div className="p-4 sm:p-6 pt-0 border-t border-gray-200 bg-white">
                <Button
                  variant="ghost"
                  onClick={handleSignOut}
                  className="w-full justify-start text-gray-600 hover:text-red-600 text-sm sm:text-base"
                >
                  <LogOut className="mr-3 h-4 w-4 sm:h-5 sm:w-5" />
                  Đăng xuất
                </Button>
              </div>
            </div>
            </aside>
          )}

          {/* Main Content */}
          <main className="flex-1 p-3 sm:p-6">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
} 