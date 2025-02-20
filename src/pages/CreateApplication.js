// src/pages/CreateApplication.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./CreateApplication.css";

export default function CreateApplication() {
  const [surveyName, setSurveyName] = useState("");
  const [questions, setQuestions] = useState([]);
  const navigate = useNavigate();
  const baseUrl = "http://form-flow-be.us-east-1.elasticbeanstalk.com";

  useEffect(() => {
    const sessionId = localStorage.getItem("JSESSIONID");

    console.log("Detected jsessionid:", sessionId);

    if (sessionId) {
      document.cookie = `JSESSIONID=${sessionId}; path=/; SameSite=None;Secure`;
      console.log("Cookie after setting:", document.cookie);
    } else {
      alert("Please log in first!");
      navigate("/");
    }
  }, [navigate]);

  const addQuestion = (type) => {
    setQuestions([
      ...questions,
      { type, title: "", options: type !== "text" ? [""] : [] },
    ]);
  };

  const addOption = (index) => {
    const newQuestions = [...questions];
    newQuestions[index].options.push("");
    setQuestions(newQuestions);
  };

  const removeQuestion = (index) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
  };

  const submitApplication = () => {
    const payload = { "survey name": surveyName };

    questions.forEach((question) => {
      if (question.title.trim()) {
        payload[question.title] = question; // 使用题目描述作为键
      }
    });

    console.log("Final Payload:", JSON.stringify(payload, null, 2));

    const sessionId = localStorage.getItem("JSESSIONID");
    if (!sessionId) {
      alert("Session expired, please log in again.");
      navigate("/login");
      return;
    }

    fetch(baseUrl + "/survey/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // 允许 Cookie 发送
      body: JSON.stringify(payload),
    })
      .then((response) => {
        if (!response.ok) throw new Error("Failed to submit");
        return response.json();
      })
      .then((data) => alert("Submission successful!"))
      .catch((error) => console.error("Submission failed", error));
  };

  return (
    <div className="create-application">
      <h1>Create New Survey</h1>

      <div className="form-group">
        <label htmlFor="surveyName">Survey Name:</label>
        <input
          type="text"
          id="surveyName"
          value={surveyName}
          onChange={(e) => setSurveyName(e.target.value)}
          placeholder="Enter survey name"
          className="input-field"
        />
      </div>

      <div className="question-section">
        <h2>Add Questions</h2>
        <button onClick={() => addQuestion("single")}>
          + Add Single Choice
        </button>
        <button onClick={() => addQuestion("multiple")}>
          + Add Multiple Choice
        </button>
        <button onClick={() => addQuestion("text")}>+ Add Text Question</button>

        {questions.map((question, index) => (
          <div key={index} className="question">
            <label>Question {index + 1}:</label>
            <input
              type="text"
              value={question.title}
              onChange={(e) => {
                const newQuestions = [...questions];
                newQuestions[index].title = e.target.value;
                setQuestions(newQuestions);
              }}
              placeholder="Enter question"
              className="input-field"
            />

            {question.type !== "text" && (
              <div className="options-container">
                {question.options.map((option, i) => (
                  <div key={i} className="option">
                    {question.type === "single" ? (
                      <input type="radio" disabled />
                    ) : (
                      <input type="checkbox" disabled />
                    )}
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => {
                        const newQuestions = [...questions];
                        newQuestions[index].options[i] = e.target.value;
                        setQuestions(newQuestions);
                      }}
                      placeholder="Enter option"
                      className="input-field"
                    />
                  </div>
                ))}
                <button onClick={() => addOption(index)}>+ Add Option</button>
              </div>
            )}

            {question.type === "text" && (
              <textarea
                placeholder="Enter answer"
                className="input-field"
                disabled
              />
            )}

            <button onClick={() => removeQuestion(index)}>
              Delete Question
            </button>
          </div>
        ))}
      </div>

      <button className="submit-btn" onClick={submitApplication}>
        Submit Survey
      </button>
    </div>
  );
}
