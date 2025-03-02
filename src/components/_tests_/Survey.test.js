import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Survey from "../Survey/Survey";

// Mock react-router-dom 的 useNavigate，使其返回一个模拟函数
jest.mock("react-router-dom", () => {
  const originalModule = jest.requireActual("react-router-dom");
  return {
    ...originalModule,
    useNavigate: jest.fn(),
  };
});

describe("Survey Component", () => {
  const mockedNavigate = jest.fn();

  beforeEach(() => {
    // 每个测试前重置 useNavigate 的返回值
    require("react-router-dom").useNavigate.mockReturnValue(mockedNavigate);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders Survey component correctly", () => {
    const surveyData = {
      surveyId: 1,
      surveyName: "Test Survey",
      description: "A test survey description",
    };

    render(
      <MemoryRouter>
        <Survey survey={surveyData} />
      </MemoryRouter>
    );

    // 检查标题、描述及按钮是否正确渲染
    expect(screen.getByRole("heading", { name: /Test Survey/i })).toBeInTheDocument();
    expect(screen.getByText(/A test survey description/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Details/i })).toBeInTheDocument();
  });

  test("navigates to survey details when Details button is clicked", () => {
    const surveyData = {
      surveyId: 1,
      surveyName: "Test Survey",
      description: "A test survey description",
    };

    render(
      <MemoryRouter>
        <Survey survey={surveyData} />
      </MemoryRouter>
    );

    // 点击 Details 按钮
    const button = screen.getByRole("button", { name: /Details/i });
    fireEvent.click(button);

    // 验证 useNavigate 被调用，并传入正确的 URL 参数
    expect(mockedNavigate).toHaveBeenCalledWith("/survey/1");
  });
});
