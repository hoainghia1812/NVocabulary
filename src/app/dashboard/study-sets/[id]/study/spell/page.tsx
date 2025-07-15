'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { getVocabularyItems } from '@/lib/api/vocabulary';
import type { VocabularyItem } from '@/lib/types';
import toast from 'react-hot-toast';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { ArrowLeft, Shuffle } from 'lucide-react';
import Confetti from 'react-confetti';

export default function SpellPage() {
  const params = useParams();
  const setId = params.id as string;

  const [items, setItems] = useState<VocabularyItem[]>([]);
  const [currentWord, setCurrentWord] = useState<VocabularyItem | null>(null);
  const [userInput, setUserInput] = useState('');
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [correctCount, setCorrectCount] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [attemptedWords, setAttemptedWords] = useState<Set<string>>(new Set());
  const [incorrectAttempts, setIncorrectAttempts] = useState(0);

  const loadData = async () => {
    try {
      setLoading(true);
      const itemsData = await getVocabularyItems(setId);
      setItems(itemsData);
      getRandomWord();
    } catch (err) {
      setError('Không thể tải dữ liệu học tập');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [setId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value);
  };

  const getRandomWord = () => {
    const remainingWords = items.filter(item => !attemptedWords.has(item.id));
    if (remainingWords.length > 0) {
      const randomIndex = Math.floor(Math.random() * remainingWords.length);
      setCurrentWord(remainingWords[randomIndex]);
      setUserInput('');
    } else {
      setShowConfetti(true);
    }
  };

  const handleCheckSpelling = useCallback(() => {
    if (currentWord && userInput.trim().toLowerCase() === currentWord.english.toLowerCase()) {
      toast.success('Chính xác!');
      setScore(prev => prev + 1);
      setCorrectCount(prev => prev + 1);
      setAttemptedWords(prev => new Set(prev).add(currentWord.id));
      setIncorrectAttempts(0); // Reset incorrect attempts
      // Check if all words are completed
      if (correctCount + 1 === items.length) {
        setShowConfetti(true);
      } else {
        // Move to a random word
        getRandomWord();
      }
    } else {
      setIncorrectAttempts(prev => prev + 1);
      if (incorrectAttempts + 1 >= 3) {
        toast.error(`Sai rồi! Từ đúng là: ${currentWord?.english}`);
      } else {
        toast.error(`Sai rồi! Gợi ý: ${getHint(currentWord?.english || '')}`);
      }
    }
  }, [currentWord, userInput, items, correctCount, attemptedWords, incorrectAttempts]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCheckSpelling();
    }
  }, [handleCheckSpelling]);

  const getHint = (word: string) => {
    // Provide a simple hint by showing the first letter and the length of the word
    return `${word.charAt(0)}${'_'.repeat(word.length - 1)}`;
  };

  const handleRestart = () => {
    setAttemptedWords(new Set());
    setCorrectCount(0);
    setScore(0);
    setShowConfetti(false);
    setCurrentWord(null);
    setUserInput('');
    setIncorrectAttempts(0);
    loadData(); // Re-fetch and initialize the game
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="spell-page min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      {showConfetti ? (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <Confetti recycle={false} numberOfPieces={500} />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Chúc mừng!</h1>
          <p className="text-lg text-gray-700 mb-8">Bạn đã hoàn thành tất cả các từ trong bộ từ vựng này.</p>
          <p className="text-lg text-gray-600 mb-8">Số từ đúng: <span className="font-bold text-indigo-600">{correctCount}</span> / {items.length}</p>
          <div className="flex space-x-4">
            <Button onClick={handleRestart} className="bg-indigo-600 text-white hover:bg-indigo-700 transition">
              Chơi lại
            </Button>
            <Link href={`/dashboard/study-sets/${setId}/study`}>
              <Button variant="outline">
                Quay lại chọn cách học
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Header with back button */}
          <div className="flex items-center justify-between">
            <Link href={`/dashboard/study-sets/${setId}/study`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Quay lại
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Chính tả</h1>
            <Button onClick={getRandomWord} variant="outline" size="sm">
              <Shuffle className="mr-2 h-4 w-4" />
              Từ ngẫu nhiên
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
            <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${(correctCount / items.length) * 100}%` }}></div>
          </div>

          {currentWord && (
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <p className="text-lg text-gray-700 mb-4">Viết chính xác từ: <span className="font-semibold">{currentWord.vietnamese}</span></p>
                <input 
                  type="text" 
                  value={userInput} 
                  onChange={handleInputChange} 
                  onKeyPress={handleKeyPress}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  placeholder="Nhập từ tiếng Anh..."
                />
                <Button onClick={handleCheckSpelling} className="mt-4 w-full bg-indigo-600 text-white hover:bg-indigo-700 transition">
                  Kiểm tra
                </Button>
              </CardContent>
            </Card>
          )}
          <p className="text-center text-lg text-gray-600">Điểm số: <span className="font-bold text-indigo-600">{score}</span></p>
          <p className="text-center text-lg text-gray-600">Số từ đúng: <span className="font-bold text-indigo-600">{correctCount}</span> / {items.length}</p>
        </div>
      )}
    </div>
  );
} 