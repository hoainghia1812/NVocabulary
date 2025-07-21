'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save, Plus, Trash2, Upload } from "lucide-react"
import Link from "next/link"
import { createVocabularySetWithItems } from '@/lib/api/vocabulary'
import type { CreateVocabularySetData, CreateVocabularyItemData } from '@/lib/types'
import toast from 'react-hot-toast'

interface VocabularyItemForm extends Omit<CreateVocabularyItemData, 'set_id'> {
  id: string
}

export default function NewStudySetPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Form data
  const [setData, setSetData] = useState<CreateVocabularySetData>({
    name: '',
    description: '',
    is_public: false
  })

  const [vocabularyItems, setVocabularyItems] = useState<VocabularyItemForm[]>([
    { id: '1', english: '', vietnamese: '', phonetic: '', type: '', example: '', synonyms: '' },
    { id: '2', english: '', vietnamese: '', phonetic: '', type: '', example: '', synonyms: '' }
  ])

  // Import dialog states
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [importText, setImportText] = useState('')
  const [delimiter, setDelimiter] = useState('comma') // space, tab, comma, custom
  const [customDelimiter, setCustomDelimiter] = useState('')
  const [termOrder, setTermOrder] = useState('english-first') // english-first, vietnamese-first

  const addVocabularyItem = () => {
    const newId = (vocabularyItems.length + 1).toString()
    setVocabularyItems([
      ...vocabularyItems,
      { id: newId, english: '', vietnamese: '', phonetic: '', type: '', example: '', synonyms: '' }
    ])
  }

  const removeVocabularyItem = (id: string) => {
    if (vocabularyItems.length <= 1) return
    setVocabularyItems(vocabularyItems.filter(item => item.id !== id))
  }

  const updateVocabularyItem = (id: string, field: keyof VocabularyItemForm, value: string) => {
    setVocabularyItems(vocabularyItems.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ))
  }

  const handleImport = () => {
    if (!importText.trim()) {
      toast.error('Vui lòng nhập dữ liệu trước khi import')
      return
    }

    const lines = importText.trim().split('\n').filter(line => line.trim())
    const separator = delimiter === 'space' ? ' ' : delimiter === 'tab' ? '\t' : delimiter === 'comma' ? ';' : customDelimiter

    if (delimiter === 'custom' && !customDelimiter) {
      toast.error('Vui lòng nhập ký tự phân tách tùy chỉnh')
      return
    }

    const newItems: VocabularyItemForm[] = []
    const invalidLines: number[] = []

    lines.forEach((line, index) => {
      const parts = line.split(separator).map(part => part.trim())
      if (parts.length >= 2 && parts[0] && parts[1]) {
        const english = termOrder === 'english-first' ? parts[0] : parts[1]
        const vietnamese = termOrder === 'english-first' ? parts[1] : parts[0]
        
        newItems.push({
          id: `import-${Date.now()}-${index}`,
          english,
          vietnamese,
          phonetic: parts[2] || '',
          type: '',
          example: '',
          synonyms: ''
        })
      } else {
        invalidLines.push(index + 1)
      }
    })

    if (newItems.length > 0) {
      setVocabularyItems(newItems)
      setImportDialogOpen(false)
      setImportText('')
      setDelimiter('comma')
      setCustomDelimiter('')
      setTermOrder('english-first')
      
      let message = `Đã nhập ${newItems.length} từ vựng thành công!`
      if (invalidLines.length > 0) {
        message += ` (Bỏ qua ${invalidLines.length} dòng không hợp lệ)`
      }
      toast.success(message)
    } else {
      toast.error('Không tìm thấy dữ liệu hợp lệ để nhập. Vui lòng kiểm tra format: từ;nghĩa')
    }
  }

  const handleCancelImport = () => {
    setImportDialogOpen(false)
    setImportText('')
  }

  const handleLoadSample = () => {
    const sampleData = `hello;xin chào
goodbye;tạm biệt
thank you;cám ơn
good morning;chào buổi sáng
good night;chúc ngủ ngon
please;xin lỗi
excuse me;xin lỗi
how are you;bạn khỏe không
I love you;anh yêu em
see you later;hẹn gặp lại`
    setImportText(sampleData)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validate required fields
      if (!setData.name.trim()) {
        throw new Error('Tên bộ từ vựng là bắt buộc')
      }

      const validItems = vocabularyItems.filter(item => 
        item.english.trim() && item.vietnamese.trim()
      )

      if (validItems.length === 0) {
        throw new Error('Cần có ít nhất một từ vựng')
      }

      // Prepare vocabulary items
      const itemsToCreate = validItems.map(item => ({
        english: item.english.trim(),
        vietnamese: item.vietnamese.trim(),
        phonetic: item.phonetic?.trim() || undefined,
        type: item.type?.trim() || undefined,
        example: item.example?.trim() || undefined,
        synonyms: item.synonyms?.trim() || undefined,
      }))

      // Create vocabulary set with items in one transaction
      const newSet = await createVocabularySetWithItems(setData, itemsToCreate)

      // Show success message
      toast.success(`Đã tạo bộ từ vựng "${setData.name}" với ${validItems.length} từ thành công!`, {
        duration: 3000,
      })

      // Wait a bit for user to see the message then redirect
      setTimeout(() => {
        router.push(`/dashboard/study-sets/${newSet.id}`)
      }, 1000)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi tạo bộ từ vựng'
      setError(errorMessage)
      toast.error(errorMessage)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
        <Link href="/dashboard/study-sets">
          <Button variant="ghost" size="sm" className="w-fit hover:bg-sky-50">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-cyan-500">
            Tạo bộ từ vựng mới
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Tạo bộ từ vựng riêng để bắt đầu học</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Set Information */}
        <Card className="bg-white/80 backdrop-blur-sm border-sky-100 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-cyan-500">
              Thông tin bộ từ vựng
            </CardTitle>
            <CardDescription className="text-sm sm:text-base text-gray-600">
              Nhập tên và mô tả cho bộ từ vựng của bạn
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-gray-700">
                Tên bộ từ vựng *
              </label>
              <Input
                id="name"
                placeholder="VD: Từ vựng tiếng Anh cơ bản"
                value={setData.name}
                onChange={(e) => setSetData({ ...setData, name: e.target.value })}
                required
                className="bg-white/50 border-sky-200 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium text-gray-700">
                Mô tả (tùy chọn)
              </label>
              <Input
                id="description"
                placeholder="Mô tả ngắn về bộ từ vựng này"
                value={setData.description}
                onChange={(e) => setSetData({ ...setData, description: e.target.value })}
                className="bg-white/50 border-sky-200 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isPublic"
                checked={setData.is_public}
                onChange={(e) => setSetData({ ...setData, is_public: e.target.checked })}
                className="w-4 h-4 text-sky-600 border-sky-300 rounded focus:ring-sky-500"
              />
              <label htmlFor="isPublic" className="text-sm text-gray-700">
                Chia sẻ công khai (người khác có thể xem và sử dụng)
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Vocabulary Items */}
        <Card className="bg-white/80 backdrop-blur-sm border-sky-100 shadow-lg">
          <CardHeader>
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div>
                <CardTitle className="text-lg sm:text-xl text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-cyan-500">
                  Từ vựng
                </CardTitle>
                <CardDescription className="text-sm sm:text-base text-gray-600">
                  Thêm các từ vựng vào bộ của bạn
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      type="button" 
                      variant="outline"
                      className="w-full sm:w-auto border-sky-300 text-sky-700 hover:bg-sky-50"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Nhập
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl bg-white/95 backdrop-blur-sm border border-sky-100">
                    <DialogHeader>
                      <DialogTitle className="text-lg sm:text-xl text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-cyan-500">
                        Nhập dữ liệu
                      </DialogTitle>
                      <p className="text-sm text-gray-600">Chép và dán dữ liệu ở đây (từ Word, Excel, Google Docs, v.v.)</p>
                    </DialogHeader>
                    
                    <div className="bg-gradient-to-r from-sky-50 to-cyan-50 border border-sky-200 rounded-lg p-3 text-sm">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-sky-800">Ví dụ format dữ liệu:</p>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={handleLoadSample}
                          className="text-xs border-sky-300 text-sky-700 hover:bg-sky-50"
                        >
                          Tải dữ liệu mẫu
                        </Button>
                      </div>
                      <p className="text-sky-700 font-mono">hello;xin chào</p>
                      <p className="text-sky-700 font-mono">goodbye;tạm biệt</p>
                      <p className="text-sky-700 font-mono">thank you;cám ơn</p>
                    </div>
                    
                    <div className="space-y-4">
                      <Textarea
                        placeholder="hello;xin chào&#10;goodbye;tạm biệt&#10;thank you;cám ơn"
                        value={importText}
                        onChange={(e) => setImportText(e.target.value)}
                        className="min-h-[200px] bg-white/50 border-2 border-sky-200 font-mono text-sm focus:border-sky-400"
                      />
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Giữa thuật ngữ và định nghĩa</h4>
                          <RadioGroup value={delimiter} onValueChange={setDelimiter}>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="comma" id="comma" className="border-sky-300 text-sky-600" />
                              <label htmlFor="comma" className="text-gray-700">Chấm phẩy</label>
                            </div>
                          </RadioGroup>
                          {delimiter === 'custom' && (
                            <Input
                              placeholder="Nhập ký tự phân tách"
                              value={customDelimiter}
                              onChange={(e) => setCustomDelimiter(e.target.value)}
                              className="mt-2 w-32 bg-white/50 border-sky-200 focus:border-sky-400"
                            />
                          )}
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Giữa các thẻ</h4>
                          <RadioGroup value={termOrder} onValueChange={setTermOrder}>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="english-first" id="english-first" className="border-sky-300 text-sky-600" />
                              <label htmlFor="english-first" className="text-gray-700">Dòng mới</label>
                            </div>
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    
                    <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={handleCancelImport}
                        className="w-full sm:w-auto order-2 sm:order-1 border-sky-300 text-sky-700 hover:bg-sky-50"
                      >
                        Hủy nhập
                      </Button>
                      <Button 
                        type="button" 
                        onClick={handleImport}
                        className="w-full sm:w-auto order-1 sm:order-2 bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-lg hover:shadow-cyan-500/50 transition-shadow"
                      >
                        Nhập
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                
                <Button 
                  type="button" 
                  onClick={addVocabularyItem} 
                  variant="outline"
                  className="w-full sm:w-auto border-sky-300 text-sky-700 hover:bg-sky-50"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Thêm từ
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {vocabularyItems.map((item, index) => (
              <div 
                key={item.id} 
                className="border border-sky-100 bg-gradient-to-r from-white to-sky-50/30 rounded-lg p-4 space-y-3 hover:border-sky-200 hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <span className="text-xs text-sky-600 font-bold bg-sky-100 px-2 py-1 rounded-full">
                      #{index + 1}
                    </span>
                    Từ vựng
                  </h4>
                  {vocabularyItems.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => removeVocabularyItem(item.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Tiếng Anh *
                    </label>
                    <Input
                      placeholder="hello"
                      value={item.english}
                      onChange={(e) => updateVocabularyItem(item.id, 'english', e.target.value)}
                      required
                      className="bg-white/50 border-sky-200 focus:ring-sky-500 focus:border-sky-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Tiếng Việt *
                    </label>
                    <Input
                      placeholder="xin chào"
                      value={item.vietnamese}
                      onChange={(e) => updateVocabularyItem(item.id, 'vietnamese', e.target.value)}
                      required
                      className="bg-white/50 border-sky-200 focus:ring-sky-500 focus:border-sky-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Phiên âm
                    </label>
                    <Input
                      placeholder="/həˈloʊ/"
                      value={item.phonetic}
                      onChange={(e) => updateVocabularyItem(item.id, 'phonetic', e.target.value)}
                      className="bg-white/50 border-sky-200 focus:ring-sky-500 focus:border-sky-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Loại từ
                    </label>
                    <Input
                      placeholder="interjection"
                      value={item.type}
                      onChange={(e) => updateVocabularyItem(item.id, 'type', e.target.value)}
                      className="bg-white/50 border-sky-200 focus:ring-sky-500 focus:border-sky-500"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">
                      Ví dụ
                    </label>
                    <Input
                      placeholder="Hello, how are you?"
                      value={item.example}
                      onChange={(e) => updateVocabularyItem(item.id, 'example', e.target.value)}
                      className="bg-white/50 border-sky-200 focus:ring-sky-500 focus:border-sky-500"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">
                      Từ đồng nghĩa
                    </label>
                    <Input
                      placeholder="hi, greetings"
                      value={item.synonyms}
                      onChange={(e) => updateVocabularyItem(item.id, 'synonyms', e.target.value)}
                      className="bg-white/50 border-sky-200 focus:ring-sky-500 focus:border-sky-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4">
          <Link href="/dashboard/study-sets" className="w-full sm:w-auto">
            <Button 
              type="button" 
              variant="outline"
              className="w-full border-sky-300 text-sky-700 hover:bg-sky-50"
            >
              Hủy
            </Button>
          </Link>
          <Button 
            type="submit" 
            disabled={loading}
            className="w-full sm:w-auto bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-lg hover:shadow-cyan-500/50 transition-shadow"
          >
            <Save className="mr-2 h-4 w-4" />
            {loading ? 'Đang tạo...' : 'Tạo bộ từ vựng'}
          </Button>
        </div>
      </form>
    </div>
  )
} 