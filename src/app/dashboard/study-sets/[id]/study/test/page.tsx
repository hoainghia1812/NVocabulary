"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, RotateCcw, CheckCircle, XCircle, Play } from 'lucide-react';
import Link from 'next/link';
import { getVocabularySet, getVocabularyItems } from '@/lib/api/vocabulary';
import type { VocabularySet, VocabularyItem } from '@/lib/types';
import toast from 'react-hot-toast';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  type: 'english-to-vietnamese' | 'vietnamese-to-english';
  vocabularyItem: VocabularyItem;
}

interface UserAnswer {
  questionIndex: number;
  selectedAnswer: string;
  isCorrect: boolean;
  question: Question;
}

type StudyDirection = 'english-to-vietnamese' | 'vietnamese-to-english';

const TestPage = () => {
  const params = useParams();
  const setId = params.id as string;

  const [set, setSet] = useState<VocabularySet | null>(null);
  const [items, setItems] = useState<VocabularyItem[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Test flow states
  const [testStarted, setTestStarted] = useState(false);
  const [studyDirection, setStudyDirection] = useState<StudyDirection>('english-to-vietnamese');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState('');
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [showReview, setShowReview] = useState(false);

  // Load data from database
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [setData, itemsData] = await Promise.all([
          getVocabularySet(setId),
          getVocabularyItems(setId)
        ]);
        
        setSet(setData);
        setItems(itemsData);
        
        if (itemsData.length === 0) {
          setError('Bộ từ vựng này chưa có từ nào. Vui lòng thêm từ vựng trước khi làm bài test.');
          return;
        }

      } catch (err) {
        setError('Không thể tải dữ liệu bài test');
        console.error(err);
        toast.error('Lỗi khi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [setId]);

  // Generate questions based on study direction
  const generateQuestions = (vocabItems: VocabularyItem[], direction: StudyDirection): Question[] => {
    const shuffledItems = [...vocabItems].sort(() => Math.random() - 0.5);
    
    return shuffledItems.map((item) => {
      if (direction === 'english-to-vietnamese') {
        return {
          id: `${item.id}-en-vi`,
          question: item.english,
          correctAnswer: item.vietnamese,
          options: generateOptions(item.vietnamese, vocabItems.map(v => v.vietnamese)),
          type: 'english-to-vietnamese',
          explanation: item.example ? `Ví dụ: ${item.example}` : undefined,
          vocabularyItem: item
        };
      } else {
        return {
          id: `${item.id}-vi-en`,
          question: item.vietnamese,
          correctAnswer: item.english,
          options: generateOptions(item.english, vocabItems.map(v => v.english)),
          type: 'vietnamese-to-english',
          explanation: item.example ? `Ví dụ: ${item.example}` : undefined,
          vocabularyItem: item
        };
      }
    });
  };

  // Generate wrong options for multiple choice
  const generateOptions = (correctAnswer: string, allAnswers: string[]): string[] => {
    const wrongOptions = allAnswers
      .filter(answer => answer !== correctAnswer)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    const options = [correctAnswer, ...wrongOptions].sort(() => Math.random() - 0.5);
    return options;
  };

  const startTest = () => {
    if (items.length === 0) {
      toast.error('Không có từ vựng để test');
      return;
    }

    const generatedQuestions = generateQuestions(items, studyDirection);
    setQuestions(generatedQuestions);
    setTestStarted(true);
    setCurrentQuestionIndex(0);
    setSelectedOption('');
    setUserAnswers([]);
    setShowResult(false);
    setShowReview(false);
  };

  const currentQuestion = questions[currentQuestionIndex];

  const handleSubmit = () => {
    if (!selectedOption) {
      toast.error('Vui lòng chọn một đáp án');
      return;
    }

    const isCorrect = selectedOption === currentQuestion.correctAnswer;
    
    // Save user answer
    const newAnswer: UserAnswer = {
      questionIndex: currentQuestionIndex,
      selectedAnswer: selectedOption,
      isCorrect,
      question: currentQuestion
    };

    const updatedAnswers = [...userAnswers, newAnswer];
    setUserAnswers(updatedAnswers);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption('');
    } else {
      setShowResult(true);
    }
  };

  const restartTest = () => {
    setTestStarted(false);
    setCurrentQuestionIndex(0);
    setSelectedOption('');
    setUserAnswers([]);
    setShowResult(false);
    setShowReview(false);
  };

  const score = userAnswers.filter(answer => answer.isCorrect).length;
  const totalQuestions = questions.length;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Đang tải bài test...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="p-6">
          <div className="text-center space-y-4">
            <div className="text-red-500 text-lg font-semibold">Lỗi</div>
            <p className="text-gray-600">{error}</p>
            <Link href={`/dashboard/study-sets/${setId}`}>
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <Link href={`/dashboard/study-sets/${setId}/study`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
        </Link>
      </div>

      {!testStarted ? (
        /* Test Setup */
        <Card className="p-6">
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-2">Kiểm tra kiến thức</h1>
              <p className="text-gray-600">{set?.name}</p>
              <p className="text-sm text-gray-500 mt-1">
                {items.length} từ vựng • Tất cả từ sẽ được kiểm tra
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Chọn hướng học:</h3>
              <RadioGroup 
                value={studyDirection} 
                onValueChange={(value) => setStudyDirection(value as StudyDirection)}
              >
                <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <RadioGroupItem value="english-to-vietnamese" id="en-vi" />
                  <label htmlFor="en-vi" className="flex-1 cursor-pointer">
                    <div className="font-medium">Tiếng Anh → Tiếng Việt</div>
                    <div className="text-sm text-gray-600">Nhìn từ tiếng Anh, chọn nghĩa tiếng Việt</div>
                  </label>
                </div>
                
                <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <RadioGroupItem value="vietnamese-to-english" id="vi-en" />
                  <label htmlFor="vi-en" className="flex-1 cursor-pointer">
                    <div className="font-medium">Tiếng Việt → Tiếng Anh</div>
                    <div className="text-sm text-gray-600">Nhìn từ tiếng Việt, chọn từ tiếng Anh</div>
                  </label>
                </div>
              </RadioGroup>
            </div>

            <Button onClick={startTest} className="w-full" size="lg">
              <Play className="w-4 h-4 mr-2" />
              Bắt đầu kiểm tra
            </Button>
          </div>
        </Card>
      ) : showResult ? (
        /* Results and Review */
        <div className="space-y-6">
          {!showReview ? (
            /* Results Summary */
            <Card className="p-6">
              <div className="text-center space-y-6">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Kết quả bài test</h2>
                  <p className="text-gray-600">{set?.name}</p>
                </div>
                
                <div className="space-y-4">
                  <div className="text-6xl font-bold text-blue-600">
                    {score}/{totalQuestions}
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-xl">
                      Tỷ lệ đúng: <span className="font-bold text-green-600">
                        {Math.round((score / totalQuestions) * 100)}%
                      </span>
                    </p>
                    
                    {score === totalQuestions && (
                      <p className="text-green-600 font-semibold">🎉 Xuất sắc! Bạn đã trả lời đúng tất cả!</p>
                    )}
                    {score >= totalQuestions * 0.8 && score < totalQuestions && (
                      <p className="text-blue-600 font-semibold">👏 Tốt lắm! Bạn đã nắm vững kiến thức!</p>
                    )}
                    {score >= totalQuestions * 0.6 && score < totalQuestions * 0.8 && (
                      <p className="text-yellow-600 font-semibold">📚 Khá tốt! Hãy ôn luyện thêm một chút!</p>
                    )}
                    {score < totalQuestions * 0.6 && (
                      <p className="text-red-600 font-semibold">💪 Hãy học thêm và thử lại nhé!</p>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-3 justify-center">
                  <Button onClick={() => setShowReview(true)} variant="outline">
                    Xem chi tiết
                  </Button>
                  <Button onClick={restartTest} variant="outline">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Làm lại
                  </Button>
                  <Link href={`/dashboard/study-sets/${setId}/study`}>
                    <Button>
                      Tiếp tục học
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ) : (
            /* Detailed Review */
            <div className="space-y-4">
              <Card className="p-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold">Chi tiết bài làm</h2>
                  <Button onClick={() => setShowReview(false)} variant="outline" size="sm">
                    Quay lại kết quả
                  </Button>
                </div>
              </Card>

              {userAnswers.map((answer, index) => (
                <Card key={index} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {answer.isCorrect ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600" />
                          )}
                          <span className="text-sm font-medium">
                            Câu {index + 1}
                          </span>
                        </div>
                        
                        <div className="text-lg font-semibold mb-2">
                          {answer.question.question}
                        </div>
                        
                        <div className="space-y-1">
                          <p className="text-sm">
                            <span className="font-medium">Bạn chọn:</span> 
                            <span className={answer.isCorrect ? 'text-green-600 ml-1' : 'text-red-600 ml-1'}>
                              {answer.selectedAnswer}
                            </span>
                          </p>
                          
                          {!answer.isCorrect && (
                            <p className="text-sm">
                              <span className="font-medium">Đáp án đúng:</span> 
                              <span className="text-green-600 ml-1">
                                {answer.question.correctAnswer}
                              </span>
                            </p>
                          )}
                          
                          {answer.question.explanation && (
                            <p className="text-sm text-gray-600 italic">
                              {answer.question.explanation}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Test in Progress */
        <Card className="p-6">
          <div className="space-y-6">
            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Kiểm tra kiến thức</h1>
                <span className="text-sm text-gray-500">
                  {set?.name}
                </span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Câu {currentQuestionIndex + 1} / {questions.length}</span>
                <span>{Math.round(((currentQuestionIndex) / questions.length) * 100)}% hoàn thành</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex) / questions.length) * 100}%` }}
                ></div>
              </div>
            </div>
            
            {/* Question */}
            <div className="space-y-4">
              <div className="bg-gray-50 p-6 rounded-lg text-center">
                <h2 className="text-2xl font-bold mb-2">{currentQuestion?.question}</h2>
                <p className="text-sm text-blue-600">
                  {studyDirection === 'english-to-vietnamese' 
                    ? 'Chọn nghĩa tiếng Việt đúng' 
                    : 'Chọn từ tiếng Anh đúng'
                  }
                </p>
              </div>
              
              <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {currentQuestion?.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <RadioGroupItem value={option} id={`option-${index}`} />
                      <label 
                        htmlFor={`option-${index}`} 
                        className="flex-1 text-lg font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {option}
                      </label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>
            
            {/* Submit Button */}
            <Button 
              onClick={handleSubmit} 
              disabled={!selectedOption}
              className="w-full"
              size="lg"
            >
              {currentQuestionIndex < questions.length - 1 ? 'Tiếp theo' : 'Hoàn thành'}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default TestPage; 