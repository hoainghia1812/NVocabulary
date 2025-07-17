"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { getVocabularySets, getVocabularyItems } from '@/lib/api/vocabulary'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RotateCcw, Settings, Play, Pause, Volume2, VolumeX } from "lucide-react"
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

function pad(num: number) {
  return num < 10 ? `0${num}` : num
}

export default function TypingPracticePage() {
  const [input, setInput] = useState("")
  const [timer, setTimer] = useState(600) // 10:00 in seconds
  const [running, setRunning] = useState(false)
  const [finished, setFinished] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [duration, setDuration] = useState(60)
  const [wordlist, setWordlist] = useState("")
  const [randomize, setRandomize] = useState(true)
  const [wordArray, setWordArray] = useState<string[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [wrongCount, setWrongCount] = useState(0)
  const [wrongWords, setWrongWords] = useState<Array<{typed: string, correct: string}>>([])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const synth = useRef<SpeechSynthesis | null>(null)
  const utterance = useRef<SpeechSynthesisUtterance | null>(null)
  const [incorrectWords, setIncorrectWords] = useState<Set<number>>(new Set())

  useEffect(() => {
    // Initialize speech synthesis
    if (typeof window !== 'undefined') {
      synth.current = window.speechSynthesis
      utterance.current = new SpeechSynthesisUtterance()
      utterance.current.lang = 'en-US'
      utterance.current.rate = 0.9
    }
  }, [])

  const playCurrentWord = useCallback(() => {
    if (synth.current && utterance.current && !isMuted) {
      const currentWord = wordArray[currentIndex]
      if (currentWord) {
        utterance.current.text = currentWord
        synth.current.speak(utterance.current)
        setIsPlaying(true)
        utterance.current.onend = () => setIsPlaying(false)
      }
    }
  }, [isMuted, wordArray, currentIndex])

  useEffect(() => {
    // Play word when it becomes current
    if (running && !finished && !isMuted) {
      playCurrentWord()
    }
  }, [currentIndex, running, isMuted, finished, playCurrentWord])

  useEffect(() => {
    // Ưu tiên lấy wordlist từ localStorage
    const saved = localStorage.getItem('typing_wordlist')
    if (saved) {
      setWordlist(saved)
      const arr = saved.split(/\s+|\|/).filter(Boolean)
      setWordArray(arr)
    } else {
      // Nếu chưa có, lấy từ API như cũ
      (async () => {
        try {
          const sets = await getVocabularySets()
          if (sets.length === 0) {
            setWordArray([])
            return
          }
          const items = await getVocabularyItems(sets[0].id)
          setWordArray(items.map(item => item.english))
        } catch {
          setWordArray([])
        }
      })()
    }
  }, [])

  useEffect(() => {
    if (running && timer > 0) {
      intervalRef.current = setInterval(() => {
        setTimer(t => t - 1)
      }, 1000)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [running, timer])

  useEffect(() => {
    if (timer === 0) {
      setRunning(false)
      setFinished(true)
    }
  }, [timer])

  const handleStart = () => {
    setRunning(true)
    setFinished(false)
    if (inputRef.current) inputRef.current.focus()
  }

  const handleReset = () => {
    setInput("")
    setTimer(duration)
    setRunning(false)
    setFinished(false)
    setCurrentIndex(0)
    setCorrectCount(0)
    setWrongCount(0)
    setWrongWords([])
    // reset lại wordArray từ wordlist hiện tại
    const arr = wordlist.split(/\s+|\|/).filter(Boolean)
    setWordArray(arr)
    if (inputRef.current) inputRef.current.focus()
  }

  // Update handleInputChange to check for errors in real-time
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newInput = event.target.value
    setInput(newInput)
    
    // Check if the current input is a complete word and incorrect
    const currentWord = wordArray[currentIndex] || ""
    if (newInput.length > 0 && !currentWord.startsWith(newInput)) {
      setIncorrectWords(prev => new Set(prev).add(currentIndex))
    } else if (newInput.length === 0) {
      // Remove from incorrect words if input is cleared
      setIncorrectWords(prev => {
        const newSet = new Set(prev)
        newSet.delete(currentIndex)
        return newSet
      })
    }
  }

  // Xử lý khi nhấn Enter để kiểm tra từ hiện tại
  const handleCheck = () => {
    if (!running || finished) return
    const currentWord = wordArray[currentIndex] || ""
    if (input.trim() === currentWord) {
      setCorrectCount(c => c + 1)
      // Remove from incorrect words if eventually typed correctly
      setIncorrectWords(prev => {
        const newSet = new Set(prev)
        newSet.delete(currentIndex)
        return newSet
      })
    } else {
      setWrongCount(w => w + 1)
      setWrongWords(prev => [...prev, {typed: input.trim(), correct: currentWord}])
      // Add to incorrect words if submitted incorrectly
      setIncorrectWords(prev => new Set(prev).add(currentIndex))
    }
    setInput("")
    if (currentIndex === wordArray.length - 1) {
      setRunning(false)
      setFinished(true)
    } else {
      setCurrentIndex(i => i + 1)
    }
  }

  // Chia wordArray thành các dòng 6 từ
  const wordsPerLine = 6
  const lines: string[][] = []
  for (let i = 0; i < wordArray.length; i += wordsPerLine) {
    const line = wordArray.slice(i, i + wordsPerLine)
    // Đảm bảo mỗi dòng có đủ 6 từ bằng cách thêm chuỗi rỗng
    while (line.length < wordsPerLine && i + line.length < wordArray.length) {
      line.push("")
    }
    lines.push(line)
  }

  // Xác định nhóm 2 dòng hiện tại
  const currentBlock = Math.floor(currentIndex / (wordsPerLine * 2))
  const startLine = currentBlock * 2
  const displayLines = [
    lines[startLine],
    lines[startLine + 1]
  ].filter(Boolean)

  const wpm = Math.round((correctCount / (duration - timer)) * 60) || 0
  const accuracy = correctCount + wrongCount > 0 ? Math.round((correctCount / (correctCount + wrongCount)) * 100) : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-2 sm:p-4 lg:p-6">
      <div className="w-full max-w-6xl mx-auto pt-2 sm:pt-8">
        {/* Header */}
        <div className="text-center mb-3 sm:mb-6 lg:mb-8">
          <h1 className="text-xl sm:text-3xl lg:text-4xl font-bold text-slate-800 mb-1 sm:mb-2">Typing Practice</h1>
          <p className="text-xs sm:text-base text-slate-600 hidden sm:block">Master your typing skills with vocabulary words</p>
        </div>

        {/* Stats Bar */}
        <div className="flex flex-row justify-center items-center gap-2 sm:gap-4 lg:gap-6 mb-3 sm:mb-6 lg:mb-8">
          <div className="bg-white rounded-lg sm:rounded-2xl shadow-md px-3 sm:px-6 py-2 sm:py-4 text-center flex-1 sm:flex-none sm:min-w-[120px]">
            <div className="text-lg sm:text-2xl font-bold text-blue-600">{wpm}</div>
            <div className="text-xs sm:text-sm text-slate-600">WPM</div>
          </div>
          <div className="bg-white rounded-lg sm:rounded-2xl shadow-md px-3 sm:px-6 py-2 sm:py-4 text-center flex-1 sm:flex-none sm:min-w-[120px]">
            <div className="text-lg sm:text-2xl font-bold text-green-600">{accuracy}%</div>
            <div className="text-xs sm:text-sm text-slate-600">Accuracy</div>
          </div>
          <div className="bg-white rounded-lg sm:rounded-2xl shadow-md px-3 sm:px-6 py-2 sm:py-4 text-center flex-1 sm:flex-none sm:min-w-[120px]">
            <div className="text-lg sm:text-2xl font-bold text-slate-700">
              {pad(Math.floor(timer / 60))}:{pad(timer % 60)}
            </div>
            <div className="text-xs sm:text-sm text-slate-600">Time</div>
          </div>
          <div className="bg-white rounded-lg sm:rounded-2xl shadow-md px-3 sm:px-6 py-2 sm:py-4 text-center flex-1 sm:flex-none sm:min-w-[120px]">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsMuted(!isMuted)}
              className="w-full h-full flex flex-col items-center justify-center"
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4 sm:h-6 sm:w-6 text-slate-400" />
              ) : (
                <Volume2 className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600" />
              )}
              <span className="text-xs sm:text-sm text-slate-600 mt-1">
                {isMuted ? 'Unmute' : 'Mute'}
              </span>
            </Button>
          </div>
        </div>

        {/* Main Typing Area */}
        <div className="bg-white rounded-xl sm:rounded-3xl shadow-lg p-3 sm:p-6 lg:p-8 mb-3 sm:mb-6">
          {/* Words Display */}
          <div className="bg-slate-50 rounded-lg sm:rounded-2xl p-3 sm:p-6 lg:p-8 mb-3 sm:mb-6 min-h-[120px] sm:min-h-[200px] flex items-center justify-center">
            {wordArray.length === 0 ? (
              <div className="text-center text-slate-400 px-4">
                <div className="text-lg sm:text-xl mb-2">No vocabulary words available</div>
                <div className="text-xs sm:text-sm">Please add words in settings to start practicing</div>
              </div>
            ) : (
              <div className="w-full max-w-5xl">
                {displayLines.map((line, lineIdx) => {
                  const realLineIdx = currentBlock * 2 + lineIdx
                  return (
                    <div key={realLineIdx} className="flex justify-center mb-2 sm:mb-4 last:mb-0">
                      <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-1.5 sm:gap-3 lg:gap-4 w-full max-w-4xl px-1">
                        {Array.from({ length: wordsPerLine }, (_, idx) => {
                          const globalIdx = realLineIdx * wordsPerLine + idx
                          const word = line[idx] || ""
                          const isIncorrect = incorrectWords.has(globalIdx)
                          
                          let className = "text-xs sm:text-lg lg:text-2xl font-mono px-1 sm:px-3 py-1.5 sm:py-3 rounded sm:rounded-lg transition-all duration-200 text-center min-h-[32px] sm:min-h-[50px] flex items-center justify-center break-words relative group"
                          
                          if (globalIdx < currentIndex) {
                            // Past words
                            className += isIncorrect ? " bg-red-100 text-red-700" : " bg-green-100 text-green-700"
                          } else if (globalIdx === currentIndex) {
                            // Current word
                            if (input.length > 0) {
                              if (input === word) {
                                className += " bg-blue-200 text-blue-800 ring-2 ring-blue-400"
                              } else if (!word.startsWith(input)) {
                                className += " bg-red-200 text-red-700 ring-2 ring-red-400"
                              } else {
                                className += " bg-yellow-200 text-yellow-800 ring-2 ring-yellow-400"
                              }
                            } else {
                              className += " bg-yellow-200 text-yellow-800 ring-2 ring-yellow-400"
                            }
                          } else {
                            // Future words
                            className += " bg-white text-slate-600 border-2 border-slate-200"
                          }
                          
                          return (
                            <div key={globalIdx} className={className}>
                              {word || ""}
                              {globalIdx === currentIndex && !isMuted && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={playCurrentWord}
                                  disabled={isPlaying}
                                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-blue-100 hover:bg-blue-200 p-1"
                                >
                                  <Volume2 className="h-4 w-4 text-blue-600" />
                                </Button>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="flex flex-col gap-2 sm:gap-4">
            <div className="w-full">
              <Input
                ref={inputRef}
                className="text-base sm:text-xl lg:text-2xl p-2.5 sm:p-4 lg:p-6 bg-white rounded-lg sm:rounded-2xl border-2 border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200 w-full"
                placeholder="Type the word..."
                value={input}
                onChange={handleInputChange}
                disabled={finished || !wordArray.length}
                onFocus={handleStart}
                onKeyDown={e => { if (e.key === 'Enter') handleCheck() }}
                autoFocus
              />
            </div>
            <div className="flex gap-2 w-full justify-center">
              <Button 
                size="sm" 
                variant={running ? "destructive" : "default"} 
                onClick={running ? () => setRunning(false) : handleStart}
                className="px-3 sm:px-6 py-2 sm:py-4 lg:py-6 rounded-lg sm:rounded-2xl flex-1 text-sm sm:text-base"
                disabled={!wordArray.length}
              >
                {running ? <Pause className="h-4 w-4 sm:h-5 sm:w-5" /> : <Play className="h-4 w-4 sm:h-5 sm:w-5" />}
                <span className="ml-1 sm:ml-2">{running ? 'Pause' : 'Start'}</span>
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleReset} 
                className="px-3 sm:px-6 py-2 sm:py-4 lg:py-6 rounded-lg sm:rounded-2xl flex-1 text-sm sm:text-base"
              >
                <RotateCcw className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="ml-1 sm:ml-2">Reset</span>
              </Button>
              <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="px-3 sm:px-6 py-2 sm:py-4 lg:py-6 rounded-lg sm:rounded-2xl flex-1 text-sm sm:text-base">
                    <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="ml-1 sm:ml-2">Settings</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[95vw] max-w-md sm:max-w-lg mx-auto max-h-[90vh] overflow-y-auto">
                  <DialogHeader className="pb-3 sm:pb-4">
                    <DialogTitle className="text-lg sm:text-xl">Settings</DialogTitle>
                    <DialogDescription className="text-sm sm:text-base">
                      Customize your typing practice session
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 sm:space-y-6 px-1">
                    <div>
                      <label className="block font-medium mb-1.5 sm:mb-2 text-slate-700 text-sm sm:text-base">
                        Duration:
                      </label>
                      <select
                        className="w-full border-2 border-slate-200 rounded-lg px-3 py-2 sm:py-2.5 focus:border-blue-400 focus:outline-none text-sm sm:text-base"
                        value={duration}
                        onChange={e => setDuration(Number(e.target.value))}
                      >
                        <option value={60}>1 minute</option>
                        <option value={120}>2 minutes</option>
                        <option value={180}>3 minutes</option>
                        <option value={300}>5 minutes</option>
                        <option value={600}>10 minutes</option>
                        <option value={900}>15 minutes</option>
                        <option value={1200}>20 minutes</option>
                        <option value={1800}>30 minutes</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-medium mb-1.5 sm:mb-2 text-slate-700 text-sm sm:text-base">
                        Word List 
                        <span className="text-xs sm:text-sm text-slate-500 block sm:inline">
                          <span className="hidden sm:inline">(</span>separate by space or<span className="hidden sm:inline">)</span>
                        </span>
                      </label>
                      <Textarea
                        value={wordlist}
                        onChange={e => setWordlist(e.target.value)}
                        className="min-h-[80px] sm:min-h-[100px] border-2 border-slate-200 rounded-lg focus:border-blue-400 text-sm sm:text-base"
                        placeholder="Enter vocabulary words..."
                        rows={4}
                      />
                    </div>
                    <div className="flex items-start sm:items-center space-x-2 sm:space-x-3">
                      <input
                        id="randomize"
                        type="checkbox"
                        checked={randomize}
                        onChange={e => setRandomize(e.target.checked)}
                        className="w-4 h-4 sm:w-4 sm:h-4 text-blue-600 rounded focus:ring-blue-500 mt-0.5 sm:mt-0 flex-shrink-0"
                      />
                      <label htmlFor="randomize" className="font-medium text-slate-700 text-sm sm:text-base leading-tight">
                        Randomize word order
                      </label>
                    </div>
                  </div>
                  <DialogFooter className="pt-4 sm:pt-6 flex-col sm:flex-row gap-2 sm:gap-0">
                    <Button 
                      variant="outline" 
                      onClick={() => setSettingsOpen(false)}
                      className="w-full sm:w-auto order-2 sm:order-1 text-sm sm:text-base"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={() => {
                        let arr = wordlist.split(/\s+|\|/).filter(Boolean)
                        if (randomize) arr = arr.sort(() => Math.random() - 0.5)
                        localStorage.setItem('typing_wordlist', arr.join(' '))
                        setInput("")
                        setTimer(duration)
                        setRunning(false)
                        setFinished(false)
                        setCurrentIndex(0)
                        setCorrectCount(0)
                        setWrongCount(0)
                        setWrongWords([])
                        setWordArray(arr)
                        setSettingsOpen(false)
                      }}
                      className="w-full sm:w-auto order-1 sm:order-2 text-sm sm:text-base"
                    >
                      Apply Settings
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Results */}
        {finished && (
          <div className="bg-white rounded-xl sm:rounded-3xl shadow-lg p-3 sm:p-6 lg:p-8 text-center">
            <div className="mb-3 sm:mb-6">
              <h2 className="text-xl sm:text-3xl font-bold text-slate-800 mb-2 sm:mb-4">Complete!</h2>
              <div className="grid grid-cols-3 sm:grid-cols-3 gap-2 sm:gap-6">
                <div className="bg-green-50 rounded-lg sm:rounded-2xl p-2 sm:p-6">
                  <div className="text-lg sm:text-3xl font-bold text-green-600 mb-1 sm:mb-2">{correctCount}</div>
                  <div className="text-xs sm:text-base text-green-700">Correct</div>
                </div>
                <div className="bg-red-50 rounded-lg sm:rounded-2xl p-2 sm:p-6">
                  <div className="text-lg sm:text-3xl font-bold text-red-600 mb-1 sm:mb-2">{wrongCount}</div>
                  <div className="text-xs sm:text-base text-red-700">Wrong</div>
                </div>
                <div className="bg-blue-50 rounded-lg sm:rounded-2xl p-2 sm:p-6">
                  <div className="text-lg sm:text-3xl font-bold text-blue-600 mb-1 sm:mb-2">{accuracy}%</div>
                  <div className="text-xs sm:text-base text-blue-700">Accuracy</div>
                </div>
              </div>
            </div>

            {wrongWords.length > 0 && (
              <div className="mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-semibold text-slate-800 mb-2 sm:mb-4">Wrong Words</h3>
                <div className="bg-red-50 rounded-lg sm:rounded-2xl p-3 sm:p-4">
                  <div className="grid grid-cols-2 gap-2 text-sm sm:text-base">
                    {wrongWords.map((word, index) => (
                      <div key={index} className="flex justify-between items-center bg-white rounded p-2">
                        <span className="text-red-600">{word.typed}</span>
                        <span className="text-slate-400">→</span>
                        <span className="text-green-600">{word.correct}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <Button onClick={handleReset} size="sm" className="px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-2xl text-sm sm:text-base w-full sm:w-auto">
              <RotateCcw className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5" />
              Retry
            </Button>
          </div>
        )}
      </div>
    </div>
  )
} 