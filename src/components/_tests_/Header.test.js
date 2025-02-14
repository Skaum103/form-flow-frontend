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
    render(
      <MemoryRouter>
        <Header user="TestUser" setUser={setUserMock} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText("Log out"));
    expect(setUserMock).toHaveBeenCalledWith(null);
  });
});
