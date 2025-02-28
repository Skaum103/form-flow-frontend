import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Survey from "../components/Survey/Survey";
import "./Home.css";
import "../components/Survey/Survey.css";

const Home = () => {
    const navigate = useNavigate();
    const [surveys, setSurveys] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const surveysPerPage = 4;

    // 确保 `sessionToken` 有默认值，避免 `null` 影响 useEffect
    const sessionToken = localStorage.getItem("sessionToken") || "";

    //  确保 `useEffect` 在所有渲染中执行，不受 `if` 影响
    useEffect(() => {
        if (!sessionToken.trim()) return; // 仅在 sessionToken 存在时请求

        fetch("https://your-backend-api.com/surveys", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionToken }),
        })
        .then((response) => response.json())
        .then((data) => setSurveys(data.surveys || []))
        .catch((error) => console.error("Error fetching surveys:", error));
    }, [sessionToken]);

    //  确保分页计算不会超出数据范围
    const totalPages = Math.ceil(surveys.length / surveysPerPage);
    const indexOfLastSurvey = Math.min(currentPage * surveysPerPage, surveys.length);
    const indexOfFirstSurvey = (currentPage - 1) * surveysPerPage;
    const currentSurveys = surveys.slice(indexOfFirstSurvey, indexOfLastSurvey);

    //  避免 `useEffect` 无限循环，防止 `setCurrentPage` 触发重复渲染
    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [totalPages, currentPage]);

    //  如果 sessionToken 为空，直接返回未登录界面
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
                <div className="pagination">
                    {Array.from({ length: totalPages }, (_, i) => (
                        <button
                            key={i + 1}
                            //页面高亮
                            className={currentPage === i + 1 ? "active" : ""}
                            onClick={() => setCurrentPage(i + 1)}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Home;
