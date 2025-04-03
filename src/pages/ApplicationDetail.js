import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./ApplicationDetail.css";

const ApplicationDetail = () => {
    const { surveyId } = useParams();
    const navigate = useNavigate();
    const [questions, setQuestions] = useState([]);
    const baseUrl = "http://form-flow-be.us-east-1.elasticbeanstalk.com";

    const sessionToken = localStorage.getItem("sessionToken") || "";

    const handleStatisticClick = () => {
        navigate(`/Statistic/${surveyId}`); 
    };

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

    return (
        <div className="question-container">
            <h2>Survey Questions</h2>
            {questions.length === 0 ? (
                <p>There are no questions in this survey!</p>
            ) : (
                questions.map((q) => (
                    <div key={q.id} className="question-card">
                        <h3>{q.question_order}. {q.description}</h3>

                        {/* 单选题 */}
                        {q.type === "single" && (
                            <div className="option-box">
                                {q.body.split(",").map((option, index) => (
                                    <label key={index} className="option-label">
                                        <input type="radio" name={`question-${q.id}`} />
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
                                        <input type="checkbox" />
                                        <span>{option.trim()}</span>
                                    </label>
                                ))}
                            </div>
                        )}

                        {/* 文本题 */}
                        {q.type === "text" && (
                            <textarea className="text-answer" placeholder=" Enter your answer here..." />
                        )}
                    </div>
                ))
            )}

            {/* 返回按钮 */}
            <div className="button-row">
                <button className="back-button" onClick={() => navigate("/")}>
                    Return to Home
                </button>

                <button className="back-button" onClick={handleStatisticClick}>
                    Statistic
                </button>
            </div>
        </div>
    );
};

export default ApplicationDetail;
