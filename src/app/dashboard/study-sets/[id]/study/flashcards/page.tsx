'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, RotateCcw, Shuffle, Volume2, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { getVocabularySet, getVocabularyItems } from '@/lib/api/vocabulary'
import type { VocabularySet, VocabularyItem } from '@/lib/types'
import toast from 'react-hot-toast'

export default function FlashcardsPage() {
  const params = useParams()
  const setId = params.id as string

  const [set, setSet] = useState<VocabularySet | null>(null)
  const [items, setItems] = useState<VocabularyItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Flashcard states
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [shuffledItems, setShuffledItems] = useState<VocabularyItem[]>([])
  const [showEnglish, setShowEnglish] = useState(true) // true = show English first, false = show Vietnamese first

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [setData, itemsData] = await Promise.all([
          getVocabularySet(setId),
          getVocabularyItems(setId)
        ])
        setSet(setData)
        setItems(itemsData)
        setShuffledItems(itemsData) // Initially not shuffled
      } catch (err) {
        setError('Không thể tải dữ liệu học tập')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [setId])

  const currentItem = shuffledItems[currentIndex]

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  const handleNext = () => {
    if (currentIndex < shuffledItems.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setIsFlipped(false)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setIsFlipped(false)
    }
  }

  const handleShuffle = () => {
    const shuffled = [...items].sort(() => Math.random() - 0.5)
    setShuffledItems(shuffled)
    setCurrentIndex(0)
    setIsFlipped(false)
    toast.success('Đã xáo trộn thẻ!')
  }

  const handleReset = () => {
    setCurrentIndex(0)
    setIsFlipped(false)
    setShuffledItems([...items])
    toast.success('Đã đặt lại!')
  }

  const handleFlipMode = () => {
    setShowEnglish(!showEnglish)
    setIsFlipped(false)
    toast.success(showEnglish ? 'Chế độ: Tiếng Việt trước' : 'Chế độ: Tiếng Anh trước')
  }

  const speakText = (text: string, lang: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = lang === 'en' ? 'en-US' : 'vi-VN'
      utterance.rate = 0.8
      speechSynthesis.speak(utterance)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !set || shuffledItems.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Lỗi</h3>
        <p className="text-gray-500 mb-4">{error || 'Không tìm thấy từ vựng để học'}</p>
        <Link href={`/dashboard/study-sets/${setId}/study`}>
          <Button variant="outline">Quay lại chọn cách học</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href={`/dashboard/study-sets/${setId}/study`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Quay lại
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Thẻ ghi nhớ</h1>
              <p className="text-gray-600">{set.name}</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleFlipMode} size="sm">
              <ArrowRight className="mr-2 h-4 w-4" />
              {showEnglish ? 'EN → VI' : 'VI → EN'}
            </Button>
            <Button variant="outline" onClick={handleShuffle} size="sm">
              <Shuffle className="mr-2 h-4 w-4" />
              Xáo trộn
            </Button>
            <Button variant="outline" onClick={handleReset} size="sm">
              <RotateCcw className="mr-2 h-4 w-4" />
              Đặt lại
            </Button>
          </div>
        </div>

        {/* Progress */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Thẻ {currentIndex + 1} / {shuffledItems.length}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(((currentIndex + 1) / shuffledItems.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / shuffledItems.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Flashcard */}
        <div className="flex items-center justify-center">
          <div className="relative w-full max-w-2xl">
            <Card 
              className={`w-full h-80 cursor-pointer transition-all duration-500 transform-gpu ${
                isFlipped ? 'rotateY-180' : ''
              }`}
              onClick={handleFlip}
              style={{
                transformStyle: 'preserve-3d',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
              }}
            >
              {/* Front */}
              <CardContent 
                className="absolute inset-0 flex flex-col items-center justify-center p-8 backface-hidden"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-4">
                    {showEnglish ? currentItem.english : currentItem.vietnamese}
                  </div>
                  {currentItem.phonetic && showEnglish && (
                    <div className="text-lg text-gray-500 mb-4">
                      /{currentItem.phonetic}/
                    </div>
                  )}
                  {currentItem.type && showEnglish && (
                    <div className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full mb-4">
                      {currentItem.type}
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      speakText(
                        showEnglish ? currentItem.english : currentItem.vietnamese,
                        showEnglish ? 'en' : 'vi'
                      )
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <Volume2 className="h-5 w-5" />
                  </Button>
                </div>
                <div className="absolute bottom-4 text-sm text-gray-400">
                  Nhấp để lật thẻ
                </div>
              </CardContent>

              {/* Back */}
              <CardContent 
                className="absolute inset-0 flex flex-col items-center justify-center p-8 backface-hidden"
                style={{ 
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)'
                }}
              >
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-4">
                    {showEnglish ? currentItem.vietnamese : currentItem.english}
                  </div>
                  {currentItem.example && (
                    <div className="text-lg text-gray-600 italic mb-4 max-w-md">
                      &quot;{currentItem.example}&quot;
                    </div>
                  )}
                  {currentItem.synonyms && (
                    <div className="text-sm text-gray-500">
                      Từ đồng nghĩa: {currentItem.synonyms}
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      speakText(
                        showEnglish ? currentItem.vietnamese : currentItem.english,
                        showEnglish ? 'vi' : 'en'
                      )
                    }}
                    className="text-gray-500 hover:text-gray-700 mt-4"
                  >
                    <Volume2 className="h-5 w-5" />
                  </Button>
                </div>
                <div className="absolute bottom-4 text-sm text-gray-400">
                  Nhấp để lật lại
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-center space-x-4">
          <Button 
            variant="outline" 
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            size="lg"
          >
            <ChevronLeft className="mr-2 h-5 w-5" />
            Trước
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleFlip}
            size="lg"
            className="px-8"
          >
            Lật thẻ
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleNext}
            disabled={currentIndex === shuffledItems.length - 1}
            size="lg"
          >
            Sau
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </div>

        {/* Completed */}
        {currentIndex === shuffledItems.length - 1 && isFlipped && (
          <div className="text-center bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-bold text-green-800 mb-2">🎉 Hoàn thành!</h3>
            <p className="text-green-700 mb-4">
              Bạn đã xem hết {shuffledItems.length} thẻ từ vựng
            </p>
            <div className="space-x-2">
              <Button onClick={handleReset}>
                Học lại
              </Button>
              <Link href={`/dashboard/study-sets/${setId}/study`}>
                <Button variant="outline">
                  Chọn cách học khác
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotateY-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  )
} 