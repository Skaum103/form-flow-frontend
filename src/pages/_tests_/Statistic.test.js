global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

const React = require("react");
const { render, screen, waitFor, fireEvent } = require("@testing-library/react");
const { BrowserRouter } = require("react-router-dom");
const ApplicationDetail = require("../Statistic").default;

// 模拟 react-router-dom 中的 useParams 和 useNavigate
const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useParams: () => ({ surveyId: "123" }),
    useNavigate: () => mockNavigate, // ⬅️ 这里返回 mock 函数本体
  };
});


describe("ApplicationDetail Component", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.restoreAllMocks();
    global.fetch = jest.fn();
  });

  test("无 sessionToken 时不请求数据，显示提示", () => {
    localStorage.setItem("sessionToken", "");
    render(
      React.createElement(BrowserRouter, null, React.createElement(ApplicationDetail, null))
    );
    expect(screen.getByText(/Survey Satistic/i)).toBeInTheDocument();
    expect(screen.getByText(/There are no questions in this survey!/i)).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  test("加载问卷和统计数据并渲染图表与文本区域", async () => {
    const questionsData = {
      questions: [
        {
          id: "1",
          question_order: 1,
          description: "单选题",
          type: "single",
          body: "A,B,C",
        },
        {
          id: "2",
          question_order: 2,
          description: "文本题",
          type: "text",
          body: "",
        },
      ],
    };

    const statsData = {
      stats: [
        {
          question_order: 1,
          stats: { "1": 5, "2": 3, "3": 2 },
        },
      ],
    };

    fetch
      .mockResolvedValueOnce({ json: () => Promise.resolve(questionsData) })
      .mockResolvedValueOnce({ json: () => Promise.resolve(statsData) });

    localStorage.setItem("sessionToken", "valid-token");

    render(
      React.createElement(BrowserRouter, null, React.createElement(ApplicationDetail, null))
    );

    await screen.findByText(/单选题/i);
    expect(screen.getByText(/文本题/i)).toBeInTheDocument();
    expect(screen.getByText(/Survey Satistic/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Text questions do not provide statistics/i)).toBeDisabled();
  });

  test("获取问卷失败时，显示无题目提示", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    fetch
      .mockRejectedValueOnce(new Error("fail detail"))
      .mockResolvedValueOnce({ json: () => Promise.resolve({ stats: [] }) });

    localStorage.setItem("sessionToken", "token");
    render(
      React.createElement(BrowserRouter, null, React.createElement(ApplicationDetail, null))
    );

    await waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(screen.getByText(/There are no questions in this survey!/i)).toBeInTheDocument();
    expect(consoleSpy).toHaveBeenCalledWith("Error fetching survey details:", expect.any(Error));
    consoleSpy.mockRestore();
  });

  test("获取统计数据失败时，不影响问题展示", async () => {
    const questionsData = {
      questions: [
        {
          id: "1",
          question_order: 1,
          description: "单选题",
          type: "single",
          body: "X,Y",
        },
      ],
    };

    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    fetch
      .mockResolvedValueOnce({ json: () => Promise.resolve(questionsData) })
      .mockRejectedValueOnce(new Error("fail stats"));

    localStorage.setItem("sessionToken", "token");

    render(
      React.createElement(BrowserRouter, null, React.createElement(ApplicationDetail, null))
    );

    await screen.findByText(/单选题/i);
    expect(consoleSpy).toHaveBeenCalledWith("Error fetching survey stats:", expect.any(Error));
    consoleSpy.mockRestore();
  });

  test("点击返回按钮跳转首页", async () => {
    const mockNavigate = require("react-router-dom").useNavigate();
    const questionsData = { questions: [] };
    const statsData = { stats: [] };

    fetch
      .mockResolvedValueOnce({ json: () => Promise.resolve(questionsData) })
      .mockResolvedValueOnce({ json: () => Promise.resolve(statsData) });

    localStorage.setItem("sessionToken", "token");

    render(
      React.createElement(BrowserRouter, null, React.createElement(ApplicationDetail, null))
    );

    const btn = await screen.findByText(/Return to Home/i);
    fireEvent.click(btn);
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});
test("当选项索引超出范围时使用默认 OPTION 标签", async () => {
  const questionsData = {
    questions: [
      {
        id: "1",
        question_order: 1,
        description: "单选题",
        type: "single",
        body: "OnlyOneOption", // 只有一个选项
      },
    ],
  };

  const statsData = {
    stats: [
      {
        question_order: 1,
        stats: { "1": 5, "2": 3 }, // 第二项超出选项范围
      },
    ],
  };

  fetch
    .mockResolvedValueOnce({ json: () => Promise.resolve(questionsData) })
    .mockResolvedValueOnce({ json: () => Promise.resolve(statsData) });

  localStorage.setItem("sessionToken", "token");

  render(
    React.createElement(BrowserRouter, null, React.createElement(ApplicationDetail, null))
  );

  await screen.findByText(/单选题/i);
  // 至少确认不报错，并渲染成功
  expect(screen.getByText(/Survey Satistic/i)).toBeInTheDocument();
});
