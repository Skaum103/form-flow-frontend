import React from "react";
import { render, screen, waitFor, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import TakeSurvey from "../TakeSurvey";

// 模拟 SurveyTake 组件，方便测试内部传入的 survey 数据
jest.mock("../../components/Survey/SurveyTake", () => {
  return function DummySurveyTake(props) {
    return <div data-testid="survey-take">{props.survey.surveyId}</div>;
  };
});

describe("TakeSurvey Component", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  afterEach(cleanup);

  test("renders not logged in view when no session token", () => {
    localStorage.setItem("sessionToken", ""); // 模拟未登录
    render(
      <MemoryRouter>
        <TakeSurvey />
      </MemoryRouter>
    );
    // 检查欢迎页面内容
    expect(screen.getByText("The refreshingly different survey builder")).toBeInTheDocument();
    expect(screen.getByAltText("Survey UI")).toBeInTheDocument();
  });

  test("fetches surveys successfully and renders survey list and pagination", async () => {
    localStorage.setItem("sessionToken", "valid-token");
    const surveysData = {
      surveys: [
        { surveyId: "1" },
        { surveyId: "2" },
        { surveyId: "3" },
      ],
    };
    global.fetch = jest.fn().mockResolvedValueOnce({
      json: async () => surveysData,
    });

    render(
      <MemoryRouter>
        <TakeSurvey />
      </MemoryRouter>
    );

    // 等待 survey-take 元素出现（确保状态更新后渲染出3个组件）
    await waitFor(() => {
      expect(screen.getAllByTestId("survey-take")).toHaveLength(3);
    });

    // 检查分页：数据量为 3 (< surveysPerPage=8) 时，分页应只有1个按钮
    await waitFor(() => {
      const paginationButtons = screen.getByTestId("pagination").querySelectorAll("button");
      expect(paginationButtons).toHaveLength(1);
      expect(paginationButtons[0]).toHaveClass("active");
    });
  });

  test("handles fetch failure gracefully", async () => {
    localStorage.setItem("sessionToken", "valid-token");
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    global.fetch = jest.fn().mockRejectedValueOnce(new Error("Fetch error"));

    render(
      <MemoryRouter>
        <TakeSurvey />
      </MemoryRouter>
    );

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    // 检查错误日志输出
    expect(consoleErrorSpy).toHaveBeenCalledWith("Error fetching surveys:", expect.any(Error));
    // 数据获取失败时 surveys 保持为空，不渲染 SurveyTake 组件，但分页依然显示1页
    expect(screen.queryByTestId("survey-take")).toBeNull();
    const paginationButtons = screen.getByTestId("pagination").querySelectorAll("button");
    expect(paginationButtons).toHaveLength(1);
    expect(paginationButtons[0]).toHaveClass("active");
    consoleErrorSpy.mockRestore();
  });

  test("handles pagination with multiple pages and page switching", async () => {
    localStorage.setItem("sessionToken", "valid-token");
    // 构造 10 个问卷数据，totalPages = ceil(10 / 8) = 2
    const surveysData = {
      surveys: Array.from({ length: 10 }, (_, i) => ({ surveyId: String(i + 1) })),
    };
    global.fetch = jest.fn().mockResolvedValueOnce({
      json: async () => surveysData,
    });

    render(
      <MemoryRouter>
        <TakeSurvey />
      </MemoryRouter>
    );

    // 等待分页按钮出现
    await waitFor(() => {
      const buttons = screen.getByTestId("pagination").querySelectorAll("button");
      expect(buttons.length).toBe(2);
    });

    // 初始页（currentPage=1）应渲染前 8 个问卷
    let surveyItems = screen.getAllByTestId("survey-take");
    expect(surveyItems).toHaveLength(8);

    // 点击第2页按钮
    const paginationButtons = screen.getByTestId("pagination").querySelectorAll("button");
    fireEvent.click(paginationButtons[1]);

    // 等待更新后，页面应渲染剩下 2 个问卷
    await waitFor(() => {
      surveyItems = screen.getAllByTestId("survey-take");
      expect(surveyItems).toHaveLength(2);
    });
    // 检查第二个按钮带 active 样式
    expect(paginationButtons[1]).toHaveClass("active");
  });

  test("auto adjusts currentPage when currentPage > totalPages", async () => {
    localStorage.setItem("sessionToken", "valid-token");
    // 传入初始 currentPage 为 5，但数据只有 3 个，totalPages 应为 1
    const surveysData = {
      surveys: [
        { surveyId: "1" },
        { surveyId: "2" },
        { surveyId: "3" },
      ],
    };
    global.fetch = jest.fn().mockResolvedValueOnce({
      json: async () => surveysData,
    });

    render(
      <MemoryRouter>
        <TakeSurvey initialCurrentPage={5} />
      </MemoryRouter>
    );

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    // 等待分页按钮更新
    await waitFor(() => {
      const paginationButtons = screen.getByTestId("pagination").querySelectorAll("button");
      expect(paginationButtons).toHaveLength(1);
      expect(paginationButtons[0]).toHaveClass("active");
    });
  });

  test("displays pagination correctly when surveys array is empty", async () => {
    localStorage.setItem("sessionToken", "valid-token");
    const surveysData = { surveys: [] };
    global.fetch = jest.fn().mockResolvedValueOnce({
      json: async () => surveysData,
    });

    render(
      <MemoryRouter>
        <TakeSurvey />
      </MemoryRouter>
    );

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    // 无问卷数据时，不应渲染 SurveyTake 组件
    expect(screen.queryByTestId("survey-take")).toBeNull();
    // 分页仍应显示1页
    const paginationButtons = screen.getByTestId("pagination").querySelectorAll("button");
    expect(paginationButtons).toHaveLength(1);
    expect(paginationButtons[0]).toHaveClass("active");
  });
});
