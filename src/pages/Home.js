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
    const sessionToken = localStorage.getItem("sessionToken");
    console.log("Home component rendered, sessionToken:", sessionToken);
    useEffect(() => {
        if (!sessionToken) return;

        fetch("https://your-backend-api.com/surveys", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionToken }),
        })
            .then((response) => response.json())
            .then((data) => setSurveys(data.surveys || []))
            .catch((error) => console.error("Error fetching surveys:", error));
    }, [sessionToken]);

    if (!sessionToken || sessionToken.trim() === "") {
      return (
          <div className="home-container">
              <div className="content">
                  {/* 左侧文本区域 */}
                  <div className="text-section">
                      <h1>The refreshingly different survey builder</h1>
                      <p>
                        Let the whole journey happen in your survey
                      </p>
                  </div>

                  {/* 右侧：完整的图片 */}
                  <div className="image-section">
                      <img src={`${process.env.PUBLIC_URL}/welcome-image.png`} alt="Survey UI" />
                  </div>
              </div>
          </div>
      );
  }

    const indexOfLastSurvey = currentPage * surveysPerPage;
    const indexOfFirstSurvey = indexOfLastSurvey - surveysPerPage;
    const currentSurveys = surveys.slice(indexOfFirstSurvey, indexOfLastSurvey);

    return (
        <div className="home-container">
            <div className="survey-list">
                {currentSurveys.map((survey) => (
                    <Survey key={survey.surveyId} survey={survey} />
                ))}
                <div className="pagination">
                    {Array.from({ length: Math.ceil(surveys.length / surveysPerPage) }, (_, i) => (
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
        </div>
    );
};

export default Home;
