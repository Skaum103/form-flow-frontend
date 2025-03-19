import React from "react";
import { render, screen, waitFor, fireEvent, cleanup, within } from "@testing-library/react";
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
    expect(screen.getByText("The refreshingly different survey builder")).toBeInTheDocument();
    expect(screen.getByAltText("Survey UI")).toBeInTheDocument();
  });

  test("fetches surveys successfully and renders survey list and pagination", async () => {
    localStorage.setItem("sessionToken", "valid-token");
    const surveysData = {
      surveys: [
        { surveyId: "1" },
        { surveyId: "2" },
        { surveyId: "3" }
      ]
    };
    global.fetch = jest.fn().mockResolvedValueOnce({
      json: async () => surveysData
    });

    render(
      <MemoryRouter>
        <TakeSurvey />
      </MemoryRouter>
    );

    await waitFor(() => {
      const surveyItems = screen.getAllByTestId("survey-take");
      expect(surveyItems).toHaveLength(3);
    });
    await waitFor(() => {
      const paginationButtons = within(screen.getByTestId("pagination")).getAllByRole("button");
      expect(paginationButtons.length).toBe(1);
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
    expect(screen.queryByTestId("survey-take")).toBeNull();
    const paginationButtons = within(screen.getByTestId("pagination")).getAllByRole("button");
    expect(paginationButtons.length).toBe(1);
    expect(paginationButtons[0]).toHaveClass("active");
    consoleErrorSpy.mockRestore();
  });

  test("handles pagination with multiple pages and page switching", async () => {
    localStorage.setItem("sessionToken", "valid-token");
    // 构造 10 个问卷数据，totalPages = Math.ceil(10/8) = 2
    const surveysData = {
      surveys: Array.from({ length: 10 }, (_, i) => ({ surveyId: String(i + 1) }))
    };
    global.fetch = jest.fn().mockResolvedValueOnce({
      json: async () => surveysData
    });

    render(
      <MemoryRouter>
        <TakeSurvey />
      </MemoryRouter>
    );

    await waitFor(() => {
      const buttons = within(screen.getByTestId("pagination")).getAllByRole("button");
      expect(buttons.length).toBe(2);
    });
    let surveyItems = screen.getAllByTestId("survey-take");
    expect(surveyItems).toHaveLength(8);
    const paginationButtons = within(screen.getByTestId("pagination")).getAllByRole("button");
    fireEvent.click(paginationButtons[1]);
    await waitFor(() => {
      const surveysAfterPagination = screen.getAllByTestId("survey-take");
      expect(surveysAfterPagination).toHaveLength(2);
    });
    expect(within(screen.getByTestId("pagination")).getAllByRole("button")[1]).toHaveClass("active");
  });

  test("auto adjusts currentPage when currentPage > totalPages", async () => {
    localStorage.setItem("sessionToken", "valid-token");
    const surveysData = {
      surveys: [
        { surveyId: "1" },
        { surveyId: "2" },
        { surveyId: "3" }
      ]
    };
    global.fetch = jest.fn().mockResolvedValueOnce({
      json: async () => surveysData
    });

    render(
      <MemoryRouter>
        <TakeSurvey initialCurrentPage={5} />
      </MemoryRouter>
    );

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    await waitFor(() => {
      const buttons = within(screen.getByTestId("pagination")).getAllByRole("button");
      expect(buttons.length).toBe(1);
    });
    await waitFor(() => {
      const buttons = within(screen.getByTestId("pagination")).getAllByRole("button");
      expect(buttons[0]).toHaveClass("active");
    });
  });

  test("displays pagination correctly when surveys array is empty", async () => {
    localStorage.setItem("sessionToken", "valid-token");
    const surveysData = { surveys: [] };
    global.fetch = jest.fn().mockResolvedValueOnce({
      json: async () => surveysData
    });

    render(
      <MemoryRouter>
        <TakeSurvey />
      </MemoryRouter>
    );

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    expect(screen.queryByTestId("survey-take")).toBeNull();
    const paginationButtons = within(screen.getByTestId("pagination")).getAllByRole("button");
    expect(paginationButtons.length).toBe(1);
    expect(paginationButtons[0]).toHaveClass("active");
  });
});
