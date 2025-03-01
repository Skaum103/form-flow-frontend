import React from "react";
import "./Survey.css";

const Survey = ({ survey }) => {
    return (
        <div className="survey-card">
            <h3>{survey.surveyName}</h3>
            <p>{survey.description}</p>
            <button>
                Details
            </button>
        </div>
    );
};

export default Survey;
