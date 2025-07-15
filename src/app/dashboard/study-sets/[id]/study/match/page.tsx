'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, RotateCcw } from "lucide-react"
import Link from "next/link"
import { getVocabularySet, getVocabularyItems } from '@/lib/api/vocabulary'
import type { VocabularySet, VocabularyItem } from '@/lib/types'
import toast from 'react-hot-toast'

interface MatchCard {
  id: string
  content: string
  type: 'term' | 'definition'
  originalId: string
  matched: boolean
}

export default function MatchPage() {
  const params = useParams()
  const setId = params.id as string

  const [set, setSet] = useState<VocabularySet | null>(null)
  const [items, setItems] = useState<VocabularyItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Match game states
  const [cards, setCards] = useState<MatchCard[]>([])
  const [selectedCards, setSelectedCards] = useState<MatchCard[]>([])
  const [matchedPairs, setMatchedPairs] = useState<string[]>([])
  const [gameStarted, setGameStarted] = useState(false)
  const [gameCompleted, setGameCompleted] = useState(false)
  const [startTime, setStartTime] = useState<number>(0)
  const [elapsedTime, setElapsedTime] = useState<number>(0)
  const [score, setScore] = useState(0)

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
        
        // Take first 6 items for match game
        const gameItems = itemsData.slice(0, 6)
        initializeGame(gameItems)
      } catch (err) {
        setError('Không thể tải dữ liệu học tập')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [setId])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (gameStarted && !gameCompleted) {
      interval = setInterval(() => {
        setElapsedTime(Date.now() - startTime)
      }, 100)
    }
    return () => clearInterval(interval)
  }, [gameStarted, gameCompleted, startTime])

  const initializeGame = (gameItems: VocabularyItem[]) => {
    const gameCards: MatchCard[] = []
    
    gameItems.forEach(item => {
      gameCards.push({
        id: `${item.id}-term`,
        content: item.english,
        type: 'term',
        originalId: item.id,
        matched: false
      })
      gameCards.push({
        id: `${item.id}-def`,
        content: item.vietnamese,
        type: 'definition',
        originalId: item.id,
        matched: false
      })
    })

    // Shuffle cards
    const shuffledCards = gameCards.sort(() => Math.random() - 0.5)
    setCards(shuffledCards)
  }

  const handleCardClick = (card: MatchCard) => {
    if (card.matched || selectedCards.includes(card) || selectedCards.length >= 2) {
      return
    }

    if (!gameStarted) {
      setGameStarted(true)
      setStartTime(Date.now())
    }

    const newSelected = [...selectedCards, card]
    setSelectedCards(newSelected)

    if (newSelected.length === 2) {
      const [first, second] = newSelected
      
      // Check if it's a match
      if (first.originalId === second.originalId && first.type !== second.type) {
        // It's a match!
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            c.originalId === first.originalId ? { ...c, matched: true } : c
          ))
          setMatchedPairs(prev => [...prev, first.originalId])
          setSelectedCards([])
          setScore(prev => prev + 100)
          toast.success('Ghép đúng! +100 điểm')
          
          // Check if game is completed
          if (matchedPairs.length + 1 === items.slice(0, 6).length) {
            setGameCompleted(true)
          }
        }, 500)
      } else {
        // Not a match
        setTimeout(() => {
          setSelectedCards([])
          setScore(prev => Math.max(0, prev - 10))
          toast.error('Sai rồi! -10 điểm')
        }, 1000)
      }
    }
  }

  const handleRestart = () => {
    setGameStarted(false)
    setGameCompleted(false)
    setSelectedCards([])
    setMatchedPairs([])
    setElapsedTime(0)
    setScore(0)
    initializeGame(items.slice(0, 6))
  }

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !set || items.length < 3) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Lỗi</h3>
        <p className="text-gray-500 mb-4">
          {error || 'Cần ít nhất 3 từ vựng để chơi game ghép thẻ'}
        </p>
        <Link href={`/dashboard/study-sets/${setId}/study`}>
          <Button variant="outline">Quay lại chọn cách học</Button>
        </Link>
      </div>
    )
  }

  if (gameCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center">
            <div className="text-6xl mb-4">🏆</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Xuất sắc!</h1>
            <p className="text-gray-600">Bạn đã ghép đúng tất cả các thẻ</p>
          </div>

          <Card>
            <CardContent className="text-center space-y-4 pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-bold text-orange-600">
                    {formatTime(elapsedTime)}
                  </div>
                  <div className="text-sm text-gray-600">Thời gian</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">
                    {score}
                  </div>
                  <div className="text-sm text-gray-600">Điểm số</div>
                </div>
              </div>
              
              <div className="flex justify-center space-x-4 pt-4">
                <Button onClick={handleRestart}>
                  Chơi lại
                </Button>
                <Link href={`/dashboard/study-sets/${setId}/study`}>
                  <Button variant="outline">
                    Chọn cách học khác
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 p-4">
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
              <h1 className="text-2xl font-bold text-gray-900">Ghép thẻ</h1>
              <p className="text-gray-600">{set.name}</p>
            </div>
          </div>
          
          <Button variant="outline" onClick={handleRestart}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Chơi lại
          </Button>
        </div>

        {/* Game Stats */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {gameStarted ? formatTime(elapsedTime) : '0:00'}
              </div>
              <div className="text-sm text-gray-600">Thời gian</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {matchedPairs.length} / {Math.floor(cards.length / 2)}
              </div>
              <div className="text-sm text-gray-600">Cặp đã ghép</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {score}
              </div>
              <div className="text-sm text-gray-600">Điểm số</div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        {!gameStarted && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <p className="text-blue-800">
              Nhấp vào các thẻ để ghép từ tiếng Anh với nghĩa tiếng Việt tương ứng
            </p>
          </div>
        )}

        {/* Game Board */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {cards.map((card) => (
            <Card
              key={card.id}
              className={`cursor-pointer transition-all duration-200 hover:scale-105 min-h-24 ${
                card.matched
                  ? 'bg-green-100 border-green-500 opacity-50'
                  : selectedCards.includes(card)
                  ? 'bg-blue-100 border-blue-500 scale-105'
                  : 'bg-white hover:shadow-md'
              }`}
              onClick={() => handleCardClick(card)}
            >
              <CardContent className="flex items-center justify-center p-4 h-full">
                <div className={`text-center ${
                  card.type === 'term' ? 'font-semibold text-gray-900' : 'text-blue-600'
                }`}>
                  <div className="text-sm mb-1 text-gray-500">
                    {card.type === 'term' ? 'EN' : 'VI'}
                  </div>
                  <div className="text-sm leading-tight">
                    {card.content}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
} 