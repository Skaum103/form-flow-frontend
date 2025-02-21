// src/pages/CreateApplication.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./CreateApplication.css";

export default function CreateApplication() {
  const [surveyName, setSurveyName] = useState("");
  const [surveyDescription, setSurveyDescription] = useState("");
  const [questions, setQuestions] = useState([]);
  const navigate = useNavigate();
  const baseUrl = "http://form-flow-be.us-east-1.elasticbeanstalk.com";

  useEffect(() => {
    const sessionId = localStorage.getItem("JSESSIONID");

    console.log("Detected sessionToken:", sessionId);

    if (!sessionId) {
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

  const submitApplication = async () => {
    const sessionToken = localStorage.getItem("JSESSIONID");
    if (!sessionToken) {
      alert("Session expired, please log in again.");
      navigate("/login");
      return;
    }

    // Step 1: Create Survey
    const createPayload = {
      sessionToken: sessionToken,
      surveyName: surveyName,
      description: surveyDescription,
    };

    console.log("Create Payload:", JSON.stringify(createPayload, null, 2));

    try {
      const createResponse = await fetch(`${baseUrl}/survey/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createPayload),
      });

      if (!createResponse.ok) throw new Error("Failed to create survey");

      const createData = await createResponse.json();
      console.log("Create Response:", createData);

      const surveyId = createData.surveyId;

      if (surveyId) {
        // Step 2: Update Questions with type and order
        const updatePayload = {
          sessionToken: sessionToken,
          surveyId: surveyId,
          questions: questions.map((q, index) => ({
            type: q.type,
            question_order: index + 1, // 1-based index for order
            description: q.title,
            body: q.options.join(", "), // 将选项以逗号分隔
          })),
        };

        console.log("Update Payload:", JSON.stringify(updatePayload, null, 2));

        const updateResponse = await fetch(`${baseUrl}/survey/update_questions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatePayload),
        });

        if (!updateResponse.ok) throw new Error("Failed to update questions");

        const updateData = await updateResponse.json();
        console.log("Update Response:", updateData);

        if (updateData.success) {
          alert("Survey created and questions updated successfully!");
          navigate("/");
        } else {
          alert("Failed to update questions.");
        }
      }
    } catch (error) {
      console.error("Submission failed", error);
      alert("Submission failed: " + error.message);
    }
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

      <div className="form-group">
        <label htmlFor="surveyDescription">Survey Description:</label>
        <input
          type="text"
          id="surveyDescription"
          value={surveyDescription}
          onChange={(e) => setSurveyDescription(e.target.value)}
          placeholder="Enter survey description"
          className="input-field"
        />
      </div>

      <div className="question-section">
        <h2>Add Questions</h2>
        <button onClick={() => addQuestion("single")}>+ Add Single Choice</button>
        <button onClick={() => addQuestion("multiple")}>+ Add Multiple Choice</button>
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

            <button onClick={() => removeQuestion(index)}>Delete Question</button>
          </div>
        ))}
      </div>

      <button className="submit-btn" onClick={submitApplication}>
        Submit Survey
      </button>
    </div>
  );
}
