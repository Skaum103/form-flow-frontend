import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Fillout.css";

const Fillout = () => {
  const { surveyId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const baseUrl = "http://form-flow-be.us-east-1.elasticbeanstalk.com";

  const sessionToken = localStorage.getItem("sessionToken") || "";

  useEffect(() => {
    if (!sessionToken.trim()) return;

    fetch(`${baseUrl}/survey/get_survey_detail`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionToken, surveyId }),
    })
      .then((response) => response.json())
      .then((data) => {
        setQuestions(data.questions || []);
      })
      .catch((error) => console.error("Error fetching survey details:", error));
  }, [surveyId, sessionToken]);

  const handleSubmit = () => {
    
    for (const q of questions) {
      if (q.type === "text") {
        const answer = answers[q.id];
        if (!answer || answer.trim() === "") {
          alert(`Please fill out the text question: "${q.description}"`);
          return; // 阻止提交
        }
      }
    }
    const answersArray = questions.map((q) => answers[q.id] || "");
    const finalAnswers = answersArray.join(";");

    const requestData = {
      sessionToken,
      surveyId,
      answers: finalAnswers,
    };

    fetch(`${baseUrl}/take/take_survey`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestData),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Submit success:", data);
        navigate("/");
      })
      .catch((error) => console.error("Submit failed:", error));
  };

  return (
    <div className="question-container">
      <h2>Survey Questions</h2>
      {questions.length === 0 ? (
        <p>There are no questions in this survey!</p>
      ) : (
        questions.map((q) => (
          <div key={q.id} className="question-card">
            <h3>
              {q.question_order}. {q.description}
            </h3>

            {/* 单选题 */}
            {q.type === "single" && (
              <div className="option-box">
                {q.body.split(",").map((option, index) => (
                  <label key={index} className="option-label">
                    {/* <input type="radio" name={`question-${q.id}`} /> */}
                    <input
                      type="radio"
                      name={`question-${q.id}`}
                      value={index + 1} // 存入索引数字，从1开始
                      onChange={(e) =>
                        setAnswers({ ...answers, [q.id]: e.target.value })
                      }
                    />
                    <span>{option.trim()}</span>
                  </label>
                ))}
              </div>
            )}

            {/* 多选题 */}
            {q.type === "multiple" && (
              <div className="option-box">
                {q.body.split(",").map((option, index) => (
                  <label key={index} className="option-label">
                    {/* <input type="checkbox" /> */}
                    <input
                      type="checkbox"
                      value={index + 1} // 存入索引数字
                      onChange={(e) => {
                        const checked = e.target.checked;
                        const value = e.target.value;
                        const prevAnswers = answers[q.id]
                          ? answers[q.id].split(",")
                          : [];

                        if (checked) {
                          prevAnswers.push(value);
                        } else {
                          const idx = prevAnswers.indexOf(value);
                          if (idx > -1) prevAnswers.splice(idx, 1);
                        }

                        // 排序后再存入更清晰
                        prevAnswers.sort((a, b) => a - b);

                        setAnswers({
                          ...answers,
                          [q.id]: prevAnswers.join(","),
                        });
                      }}
                    />
                    <span>{option.trim()}</span>
                  </label>
                ))}
              </div>
            )}

            {/* 文本题 */}
            {q.type === "text" && (
              <textarea
                className="text-answer"
                placeholder=" Enter your answer here..."
                onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value.trim() })}
              />
            )}
          </div>
        ))
      )}

      {/* 返回按钮 */}
      <button className="back-button" onClick={handleSubmit}>
        Submit Now !
      </button>
    </div>
  );
};

export default Fillout;
