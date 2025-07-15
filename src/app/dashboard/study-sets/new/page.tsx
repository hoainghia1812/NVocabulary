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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/study-sets">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tạo bộ từ vựng mới</h1>
          <p className="text-gray-600 mt-1">Tạo bộ từ vựng riêng để bắt đầu học</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Set Information */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin bộ từ vựng</CardTitle>
            <CardDescription>
              Nhập tên và mô tả cho bộ từ vựng của bạn
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
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
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isPublic"
                checked={setData.is_public}
                onChange={(e) => setSetData({ ...setData, is_public: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isPublic" className="text-sm text-gray-700">
                Chia sẻ công khai (người khác có thể xem và sử dụng)
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Vocabulary Items */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Từ vựng</CardTitle>
                <CardDescription>
                  Thêm các từ vựng vào bộ của bạn
                </CardDescription>
              </div>
              <div className="flex space-x-2">
                <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline">
                      <Upload className="mr-2 h-4 w-4" />
                      Nhập
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Nhập dữ liệu. Chép và dán dữ liệu ở đây (từ Word, Excel, Google Docs, v.v.)</DialogTitle>
                    </DialogHeader>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-blue-800">Ví dụ format dữ liệu:</p>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={handleLoadSample}
                          className="text-xs"
                        >
                          Tải dữ liệu mẫu
                        </Button>
                      </div>
                      <p className="text-blue-700 font-mono">hello;xin chào</p>
                      <p className="text-blue-700 font-mono">goodbye;tạm biệt</p>
                      <p className="text-blue-700 font-mono">thank you;cám ơn</p>
                    </div>
                    
                    <div className="space-y-4">
                                             <Textarea
                         placeholder="hello;xin chào&#10;goodbye;tạm biệt&#10;thank you;cám ơn"
                         value={importText}
                         onChange={(e) => setImportText(e.target.value)}
                         className="min-h-[200px] bg-gray-50 border-2 border-gray-300 font-mono text-sm"
                       />
                      
                      <div className="grid grid-cols-2 gap-6">
                                                <div>
                          <h4 className="font-medium text-gray-900 mb-3">Giữa thuật ngữ và định nghĩa</h4>
                          <RadioGroup value={delimiter} onValueChange={setDelimiter}>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="comma" id="comma" />
                              <label htmlFor="comma">Chấm phẩy</label>
                            </div>
                            
                          </RadioGroup>
                          {delimiter === 'custom' && (
                            <Input
                              placeholder="Nhập ký tự phân tách"
                              value={customDelimiter}
                              onChange={(e) => setCustomDelimiter(e.target.value)}
                              className="mt-2 w-32"
                            />
                          )}
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Giữa các thẻ</h4>
                          <RadioGroup value={termOrder} onValueChange={setTermOrder}>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="english-first" id="english-first" />
                              <label htmlFor="english-first">Dòng mới</label>
                            </div>
                            
                            
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={handleCancelImport}>
                        Hủy nhập
                      </Button>
                      <Button type="button" onClick={handleImport}>
                        Nhập
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                
                <Button type="button" onClick={addVocabularyItem} variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Thêm từ
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {vocabularyItems.map((item, index) => (
              <div key={item.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">Từ vựng #{index + 1}</h4>
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
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Link href="/dashboard/study-sets">
            <Button type="button" variant="outline">
              Hủy
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? 'Đang tạo...' : 'Tạo bộ từ vựng'}
          </Button>
        </div>
      </form>
    </div>
  )
} 