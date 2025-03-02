import React from "react";
import { render, screen, fireEvent, waitFor, cleanup, within } from "@testing-library/react";
import Home from "../Home";

process.noDeprecation = true; // 关闭 punycode 弃用警告

// 修正 Mock 方式，确保 `Survey` 组件正确渲染
jest.mock("../../components/Survey/Survey", () => () => <div data-testid="mock-survey">Survey</div>);

global.fetch = jest.fn();

describe("Home Component", () => {
  beforeEach(() => {
    fetch.mockClear();
    localStorage.clear();
  });

  afterEach(() => {
    cleanup(); // 确保每次测试后清理 DOM
  });

  test("renders login view when sessionToken is missing", () => {
    render(<Home />);
    expect(
      screen.getByText("The refreshingly different survey builder")
    ).toBeInTheDocument();
  });

  test("fetches surveys and renders them when sessionToken exists", async () => {
    localStorage.setItem("sessionToken", "mockToken");
    fetch.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue({
        surveys: [{ surveyId: 1, title: "Survey 1" }, { surveyId: 2, title: "Survey 2" }]
      })
    });

    render(<Home />);
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    // 使用 findAllByTestId 等待元素出现
    const surveyElements = await screen.findAllByTestId("mock-survey");
    expect(surveyElements.length).toBeGreaterThan(0);
  });

  test("handles API fetch failure gracefully", async () => {
    localStorage.setItem("sessionToken", "mockToken");
    fetch.mockRejectedValueOnce(new Error("Fetch failed"));

    jest.spyOn(console, "error").mockImplementation(() => {});

    render(<Home />);
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    expect(screen.queryAllByTestId("mock-survey").length).toBe(0);
    expect(console.error).toHaveBeenCalledWith("Error fetching surveys:", expect.any(Error));

    console.error.mockRestore();
  });

  test("renders pagination and handles page change", async () => {
    localStorage.setItem("sessionToken", "mockToken");
    fetch.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue({
        // 返回 150 个问卷数据，确保分页控件足够多
        surveys: Array.from({ length: 150 }, (_, i) => ({ surveyId: i + 1, title: `Survey ${i + 1}` }))
      })
    });
  
    render(<Home />);
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
  
    // 等待分页区域渲染完成
    await waitFor(() => {
      expect(screen.getByTestId("pagination")).toBeInTheDocument();
    });
  
    // 查询所有分页按钮
    const pagination = screen.getByTestId("pagination");
    const paginationButtons = within(pagination).getAllByRole("button");
    expect(paginationButtons.length).toBeGreaterThan(1);
  
    // 模拟点击第二个分页按钮
    fireEvent.click(paginationButtons[1]);
  
    // 确认点击分页按钮后当前页问卷正常渲染
    const surveysAfterPagination = await screen.findAllByTestId("mock-survey");
    expect(surveysAfterPagination.length).toBeGreaterThan(0);
  });
});
