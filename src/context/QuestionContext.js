import React, { createContext, useState } from "react";

const QuestionContext = createContext({
  currentQuestion: {},
  setCurrentQuestionObj: () => {}
});

const QuestionContextProvider = ({ children }) => {
  const [currentQuestion, setCurrentQuestion] = useState(null);

  const setCurrentQuestionObj = question => {
    setCurrentQuestion(question);
  };

  return (
    <QuestionContext.Provider
      value={{
        currentQuestion,
        setCurrentQuestionObj
      }}
    >
      {children}
    </QuestionContext.Provider>
  );
};

export { QuestionContext, QuestionContextProvider };
