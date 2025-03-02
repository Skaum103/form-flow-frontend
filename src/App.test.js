import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import App from "./App";

// 模拟各个子组件，避免实际渲染过多逻辑
jest.mock("./components/Header/Header", () => (props) => (
  <div data-testid="header">Header {props.user || ""}</div>
));
jest.mock("./components/Footer/Footer", () => () => (
  <div data-testid="footer">Footer</div>
));
jest.mock("./pages/Home", () => () => <div data-testid="home">Home Page</div>);
jest.mock("./pages/CreateApplication", () => () => (
  <div data-testid="create-application">Create Application Page</div>
));
jest.mock("./pages/Login", () => () => <div data-testid="login">Login Page</div>);
jest.mock("./pages/Register", () => () => <div data-testid="register">Register Page</div>);
jest.mock("./pages/ApplicationDetail", () => () => (
  <div data-testid="application-detail">Application Detail Page</div>
));

describe("App Component", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterAll(() => {
    jest.clearAllTimers();
  });

  test("sets user from localStorage and displays it in Header", () => {
    localStorage.setItem("username", "testuser");
    render(<App />);
    expect(screen.getByTestId("header")).toHaveTextContent("Header testuser");
  });

  test("renders Home Page at route /", () => {
    window.history.pushState({}, "Home Page", "/");
    render(<App />);
    expect(screen.getByTestId("home")).toBeInTheDocument();
    expect(screen.getByTestId("footer")).toBeInTheDocument();
  });

  test("renders Application Detail Page at route /survey/1", () => {
    window.history.pushState({}, "Application Detail", "/survey/1");
    render(<App />);
    expect(screen.getByTestId("application-detail")).toBeInTheDocument();
  });

  test("renders Create Application Page at route /CreateApplication", () => {
    window.history.pushState({}, "Create Application", "/CreateApplication");
    render(<App />);
    expect(screen.getByTestId("create-application")).toBeInTheDocument();
  });

  test("renders Login Page at route /login", () => {
    window.history.pushState({}, "Login", "/login");
    render(<App />);
    expect(screen.getByTestId("login")).toBeInTheDocument();
  });

  test("renders Register Page at route /register", () => {
    window.history.pushState({}, "Register", "/register");
    render(<App />);
    expect(screen.getByTestId("register")).toBeInTheDocument();
  });
});
