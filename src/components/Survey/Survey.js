import React from "react";
import "./Survey.css";

const Survey = ({ survey }) => {
    return (
        <div className="survey-card">
            <h3>{survey.surveyName}</h3>
            <p>{survey.description}</p>
            <button onClick={() => window.location.href = `/survey/${survey.surveyId}`}>
                查看详情
            </button>
        </div>
    );
};

export default Survey;
