import React from "react";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import CreateApplication from "../CreateApplication";

// 模拟 useNavigate 并记录调用
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("CreateApplication", () => {
  beforeAll(() => {
    // 忽略 React Router 关于 Splat 路由的警告
    jest.spyOn(console, "warn").mockImplementation((msg) => {
      if (msg.includes("Relative route resolution within Splat routes")) return;
      console.warn(msg);
    });
  });

  afterAll(() => {
    console.warn.mockRestore();
  });

  beforeEach(() => {
    localStorage.setItem("sessionToken", "abc123");
    global.fetch = jest.fn();
    jest.spyOn(window, "alert").mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
    localStorage.clear();
  });

  test("submits the form successfully", async () => {
    // 模拟第一个 fetch：创建问卷返回 surveyId "1"
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ surveyId: "1" }),
    });
    // 模拟第二个 fetch：更新问题返回 success: true
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    render(
      <MemoryRouter>
        <CreateApplication />
      </MemoryRouter>
    );

    // 根据 CreateApplication 中的 label 获取输入框
    const surveyNameInput = screen.getByLabelText(/survey name/i);
    const surveyDescriptionInput = screen.getByLabelText(/survey description/i);
    const submitButton = screen.getByRole("button", { name: /submit survey/i });

    // 填写表单数据
    fireEvent.change(surveyNameInput, { target: { value: "Test Survey" } });
    fireEvent.change(surveyDescriptionInput, { target: { value: "A survey description" } });
    fireEvent.click(submitButton);

    // 等待 fetch 调用完毕
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    // 检查 alert 提示成功
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Survey created and questions updated successfully!");
    });

    // 检查页面跳转到首页
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});
