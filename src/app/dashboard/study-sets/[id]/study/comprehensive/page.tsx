"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { ArrowLeft, RotateCcw, CheckCircle, XCircle, Play, PenTool, Target, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { getVocabularySet, getVocabularyItems } from '@/lib/api/vocabulary';
import type { VocabularySet, VocabularyItem } from '@/lib/types';
import toast from 'react-hot-toast';

interface Question {
  id: string;
  question: string;
  correctAnswer: string;
  type: 'multiple-choice' | 'spelling';
  options?: string[];
  explanation?: string;
  vocabularyItem: VocabularyItem;
  direction: 'english-to-vietnamese' | 'vietnamese-to-english';
  attemptNumber: number; 
}

interface UserAnswer {
  questionIndex: number;
  selectedAnswer: string;
  isCorrect: boolean;
  question: Question;
  timeSpent: number;
}

type StudyDirection = 'english-to-vietnamese' | 'vietnamese-to-english';

const ComprehensivePage = () => {
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
  const [spellInput, setSpellInput] = useState('');
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  
  // Immediate feedback states
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackCorrect, setFeedbackCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');

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

  // Generate questions: alternating MC and Spelling
  const generateQuestions = (vocabItems: VocabularyItem[], direction: StudyDirection): Question[] => {
    const questions: Question[] = [];
    const shuffledItems = [...vocabItems].sort(() => Math.random() - 0.5);
    
    shuffledItems.forEach((item, index) => {
      // Xen kẽ: chẵn = trắc nghiệm, lẻ = chính tả
      const isMultipleChoice = index % 2 === 0;
      
      if (direction === 'english-to-vietnamese') {
        if (isMultipleChoice) {
          // Multiple choice: English → Vietnamese
          questions.push({
            id: `${item.id}-mc-${index}`,
            question: item.english,
            correctAnswer: item.vietnamese,
            options: generateOptions(item.vietnamese, vocabItems.map(v => v.vietnamese)),
            type: 'multiple-choice',
            explanation: item.example ? `Ví dụ: ${item.example}` : undefined,
            vocabularyItem: item,
            direction: 'english-to-vietnamese',
            attemptNumber: 1
          });
        } else {
          // Spelling: Vietnamese → English 
          questions.push({
            id: `${item.id}-spell-${index}`,
            question: `Viết từ tiếng Anh của: "${item.vietnamese}"`,
            correctAnswer: item.english,
            type: 'spelling',
            explanation: item.example ? `Ví dụ: ${item.example}` : undefined,
            vocabularyItem: item,
            direction: 'vietnamese-to-english',
            attemptNumber: 1
          });
        }
      } else {
        if (isMultipleChoice) {
          // Multiple choice: Vietnamese → English
          questions.push({
            id: `${item.id}-mc-${index}`,
            question: item.vietnamese,
            correctAnswer: item.english,
            options: generateOptions(item.english, vocabItems.map(v => v.english)),
            type: 'multiple-choice',
            explanation: item.example ? `Ví dụ: ${item.example}` : undefined,
            vocabularyItem: item,
            direction: 'vietnamese-to-english',
            attemptNumber: 1
          });
        } else {
          // Spelling: English → Vietnamese
          questions.push({
            id: `${item.id}-spell-${index}`,
            question: `Viết nghĩa tiếng Việt của: "${item.english}"`,
            correctAnswer: item.vietnamese,
            type: 'spelling',
            explanation: item.example ? `Ví dụ: ${item.example}` : undefined,
            vocabularyItem: item,
            direction: 'english-to-vietnamese',
            attemptNumber: 1
          });
        }
      }
    });

    return questions;
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
    setSpellInput('');
    setUserAnswers([]);
    setShowResult(false);
    setShowReview(false);
    setShowFeedback(false);
    setQuestionStartTime(Date.now());
  };

  const currentQuestion = questions[currentQuestionIndex];

  const handleSubmit = () => {
    const userAnswer = currentQuestion.type === 'multiple-choice' ? selectedOption : spellInput;
    
    if (!userAnswer.trim()) {
      toast.error('Vui lòng nhập đáp án');
      return;
    }

    const isCorrect = currentQuestion.type === 'spelling' 
      ? userAnswer.trim().toLowerCase() === currentQuestion.correctAnswer.toLowerCase()
      : userAnswer === currentQuestion.correctAnswer;
    
    const timeSpent = Date.now() - questionStartTime;
    
    // Save user answer
    const newAnswer: UserAnswer = {
      questionIndex: currentQuestionIndex,
      selectedAnswer: userAnswer,
      isCorrect,
      question: currentQuestion,
      timeSpent
    };

    const updatedAnswers = [...userAnswers, newAnswer];
    setUserAnswers(updatedAnswers);

    if (isCorrect) {
      // Nếu đúng: hiển thị feedback xanh và tự động chuyển câu
      setFeedbackCorrect(true);
      setFeedbackMessage('Chính xác! 🎉');
      setShowFeedback(true);
      
      // Tự động chuyển câu sau 1.5 giây
      setTimeout(() => {
        handleContinue();
      }, 1000);
    } else {
      // Nếu sai: hiển thị đáp án đúng và tự động chuyển câu
      setFeedbackCorrect(false);
      setFeedbackMessage(`Sai rồi! Đáp án đúng là: "${currentQuestion.correctAnswer}"`);
      setShowFeedback(true);
      
      // Tự động chuyển câu sau 3 giây (để đọc đáp án)
      setTimeout(() => {
        handleContinue();
      }, 1000);
    }
  };

  const handleContinue = () => {
    setShowFeedback(false);
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption('');
      setSpellInput('');
      setQuestionStartTime(Date.now());
    } else {
      setShowResult(true);
    }
  };

  const restartTest = () => {
    setTestStarted(false);
    setCurrentQuestionIndex(0);
    setSelectedOption('');
    setSpellInput('');
    setUserAnswers([]);
    setShowResult(false);
    setShowReview(false);
    setShowFeedback(false);
  };

  const retryIncorrectItems = () => {
    const incorrectAnswers = userAnswers.filter(answer => !answer.isCorrect);
    const incorrectItemIds = new Set(incorrectAnswers.map(answer => answer.question.vocabularyItem.id));
    const incorrectItems = items.filter(item => incorrectItemIds.has(item.id));
    
    if (incorrectItems.length === 0) {
      toast.success('Không có từ nào sai để làm lại!');
      return;
    }

    const retryQuestions = generateQuestions(incorrectItems, studyDirection);
    setQuestions(retryQuestions);
    setCurrentQuestionIndex(0);
    setSelectedOption('');
    setSpellInput('');
    setUserAnswers([]);
    setShowResult(false);
    setShowReview(false);
    setShowFeedback(false);
    setQuestionStartTime(Date.now());
    
    toast.success(`Làm lại ${incorrectItems.length} từ sai`);
  };

  const score = userAnswers.filter(answer => answer.isCorrect).length;
  const totalQuestions = questions.length;
  const mcScore = userAnswers.filter(answer => answer.isCorrect && answer.question.type === 'multiple-choice').length;
  const spellScore = userAnswers.filter(answer => answer.isCorrect && answer.question.type === 'spelling').length;
  const mcTotal = userAnswers.filter(answer => answer.question.type === 'multiple-choice').length;
  const spellTotal = userAnswers.filter(answer => answer.question.type === 'spelling').length;
  const incorrectCount = userAnswers.filter(answer => !answer.isCorrect).length;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Đang tải bài tổng hợp...</p>
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
              <h1 className="text-3xl font-bold mb-2">Bài tập tổng hợp</h1>
              <p className="text-gray-600">{set?.name}</p>
              <p className="text-sm text-gray-500 mt-1">
                {items.length} từ vựng • {items.length} câu hỏi (xen kẽ trắc nghiệm và chính tả)
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-4 border-2 border-blue-200 bg-blue-50">
                <div className="flex items-center space-x-3 mb-3">
                  <Target className="w-6 h-6 text-blue-600" />
                  <h3 className="font-semibold text-blue-800">Trắc nghiệm</h3>
                </div>
                <p className="text-sm text-blue-700">
                  Câu hỏi chẵn (1, 3, 5...) sẽ là trắc nghiệm
                </p>
              </Card>
              
              <Card className="p-4 border-2 border-green-200 bg-green-50">
                <div className="flex items-center space-x-3 mb-3">
                  <PenTool className="w-6 h-6 text-green-600" />
                  <h3 className="font-semibold text-green-800">Chính tả</h3>
                </div>
                <p className="text-sm text-green-700">
                  Câu hỏi lẻ (2, 4, 6...) sẽ là chính tả
                </p>
              </Card>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <h4 className="font-semibold text-yellow-800">Lưu ý:</h4>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                • Sẽ hiển thị kết quả ngay khi bạn trả lời sai<br/>
                • Sau khi hoàn thành, bạn có thể chọn làm lại những từ sai
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
                    <div className="text-sm text-gray-600">Trắc nghiệm: Anh → Việt | Chính tả: Việt → Anh</div>
                  </label>
                </div>
                
                <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <RadioGroupItem value="vietnamese-to-english" id="vi-en" />
                  <label htmlFor="vi-en" className="flex-1 cursor-pointer">
                    <div className="font-medium">Tiếng Việt → Tiếng Anh</div>
                    <div className="text-sm text-gray-600">Trắc nghiệm: Việt → Anh | Chính tả: Anh → Việt</div>
                  </label>
                </div>
              </RadioGroup>
            </div>

            <Button onClick={startTest} className="w-full" size="lg">
              <Play className="w-4 h-4 mr-2" />
              Bắt đầu bài tập tổng hợp
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
                  <h2 className="text-3xl font-bold mb-2">Kết quả bài tập</h2>
                  <p className="text-gray-600">{set?.name}</p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <div className="text-4xl font-bold text-blue-600">
                      {score}/{totalQuestions}
                    </div>
                    <p className="text-sm text-gray-600">Tổng điểm</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-3xl font-bold text-purple-600">
                      {mcScore}/{mcTotal}
                    </div>
                    <p className="text-sm text-gray-600">Trắc nghiệm</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-3xl font-bold text-green-600">
                      {spellScore}/{spellTotal}
                    </div>
                    <p className="text-sm text-gray-600">Chính tả</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-xl">
                    Tỷ lệ đúng: <span className="font-bold text-green-600">
                      {Math.round((score / totalQuestions) * 100)}%
                    </span>
                  </p>
                  
                  {score === totalQuestions && (
                    <p className="text-green-600 font-semibold">🎉 Hoàn hảo! Bạn đã làm đúng tất cả!</p>
                  )}
                  {score >= totalQuestions * 0.8 && score < totalQuestions && (
                    <p className="text-blue-600 font-semibold">👏 Xuất sắc! Kỹ năng tổng hợp rất tốt!</p>
                  )}
                  {score >= totalQuestions * 0.6 && score < totalQuestions * 0.8 && (
                    <p className="text-yellow-600 font-semibold">📚 Khá tốt! Tiếp tục luyện tập!</p>
                  )}
                  {score < totalQuestions * 0.6 && (
                    <p className="text-red-600 font-semibold">💪 Hãy ôn tập thêm nhé!</p>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-3 justify-center">
                  <Button onClick={() => setShowReview(true)} variant="outline">
                    Xem chi tiết
                  </Button>
                  {incorrectCount > 0 && (
                    <Button onClick={retryIncorrectItems} variant="outline" className="bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100">
                      <RotateCcw className="w-4 h-4 mr-2" />
                                             Làm lại từ sai ({incorrectCount} câu)
                    </Button>
                  )}
                  <Button onClick={restartTest} variant="outline">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Làm lại tất cả
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
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            answer.question.type === 'multiple-choice' 
                              ? 'bg-purple-100 text-purple-700' 
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {answer.question.type === 'multiple-choice' ? 'Trắc nghiệm' : 'Chính tả'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {Math.round(answer.timeSpent / 1000)}s
                          </span>
                        </div>
                        
                        <div className="text-lg font-semibold mb-2">
                          {answer.question.question}
                        </div>
                        
                        <div className="space-y-1">
                          <p className="text-sm">
                            <span className="font-medium">Bạn {answer.question.type === 'multiple-choice' ? 'chọn' : 'gõ'}:</span> 
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
          {!showFeedback ? (
            <div className="space-y-6">
              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-bold">Bài tập tổng hợp</h1>
                  <span className="text-sm text-gray-500">
                    {set?.name}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Câu {currentQuestionIndex + 1} / {questions.length}</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    currentQuestion?.type === 'multiple-choice' 
                      ? 'bg-purple-100 text-purple-700' 
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {currentQuestion?.type === 'multiple-choice' ? 'Trắc nghiệm' : 'Chính tả'}
                  </span>
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
                    {currentQuestion?.type === 'multiple-choice' 
                      ? 'Chọn đáp án đúng' 
                      : 'Gõ chính xác từ/cụm từ'
                    }
                  </p>
                </div>
                
                {currentQuestion?.type === 'multiple-choice' ? (
                  <RadioGroup value={selectedOption} onValueChange={(value) => {
                    setSelectedOption(value);
                    // Tự động submit khi chọn đáp án trắc nghiệm
                    setTimeout(() => {
                      const userAnswer = value;
                      const isCorrect = userAnswer === currentQuestion.correctAnswer;
                      const timeSpent = Date.now() - questionStartTime;
                      
                      // Save user answer
                      const newAnswer: UserAnswer = {
                        questionIndex: currentQuestionIndex,
                        selectedAnswer: userAnswer,
                        isCorrect,
                        question: currentQuestion,
                        timeSpent
                      };

                      const updatedAnswers = [...userAnswers, newAnswer];
                      setUserAnswers(updatedAnswers);

                      if (isCorrect) {
                        // Đúng: hiển thị màu xanh và tự động chuyển
                        setFeedbackCorrect(true);
                        setFeedbackMessage('Chính xác! 🎉');
                        setShowFeedback(true);
                        
                        setTimeout(() => {
                          handleContinue();
                        }, 1000);
                      } else {
                        // Sai: hiển thị đáp án đúng và tự động chuyển
                        setFeedbackCorrect(false);
                        setFeedbackMessage(`Sai rồi! Đáp án đúng là: "${currentQuestion.correctAnswer}"`);
                        setShowFeedback(true);
                        
                        setTimeout(() => {
                          handleContinue();
                        }, 1000);
                      }
                    }, 300); // Delay nhỏ để thấy selection
                  }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {currentQuestion.options?.map((option, index) => (
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
                ) : (
                  <div className="space-y-4">
                    <Input
                      value={spellInput}
                      onChange={(e) => setSpellInput(e.target.value)}
                      placeholder="Nhập câu trả lời..."
                      className="text-lg text-center"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleSubmit();
                        }
                      }}
                    />
                    <p className="text-sm text-gray-500 text-center">
                      Nhấn Enter hoặc nút Submit để gửi câu trả lời
                    </p>
                  </div>
                )}
              </div>
              
              {/* Submit Button - chỉ hiển thị cho chính tả */}
              {currentQuestion?.type === 'spelling' && (
                <Button 
                  onClick={handleSubmit} 
                  disabled={!spellInput.trim()}
                  className="w-full"
                  size="lg"
                >
                  Kiểm tra đáp án
                </Button>
              )}
              
              
            </div>
          ) : (
            /* Immediate Feedback */
            <div className="space-y-6 text-center">
              <div className={`p-6 rounded-lg ${feedbackCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border-2`}>
                {feedbackCorrect ? (
                  <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                ) : (
                  <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
                )}
                
                <h3 className={`text-2xl font-bold mb-2 ${feedbackCorrect ? 'text-green-800' : 'text-red-800'}`}>
                  {feedbackCorrect ? 'Chính xác!' : 'Sai rồi!'}
                </h3>
                
                <p className={`text-lg ${feedbackCorrect ? 'text-green-700' : 'text-red-700'}`}>
                  {feedbackMessage}
                </p>
                
                {currentQuestion?.explanation && (
                  <p className="text-sm text-gray-600 mt-3 italic">
                    {currentQuestion.explanation}
                  </p>
                )}
              </div>
              
                             <div className="text-center">
                 
               </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default ComprehensivePage; 