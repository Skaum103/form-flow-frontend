import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Login from "../Login";

// mock navigate 方法
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

// mock fetch API
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ success: true, token: "fake-jwt-token" }),
  })
);

describe("Login Component", () => {
  beforeEach(() => {
    fetch.mockClear();
    mockNavigate.mockClear();
  });

  test("renders login form with username and password fields", () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(screen.getByRole("button", { name: /Log in/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Please enter your username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Please enter your password/i)).toBeInTheDocument();
  });

  // test("displays error message when login fails", async () => {
  //   fetch.mockImplementationOnce(() =>
  //     Promise.resolve({
  //       ok: false,
  //       json: () => Promise.resolve({ success: false, message: "Invalid credentials" }),
  //     })
  //   );
  //
  //   render(
  //     <MemoryRouter>
  //       <Login />
  //     </MemoryRouter>
  //   );
  //
  //   fireEvent.change(screen.getByPlaceholderText(/Please enter your username/i), {
  //     target: { value: "wrongUser" },
  //   });
  //   fireEvent.change(screen.getByPlaceholderText(/Please enter your password/i), {
  //     target: { value: "wrongPass" },
  //   });
  //
  //   fireEvent.click(screen.getByRole("button", { name: /Log in/i }));
  //
  //   await waitFor(() => {
  //     expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument();
  //   });
  // });

  // test("successful login redirects to home page", async () => {
  //   render(
  //     <MemoryRouter>
  //       <Login />
  //     </MemoryRouter>
  //   );
  //
  //   fireEvent.change(screen.getByPlaceholderText(/Please enter your username/i), {
  //     target: { value: "correctUser" },
  //   });
  //   fireEvent.change(screen.getByPlaceholderText(/Please enter your password/i), {
  //     target: { value: "correctPass" },
  //   });
  //
  //   fireEvent.click(screen.getByRole("button", { name: /Log in/i }));
  //
  //   await waitFor(() => {
  //     expect(mockNavigate).toHaveBeenCalledWith("/");
  //   });
  // });

  test("clicking 'Register Now' button navigates to register page", () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /Register Now/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/register");
  });
});
