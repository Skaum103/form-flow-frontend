import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Login from "../Login";

// Mock useNavigate
const mockedUsedNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedUsedNavigate,
}));

describe("Login Component", () => {
  test("renders login form correctly", () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    // 检查是否渲染了必要的表单元素
    // 确保标题正确渲染
    expect(
      screen.getByRole("heading", { level: 2, name: "Log in" })
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("Please enter your username")
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Please enter your password")
    ).toBeInTheDocument();
    // 确保按钮存在
    expect(screen.getByRole("button", { name: "Log in" })).toBeInTheDocument();

    expect(screen.getByText("Does not have an account?")).toBeInTheDocument();
  });

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

  test("shows error message when login fails", async () => {
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

    const loginButton = screen.getByText("Log in");

    fireEvent.click(loginButton);

    expect(await screen.findByText("Invalid credentials")).toBeInTheDocument();
  });

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

  test("successful login stores token and navigates", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, token: "mocked_token" }),
      })
    );

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const loginButton = screen.getByText("Log in");
    fireEvent.click(loginButton);

    await new Promise((r) => setTimeout(r, 100)); // 等待异步操作完成

    expect(localStorage.getItem("token")).toBe("mocked_token");
    expect(mockedUsedNavigate).toHaveBeenCalledWith("/");
  });
});
