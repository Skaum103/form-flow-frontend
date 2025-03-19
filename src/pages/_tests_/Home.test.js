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
    expect(screen.getByText("The refreshingly different survey builder")).toBeInTheDocument();
    expect(screen.getByAltText("Survey UI")).toBeInTheDocument();
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

    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    render(<Home />);
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    expect(screen.queryAllByTestId("mock-survey")).toHaveLength(0);
    expect(consoleErrorSpy).toHaveBeenCalledWith("Error fetching surveys:", expect.any(Error));

    await waitFor(() => {
      const paginationButtons = within(screen.getByTestId("pagination")).getAllByRole("button");
      expect(paginationButtons.length).toBe(1);
    });
    await waitFor(() => {
      const paginationButtons = within(screen.getByTestId("pagination")).getAllByRole("button");
      expect(paginationButtons[0]).toHaveClass("active");
    });
    consoleErrorSpy.mockRestore();
  });

  test("renders pagination and handles page change", async () => {
    localStorage.setItem("sessionToken", "mockToken");
    // 150 个问卷数据，totalPages = Math.ceil(150/8) = 19
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
    await waitFor(() => {
      const paginationButtons = within(pagination).getAllByRole("button");
      expect(paginationButtons.length).toBe(19);
    });
    // 初始页应显示 8 问卷
    let surveyItems = screen.getAllByTestId("mock-survey");
    expect(surveyItems).toHaveLength(8);
    const paginationButtons = within(pagination).getAllByRole("button");
    // 点击第 2 页按钮
    fireEvent.click(paginationButtons[1]);
    await waitFor(() => {
      const surveysAfterPagination = screen.getAllByTestId("mock-survey");
      expect(surveysAfterPagination).toHaveLength(8);
    });
    expect(within(pagination).getAllByRole("button")[1]).toHaveClass("active");
  });

  test("adjusts currentPage when currentPage is greater than totalPages", async () => {
    localStorage.setItem("sessionToken", "mockToken");
    // 模拟返回空的 surveys 数组
    fetch.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue({
        surveys: []
      })
    });
    render(<Home initialCurrentPage={2} />);
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    await waitFor(() => {
      const buttons = within(screen.getByTestId("pagination")).getAllByRole("button");
      expect(buttons.length).toBe(1);
    });
    await waitFor(() => {
      const buttons = within(screen.getByTestId("pagination")).getAllByRole("button");
      expect(buttons[0]).toHaveClass("active");
    });
  });

  test("renders empty surveys correctly when surveys array is empty", async () => {
    localStorage.setItem("sessionToken", "mockToken");
    fetch.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue({
        surveys: []
      })
    });
    render(<Home />);
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    expect(screen.queryAllByTestId("mock-survey")).toHaveLength(0);
    const pagination = screen.getByTestId("pagination");
    const buttons = within(pagination).getAllByRole("button");
    expect(buttons.length).toBe(1);
    expect(buttons[0]).toHaveClass("active");
  });
});
