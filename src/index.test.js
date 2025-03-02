import React from "react";
import { unstable_act as act } from "react";
import "@testing-library/jest-dom/extend-expect";

describe("index.js", () => {
  let container;
  let reportWebVitals;
  beforeAll(() => {
    // 创建一个 id="root" 的 div 模拟真实页面根节点
    container = document.createElement("div");
    container.setAttribute("id", "root");
    document.body.appendChild(container);
  });

  afterAll(() => {
    document.body.removeChild(container);
    jest.clearAllTimers();
  });

  test("renders App into root element and calls reportWebVitals", async () => {
    container.innerHTML = "";
    jest.resetModules();
    // 在 require index.js 之前，动态 mock reportWebVitals 为 jest.fn()
    jest.doMock("./reportWebVitals", () => jest.fn());
    // 重新 require reportWebVitals（此时它是一个 jest.fn()）
    reportWebVitals = require("./reportWebVitals");
    
    await act(async () => {
      // 使用 isolateModules 重新加载 index.js，确保模块缓存被清空
      jest.isolateModules(() => {
        require("./index");
      });
      // 等待一小段时间确保渲染完成
      await new Promise((resolve) => setTimeout(resolve, 50));
    });
    // 检查 #root 内是否有子节点
    expect(container.childNodes.length).toBeGreaterThan(0);
    expect(reportWebVitals).toHaveBeenCalled();
  });
});
