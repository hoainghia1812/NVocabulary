'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, EyeOff, Check } from 'lucide-react'
import { FaGoogle, FaFacebook, FaLinkedin } from 'react-icons/fa'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  const { signUp, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push('/dashboard')
    }
  }, [user, router])

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8
    const hasNumber = /\d/.test(password)
    const hasLetter = /[a-zA-Z]/.test(password)
    
    return {
      minLength,
      hasNumber,
      hasLetter,
      isValid: minLength && hasNumber && hasLetter
    }
  }

  const passwordValidation = validatePassword(password)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp')
      setLoading(false)
      return
    }

    if (!passwordValidation.isValid) {
      setError('Mật khẩu không đủ điều kiện')
      setLoading(false)
      return
    }

    const { error } = await signUp(email, password)
    
    if (error) {
      setError(error)
    } else {
      setSuccess(true)
    }
    
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-100 to-blue-200 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="pt-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Đăng ký thành công!</h2>
              <p className="text-gray-600 mb-6">
                Vui lòng kiểm tra email của bạn để xác thực tài khoản.
              </p>
              <Link href="/login">
                <Button className="w-full bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-lg hover:shadow-cyan-500/50 transition-shadow font-semibold">
                  Đi đến đăng nhập
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 to-blue-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Image src="/logo.png" alt="Logo NVocabulary" width={50} height={50} className="object-contain" priority />
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-cyan-400">
              NVocabulary
            </h1>
          </div>
         
        </div>

        {/* Signup Form */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-800 text-center">Đăng ký</CardTitle>
            <CardDescription className="text-gray-600 text-center">
              Tạo tài khoản mới để bắt đầu học từ vựng
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-white/50 focus:ring-sky-500"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Mật khẩu
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Tạo mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pr-10 bg-white/50 focus:ring-sky-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-sky-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                
                {/* Password Requirements */}
                {password && (
                  <div className="mt-2 space-y-1 text-xs">
                    <div className={`flex items-center ${passwordValidation.minLength ? 'text-green-600' : 'text-gray-400'}`}>
                      <Check className={`w-3 h-3 mr-1 ${passwordValidation.minLength ? 'text-green-600' : 'text-gray-300'}`} />
                      Ít nhất 8 ký tự
                    </div>
                    <div className={`flex items-center ${passwordValidation.hasNumber ? 'text-green-600' : 'text-gray-400'}`}>
                      <Check className={`w-3 h-3 mr-1 ${passwordValidation.hasNumber ? 'text-green-600' : 'text-gray-300'}`} />
                      Có ít nhất 1 số
                    </div>
                    <div className={`flex items-center ${passwordValidation.hasLetter ? 'text-green-600' : 'text-gray-400'}`}>
                      <Check className={`w-3 h-3 mr-1 ${passwordValidation.hasLetter ? 'text-green-600' : 'text-gray-300'}`} />
                      Có ít nhất 1 chữ cái
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                  Xác nhận mật khẩu
                </label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Nhập lại mật khẩu"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full pr-10 bg-white/50 focus:ring-sky-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-sky-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-red-600">Mật khẩu xác nhận không khớp</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading || !passwordValidation.isValid || password !== confirmPassword}
                className="w-full bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-lg hover:shadow-cyan-500/50 transition-shadow font-semibold"
              >
                {loading ? 'Đang tạo tài khoản...' : 'Đăng ký'}
              </Button>
            </form>

            <div className="my-6 flex items-center">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="mx-4 flex-shrink text-sm text-gray-500">Hoặc tiếp tục với</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            <div className="flex justify-center space-x-4">
              <Button variant="outline" size="icon" className="rounded-full h-12 w-12">
                <FaGoogle size={24} color="#DB4437" />
              </Button>
              <Button variant="outline" size="icon" className="rounded-full h-12 w-12">
                <FaFacebook size={24} color="#4267B2" />
              </Button>
              <Button variant="outline" size="icon" className="rounded-full h-12 w-12">
                <FaLinkedin size={24} color="#0077B5" />
              </Button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Đã có tài khoản?{' '}
                <Link href="/login" className="font-medium text-sky-600 hover:text-sky-700 hover:underline">
                  Đăng nhập ngay
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-gray-500 hover:text-sky-700">
            ← Quay lại trang chủ
          </Link>
        </div>
      </div>
    </div>
  )
} 