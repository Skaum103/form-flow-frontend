import React from "react";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import Home from "../Home";
import Survey from "../../components/Survey/Survey";

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
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(screen.getAllByTestId("mock-survey").length).toBeGreaterThan(0);
    });
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
        surveys: Array.from({ length: 9 }, (_, i) => ({ surveyId: i + 1, title: `Survey ${i + 1}` }))
      })
    });

    render(<Home />);
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    
    // 等待分页按钮完全渲染
    await waitFor(() => expect(screen.getAllByRole("button").length).toBeGreaterThan(1));

    // 模拟点击翻页按钮
    fireEvent.click(screen.getAllByRole("button")[1]);
    await waitFor(() => expect(screen.getAllByTestId("mock-survey").length).toBeGreaterThan(0));
  });
});
