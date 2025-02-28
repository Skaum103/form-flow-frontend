import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Header from "../Header/Header";

// 模拟 react-router-dom 的 useNavigate
const mockedUsedNavigate = jest.fn();
jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockedUsedNavigate,
  };
});

describe("Header Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // 清空 localStorage 的模拟方法
    Object.defineProperty(window, "localStorage", {
      value: {
        removeItem: jest.fn(),
      },
      writable: true,
    });
  });

  test("renders logo and navigation links for logged out state", () => {
    render(
      <MemoryRouter>
        <Header user={null} setUser={() => {}} />
      </MemoryRouter>
    );
    expect(screen.getByAltText("Logo")).toBeInTheDocument();
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Create Application")).toBeInTheDocument();
    expect(screen.getByText("Log In")).toBeInTheDocument();
  });

  test("displays username and logout option when logged in", () => {
    render(
      <MemoryRouter>
        <Header user="TestUser" setUser={() => {}} />
      </MemoryRouter>
    );
    expect(screen.getByText("TestUser")).toBeInTheDocument();
    expect(screen.getByText("Log out")).toBeInTheDocument();
  });

  test("calls logout function on Log out button click", () => {
    const setUserMock = jest.fn();
    render(
      <MemoryRouter>
        <Header user="TestUser" setUser={setUserMock} />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByText("Log out"));
    expect(localStorage.removeItem).toHaveBeenCalledWith("username");
    expect(localStorage.removeItem).toHaveBeenCalledWith("JSESSIONID");
    expect(setUserMock).toHaveBeenCalledWith(null);
    expect(mockedUsedNavigate).toHaveBeenCalledWith("/");
  });

  test("navigates to login page when Log In button is clicked", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Header user={null} setUser={() => {}} />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByText("Log In"));
    // 因为 Log In 使用 Link 包裹，所以页面依然显示 Log In 按钮
    expect(screen.getByText("Log In")).toBeInTheDocument();
  });

  test("NavLink active class is applied based on current route", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Header user={null} setUser={() => {}} />
      </MemoryRouter>
    );
    // 当前路由为 "/"，所以 "Home" 链接处于激活状态
    const homeLink = screen.getByText("Home");
    expect(homeLink).toHaveClass("nav-link active");
    // "Create Application" 链接因路由不匹配，处于非激活状态
    const createAppLink = screen.getByText("Create Application");
    expect(createAppLink).toHaveClass("nav-link");
  });

  test("NavLink active class when current route is /CreateApplication", () => {
    render(
      <MemoryRouter initialEntries={["/CreateApplication"]}>
        <Header user={null} setUser={() => {}} />
      </MemoryRouter>
    );
    const homeLink = screen.getByText("Home");
    const createAppLink = screen.getByText("Create Application");
    expect(createAppLink).toHaveClass("nav-link active");
    expect(homeLink).toHaveClass("nav-link");
  });

  test("login link has correct href", () => {
    render(
      <MemoryRouter>
        <Header user={null} setUser={() => {}} />
      </MemoryRouter>
    );
    const loginLink = screen.getByRole("link", { name: "Log In" });
    expect(loginLink.getAttribute("href")).toBe("/login");
  });
});
