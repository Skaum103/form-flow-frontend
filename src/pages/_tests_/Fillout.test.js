const React = require('react');
const { render, screen, waitFor, fireEvent } = require('@testing-library/react');
const Fillout = require('../Fillout').default;
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

describe('Fillout Component', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.restoreAllMocks();
  });

  test('当 sessionToken 为空时，显示无题目提示', () => {
    localStorage.setItem('sessionToken', '');
    render(
      React.createElement(BrowserRouter, null,
        React.createElement(Fillout, null)
      )
    );
    expect(screen.getByText(/Survey Questions/i)).toBeInTheDocument();
    expect(screen.getByText(/There are no questions in this survey!/i)).toBeInTheDocument();
  });

  test('成功获取问卷详情并正确提交答案', async () => {
    const questionsData = {
      questions: [
        {
          id: '1',
          question_order: 1,
          description: '单选题测试',
          type: 'single',
          body: '选项A,选项B,选项C'
        },
        {
          id: '2',
          question_order: 2,
          description: '多选题测试',
          type: 'multiple',
          body: '选项1,选项2,选项3'
        },
        {
          id: '3',
          question_order: 3,
          description: '文本题测试',
          type: 'text',
          body: ''
        }
      ]
    };

    // 第一次 fetch 用于获取问卷题目，第二次用于提交答案
    const mockFetch = jest.fn()
      .mockResolvedValueOnce({
        json: () => Promise.resolve(questionsData),
      })
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true }),
      });
    global.fetch = mockFetch;

    const reactRouterDom = require('react-router-dom');
    const mockNavigate = jest.fn();
    reactRouterDom.useNavigate.mockReturnValue(mockNavigate);

    localStorage.setItem('sessionToken', 'valid-token');

    render(
      React.createElement(BrowserRouter, null,
        React.createElement(Fillout, null)
      )
    );

    // 等待题目加载完成
    await screen.findByText(/单选题测试/i);
    expect(screen.getByText(/多选题测试/i)).toBeInTheDocument();
    expect(screen.getByText(/文本题测试/i)).toBeInTheDocument();

    // 单选题：选择第二个选项（value 为 "2"）
    const radioButtons = screen.getAllByRole('radio');
    expect(radioButtons).toHaveLength(3);
    fireEvent.click(radioButtons[1]);

    // 多选题：勾选第一个和第三个选项（value 分别为 "1" 和 "3"）
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(3);
    fireEvent.click(checkboxes[0]);
    fireEvent.click(checkboxes[2]);

    // 文本题：输入答案
    const textarea = screen.getByPlaceholderText(/Enter your answer here/i);
    expect(textarea).toBeInTheDocument();
    fireEvent.change(textarea, { target: { value: 'test answer' } });

    // 点击提交按钮
    const submitButton = screen.getByText(/Submit Now !/i);
    fireEvent.click(submitButton);

    // 等待提交 fetch 调用完成
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    // 检查提交请求参数
    const submissionCall = mockFetch.mock.calls[1];
    expect(submissionCall[0]).toContain('/take/take_survey');
    const requestOptions = submissionCall[1];
    expect(requestOptions.method).toBe('POST');
    const requestBody = JSON.parse(requestOptions.body);
    // 单选题答案："2"，多选题答案："1,3"，文本题答案："test answer"
    expect(requestBody).toMatchObject({
      sessionToken: 'valid-token',
      surveyId: '123',
      answers: '2;1,3;test answer'
    });

    // 成功提交后应调用 navigate('/') 跳转回首页
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  test('多选题取消选择后正确提交答案', async () => {
    const questionsData = {
      questions: [
        {
          id: '1',
          question_order: 1,
          description: '单选题测试',
          type: 'single',
          body: '选项A,选项B,选项C'
        },
        {
          id: '2',
          question_order: 2,
          description: '多选题测试',
          type: 'multiple',
          body: '选项1,选项2,选项3'
        },
        {
          id: '3',
          question_order: 3,
          description: '文本题测试',
          type: 'text',
          body: ''
        }
      ]
    };

    const mockFetch = jest.fn()
      .mockResolvedValueOnce({
        json: () => Promise.resolve(questionsData),
      })
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true }),
      });
    global.fetch = mockFetch;

    const reactRouterDom = require('react-router-dom');
    const mockNavigate = jest.fn();
    reactRouterDom.useNavigate.mockReturnValue(mockNavigate);

    localStorage.setItem('sessionToken', 'valid-token');

    render(
      React.createElement(BrowserRouter, null,
        React.createElement(Fillout, null)
      )
    );

    await screen.findByText(/单选题测试/i);

    // 单选题：选择第一个选项（value "1"）
    const radioButtons = screen.getAllByRole('radio');
    fireEvent.click(radioButtons[0]);

    // 多选题：先勾选所有选项，再取消第一个选项
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]); // 勾选 value "1"
    fireEvent.click(checkboxes[1]); // 勾选 value "2"
    fireEvent.click(checkboxes[2]); // 勾选 value "3"
    // 取消勾选第一个选项（value "1"）
    fireEvent.click(checkboxes[0]);

    // 文本题：输入答案
    const textarea = screen.getByPlaceholderText(/Enter your answer here/i);
    fireEvent.change(textarea, { target: { value: 'another answer' } });

    // 点击提交按钮
    const submitButton = screen.getByText(/Submit Now !/i);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    const submissionCall = mockFetch.mock.calls[1];
    const requestBody = JSON.parse(submissionCall[1].body);
    // 单选题答案："1"，多选题最终答案："2,3"（排序后），文本题答案："another answer"
    expect(requestBody.answers).toBe('1;2,3;another answer');
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  test('提交答案失败时，捕获错误并输出错误日志', async () => {
    const questionsData = {
      questions: [
        {
          id: '1',
          question_order: 1,
          description: '单选题测试',
          type: 'single',
          body: '选项A,选项B,选项C'
        }
      ]
    };

    // 模拟问卷详情获取成功，但提交答案时失败
    const mockFetch = jest.fn()
      .mockResolvedValueOnce({
        json: () => Promise.resolve(questionsData),
      })
      .mockRejectedValueOnce(new Error('Submit error'));
    global.fetch = mockFetch;

    const reactRouterDom = require('react-router-dom');
    const mockNavigate = jest.fn();
    reactRouterDom.useNavigate.mockReturnValue(mockNavigate);

    localStorage.setItem('sessionToken', 'valid-token');

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      React.createElement(BrowserRouter, null,
        React.createElement(Fillout, null)
      )
    );

    await screen.findByText(/单选题测试/i);

    // 选择单选题选项
    const radioButtons = screen.getAllByRole('radio');
    fireEvent.click(radioButtons[0]);

    // 点击提交按钮触发 handleSubmit，第二次 fetch 将失败
    const submitButton = screen.getByText(/Submit Now !/i);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith("Submit failed:", expect.any(Error));
    // 提交失败时不应调用页面跳转
    expect(mockNavigate).not.toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });
  test('请求问卷详情失败时，捕获错误并显示无题目提示', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    // 模拟获取问卷详情时 fetch 失败
    const mockFetch = jest.fn().mockRejectedValueOnce(new Error('Fetch failed'));
    global.fetch = mockFetch;
  
    localStorage.setItem('sessionToken', 'valid-token');
  
    render(
      React.createElement(BrowserRouter, null,
        React.createElement(Fillout, null)
      )
    );
  
    // 等待 useEffect 中的 fetch 调用完成
    await waitFor(() => expect(mockFetch).toHaveBeenCalled());
    expect(consoleErrorSpy).toHaveBeenCalledWith("Error fetching survey details:", expect.any(Error));
    // 因为题目获取失败，questions 为空，组件应显示无题目提示
    expect(screen.getByText(/There are no questions in this survey!/i)).toBeInTheDocument();
  
    consoleErrorSpy.mockRestore();
  });
  test('有效 token 时，后端返回空数据，显示无题目提示（覆盖 useEffect then 分支）', async () => {
    // 模拟返回结果没有 questions 字段
    const questionsData = {};
    const mockFetch = jest.fn().mockResolvedValueOnce({
      json: () => Promise.resolve(questionsData),
    });
    global.fetch = mockFetch;
  
    localStorage.setItem('sessionToken', 'valid-token');
  
    render(
      React.createElement(BrowserRouter, null,
        React.createElement(Fillout, null)
      )
    );
  
    // 等待 fetch 调用并更新组件
    await waitFor(() => expect(mockFetch).toHaveBeenCalled());
    // 此时 questions 为空，组件应显示无题目提示
    expect(screen.getByText(/There are no questions in this survey!/i)).toBeInTheDocument();
  });
  
  test('多选题取消选择时，触发删除分支（覆盖 onChange 中的 if(idx > -1) 分支）', async () => {
    const questionsData = {
      questions: [
        {
          id: '1',
          question_order: 1,
          description: '多选题测试',
          type: 'multiple',
          body: '选项1,选项2,选项3'
        }
      ]
    };
  
    const mockFetch = jest.fn().mockResolvedValueOnce({
      json: () => Promise.resolve(questionsData),
    });
    global.fetch = mockFetch;
  
    localStorage.setItem('sessionToken', 'valid-token');
  
    render(
      React.createElement(BrowserRouter, null,
        React.createElement(Fillout, null)
      )
    );
  
    // 等待题目加载完成
    await screen.findByText(/多选题测试/i);
  
    // 获取所有多选题的 checkbox
    const checkboxes = screen.getAllByRole('checkbox');
    // 模拟第一次 change 事件：勾选选项，checked 为 true
    fireEvent.change(checkboxes[0], { target: { checked: true, value: "1" } });
    // 模拟第二次 change 事件：取消勾选选项，checked 为 false
    fireEvent.change(checkboxes[0], { target: { checked: false, value: "1" } });
  
    // 若代码没有报错，则证明分支被覆盖
  });
  
});
