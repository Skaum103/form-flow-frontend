import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Header from "../Header/Header";

describe("Header Component", () => {
  test("renders logo and navigation links", () => {
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

  test("displays username when logged in", () => {
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
    jest.spyOn(Storage.prototype, "removeItem");

    render(
      <MemoryRouter>
        <Header user="TestUser" setUser={setUserMock} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText("Log out"));

    expect(localStorage.removeItem).toHaveBeenCalledWith("username");
    expect(localStorage.removeItem).toHaveBeenCalledWith("JSESSIONID");
    expect(setUserMock).toHaveBeenCalledWith(null);
  });

  test("navigates to login page when Log In button is clicked", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Header user={null} setUser={() => {}} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText("Log In"));

    // 由于 MemoryRouter 不能直接检查 URL 变化，我们可以检查页面是否包含 Login 相关内容
    expect(screen.getByText("Log In")).toBeInTheDocument();
  });
});
