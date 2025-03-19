import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import SurveyTake from "../Survey/SurveyTake";
import { MemoryRouter } from "react-router-dom";

// 模拟 useNavigate
const mockedUsedNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedUsedNavigate,
}));

describe("SurveyTake Component", () => {
  const survey = {
    surveyId: "123",
    surveyName: "Test Survey",
    description: "Test Description",
  };

  beforeEach(() => {
    mockedUsedNavigate.mockClear();
  });

  test("renders survey details correctly", () => {
    render(
      <MemoryRouter>
        <SurveyTake survey={survey} />
      </MemoryRouter>
    );

    // 检查问卷名称、描述和按钮是否正确渲染
    expect(screen.getByText("Test Survey")).toBeInTheDocument();
    expect(screen.getByText("Test Description")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Fill out Now/i })).toBeInTheDocument();
  });

  test("navigates to Fillout page when button is clicked", () => {
    render(
      <MemoryRouter>
        <SurveyTake survey={survey} />
      </MemoryRouter>
    );

    const button = screen.getByRole("button", { name: /Fill out Now/i });
    fireEvent.click(button);
    // 点击按钮后应调用 navigate，跳转到 /Fillout/{surveyId}
    expect(mockedUsedNavigate).toHaveBeenCalledWith(`/Fillout/${survey.surveyId}`);
  });
});
