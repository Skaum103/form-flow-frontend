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
    localStorage.clear();
    global.fetch = jest.fn();
    jest.spyOn(window, "alert").mockImplementation(() => {});
    mockNavigate.mockClear();
  });

  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
    localStorage.clear();
  });

  test("redirects to home if no session token on mount", async () => {
    render(
      <MemoryRouter>
        <CreateApplication />
      </MemoryRouter>
    );
    await waitFor(() =>
      expect(window.alert).toHaveBeenCalledWith("Please log in first!")
    );
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith("/")
    );
  });

  test("adds single, multiple, and text questions and modifies them", async () => {
    localStorage.setItem("sessionToken", "abc123");
    render(
      <MemoryRouter>
        <CreateApplication />
      </MemoryRouter>
    );

    // 添加三种类型的问题
    fireEvent.click(screen.getByText("+ Add Single Choice"));
    fireEvent.click(screen.getByText("+ Add Multiple Choice"));
    fireEvent.click(screen.getByText("+ Add Text Question"));

    // 检查问题输入框数量为 3
    expect(screen.getAllByPlaceholderText("Enter question")).toHaveLength(3);

    // 修改第一个问题的标题
    const firstQuestionInput = screen.getAllByPlaceholderText("Enter question")[0];
    fireEvent.change(firstQuestionInput, { target: { value: "What is your favorite color?" } });
    expect(firstQuestionInput.value).toBe("What is your favorite color?");

    // 对非文本问题，检查选项输入（第一个问题为 single 类型）
    const radioInput = screen.getByRole("radio");
    expect(radioInput).toBeInTheDocument();

    // 全局查询所有选项输入框，初始时应有两个（分别对应 single 和 multiple 类型）
    let optionInputs = screen.getAllByPlaceholderText("Enter option");
    expect(optionInputs.length).toBe(2);

    // 修改第一个问题的第一个选项
    fireEvent.change(optionInputs[0], { target: { value: "Red" } });
    expect(optionInputs[0].value).toBe("Red");

    // 获取所有“+ Add Option”按钮，全局第一个即为第一问题的按钮
    const addOptionButtons = screen.getAllByText("+ Add Option");
    const firstQuestionAddOptionButton = addOptionButtons[0];
    fireEvent.click(firstQuestionAddOptionButton);

    // 添加后，全局选项输入框数量应由 2 增加到 3
    optionInputs = screen.getAllByPlaceholderText("Enter option");
    expect(optionInputs.length).toBe(3);

    // 删除第二个问题（multiple 类型）
    const deleteButtons = screen.getAllByText("Delete Question");
    fireEvent.click(deleteButtons[1]);
    expect(screen.getAllByPlaceholderText("Enter question")).toHaveLength(2);
  });

  test("handles session token missing on submit", async () => {
    // 先设置 token，再移除模拟 token 过期
    localStorage.setItem("sessionToken", "abc123");
    render(
      <MemoryRouter>
        <CreateApplication />
      </MemoryRouter>
    );
    localStorage.removeItem("sessionToken");

    const submitButton = screen.getByRole("button", { name: /submit survey/i });
    fireEvent.click(submitButton);

    await waitFor(() =>
      expect(window.alert).toHaveBeenCalledWith("Session expired, please log in again.")
    );
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith("/login")
    );
  });

  test("handles fetch failure on survey creation", async () => {
    localStorage.setItem("sessionToken", "abc123");
    // 模拟创建问卷 API 返回不 ok
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    });

    render(
      <MemoryRouter>
        <CreateApplication />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/survey name/i), { target: { value: "Test Survey" } });
    fireEvent.change(screen.getByLabelText(/survey description/i), { target: { value: "A survey description" } });
    const submitButton = screen.getByRole("button", { name: /submit survey/i });
    fireEvent.click(submitButton);

    await waitFor(() =>
      expect(window.alert).toHaveBeenCalledWith(expect.stringContaining("Submission failed"))
    );
  });

  test("handles fetch failure on updating questions", async () => {
    localStorage.setItem("sessionToken", "abc123");
    // 第一个 API 成功返回 surveyId
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ surveyId: "1" }),
    });
    // 第二个 API 返回不 ok
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    });

    render(
      <MemoryRouter>
        <CreateApplication />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/survey name/i), { target: { value: "Test Survey" } });
    fireEvent.change(screen.getByLabelText(/survey description/i), { target: { value: "A survey description" } });
    const submitButton = screen.getByRole("button", { name: /submit survey/i });
    fireEvent.click(submitButton);

    await waitFor(() =>
      expect(window.alert).toHaveBeenCalledWith(expect.stringContaining("Submission failed"))
    );
  });

  test("submits the form successfully", async () => {
    localStorage.setItem("sessionToken", "abc123");
    // 模拟创建和更新 API 均成功
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ surveyId: "1" }),
    });
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    render(
      <MemoryRouter>
        <CreateApplication />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/survey name/i), { target: { value: "Test Survey" } });
    fireEvent.change(screen.getByLabelText(/survey description/i), { target: { value: "A survey description" } });
    const submitButton = screen.getByRole("button", { name: /submit survey/i });
    fireEvent.click(submitButton);

    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledTimes(2)
    );
    await waitFor(() =>
      expect(window.alert).toHaveBeenCalledWith("Survey created and questions updated successfully!")
    );
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  test("handles updateData.success false", async () => {
    localStorage.setItem("sessionToken", "abc123");
    // 模拟创建问卷成功但更新问题返回 success 为 false
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ surveyId: "1" }),
    });
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: false }),
    });

    render(
      <MemoryRouter>
        <CreateApplication />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/survey name/i), { target: { value: "Test Survey" } });
    fireEvent.change(screen.getByLabelText(/survey description/i), { target: { value: "A survey description" } });
    // 添加一个问题使更新问题的 payload 非空
    fireEvent.click(screen.getByText("+ Add Single Choice"));
    const questionInput = screen.getAllByPlaceholderText("Enter question")[0];
    fireEvent.change(questionInput, { target: { value: "Question 1" } });

    const submitButton = screen.getByRole("button", { name: /submit survey/i });
    fireEvent.click(submitButton);

    await waitFor(() =>
      expect(window.alert).toHaveBeenCalledWith("Failed to update questions.")
    );
  });

  test("handles create response without surveyId", async () => {
    localStorage.setItem("sessionToken", "abc123");
    // 模拟创建问卷 API 返回 ok，但 surveyId 为空（未返回 surveyId）
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    render(
      <MemoryRouter>
        <CreateApplication />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/survey name/i), { target: { value: "Test Survey" } });
    fireEvent.change(screen.getByLabelText(/survey description/i), { target: { value: "A survey description" } });
    // 添加一个问题（虽然不会进入更新流程，但能覆盖到该分支）
    fireEvent.click(screen.getByText("+ Add Single Choice"));

    const submitButton = screen.getByRole("button", { name: /submit survey/i });
    fireEvent.click(submitButton);

    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledTimes(1)
    );
  });
});
