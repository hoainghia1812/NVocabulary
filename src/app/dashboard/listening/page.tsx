"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { getVocabularySets, getVocabularyItems, getAllUserVocabularyItems } from '@/lib/api/vocabulary'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RotateCcw, Settings, Play, Volume2, VolumeX, SkipForward, Headphones } from "lucide-react"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'

interface VocabularyItem {
  english: string
  vietnamese: string
}

export default function ListeningPracticePage() {
  const [input, setInput] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [answered, setAnswered] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [wordlist, setWordlist] = useState("")
  const [vocabularyItems, setVocabularyItems] = useState<VocabularyItem[]>([])
  const [autoNext, setAutoNext] = useState(true)
  const [showVietnamese, setShowVietnamese] = useState(true)
  const [playbackSpeed, setPlaybackSpeed] = useState(0.8)
  const [vocabularySource, setVocabularySource] = useState<'custom' | 'all' | 'random'>('all')
  const [randomCount, setRandomCount] = useState(50)
  const [finished, setFinished] = useState(false)
  const [wrongAnswers, setWrongAnswers] = useState<Array<{typed: string, correct: string, vietnamese: string}>>([])
  const [skippedAnswers, setSkippedAnswers] = useState<Array<{correct: string, vietnamese: string}>>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const synth = useRef<SpeechSynthesis | null>(null)
  const utterance = useRef<SpeechSynthesisUtterance | null>(null)
  const audioContext = useRef<AudioContext | null>(null)
  const [audioUnlocked, setAudioUnlocked] = useState(false)

  useEffect(() => {
    // Initialize speech synthesis and audio context
    if (typeof window !== 'undefined') {
      synth.current = window.speechSynthesis
      utterance.current = new SpeechSynthesisUtterance()
      utterance.current.lang = 'en-US'
      utterance.current.rate = playbackSpeed
      
              // Initialize audio context for sound effects
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)()
        } catch (error) {
          console.warn('Web Audio API not supported:', error)
        }
    }
  }, [playbackSpeed])

  // Unlock audio context on mobile
  const unlockAudioContext = useCallback(async () => {
    if (!audioContext.current || audioUnlocked) return
    
    try {
      // Create a silent audio to unlock context
      const oscillator = audioContext.current.createOscillator()
      const gainNode = audioContext.current.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.current.destination)
      
      gainNode.gain.setValueAtTime(0, audioContext.current.currentTime)
      oscillator.start()
      oscillator.stop(audioContext.current.currentTime + 0.1)
      
      // Resume context if suspended
      if (audioContext.current.state === 'suspended') {
        await audioContext.current.resume()
      }
      
      setAudioUnlocked(true)
    } catch (error) {
      console.warn('Failed to unlock audio context:', error)
    }
  }, [audioUnlocked])

  // Sound effect functions
  const playSuccessSound = useCallback(async () => {
    if (!audioContext.current || isMuted) return
    
    // Try to unlock audio first
    if (!audioUnlocked) {
      await unlockAudioContext()
    }
    
    try {
      const oscillator = audioContext.current.createOscillator()
      const gainNode = audioContext.current.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.current.destination)
      
      // Success sound: rising tone
      oscillator.frequency.setValueAtTime(523.25, audioContext.current.currentTime) // C5
      oscillator.frequency.setValueAtTime(659.25, audioContext.current.currentTime + 0.1) // E5
      oscillator.frequency.setValueAtTime(783.99, audioContext.current.currentTime + 0.2) // G5
      
      gainNode.gain.setValueAtTime(0.3, audioContext.current.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.current.currentTime + 0.3)
      
      oscillator.start()
      oscillator.stop(audioContext.current.currentTime + 0.3)
    } catch (error) {
      console.warn('Error playing success sound:', error)
    }
  }, [isMuted, audioUnlocked, unlockAudioContext])

  const playErrorSound = useCallback(async () => {
    if (!audioContext.current || isMuted) return
    
    // Try to unlock audio first
    if (!audioUnlocked) {
      await unlockAudioContext()
    }
    
    try {
      const oscillator = audioContext.current.createOscillator()
      const gainNode = audioContext.current.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.current.destination)
      
      // Error sound: lower tone
      oscillator.frequency.setValueAtTime(220, audioContext.current.currentTime) // A3
      oscillator.type = 'sawtooth'
      
      gainNode.gain.setValueAtTime(0.2, audioContext.current.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.current.currentTime + 0.5)
      
      oscillator.start()
      oscillator.stop(audioContext.current.currentTime + 0.5)
    } catch (error) {
      console.warn('Error playing error sound:', error)
    }
  }, [isMuted, audioUnlocked, unlockAudioContext])

  const playCurrentWord = useCallback(async () => {
    // Unlock audio context on first interaction
    if (!audioUnlocked) {
      await unlockAudioContext()
    }
    
    if (synth.current && utterance.current && !isMuted) {
      const currentItem = vocabularyItems[currentIndex]
      if (currentItem) {
        utterance.current.text = currentItem.english
        utterance.current.rate = playbackSpeed
        synth.current.speak(utterance.current)
        setIsPlaying(true)
        utterance.current.onend = () => setIsPlaying(false)
      }
    }
  }, [isMuted, vocabularyItems, currentIndex, playbackSpeed, audioUnlocked, unlockAudioContext])

  useEffect(() => {
    // Auto play word when it becomes current and auto focus input
    if (!finished && vocabularyItems.length > 0) {
      const timer = setTimeout(async () => {
        await playCurrentWord()
        // Auto focus input for new question
        if (inputRef.current) {
          inputRef.current.focus()
        }
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [currentIndex, vocabularyItems, finished, playCurrentWord])

  useEffect(() => {
    // Load vocabulary from localStorage or API
    const loadVocabulary = async () => {
      const saved = localStorage.getItem('listening_wordlist')
      const savedSource = localStorage.getItem('listening_vocabulary_source') as 'custom' | 'all' | 'random' || 'all'
      const savedRandomCount = parseInt(localStorage.getItem('listening_random_count') || '50')
      
      setVocabularySource(savedSource)
      setRandomCount(savedRandomCount)
      
      if (saved && savedSource === 'custom') {
        try {
          const items = JSON.parse(saved)
          setVocabularyItems(items)
          setWordlist(items.map((item: VocabularyItem) => `${item.english}|${item.vietnamese}`).join('\n'))
          return
        } catch {
          setVocabularyItems([])
        }
      }
      
      // Load from API based on source
      try {
        let allItems: { english: string; vietnamese: string }[] = []
        
        if (savedSource === 'all' || savedSource === 'random') {
          // Get all vocabulary items from user's sets
          allItems = await getAllUserVocabularyItems()
        } else {
          // Fallback to first set if no source specified
          const sets = await getVocabularySets()
          if (sets.length > 0) {
            allItems = await getVocabularyItems(sets[0].id)
          }
        }
        
        if (allItems.length === 0) {
          setVocabularyItems([])
          return
        }
        
        let finalItems = allItems.map(item => ({
          english: item.english,
          vietnamese: item.vietnamese
        }))
        
        // If random source, shuffle and limit count
        if (savedSource === 'random') {
          finalItems = finalItems.sort(() => Math.random() - 0.5)
          if (savedRandomCount > 0) {
            finalItems = finalItems.slice(0, savedRandomCount)
          }
        }
        
        setVocabularyItems(finalItems)
        setWordlist(finalItems.map(item => `${item.english}|${item.vietnamese}`).join('\n'))
      } catch {
        setVocabularyItems([])
      }
    }
    loadVocabulary()
  }, [])

  const handleSubmit = async () => {
    if (!vocabularyItems[currentIndex]) return
    
    // Unlock audio context on first interaction
    if (!audioUnlocked) {
      await unlockAudioContext()
    }
    
    const currentItem = vocabularyItems[currentIndex]
    const userAnswer = input.trim().toLowerCase()
    const correctAnswer = currentItem.english.toLowerCase()
    
    setAnswered(prev => prev + 1)
    setShowAnswer(true)
    
    if (userAnswer === correctAnswer) {
      setScore(prev => prev + 1)
      await playSuccessSound()
    } else {
      setWrongAnswers(prev => [...prev, {
        typed: input.trim(),
        correct: currentItem.english,
        vietnamese: currentItem.vietnamese
      }])
      await playErrorSound()
    }

    if (autoNext) {
      setTimeout(handleNext, 2000)
    }
  }

  const handleNext = () => {
    if (currentIndex >= vocabularyItems.length - 1) {
      setFinished(true)
      return
    }
    
    setInput("")
    setShowAnswer(false)
    setCurrentIndex(prev => prev + 1)
    // Auto focus on input when moving to next question
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus()
      }
    }, 100)
  }

  const handleSkip = () => {
    setAnswered(prev => prev + 1)
    setSkippedAnswers(prev => [...prev, {
      correct: vocabularyItems[currentIndex]?.english || "",
      vietnamese: vocabularyItems[currentIndex]?.vietnamese || ""
    }])
    handleNext()
  }

  const handleReset = () => {
    setInput("")
    setCurrentIndex(0)
    setScore(0)
    setAnswered(0)
    setShowAnswer(false)
    setFinished(false)
    setWrongAnswers([])
    setSkippedAnswers([])
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus()
      }
    }, 100)
  }

  const currentItem = vocabularyItems[currentIndex]
  const accuracy = answered > 0 ? Math.round((score / answered) * 100) : 0
  const progress = vocabularyItems.length > 0 ? Math.round(((currentIndex + 1) / vocabularyItems.length) * 100) : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50 to-blue-50 p-2 sm:p-4 lg:p-6">
      <div className="w-full max-w-4xl mx-auto pt-2 sm:pt-8">
        {/* Header */}
        <div className="text-center mb-3 sm:mb-6 lg:mb-8">
          <h1 className="text-xl sm:text-3xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-cyan-500 mb-1 sm:mb-2">
            Luyện nghe từ vựng
          </h1>
          <p className="text-xs sm:text-base text-gray-600 hidden sm:block">Cải thiện khả năng nghe và viết từ vựng tiếng Anh</p>
        </div>

        {/* Stats Bar */}
        <div className="flex flex-row justify-center items-center gap-2 sm:gap-4 lg:gap-6 mb-3 sm:mb-6 lg:mb-8">
          <div className="bg-white/80 backdrop-blur-sm border border-sky-100 rounded-lg sm:rounded-2xl shadow-lg px-3 sm:px-6 py-2 sm:py-4 text-center flex-1 sm:flex-none sm:min-w-[100px]">
            <div className="text-lg sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-cyan-500">{score}</div>
            <div className="text-xs sm:text-sm text-gray-600">Đúng</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm border border-sky-100 rounded-lg sm:rounded-2xl shadow-lg px-3 sm:px-6 py-2 sm:py-4 text-center flex-1 sm:flex-none sm:min-w-[100px]">
            <div className="text-lg sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-500">{accuracy}%</div>
            <div className="text-xs sm:text-sm text-gray-600">Độ chính xác</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm border border-sky-100 rounded-lg sm:rounded-2xl shadow-lg px-3 sm:px-6 py-2 sm:py-4 text-center flex-1 sm:flex-none sm:min-w-[100px]">
            <div className="text-lg sm:text-2xl font-bold text-gray-700">{progress}%</div>
            <div className="text-xs sm:text-sm text-gray-600">Tiến độ</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm border border-sky-100 rounded-lg sm:rounded-2xl shadow-lg px-3 sm:px-6 py-2 sm:py-4 text-center flex-1 sm:flex-none sm:min-w-[100px]">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsMuted(!isMuted)}
              className="w-full h-full flex flex-col items-center justify-center hover:bg-sky-50"
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4 sm:h-6 sm:w-6 text-gray-400" />
              ) : (
                <Volume2 className="h-4 w-4 sm:h-6 sm:w-6 text-sky-600" />
              )}
              <span className="text-xs sm:text-sm text-gray-600 mt-1">
                {isMuted ? 'Unmute' : 'Mute'}
              </span>
            </Button>
          </div>
        </div>

        {/* Main Listening Area */}
        <div className="bg-white/80 backdrop-blur-sm border border-sky-100 rounded-xl sm:rounded-3xl shadow-lg p-3 sm:p-6 lg:p-8 mb-3 sm:mb-6">
          {vocabularyItems.length === 0 ? (
            <div className="text-center text-gray-400 py-8 sm:py-16">
              <Headphones className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-sky-300 mb-4" />
              <div className="text-lg sm:text-xl mb-2 text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-cyan-500">
                Chưa có từ vựng
              </div>
              <div className="text-xs sm:text-sm">Vui lòng thêm từ vựng trong cài đặt để bắt đầu luyện tập</div>
            </div>
          ) : finished ? (
            <div className="text-center py-8 sm:py-12">
              <h2 className="text-xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-cyan-500 mb-4 sm:mb-6">
                Hoàn thành!
              </h2>
              <div className="grid grid-cols-3 gap-3 sm:gap-6 mb-6">
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-lg sm:rounded-2xl p-3 sm:p-6">
                  <div className="text-lg sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-500 mb-1 sm:mb-2">{score}</div>
                  <div className="text-xs sm:text-base text-emerald-700">Đúng</div>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 rounded-lg sm:rounded-2xl p-3 sm:p-6">
                  <div className="text-lg sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-rose-500 mb-1 sm:mb-2">{answered - score}</div>
                  <div className="text-xs sm:text-base text-red-700">Sai</div>
                </div>
                <div className="bg-gradient-to-br from-sky-50 to-cyan-50 border border-sky-200 rounded-lg sm:rounded-2xl p-3 sm:p-6">
                  <div className="text-lg sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-cyan-500 mb-1 sm:mb-2">{accuracy}%</div>
                  <div className="text-xs sm:text-base text-sky-700">Độ chính xác</div>
                </div>
              </div>

{(wrongAnswers.length > 0 || skippedAnswers.length > 0) && (
                <div className="mb-6 space-y-4">
                  {wrongAnswers.length > 0 && (
                    <div>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">
                        Từ sai ({wrongAnswers.length})
                      </h3>
                      <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-lg sm:rounded-2xl p-3 sm:p-4 max-h-40 sm:max-h-60 overflow-y-auto">
                        <div className="space-y-2">
                          {wrongAnswers.map((item, index) => (
                            <div key={index} className="flex justify-between items-center bg-white/80 backdrop-blur-sm rounded p-2 sm:p-3 border border-red-100">
                              <div className="flex flex-col text-left flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-red-600 font-medium text-sm">{item.typed}</span>
                                  <span className="text-gray-400">→</span>
                                  <span className="text-emerald-600 font-medium text-sm">{item.correct}</span>
                                </div>
                                <span className="text-gray-500 text-xs">{item.vietnamese}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {skippedAnswers.length > 0 && (
                    <div>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">
                        Từ bỏ qua ({skippedAnswers.length})
                      </h3>
                      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg sm:rounded-2xl p-3 sm:p-4 max-h-40 sm:max-h-60 overflow-y-auto">
                        <div className="space-y-2">
                          {skippedAnswers.map((item, index) => (
                            <div key={index} className="flex justify-between items-center bg-white/80 backdrop-blur-sm rounded p-2 sm:p-3 border border-amber-100">
                              <div className="flex flex-col text-left flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-amber-600 font-medium text-sm">(Bỏ qua)</span>
                                  <span className="text-gray-400">→</span>
                                  <span className="text-emerald-600 font-medium text-sm">{item.correct}</span>
                                </div>
                                <span className="text-gray-500 text-xs">{item.vietnamese}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <Button 
                onClick={handleReset} 
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-lg hover:shadow-cyan-500/50 transition-shadow"
              >
                <RotateCcw className="h-5 w-5 mr-2" />
                Thử lại
              </Button>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {/* Question Display */}
              <div className="text-center">
                <div className="text-lg sm:text-xl text-gray-600 mb-2 sm:mb-4">
                  Câu {currentIndex + 1} / {vocabularyItems.length}
                </div>
                
                {/* Audio Controls */}
                <div className="bg-gradient-to-r from-sky-50 to-cyan-50 rounded-2xl p-4 sm:p-8 mb-4 sm:mb-6 border border-sky-100">
                  <div className="flex flex-col items-center space-y-3 sm:space-y-4">
                    <Headphones className="h-12 w-12 sm:h-16 sm:w-16 text-sky-600" />
                    <div className="text-sm sm:text-base text-gray-600 mb-2">Nghe và viết từ bạn nghe được</div>
                    <Button
                      onClick={() => playCurrentWord()}
                      disabled={isPlaying}
                      className="bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-lg hover:shadow-cyan-500/50 transition-shadow px-6 py-3 rounded-2xl"
                    >
                      {isPlaying ? (
                        <Volume2 className="h-5 w-5 mr-2 animate-pulse" />
                      ) : (
                        <Play className="h-5 w-5 mr-2" />
                      )}
                      {isPlaying ? 'Đang phát...' : 'Phát âm'}
                    </Button>
                  </div>
                </div>

                {/* Vietnamese hint */}
                {showVietnamese && currentItem && (
                  <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg p-3 sm:p-4 mb-4">
                    <div className="text-sm text-gray-600 mb-1">Gợi ý:</div>
                    <div className="text-base sm:text-lg font-medium text-amber-700">{currentItem.vietnamese}</div>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="space-y-3 sm:space-y-4">
                <Input
                  ref={inputRef}
                  className="text-base sm:text-xl p-3 sm:p-4 bg-white/50 rounded-2xl border-2 border-sky-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all duration-200 text-center"
                  placeholder="Viết từ bạn nghe được..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !showAnswer) {
                      handleSubmit()
                    } else if (e.key === 'Enter' && showAnswer) {
                      handleNext()
                    }
                  }}
                  disabled={showAnswer}
                  autoFocus
                />

                {/* Answer Display */}
                {showAnswer && currentItem && (
                  <div className={`p-3 sm:p-4 rounded-2xl border-2 ${
                    input.trim().toLowerCase() === currentItem.english.toLowerCase()
                      ? 'bg-emerald-50 border-emerald-200'
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="text-center">
                      <div className={`text-lg sm:text-xl font-bold mb-2 ${
                        input.trim().toLowerCase() === currentItem.english.toLowerCase()
                          ? 'text-emerald-600'
                          : 'text-red-600'
                      }`}>
                        {input.trim().toLowerCase() === currentItem.english.toLowerCase() ? 'Chính xác!' : 'Sai rồi!'}
                      </div>
                      <div className="text-gray-700">
                        <span className="font-medium">Đáp án: </span>
                        <span className="text-lg font-bold text-emerald-600">{currentItem.english}</span>
                      </div>
                      <div className="text-gray-600 text-sm mt-1">
                        {currentItem.vietnamese}
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 sm:gap-3">
                  {!showAnswer ? (
                    <>
                      <Button 
                        onClick={handleSubmit}
                        disabled={!input.trim()}
                        className="flex-1 bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-lg hover:shadow-cyan-500/50 transition-shadow py-2 sm:py-3 rounded-xl"
                      >
                        Kiểm tra
                      </Button>
                      <Button 
                        onClick={handleSkip}
                        variant="outline"
                        className="flex-1 border-sky-300 text-sky-700 hover:bg-sky-50 py-2 sm:py-3 rounded-xl"
                      >
                        <SkipForward className="h-4 w-4 mr-1" />
                        Bỏ qua
                      </Button>
                    </>
                  ) : (
                    <Button 
                      onClick={handleNext}
                      className="flex-1 bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-lg hover:shadow-cyan-500/50 transition-shadow py-2 sm:py-3 rounded-xl"
                    >
                      {currentIndex >= vocabularyItems.length - 1 ? 'Hoàn thành' : 'Tiếp theo'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Control Buttons */}
        <div className="flex gap-2 sm:gap-4 justify-center">
          <Button 
            onClick={handleReset}
            variant="outline"
            className="px-4 sm:px-6 py-2 sm:py-3 rounded-xl border-sky-300 text-sky-700 hover:bg-sky-50"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Làm lại
          </Button>
          
          <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline"
                className="px-4 sm:px-6 py-2 sm:py-3 rounded-xl border-sky-300 text-sky-700 hover:bg-sky-50"
              >
                <Settings className="h-4 w-4 mr-2" />
                Cài đặt
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-md sm:max-w-lg mx-auto max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm border border-sky-100">
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-xl text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-cyan-500">
                  Cài đặt luyện nghe
                </DialogTitle>
                <DialogDescription className="text-sm sm:text-base text-gray-600">
                  Tùy chỉnh phiên luyện nghe của bạn
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 sm:space-y-6 px-1">
                <div>
                  <label className="block font-medium mb-2 text-gray-700">
                    Nguồn từ vựng:
                  </label>
                  <select
                    className="w-full border-2 border-sky-200 rounded-lg px-3 py-2 focus:border-sky-400 focus:outline-none bg-white/50"
                    value={vocabularySource}
                    onChange={e => setVocabularySource(e.target.value as 'custom' | 'all' | 'random')}
                  >
                    <option value="all">Tất cả từ vựng của tôi</option>
                    <option value="random">Ngẫu nhiên từ bộ sưu tập</option>
                    <option value="custom">Tùy chỉnh danh sách</option>
                  </select>
                </div>
                
                {vocabularySource === 'random' && (
                  <div>
                    <label className="block font-medium mb-2 text-gray-700">
                      Số từ ngẫu nhiên:
                    </label>
                    <select
                      className="w-full border-2 border-sky-200 rounded-lg px-3 py-2 focus:border-sky-400 focus:outline-none bg-white/50"
                      value={randomCount}
                      onChange={e => setRandomCount(Number(e.target.value))}
                    >
                      <option value={20}>20 từ</option>
                      <option value={30}>30 từ</option>
                      <option value={50}>50 từ</option>
                      <option value={100}>100 từ</option>
                      <option value={200}>200 từ</option>
                      <option value={-1}>Tất cả</option>
                    </select>
                  </div>
                )}
                
                <div>
                  <label className="block font-medium mb-2 text-gray-700">
                    Tốc độ phát âm:
                  </label>
                  <select
                    className="w-full border-2 border-sky-200 rounded-lg px-3 py-2 focus:border-sky-400 focus:outline-none bg-white/50"
                    value={playbackSpeed}
                    onChange={e => setPlaybackSpeed(Number(e.target.value))}
                  >
                    <option value={0.5}>Chậm (0.5x)</option>
                    <option value={0.7}>Hơi chậm (0.7x)</option>
                    <option value={0.8}>Bình thường chậm (0.8x)</option>
                    <option value={1.0}>Bình thường (1.0x)</option>
                    <option value={1.2}>Hơi nhanh (1.2x)</option>
                  </select>
                </div>
{vocabularySource === 'custom' && (
                  <div>
                    <label className="block font-medium mb-2 text-gray-700">
                      Danh sách từ vựng:
                      <span className="text-sm text-gray-500 block">
                        (nhập theo định dạng: từ tiếng Anh|nghĩa tiếng Việt, mỗi dòng một từ)
                      </span>
                    </label>
                    <Textarea
                      value={wordlist}
                      onChange={e => setWordlist(e.target.value)}
                      className="min-h-[100px] border-2 border-sky-200 rounded-lg focus:border-sky-400 bg-white/50"
                      placeholder="apple|táo&#10;book|sách&#10;car|xe hơi"
                      rows={6}
                    />
                  </div>
                )}
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <input
                      id="showVietnamese"
                      type="checkbox"
                      checked={showVietnamese}
                      onChange={e => setShowVietnamese(e.target.checked)}
                      className="w-4 h-4 text-sky-600 border-sky-300 rounded focus:ring-sky-500"
                    />
                    <label htmlFor="showVietnamese" className="font-medium text-gray-700">
                      Hiển thị gợi ý tiếng Việt
                    </label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      id="autoNext"
                      type="checkbox"
                      checked={autoNext}
                      onChange={e => setAutoNext(e.target.checked)}
                      className="w-4 h-4 text-sky-600 border-sky-300 rounded focus:ring-sky-500"
                    />
                    <label htmlFor="autoNext" className="font-medium text-gray-700">
                      Tự động chuyển câu tiếp theo
                    </label>
                  </div>
                </div>
              </div>
              <DialogFooter className="pt-6 flex-col sm:flex-row gap-2 sm:gap-0">
                <Button 
                  variant="outline" 
                  onClick={() => setSettingsOpen(false)}
                  className="w-full sm:w-auto order-2 sm:order-1 border-sky-300 text-sky-700 hover:bg-sky-50"
                >
                  Hủy
                </Button>
<Button 
                  onClick={async () => {
                    try {
                      // Save settings to localStorage
                      localStorage.setItem('listening_vocabulary_source', vocabularySource)
                      localStorage.setItem('listening_random_count', randomCount.toString())
                      
                      let finalItems: VocabularyItem[] = []
                      
                      if (vocabularySource === 'custom') {
                        const lines = wordlist.split('\n').filter(line => line.trim())
                        const items = lines.map(line => {
                          const [english, vietnamese] = line.split('|').map(s => s.trim())
                          return { english: english || '', vietnamese: vietnamese || '' }
                        }).filter(item => item.english)
                        
                        localStorage.setItem('listening_wordlist', JSON.stringify(items))
                        finalItems = items
                      } else {
                        // Load from API
                        let allItems: { english: string; vietnamese: string }[] = []
                        
                        if (vocabularySource === 'all' || vocabularySource === 'random') {
                          allItems = await getAllUserVocabularyItems()
                        }
                        
                        if (allItems.length === 0) {
                          alert('Không tìm thấy từ vựng nào. Vui lòng tạo bộ từ vựng trước.')
                          return
                        }
                        
                        finalItems = allItems.map(item => ({
                          english: item.english,
                          vietnamese: item.vietnamese
                        }))
                        
                        // If random source, shuffle and limit count
                        if (vocabularySource === 'random') {
                          finalItems = finalItems.sort(() => Math.random() - 0.5)
                          if (randomCount > 0) {
                            finalItems = finalItems.slice(0, randomCount)
                          }
                        }
                      }
                      
                      setVocabularyItems(finalItems)
                      handleReset()
                      setSettingsOpen(false)
                    } catch {
                      alert('Có lỗi xảy ra. Vui lòng thử lại.')
                    }
                  }}
                  className="w-full sm:w-auto order-1 sm:order-2 bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-lg hover:shadow-cyan-500/50 transition-shadow"
                >
                  Áp dụng
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
} 