import React from "react";
import "./App.css";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>问卷平台</h1>
        <p>欢迎来到问卷平台，请选择以下操作：</p>
        <div className="button-group">
          <button className="btn" onClick={() => alert("创建问卷")}>
            创建问卷
          </button>
          <button className="btn" onClick={() => alert("填写问卷")}>
            填写问卷
          </button>
          <button className="btn" onClick={() => alert("查看问卷结果")}>
            查看结果
          </button>
        </div>
      </header>
    </div>
  );
}

export default App;
