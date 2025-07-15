"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

// Sample data structure for questions
const sampleQuestions = [
  {
    question: 'What is the capital of France?',
    options: ['Berlin', 'Madrid', 'Paris', 'Rome'],
    answer: 'Paris',
  },
  {
    question: 'What is 2 + 2?',
    options: ['3', '4', '5', '6'],
    answer: '4',
  },
  // Add more questions as needed
];

const QuizPage = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState('');
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const currentQuestion = sampleQuestions[currentQuestionIndex];

  const handleOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedOption(event.target.value);
  };

  const handleSubmit = () => {
    if (selectedOption === currentQuestion.answer) {
      setScore(score + 1);
    }
    if (currentQuestionIndex < sampleQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption('');
    } else {
      setShowResult(true);
    }
  };

  return (
    <Card className="quiz-container">
      {!showResult ? (
        <div className="question-section">
          <h2>{currentQuestion.question}</h2>
          <RadioGroup value={selectedOption} onChange={handleOptionChange}>
            {currentQuestion.options.map((option, index) => (
              <RadioGroupItem key={index} value={option}>
                {option}
              </RadioGroupItem>
            ))}
          </RadioGroup>
          <Button onClick={handleSubmit}>Submit</Button>
        </div>
      ) : (
        <div className="result-section">
          <h2>Your Score: {score} / {sampleQuestions.length}</h2>
        </div>
      )}
    </Card>
  );
};

export default QuizPage; 