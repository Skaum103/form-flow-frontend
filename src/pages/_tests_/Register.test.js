import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Register from "../Register";
import React from "react";

// Mock react-router-dom 的 useNavigate
const mockedUsedNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedUsedNavigate,
}));

describe("Register Component", () => {
  beforeEach(() => {
    Object.defineProperty(window, "localStorage", {
      value: {
        setItem: jest.fn(),
        getItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    });
    // Mock window.alert 避免 JSDOM 报错
    jest.spyOn(window, "alert").mockImplementation(() =>{});
    jest.spyOn(global, "fetch").mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, message: "User registered successfully" }),
      })
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("renders register form correctly", () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    expect(screen.getByRole("heading", { level: 2, name: "Register" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter your username")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter your email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter your password")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Confirm your password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Register" })).toBeInTheDocument();
    expect(screen.getByText("Already have an account?")).toBeInTheDocument();
  });

  test("updates input fields", () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    const usernameInput = screen.getByPlaceholderText("Enter your username");
    const emailInput = screen.getByPlaceholderText("Enter your email");
    const passwordInput = screen.getByPlaceholderText("Enter your password");
    const confirmPasswordInput = screen.getByPlaceholderText("Confirm your password");

    fireEvent.change(usernameInput, { target: { value: "testuser" } });
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "securepassword" } });
    fireEvent.change(confirmPasswordInput, { target: { value: "securepassword" } });

    expect(usernameInput.value).toBe("testuser");
    expect(emailInput.value).toBe("test@example.com");
    expect(passwordInput.value).toBe("securepassword");
    expect(confirmPasswordInput.value).toBe("securepassword");
  });

  test("shows error when passwords do not match", () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("Enter your password"), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByPlaceholderText("Confirm your password"), {
      target: { value: "differentpassword" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Register" }));

    expect(screen.getByText("Passwords do not match!")).toBeInTheDocument();
  });

  test("shows error when username already exists", async () => {
    jest.spyOn(global, "fetch").mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ success: false, message: "Username already exists" }),
      })
    );

    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: "Register" }));

    expect(await screen.findByText("Username already exists")).toBeInTheDocument();
  });

  test("shows error when email already exists", async () => {
    jest.spyOn(global, "fetch").mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ success: false, message: "Email already exists" }),
      })
    );

    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: "Register" }));

    expect(await screen.findByText("Email already exists")).toBeInTheDocument();
  });

  test("successful registration redirects to login page", async () => {
    jest.spyOn(global, "fetch").mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })
    );
  
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );
  
    fireEvent.click(screen.getByRole("button", { name: "Register" }));
  
    // 确保 `navigate("/login")` 被调用
    await new Promise((r) => setTimeout(r, 100)); // 等待异步操作完成
    expect(mockedUsedNavigate).toHaveBeenCalledWith("/login");
  });
  

  test("navigates to login page when clicking 'Log in'", () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText("Log in"));
    expect(mockedUsedNavigate).toHaveBeenCalledWith("/login");
  });
  test("shows default error message when registration fails without a message", async () => {
    jest.spyOn(global, "fetch").mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ success: false, message: "" }), // 这里 message 为空
      })
    );
  
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );
  
    fireEvent.click(screen.getByRole("button", { name: "Register" }));
  
    // 确保默认错误信息 "Registration failed." 被显示
    expect(await screen.findByText("Registration failed", { exact: false })).toBeInTheDocument();
  });
  test("shows error message when registration fails with success: false", async () => {
    jest.spyOn(global, "fetch").mockImplementationOnce(() =>
      Promise.resolve({
        ok: true, // 这里的 response.ok 是 true
        json: () => Promise.resolve({ success: false, message: "Custom error message" }),
      })
    );
  
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );
  
    fireEvent.click(screen.getByRole("button", { name: "Register" }));
  
    // 确保 setErrorMsg("Custom error message") 被执行
    expect(await screen.findByText("Custom error message")).toBeInTheDocument();
  });
  
});
