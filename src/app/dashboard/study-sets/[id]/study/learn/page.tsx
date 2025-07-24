'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Check, X, Volume2, Settings } from "lucide-react"
import Link from "next/link"
import { getVocabularySet, getVocabularyItems } from '@/lib/api/vocabulary'
import type { VocabularySet, VocabularyItem } from '@/lib/types'


interface Question {
  id: string
  term: string
  correctAnswer: string
  options?: string[]
  type: 'multiple-choice' | 'spelling'
  language: 'english' | 'vietnamese'
  vocabularyItem: VocabularyItem
}

type StudyPhase = 'quiz1' | 'review1' | 'spell1' | 'quiz2' | 'review2' | 'spell2' | 'completed'
type StudyMode = 'mixed' | 'quiz-only' | 'spell-only'

export default function LearnPage() {
  const params = useParams()
  const setId = params.id as string

  const [set, setSet] = useState<VocabularySet | null>(null)
  const [items, setItems] = useState<VocabularyItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Learn mode states
  const [currentPhase, setCurrentPhase] = useState<StudyPhase>('quiz1')
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string>('')
  const [spellInput, setSpellInput] = useState<string>('')
  const [showResult, setShowResult] = useState(false)
  const [incorrectQuestions, setIncorrectQuestions] = useState<Set<number>>(new Set())
  const [currentPhaseVocabulary, setCurrentPhaseVocabulary] = useState<VocabularyItem[]>([])
  const [showHint, setShowHint] = useState(false)
  const [studyMode, setStudyMode] = useState<StudyMode>('mixed')
  
  // Ref cho input field để auto focus
  const spellInputRef = useRef<HTMLInputElement>(null)

  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [phaseScores, setPhaseScores] = useState({
    quiz1: { correct: 0, total: 0 },
    spell1: { correct: 0, total: 0 },
    quiz2: { correct: 0, total: 0 },
    spell2: { correct: 0, total: 0 }
  })

  const generateQuestionsForPhase = useCallback((items: VocabularyItem[], phase: StudyPhase): Question[] => {
    const questions: Question[] = []
    const totalItems = items.length
    const halfPoint = Math.ceil(totalItems / 2)
    
    let itemsToUse: VocabularyItem[] = []
    
    // Chia từ vựng theo phase và study mode
    if (phase === 'quiz1' || (phase === 'spell1' && studyMode === 'mixed')) {
      // Nửa đầu
      itemsToUse = items.slice(0, halfPoint)
    } else if (phase === 'quiz2' || phase === 'spell2') {
      // Nửa sau
      itemsToUse = items.slice(halfPoint)
    } else if (phase === 'spell1' && studyMode === 'spell-only') {
      // Spell-only mode: sử dụng tất cả từ vựng
      itemsToUse = items
    }

    itemsToUse.forEach((item) => {
      if (phase === 'quiz1' || phase === 'quiz2') {
        // Tạo câu hỏi trắc nghiệm - 4 đáp án
        const englishOptions = [item.vietnamese]
        let i = 0
        while (englishOptions.length < 4 && i < items.length) {
          const randomItem = items[i]
          if (!englishOptions.includes(randomItem.vietnamese)) {
            englishOptions.push(randomItem.vietnamese)
          }
          i++
        }
        const shuffledOptions = englishOptions.sort(() => Math.random() - 0.5)
        questions.push({
          id: `${item.id}-en-vi-${phase}`,
          term: item.english,
          correctAnswer: item.vietnamese,
          options: shuffledOptions, // Đáp án đã được xáo trộn
          type: 'multiple-choice',
          language: 'english',
          vocabularyItem: item
        })
      } else if (phase === 'spell1' || phase === 'spell2') {
        // Tạo câu hỏi chính tả - 1 câu mỗi từ (Vietnamese to English spelling)
        questions.push({
          id: `${item.id}-spell-${phase}`,
          term: `Viết từ tiếng Anh của: "${item.vietnamese}"`,
          correctAnswer: item.english,
          type: 'spelling',
          language: 'vietnamese',
          vocabularyItem: item
        })
      }
    })

    return questions // Không random thứ tự câu hỏi
  }, [studyMode]);

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
        
        // Generate questions for first phase based on study mode
        const initialPhase = studyMode === 'spell-only' ? 'spell1' : 'quiz1'
        const firstQuestions = generateQuestionsForPhase(itemsData, initialPhase)
        setQuestions(firstQuestions)
        setCurrentPhase(initialPhase)
      } catch (err) {
        setError('Không thể tải dữ liệu học tập')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [setId, generateQuestionsForPhase, studyMode])

  // Auto focus cho chính tả và auto đọc từ khi câu hỏi thay đổi
  useEffect(() => {
    const currentQ = questions[currentQuestionIndex]
    if (currentQ && !showResult) {
      // Auto đọc từ mới (chỉ cho trắc nghiệm)
      const timer = setTimeout(() => {
        if (currentQ.type === 'multiple-choice') {
          // Đọc từ tiếng Anh trong trắc nghiệm
          speakText(currentQ.term, currentQ.language === 'english' ? 'en' : 'vi')
        }
        // Không đọc tự động trong chế độ chính tả
      }, 300)
      
      // Auto focus cho chính tả
      if (currentQ?.type === 'spelling' && spellInputRef.current) {
        const focusTimer = setTimeout(() => {
          spellInputRef.current?.focus()
        }, 400)
        return () => {
          clearTimeout(timer)
          clearTimeout(focusTimer)
        }
      }
      
      return () => clearTimeout(timer)
    }
  }, [questions, currentQuestionIndex, showResult])

  const currentQuestion = questions[currentQuestionIndex]

  const handleAnswerSelect = (answer: string) => {
    if (showResult) return
    
    setSelectedAnswer(answer)
    const correct = answer === currentQuestion.correctAnswer
    setShowResult(true)
    
    if (correct) {
      // Đúng: cập nhật điểm và tự động chuyển sau 1s
      setScore(prev => ({
        correct: prev.correct + 1,
        total: prev.total + 1
      }))

      if (currentPhase !== 'completed') {
        setPhaseScores(prev => ({
          ...prev,
          [currentPhase]: {
            correct: prev[currentPhase as keyof typeof prev].correct + 1,
            total: prev[currentPhase as keyof typeof prev].total + 1
          }
        }))
      }

      playSound(true)
      
      // Tự động chuyển sau 1s
      setTimeout(() => {
        handleNext()
      }, 1000)
    } else {
      // Sai: đánh dấu để làm lại sau này
      setIncorrectQuestions(prev => new Set(prev).add(currentQuestionIndex))
      playSound(false)
      
      // Tự động chuyển sau 2s để đọc đáp án
      setTimeout(() => {
        handleNext()
      }, 2000)
    }
  }

  const handleHint = () => {
    if (currentQuestion?.correctAnswer && !showResult) {
      const hint = currentQuestion.correctAnswer.slice(0, 2)
      setSpellInput(hint)
      setShowHint(true)
      // Focus lại input sau khi set hint
      setTimeout(() => {
        if (spellInputRef.current) {
          spellInputRef.current.focus()
          // Set cursor ở cuối
          spellInputRef.current.setSelectionRange(hint.length, hint.length)
        }
      }, 50)
    }
  }

  const handleSpellSubmit = () => {
    if (!spellInput.trim()) {
      return
    }

    const correct = spellInput.trim().toLowerCase() === currentQuestion.correctAnswer.toLowerCase()
    setShowResult(true)
    
    if (correct) {
      // Đúng: cập nhật điểm và tự động chuyển
      setScore(prev => ({
        correct: prev.correct + 1,
        total: prev.total + 1
      }))

      if (currentPhase !== 'completed') {
        setPhaseScores(prev => ({
          ...prev,
          [currentPhase]: {
            correct: prev[currentPhase as keyof typeof prev].correct + 1,
            total: prev[currentPhase as keyof typeof prev].total + 1
          }
        }))
      }

      playSound(true)
      
      // Tự động chuyển sau 1s
      setTimeout(() => {
        handleNext()
      }, 1000)
    } else {
      // Sai: đánh dấu để làm lại và hiển thị đáp án
      setIncorrectQuestions(prev => new Set(prev).add(currentQuestionIndex))
      playSound(false)
      
      // Tự động chuyển sau 2s
      setTimeout(() => {
        handleNext()
      }, 2000)
    }
  }

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      // Tiếp tục câu hỏi trong phase hiện tại
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setSelectedAnswer('')
      setSpellInput('')
      setShowResult(false)
      setShowHint(false)
      // Auto focus cho chính tả và auto đọc từ
      setTimeout(() => {
        const nextQ = questions[currentQuestionIndex + 1]
        if (nextQ?.type === 'spelling' && spellInputRef.current) {
          spellInputRef.current.focus()
        }
        // Auto đọc từ mới (chỉ cho trắc nghiệm)
        if (nextQ) {
          setTimeout(() => {
            if (nextQ.type === 'multiple-choice') {
              speakText(nextQ.term, nextQ.language === 'english' ? 'en' : 'vi')
            }
            // Không đọc tự động trong chế độ chính tả
          }, 200)
        }
      }, 100)
    } else {
      // Hoàn thành tất cả câu hỏi trong phase hiện tại
      // Kiểm tra xem có câu sai cần làm lại không
      if (incorrectQuestions.size > 0) {
        // Nếu vẫn còn câu sai, tiếp tục lặp lại các câu đó cho đến khi đúng hết
        const incorrectArray = Array.from(incorrectQuestions).sort((a, b) => a - b)
        const retryQuestions = incorrectArray.map(index => questions[index])
        setQuestions(retryQuestions)
        setCurrentQuestionIndex(0)
        setSelectedAnswer('')
        setSpellInput('')
        setShowResult(false)
        setShowHint(false)
        setIncorrectQuestions(new Set()) // Reset danh sách câu sai
        // Không chuyển phase, tiếp tục lặp lại các câu sai
      } else {
        // Không có câu sai, chuyển sang phase tiếp theo
        moveToNextPhase()
      }
    }
  }

  const moveToNextPhase = () => {
    let nextPhase: StudyPhase
    
    switch (currentPhase) {
      case 'quiz1':
        if (studyMode === 'quiz-only') {
          nextPhase = 'quiz2'
        } else {
          nextPhase = 'review1'
        }
        break
      case 'review1':
        nextPhase = 'spell1'
        break
      case 'spell1':
        if (studyMode === 'spell-only') {
          nextPhase = 'completed'
        } else {
          nextPhase = 'quiz2'
        }
        break
      case 'quiz2':
        if (studyMode === 'quiz-only') {
          nextPhase = 'completed'
        } else {
          nextPhase = 'review2'
        }
        break
      case 'review2':
        nextPhase = 'spell2'
        break
      case 'spell2':
        nextPhase = 'completed'
        break
      default:
        nextPhase = 'completed'
    }

    if (nextPhase === 'completed') {
      setCurrentPhase('completed')
    } else if (nextPhase === 'review1' || nextPhase === 'review2') {
      // Chuyển sang màn hình review từ vựng
      const totalItems = items.length
      const halfPoint = Math.ceil(totalItems / 2)
      const reviewItems = nextPhase === 'review1' 
        ? items.slice(0, halfPoint)
        : items.slice(halfPoint)
      
      setCurrentPhaseVocabulary(reviewItems)
      setCurrentPhase(nextPhase)
      setCurrentQuestionIndex(0)
      setSelectedAnswer('')
      setSpellInput('')
      setShowResult(false)
      setShowHint(false)
      

    } else {
      // Tạo câu hỏi cho phase tiếp theo
      const nextQuestions = generateQuestionsForPhase(items, nextPhase)
      setQuestions(nextQuestions)
      setCurrentPhase(nextPhase)
      setCurrentQuestionIndex(0)
      setSelectedAnswer('')
      setSpellInput('')
      setShowResult(false)
      setShowHint(false)
      setIncorrectQuestions(new Set()) // Reset danh sách câu sai cho phase mới
      


      
      // Auto focus cho chính tả và auto đọc từ khi bắt đầu phase mới
      setTimeout(() => {
        if ((nextPhase === 'spell1' || nextPhase === 'spell2') && spellInputRef.current) {
          spellInputRef.current.focus()
        }
        // Auto đọc từ đầu tiên của phase mới (chỉ cho trắc nghiệm)
        const firstQuestion = nextQuestions[0]
        if (firstQuestion) {
          setTimeout(() => {
            if (firstQuestion.type === 'multiple-choice') {
              speakText(firstQuestion.term, firstQuestion.language === 'english' ? 'en' : 'vi')
            }
            // Không đọc tự động trong chế độ chính tả
          }, 200)
        }
      }, 100)
    }
  }

  const speakText = (text: string, lang: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      if (lang === 'en') {
        utterance.lang = 'en-US'
        // Chọn voice chuẩn TOEIC (ưu tiên Google US English, Microsoft Aria Online, hoặc en-US female)
        const voices = window.speechSynthesis.getVoices()
        // Ưu tiên các voice TOEIC-like
        const toeicVoices = voices.filter(v =>
          v.lang === 'en-US' &&
          (
            v.name.toLowerCase().includes('google us english') ||
            v.name.toLowerCase().includes('aria') ||
            v.name.toLowerCase().includes('microsoft') ||
            v.name.toLowerCase().includes('natural') ||
            v.name.toLowerCase().includes('online') ||
            v.name.toLowerCase().includes('female')
          )
        )
        if (toeicVoices.length > 0) {
          utterance.voice = toeicVoices[0]
        } else {
          // Fallback: chọn bất kỳ en-US
          const usVoices = voices.filter(v => v.lang === 'en-US')
          if (usVoices.length > 0) {
            utterance.voice = usVoices[0]
          }
        }
      } else {
        utterance.lang = 'vi-VN'
      }
      utterance.rate = 0.95 // tốc độ tự nhiên hơn cho TOEIC
      speechSynthesis.speak(utterance)
    }
  }

  const playSound = (isCorrect: boolean) => {
    if ('AudioContext' in window || 'webkitAudioContext' in window) {
      const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext
      const audioCtx = new AudioContext()
      
      const oscillator = audioCtx.createOscillator()
      const gainNode = audioCtx.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioCtx.destination)
      
      if (isCorrect) {
        // Âm thanh đúng: cao và dễ chịu
        oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime) // C5
        oscillator.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1) // E5
      } else {
        // Âm thanh sai: thấp và ngắn
        oscillator.frequency.setValueAtTime(220, audioCtx.currentTime) // A3
      }
      
      oscillator.type = 'sine'
      gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2)
      
      oscillator.start(audioCtx.currentTime)
      oscillator.stop(audioCtx.currentTime + 0.2)
    }
  }

  const handleRestart = () => {
    const initialPhase = studyMode === 'spell-only' ? 'spell1' : 'quiz1'
    const firstQuestions = generateQuestionsForPhase(items, initialPhase)
    setQuestions(firstQuestions)
    setCurrentPhase(initialPhase)
    setCurrentQuestionIndex(0)
    setSelectedAnswer('')
    setSpellInput('')
    setShowResult(false)
    setShowHint(false)
    setIncorrectQuestions(new Set()) // Reset danh sách câu sai
    setScore({ correct: 0, total: 0 })
    setPhaseScores({
      quiz1: { correct: 0, total: 0 },
      spell1: { correct: 0, total: 0 },
      quiz2: { correct: 0, total: 0 },
      spell2: { correct: 0, total: 0 }
    })
    
    // Auto đọc từ đầu tiên sau khi restart (chỉ cho trắc nghiệm)
    setTimeout(() => {
      const firstQuestion = firstQuestions[0]
      if (firstQuestion) {
        if (firstQuestion.type === 'multiple-choice') {
          speakText(firstQuestion.term, firstQuestion.language === 'english' ? 'en' : 'vi')
        }
        // Không đọc tự động trong chế độ chính tả
      }
    }, 500)
  }

  // Effect để restart khi thay đổi study mode
  useEffect(() => {
    if (items.length > 0) {
      const initialPhase = studyMode === 'spell-only' ? 'spell1' : 'quiz1'
      const firstQuestions = generateQuestionsForPhase(items, initialPhase)
      setQuestions(firstQuestions)
      setCurrentPhase(initialPhase)
      setCurrentQuestionIndex(0)
      setSelectedAnswer('')
      setSpellInput('')
      setShowResult(false)
      setShowHint(false)
      setIncorrectQuestions(new Set())
      setScore({ correct: 0, total: 0 })
      setPhaseScores({
        quiz1: { correct: 0, total: 0 },
        spell1: { correct: 0, total: 0 },
        quiz2: { correct: 0, total: 0 },
        spell2: { correct: 0, total: 0 }
      })
    }
  }, [studyMode, items, generateQuestionsForPhase])



  const getOverallProgress = () => {
    let totalPhases: number
    let phaseOrder: StudyPhase[]
    
    if (studyMode === 'quiz-only') {
      totalPhases = 2
      phaseOrder = ['quiz1', 'quiz2']
    } else if (studyMode === 'spell-only') {
      totalPhases = 1
      phaseOrder = ['spell1']
    } else {
      totalPhases = 6
      phaseOrder = ['quiz1', 'review1', 'spell1', 'quiz2', 'review2', 'spell2']
    }
    
    const currentPhaseIndex = phaseOrder.indexOf(currentPhase)
    
    if (currentPhase === 'review1' || currentPhase === 'review2') {
      // Cho review phases, tính như hoàn thành phase
      const phaseProgress = currentPhaseIndex + 1
      return (phaseProgress / totalPhases) * 100
    } else {
      const phaseProgress = currentPhaseIndex + (currentQuestionIndex + 1) / questions.length
      return (phaseProgress / totalPhases) * 100
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !set || items.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Lỗi</h3>
        <p className="text-gray-500 mb-4">{error || 'Không đủ từ vựng để tạo câu hỏi'}</p>
        <Link href={`/dashboard/study-sets/${setId}/study`}>
          <Button variant="outline">Quay lại chọn cách học</Button>
        </Link>
      </div>
    )
  }

  if (currentPhase === 'completed') {
    const percentage = Math.round((score.correct / score.total) * 100)
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50 to-blue-50 p-2 sm:p-4">
        <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
          <div className="text-center px-2">
            <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">🎉</div>
            <h1 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-cyan-500 mb-2">Hoàn thành!</h1>
            <p className="text-sm sm:text-base text-gray-600">Bạn đã hoàn thành tất cả giai đoạn học tập</p>
          </div>

          <Card className="bg-white/80 backdrop-blur-sm border border-sky-100 shadow-lg">
            <CardHeader className="p-3 sm:p-6">
              <CardTitle className="text-center text-lg sm:text-xl text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-cyan-500">Kết quả tổng hợp</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 p-3 sm:p-6">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-500 mb-2">
                  {percentage}%
                </div>
                <div className="text-base sm:text-lg text-gray-700">
                  {score.correct} / {score.total} câu đúng
                </div>
              </div>

              {/* Chi tiết từng giai đoạn */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-gradient-to-br from-sky-50 to-cyan-50 border border-sky-200 p-3 sm:p-4 rounded-lg">
                  <h3 className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-sky-700 to-cyan-600 mb-2 text-sm sm:text-base">Trắc nghiệm 1</h3>
                  <p className="text-sky-600 text-sm sm:text-base">
                    {phaseScores.quiz1.correct} / {phaseScores.quiz1.total} 
                    {phaseScores.quiz1.total > 0 && ` (${Math.round((phaseScores.quiz1.correct / phaseScores.quiz1.total) * 100)}%)`}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-200 p-3 sm:p-4 rounded-lg">
                  <h3 className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-pink-700 to-rose-600 mb-2 text-sm sm:text-base">Chính tả 1</h3>
                  <p className="text-pink-600 text-sm sm:text-base">
                    {phaseScores.spell1.correct} / {phaseScores.spell1.total}
                    {phaseScores.spell1.total > 0 && ` (${Math.round((phaseScores.spell1.correct / phaseScores.spell1.total) * 100)}%)`}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 p-3 sm:p-4 rounded-lg">
                  <h3 className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-green-600 mb-2 text-sm sm:text-base">Trắc nghiệm 2</h3>
                  <p className="text-emerald-600 text-sm sm:text-base">
                    {phaseScores.quiz2.correct} / {phaseScores.quiz2.total}
                    {phaseScores.quiz2.total > 0 && ` (${Math.round((phaseScores.quiz2.correct / phaseScores.quiz2.total) * 100)}%)`}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200 p-3 sm:p-4 rounded-lg">
                  <h3 className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-violet-600 mb-2 text-sm sm:text-base">Chính tả 2</h3>
                  <p className="text-purple-600 text-sm sm:text-base">
                    {phaseScores.spell2.correct} / {phaseScores.spell2.total}
                    {phaseScores.spell2.total > 0 && ` (${Math.round((phaseScores.spell2.correct / phaseScores.spell2.total) * 100)}%)`}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4 pt-3 sm:pt-4">
                <Button onClick={handleRestart} className="w-full sm:w-auto text-sm sm:text-base bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-lg hover:shadow-cyan-500/50 transition-shadow">
                  Học lại
                </Button>
                <Link href={`/dashboard/study-sets/${setId}/study`}>
                  <Button variant="outline" className="w-full sm:w-auto text-sm sm:text-base border-sky-300 text-sky-700 hover:bg-sky-50">
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
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50 to-blue-50 p-2 sm:p-4">
      <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link href={`/dashboard/study-sets/${setId}/study`}>
              <Button variant="ghost" size="sm" className="hover:bg-sky-100">
                <ArrowLeft className="mr-1 h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </Link>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-cyan-500 truncate">
                {set.name}
              </h1>
            </div>
          </div>
          
          <div className="text-right sm:text-right">
            {(currentPhase === 'review1' || currentPhase === 'review2') ? (
              <div className="text-xs sm:text-sm text-gray-500">
                {currentPhaseVocabulary.length} từ vựng
              </div>
            ) : (
              <>
                <div className="text-xs sm:text-sm text-gray-500">
                  Câu {currentQuestionIndex + 1} / {questions.length}
                </div>
                <div className="text-xs sm:text-sm font-medium text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-500">
                  Điểm: {score.correct} / {score.total}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Study Mode Selector */}
        <div className="bg-white/80 backdrop-blur-sm border border-sky-100 rounded-lg p-3 sm:p-4 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <div className="flex items-center space-x-2">
              <Settings className="h-4 w-4 text-sky-600" />
              <span className="text-xs sm:text-sm font-medium text-gray-700">Chế độ học:</span>
            </div>
            <select
              value={studyMode}
              onChange={(e) => setStudyMode(e.target.value as StudyMode)}
              className="text-xs sm:text-sm border-2 border-sky-200 rounded-lg px-2 sm:px-3 py-1 bg-white/50 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 w-full sm:w-auto"
            >
              <option value="mixed">🔀 Cả hai (Trắc nghiệm + Chính tả)</option>
              <option value="quiz-only">🎯 Chỉ trắc nghiệm</option>
              <option value="spell-only">✍️ Chỉ chính tả</option>
            </select>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="bg-white/80 backdrop-blur-sm border border-sky-100 rounded-lg p-3 sm:p-4 shadow-lg">
          <div className="flex justify-between text-xs sm:text-sm text-gray-600 mb-2">
            <span>Tiến độ </span>
            <span>{Math.round(getOverallProgress())}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-sky-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getOverallProgress()}%` }}
            ></div>
          </div>
        </div>



        {/* Review Screen or Question */}
        {(currentPhase === 'review1' || currentPhase === 'review2') ? (
          <Card className="bg-white/80 backdrop-blur-sm border border-sky-100 shadow-lg">
            <CardHeader className="p-3 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-1 sm:space-y-0">
                <CardTitle className="text-lg sm:text-xl text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-cyan-500">Ôn tập từ vựng</CardTitle>
                <div className="text-xs sm:text-sm text-gray-500">
                  Bấm vào từ tiếng Anh để nghe phát âm
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              <div className="space-y-3 sm:space-y-4">
                {/* Danh sách từ vựng */}
                <div className="space-y-3 max-h-80 sm:max-h-96 overflow-y-auto">
                  {currentPhaseVocabulary.map((item) => (
                    <div 
                      key={item.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gradient-to-r from-sky-50 to-cyan-50 border border-sky-100 rounded-lg hover:bg-gradient-to-r hover:from-sky-100 hover:to-cyan-100 transition-colors space-y-2 sm:space-y-0"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0">
                          <div className="text-base sm:text-lg font-semibold text-gray-900 break-words">
                            {item.english}
                          </div>
                          <div className="text-gray-600 hidden sm:block">→</div>
                          <div className="text-base sm:text-lg text-gray-700 break-words">
                            {item.vietnamese}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => speakText(item.english, 'en')}
                        className="flex items-center justify-center space-x-1 hover:bg-sky-200 self-end sm:self-center"
                      >
                        <Volume2 className="h-4 w-4 text-sky-600" />
                      </Button>
                    </div>
                  ))}
                </div>
                
                {/* Nút tiếp theo */}
                <div className="text-center pt-3 sm:pt-4 border-t border-sky-100">
                  <Button 
                    onClick={moveToNextPhase}
                    size="lg"
                    className="px-6 sm:px-8 w-full sm:w-auto bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-lg hover:shadow-cyan-500/50 transition-shadow"
                  >
                    Bắt đầu chính tả
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-white/80 backdrop-blur-sm border border-sky-100 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-cyan-500">
                  {currentQuestion?.type === 'multiple-choice' 
                    ? (currentQuestion.language === 'english' ? 'Tiếng Anh → Tiếng Việt' : 'Tiếng Việt → Tiếng Anh')
                    : 'Chính tả'
                  }
                </CardTitle>
                {currentQuestion?.vocabularyItem && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => speakText(
                      currentQuestion.type === 'spelling' 
                        ? currentQuestion.vocabularyItem.vietnamese 
                        : currentQuestion.term, 
                      currentQuestion.language === 'english' ? 'en' : 'vi'
                    )}
                    className="hover:bg-sky-100"
                  >
                    <Volume2 className="h-4 w-4 text-sky-600" />
                  </Button>
                )}
              </div>
            </CardHeader>
                      <CardContent className="p-3 sm:p-6">
              <div className="text-center mb-4 sm:mb-6">
                <div className="text-lg sm:text-2xl font-bold text-gray-900 mb-2 px-2">
                  {currentQuestion?.term}
                </div>
                <div className="text-xs sm:text-sm text-gray-500">
                  {currentQuestion?.type === 'multiple-choice' ? 'Chọn nghĩa đúng' : 'Nhập từ tiếng Anh'}
                </div>
              </div>

              {currentQuestion?.type === 'multiple-choice' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {currentQuestion.options?.map((option, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className={`p-3 sm:p-4 h-auto text-left justify-start min-h-[48px] sm:min-h-[56px] border-2 ${
                        showResult
                          ? option === currentQuestion.correctAnswer
                            ? 'bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-500 text-emerald-700'
                            : option === selectedAnswer
                            ? 'bg-gradient-to-r from-red-50 to-rose-50 border-red-500 text-red-700'
                            : 'opacity-50 border-gray-200'
                          : selectedAnswer === option
                          ? 'bg-gradient-to-r from-sky-50 to-cyan-50 border-sky-500 text-sky-700'
                          : 'border-sky-200 hover:bg-gradient-to-r hover:from-sky-50 hover:to-cyan-50 hover:border-sky-300'
                      }`}
                      onClick={() => handleAnswerSelect(option)}
                      disabled={showResult}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-sm sm:text-base leading-tight break-words pr-2">{option}</span>
                        {showResult && option === currentQuestion.correctAnswer && (
                          <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />
                        )}
                        {showResult && option === selectedAnswer && option !== currentQuestion.correctAnswer && (
                          <X className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 flex-shrink-0" />
                        )}
                      </div>
                    </Button>
                  ))}
                </div>
                          ) : (
                <div className="space-y-3 sm:space-y-4">
                  <Input
                    ref={spellInputRef}
                    placeholder="Nhập từ tiếng Anh..."
                    value={spellInput}
                    onChange={(e) => setSpellInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !showResult) {
                        handleSpellSubmit()
                      }
                    }}
                    disabled={showResult}
                    className={`text-base sm:text-lg p-3 sm:p-4 border-2 ${
                      showResult
                        ? spellInput.toLowerCase() === currentQuestion.correctAnswer.toLowerCase()
                          ? 'bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-500 text-emerald-700'
                          : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-500 text-red-700'
                        : 'border-sky-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100'
                    }`}
                  />
                  {showResult && spellInput.toLowerCase() !== currentQuestion.correctAnswer.toLowerCase() && (
                    <div className="text-center text-red-600 text-sm sm:text-base px-2">
                      Đáp án đúng: <strong>{currentQuestion.correctAnswer}</strong>
                    </div>
                  )}
                  {!showResult && (
                    <div className="space-y-3">
                      <div className="flex justify-center">
                        <Button 
                          onClick={handleHint} 
                          variant="outline" 
                          size="sm"
                          disabled={showHint}
                          className="text-xs px-3 py-2 border-sky-300 text-sky-700 hover:bg-sky-50"
                        >
                          💡 Gợi ý (2 ký tự đầu)
                        </Button>
                      </div>
                      <Button onClick={handleSpellSubmit} className="w-full text-base sm:text-lg bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-lg hover:shadow-cyan-500/50 transition-shadow" size="lg">
                        Kiểm tra
                      </Button>
                    </div>
                  )}
                </div>
            )}

            {showResult && currentQuestion?.type === 'spelling' && (
              <div className="mt-6 text-center">
                <Button onClick={handleNext} size="lg" className="bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-lg hover:shadow-cyan-500/50 transition-shadow">
                  {currentQuestionIndex < questions.length - 1 
                    ? 'Câu tiếp theo' 
                    : (currentPhase === 'spell2' ? 'Hoàn thành' : 'Giai đoạn tiếp theo')
                  }
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        )}
      </div>
    </div>
  )
} 