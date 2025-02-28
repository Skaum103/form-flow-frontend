import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Survey from "../components/Survey/Survey";
import "./Home.css";
import "../components/Survey/Survey.css";

const Home = () => {
    const navigate = useNavigate();
    const [surveys, setSurveys] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const surveysPerPage = 8;
    const baseUrl = "http://form-flow-be.us-east-1.elasticbeanstalk.com";

    // 确保 `sessionToken` 有默认值
    const sessionToken = localStorage.getItem("sessionToken") || "";

    //  获取问卷数据
    useEffect(() => {
        if (!sessionToken.trim()) return; 

        fetch(baseUrl + "/survey/getSurvey", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionToken }),
        })
        .then((response) => response.json())
        .then((data) => {
            setSurveys(data.surveys || []);
            setCurrentPage(1); // 确保默认从第一页开始
        })
        .catch((error) => console.error("Error fetching surveys:", error));
    }, [sessionToken]);

    //  确保分页计算不会超出范围
    const totalPages = Math.max(1, Math.ceil(surveys.length / surveysPerPage)); // 确保至少 1 页
    const indexOfLastSurvey = Math.min(currentPage * surveysPerPage, surveys.length);
    const indexOfFirstSurvey = (currentPage - 1) * surveysPerPage;
    const currentSurveys = surveys.slice(indexOfFirstSurvey, indexOfLastSurvey);

    //  避免 `useEffect` 无限循环
    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [totalPages, currentPage]);

    //  未登录界面
    if (!sessionToken.trim()) {
        return (
            <div className="home-container">
                <div className="content">
                    <div className="text-section">
                        <h1>The refreshingly different survey builder</h1>
                        <p>Let the whole journey happen in your survey</p>
                    </div>
                    <div className="image-section">
                        <img src={`${process.env.PUBLIC_URL}/welcome-image.png`} alt="Survey UI" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="home-container">
            <div className="survey-list">
                {currentSurveys.map((survey) => (
                    <Survey key={survey.surveyId} survey={survey} />
                ))}
            </div>
            
            <div className="pagination">
                {Array.from({ length: totalPages }, (_, i) => (
                    <button
                        key={i + 1}
                        className={currentPage === i + 1 ? "active" : ""}
                        onClick={() => setCurrentPage(i + 1)}
                    >
                        {i + 1}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default Home;
