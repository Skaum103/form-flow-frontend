// src/pages/CreateApplication.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateApplication.css';

export default function CreateApplication() {
  const [applicationTitle, setApplicationTitle] = useState('');
  const [questions, setQuestions] = useState([]);
  // const navigate = useNavigate();

  // useEffect(() => {
  //   const sessionId = document.cookie.match(/jsessionid=([^;]+)/)?.[1];
  //   if (!sessionId) {
  //     alert('请先登录！');
  //     navigate('/');
  //   }
  // }, [navigate]);

  const addQuestion = (type) => {
    setQuestions([...questions, { type, title: '', options: type !== 'text' ? [''] : [] }]);
  };

  const addOption = (index) => {
    const newQuestions = [...questions];
    newQuestions[index].options.push('');
    setQuestions(newQuestions);
  };

  const removeQuestion = (index) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
  };

  const submitApplication = () => {
    const sessionId = document.cookie.match(/jsessionid=([^;]+)/)?.[1] || '';
    const payload = {
      title: applicationTitle,
      questions,
      sessionId
    };

    fetch('/api/application/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then((response) => response.json())
      .then(() => alert('提交成功！'))
      .catch((error) => console.error('提交失败', error));
  };

  return (
    <div className="create-application">
      <h1>创建新申请</h1>

      <div className="form-group">
        <label htmlFor="title">文件标题：</label>
        <input
          type="text"
          id="title"
          value={applicationTitle}
          onChange={(e) => setApplicationTitle(e.target.value)}
          placeholder="请输入文件标题"
          className="input-field"
        />
      </div>

      <div className="question-section">
        <h2>添加题目</h2>
        <button onClick={() => addQuestion('single')}>+ 添加单选题</button>
        <button onClick={() => addQuestion('multiple')}>+ 添加多选题</button>
        <button onClick={() => addQuestion('text')}>+ 添加问答题</button>

        {questions.map((question, index) => (
          <div key={index} className="question">
            <label>题目 {index + 1}：</label>
            <input
              type="text"
              value={question.title}
              onChange={(e) => {
                const newQuestions = [...questions];
                newQuestions[index].title = e.target.value;
                setQuestions(newQuestions);
              }}
              placeholder="请输入题目"
              className="input-field"
            />

            {question.type !== 'text' && (
              <div className="options-container">
                {question.options.map((option, i) => (
                  <div key={i} className="option">
                    {question.type === 'single' ? (
                      <input type="radio" disabled />
                    ) : (
                      <input type="checkbox" disabled />
                    )}
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => {
                        const newQuestions = [...questions];
                        newQuestions[index].options[i] = e.target.value;
                        setQuestions(newQuestions);
                      }}
                      placeholder="选项内容"
                      className="input-field"
                    />
                  </div>
                ))}
                <button onClick={() => addOption(index)}>+ 添加选项</button>
              </div>
            )}

            {question.type === 'text' && (
              <textarea placeholder="请输入回答" className="input-field" disabled />
            )}

            <button onClick={() => removeQuestion(index)}>删除题目</button>
          </div>
        ))}
      </div>

      <button className="submit-btn" onClick={submitApplication}>
        提交申请
      </button>
    </div>
  );
}
