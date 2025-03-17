import React from "react";
import { useNavigate } from "react-router-dom";
import "./Survey.css";

const SurveyTake = ({ survey }) => {
    const navigate = useNavigate();

    const handleDetailsClick = () => {
        navigate(`/survey/${survey.surveyId}`); // 跳转到问卷详情页面
    };

    return (
        <div className="survey-card">
            <h3>{survey.surveyName}</h3>
            <p>{survey.description}</p>
            <button onClick={handleDetailsClick}>
                Fill out Now
            </button>
        </div>
    );
};

export default SurveyTake;
