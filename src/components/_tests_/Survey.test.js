import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Survey from "../Survey/Survey";

// 🟡 mock useNavigate 返回 mock 函数
const mockedNavigate = jest.fn();
jest.mock("react-router-dom", () => {
  const originalModule = jest.requireActual("react-router-dom");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("Survey Component", () => {
  const surveyData = {
    surveyId: 1,
    surveyName: "Test Survey",
    description: "A test survey description",
  };

  beforeEach(() => {
    mockedNavigate.mockClear(); // 清理调用记录
  });

  test("renders Survey component correctly", () => {
    render(
      <MemoryRouter>
        <Survey survey={surveyData} />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: /Test Survey/i })).toBeInTheDocument();
    expect(screen.getByText(/A test survey description/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Details/i })).toBeInTheDocument();
  });

  test("navigates to survey details when Details button is clicked", () => {
    render(
      <MemoryRouter>
        <Survey survey={surveyData} />
      </MemoryRouter>
    );

    const button = screen.getByRole("button", { name: /Details/i });
    fireEvent.click(button);

    expect(mockedNavigate).toHaveBeenCalledWith("/survey/1");
  });

  test("navigates to statistic page when Statistic button is clicked", () => {
    render(
      <MemoryRouter>
        <Survey survey={surveyData} />
      </MemoryRouter>
    );

    const button = screen.getByRole("button", { name: /Statistic/i });
    fireEvent.click(button);

    expect(mockedNavigate).toHaveBeenCalledWith("/Statistic/1");
  });
});
