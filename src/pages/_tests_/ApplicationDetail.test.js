const React = require('react');
const { render, screen, waitFor, fireEvent } = require('@testing-library/react');
const ApplicationDetail = require('../ApplicationDetail').default;
const { BrowserRouter } = require('react-router-dom');

// 模拟 react-router-dom 中的 useParams 和 useNavigate
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ surveyId: '123' }),
    useNavigate: jest.fn(),
  };
});

describe('ApplicationDetail Component', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.restoreAllMocks();
  });

  test('当 sessionToken 为空时，显示无题目提示', () => {
    localStorage.setItem('sessionToken', ''); // 空 token
    render(
      React.createElement(BrowserRouter, null,
        React.createElement(ApplicationDetail, null)
      )
    );
    expect(screen.getByText(/Survey Questions/i)).toBeInTheDocument();
    expect(screen.getByText(/There are no questions in this survey!/i)).toBeInTheDocument();
  });

  test('成功获取问卷详情时，正确渲染各类型题目并处理返回按钮', async () => {
    const questionsData = {
      questions: [
        {
          id: '1',
          question_order: 1,
          description: '单选题测试',
          type: 'single',
          body: '选项A,选项B,选项C',
        },
        {
          id: '2',
          question_order: 2,
          description: '多选题测试',
          type: 'multiple',
          body: '选项1,选项2,选项3',
        },
        {
          id: '3',
          question_order: 3,
          description: '文本题测试',
          type: 'text',
          body: '',
        },
      ],
    };

    // 模拟全局 fetch 函数，返回模拟数据
    const mockFetch = jest.fn().mockResolvedValueOnce({
      json: () => Promise.resolve(questionsData),
    });
    global.fetch = mockFetch;

    const reactRouterDom = require('react-router-dom');
    const mockNavigate = jest.fn();
    reactRouterDom.useNavigate.mockReturnValue(mockNavigate);

    localStorage.setItem('sessionToken', 'valid-token');

    render(
      React.createElement(BrowserRouter, null,
        React.createElement(ApplicationDetail, null)
      )
    );

    // 使用 findByText 等待 UI 更新完成
    await screen.findByText(/单选题测试/i);

    // 后续断言不再放在 waitFor 内
    expect(screen.getByText(/多选题测试/i)).toBeInTheDocument();
    expect(screen.getByText(/文本题测试/i)).toBeInTheDocument();

    // 单选题：应渲染 3 个 radio 按钮
    const radioButtons = screen.getAllByRole('radio');
    expect(radioButtons).toHaveLength(3);

    // 多选题：应渲染 3 个 checkbox
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(3);

    // 文本题：应渲染一个 textarea，并检查 placeholder
    const textarea = screen.getByPlaceholderText(/Enter your answer here/i);
    expect(textarea).toBeInTheDocument();

    // 测试返回按钮，点击时应调用 navigate('/') 函数
    const backButton = screen.getByText(/Return to Home/i);
    fireEvent.click(backButton);
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  test('请求失败时，捕获异常并显示无题目提示', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const mockFetch = jest.fn().mockRejectedValueOnce(new Error('Fetch failed'));
    global.fetch = mockFetch;

    localStorage.setItem('sessionToken', 'valid-token');

    render(
      React.createElement(BrowserRouter, null,
        React.createElement(ApplicationDetail, null)
      )
    );

    // 只等待 fetch 调用完成
    await waitFor(() => expect(mockFetch).toHaveBeenCalled());
    expect(consoleErrorSpy).toHaveBeenCalledWith("Error fetching survey details:", expect.any(Error));
    expect(screen.getByText(/There are no questions in this survey!/i)).toBeInTheDocument();

    consoleErrorSpy.mockRestore();
  });
});
