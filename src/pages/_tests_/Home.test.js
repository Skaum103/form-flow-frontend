import React from "react";
import { render, screen, fireEvent, waitFor, cleanup, within } from "@testing-library/react";
import Home from "../Home";

process.noDeprecation = true; // 关闭 punycode 弃用警告

// 模拟 Survey 组件，避免实际渲染内部逻辑
jest.mock("../../components/Survey/Survey", () => () => <div data-testid="mock-survey">Survey</div>);

// 全局模拟 fetch
global.fetch = jest.fn();

describe("Home Component", () => {
  beforeEach(() => {
    fetch.mockClear();
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
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
        surveys: [
          { surveyId: 1, title: "Survey 1" },
          { surveyId: 2, title: "Survey 2" }
        ]
      })
    });

    render(<Home />);
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
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
        surveys: Array.from({ length: 150 }, (_, i) => ({
          surveyId: i + 1,
          title: `Survey ${i + 1}`
        }))
      })
    });

    render(<Home />);
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    await waitFor(() => {
      expect(screen.getByTestId("pagination")).toBeInTheDocument();
    });
    const pagination = screen.getByTestId("pagination");
    const paginationButtons = within(pagination).getAllByRole("button");
    expect(paginationButtons.length).toBeGreaterThan(1);
    fireEvent.click(paginationButtons[1]);
    const surveysAfterPagination = await screen.findAllByTestId("mock-survey");
    expect(surveysAfterPagination.length).toBeGreaterThan(0);
  });

  // 新增测试用例：利用 initialCurrentPage=2 且模拟 fetch 返回永远不 resolve，
  // 使得 surveys 始终保持初始 []（totalPages=1），从而触发第二个 useEffect 分支调整 currentPage 到 1
  test("adjusts currentPage when currentPage is greater than totalPages", async () => {
    localStorage.setItem("sessionToken", "mockToken");
    // 模拟 fetch 返回永远不 resolve
    fetch.mockImplementationOnce(() => new Promise(() => {}));
    render(<Home initialCurrentPage={2} />);
    // 等待 effect 执行后，分页区域应只显示 1 个按钮，并且处于 active 状态
    await waitFor(
      () => {
        const pagination = screen.getByTestId("pagination");
        const buttons = within(pagination).getAllByRole("button");
        return buttons.length === 1 && buttons[0].classList.contains("active");
      },
      { timeout: 500 }
    );
  });
});
