// Login.test.js
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Login from "../Login";
import React from "react";

// 模拟 react-router-dom 里的 useNavigate，以便跟踪页面跳转
const mockedUsedNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedUsedNavigate,
}));

describe("Login Component", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
    jest.resetModules();
    global.fetch = jest.fn();
    Object.defineProperty(window, "localStorage", {
      value: {
        setItem: jest.fn(),
        getItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    });
  });

  // 测试 1：检查 Login 页面的各个组件是否正确渲染
  test("renders login form correctly", () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    expect(
      screen.getByRole("heading", { level: 2, name: "Log in" })
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Please enter your username")
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Please enter your password")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Log in Now !" })
    ).toBeInTheDocument();
    expect(screen.getByText("Does not have an account?")).toBeInTheDocument();
  });

  // 测试 2：检查输入框是否能正确更新
  test("updates username and password input values", () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    const usernameInput = screen.getByPlaceholderText(
      "Please enter your username"
    );
    const passwordInput = screen.getByPlaceholderText(
      "Please enter your password"
    );
    fireEvent.change(usernameInput, { target: { value: "testuser" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    expect(usernameInput.value).toBe("testuser");
    expect(passwordInput.value).toBe("password123");
  });

  // 测试 3：检查登录失败时（response.ok 为 false）的错误提示
  test("shows error message when login fails (response.ok false)", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () =>
          Promise.resolve({ success: false, message: "Invalid credentials" }),
      })
    );
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    fireEvent.click(screen.getByRole("button", { name: "Log in Now !" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Invalid credentials"
    );
  });

  // 测试 4：点击 "Register Now" 是否跳转到注册页面
  test("navigates to register page when clicking 'Register Now'", () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    const registerButton = screen.getByText("Register Now");
    fireEvent.click(registerButton);
    expect(mockedUsedNavigate).toHaveBeenCalledWith("/register");
  });

  // 测试 5：成功登录时存储 sessionToken 并跳转
  test("successful login stores session ID and navigates", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            sessionToken: "mocked_session_id",
          }),
      })
    );
    const setUserMock = jest.fn();
    render(
      <BrowserRouter>
        <Login setUser={setUserMock} />
      </BrowserRouter>
    );
    fireEvent.click(screen.getByRole("button", { name: "Log in Now !" }));
    await screen.findByRole("button", { name: "Log in Now !" });
    expect(localStorage.setItem).toHaveBeenCalledWith(
      "sessionToken",
      "mocked_session_id"
    );
    expect(mockedUsedNavigate).toHaveBeenCalledWith("/");
    expect(setUserMock).toHaveBeenCalled(); // 验证 setUser 被调用
  });

  // 测试 6：登录失败且返回空字符串 message 时，显示默认错误提示
  test("shows default error message when login fails without message", async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        json: () =>
          Promise.resolve({
            success: false,
            message: "",
          }),
      })
    );
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    fireEvent.click(screen.getByRole("button", { name: "Log in Now !" }));
    const alertElement = await screen.findByRole("alert");
    expect(alertElement).toHaveTextContent("Invalid credentials");
  });

  // 测试 7：response.ok 为 true 但 data.success 为 false 的情况
  test("login failure with ok true but success false", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: false,
            message: "Wrong password",
          }),
      })
    );
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    fireEvent.click(screen.getByRole("button", { name: "Log in Now !" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Wrong password");
  });

  // 测试 8：模拟 fetch 抛出异常的情况
  test("handles exception when fetch fails", async () => {
    global.fetch = jest.fn(() =>
      Promise.reject(new Error("Network error"))
    );
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    fireEvent.click(screen.getByRole("button", { name: "Log in Now !" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Network error");
  });

  // 测试 9：检查 fetch 调用时的参数是否正确（包括 body、header 等）
  test("fetch is called with correct parameters", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            sessionToken: "123",
          }),
      })
    );
    const setUserMock = jest.fn();
    render(
      <BrowserRouter>
        <Login setUser={setUserMock} />
      </BrowserRouter>
    );

    const usernameInput = screen.getByPlaceholderText("Please enter your username");
    const passwordInput = screen.getByPlaceholderText("Please enter your password");
    fireEvent.change(usernameInput, { target: { value: "user1" } });
    fireEvent.change(passwordInput, { target: { value: "pass1" } });
    fireEvent.click(screen.getByRole("button", { name: "Log in Now !" }));

    await screen.findByRole("button", { name: "Log in Now !" });
    expect(global.fetch).toHaveBeenCalled();
    const fetchCall = global.fetch.mock.calls[0];
    expect(fetchCall[0]).toBe("http://form-flow-be.us-east-1.elasticbeanstalk.com/auth/login");
    expect(fetchCall[1].method).toBe("POST");
    expect(fetchCall[1].headers["Content-Type"]).toBe("application/x-www-form-urlencoded");
    expect(fetchCall[1].body).toContain("username=user1");
    expect(fetchCall[1].body).toContain("password=pass1");
  });
});
