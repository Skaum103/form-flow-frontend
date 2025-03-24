import React from "react";
import { useNavigate } from "react-router-dom";
import "./Survey.css";

const Survey = ({ survey }) => {
    const navigate = useNavigate();

    const handleDetailsClick = () => {
        navigate(`/survey/${survey.surveyId}`); // 跳转到问卷详情页面
    };

    const handleStatisticClick = () => {
        navigate(`/Statistic/${survey.surveyId}`); 
    };

    return (
        <div className="survey-card">
            <h3>{survey.surveyName}</h3>
            <p>{survey.description}</p>
            <button onClick={handleDetailsClick}>
                Details
            </button>
            <button onClick={handleStatisticClick}>
                Statistic
            </button>
        </div>
    );
};

export default Survey;
