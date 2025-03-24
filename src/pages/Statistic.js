import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "./Statistic.css";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28CFE", "#FF6BAA"];

const ApplicationDetail = () => {
  const { surveyId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [stats, setStats] = useState([]);
  const baseUrl = "http://form-flow-be.us-east-1.elasticbeanstalk.com";
  const sessionToken = localStorage.getItem("sessionToken") || "";

  // 获取问卷详细信息
  useEffect(() => {
    if (!sessionToken.trim()) return;

    fetch(`${baseUrl}/survey/get_survey_detail`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionToken, surveyId }),
    })
      .then((res) => res.json())
      .then((data) => setQuestions(data.questions || []))
      .catch((err) => console.error("Error fetching survey details:", err));
  }, [surveyId, sessionToken]);

  // 获取统计数据
  useEffect(() => {
    if (!sessionToken.trim()) return;

    fetch(`${baseUrl}/take/get_survey_stats`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionToken, surveyId }),
    })
      .then((res) => res.json())
      .then((data) => setStats(data.stats || []))
      .catch((err) => console.error("Error fetching survey stats:", err));
  }, [surveyId, sessionToken]);

  // 获取指定问题的统计数据
  const getQuestionStats = (order) => {
    const statEntry = stats.find((s) => s.question_order === order);
    return statEntry ? statEntry.stats : {};
  };

  // 将 stats 的索引转为选项文本 + 数值形式供 Recharts 使用
  const generateChartData = (q) => {
    const optionList = q.body.split(",").map((opt) => opt.trim());
    const rawStats = getQuestionStats(q.question_order);
    return Object.entries(rawStats).map(([key, value]) => {
      const optionIndex = parseInt(key, 10) - 1;
      return {
        name: optionList[optionIndex] || `选项${key}`,
        value: value,
      };
    });
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

            {(q.type === "single" || q.type === "multiple") ? (
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={generateChartData(q)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} (${(percent * 100).toFixed(0)}%)`
                      }
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {generateChartData(q).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <textarea
                className="text-answer"
                placeholder="Enter your answer here..."
                disabled
              />
            )}
          </div>
        ))
      )}

      <button className="back-button" onClick={() => navigate("/")}>
        Return to Home
      </button>
    </div>
  );
};

export default ApplicationDetail;
