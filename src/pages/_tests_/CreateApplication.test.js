// CreateApplication.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CreateApplication from '../CreateApplication';
import { MemoryRouter } from 'react-router-dom';

// 模拟 useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

beforeEach(() => {
  jest.restoreAllMocks(); // 恢复所有之前的 mock
  localStorage.clear();
  jest.clearAllMocks();
  global.fetch = jest.fn();
  window.alert = jest.fn();
});

function renderComponent() {
  return render(
    <MemoryRouter>
      <CreateApplication />
    </MemoryRouter>
  );
}

test('挂载时若无 sessionToken，则 alert 并跳转到 "/"', async () => {
  localStorage.removeItem('sessionToken');
  renderComponent();
  await waitFor(() => {
    expect(window.alert).toHaveBeenCalledWith("Please log in first!");
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});

test('存在 sessionToken 时应渲染表单', () => {
  localStorage.setItem('sessionToken', 'abc123');
  renderComponent();
  expect(screen.getByLabelText(/Survey Name/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/Survey Description/i)).toBeInTheDocument();
});

test('添加、修改问题和选项，再删除问题', () => {
  localStorage.setItem('sessionToken', 'abc123');
  renderComponent();

  // 添加单选题，初始会有一个空选项
  fireEvent.click(screen.getByText('+ Add Single Choice'));
  expect(screen.getByText(/Question 1:/)).toBeInTheDocument();

  // 修改问题标题
  const questionInput = screen.getByPlaceholderText('Enter question');
  fireEvent.change(questionInput, { target: { value: 'What is your favorite color?' } });
  expect(questionInput.value).toBe('What is your favorite color?');

  // 点击添加选项，注意此时可能会有多个 "Enter option"
  fireEvent.click(screen.getByText('+ Add Option'));
  const optionInputs = screen.getAllByPlaceholderText('Enter option');
  // 选择最后一个新添加的选项
  const newOptionInput = optionInputs[optionInputs.length - 1];
  fireEvent.change(newOptionInput, { target: { value: 'Blue' } });
  expect(newOptionInput.value).toBe('Blue');

  // 删除该问题
  fireEvent.click(screen.getByText('Delete Question'));
  expect(screen.queryByText(/Question 1:/)).not.toBeInTheDocument();

  // 添加文本题，并验证 textarea 被禁用
  fireEvent.click(screen.getByText('+ Add Text Question'));
  expect(screen.getByText(/Question 1:/)).toBeInTheDocument();
  expect(screen.getByPlaceholderText('Enter answer')).toBeDisabled();
});

test('提交时若 token 为空，则 alert 并跳转到 "/login"', async () => {
  localStorage.setItem('sessionToken', 'abc123');
  renderComponent();
  // 模拟 token 为空
  const spy = jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
  fireEvent.click(screen.getByText('Submit Survey'));
  await waitFor(() => {
    expect(window.alert).toHaveBeenCalledWith("Session expired, please log in again.");
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });
  spy.mockRestore();
});

test('提交时创建调查失败，提示错误', async () => {
  localStorage.setItem('sessionToken', 'abc123');
  renderComponent();
  // 填写调查名称和描述
  fireEvent.change(screen.getByLabelText(/Survey Name/i), { target: { value: 'Test Survey' } });
  fireEvent.change(screen.getByLabelText(/Survey Description/i), { target: { value: 'A survey description' } });

  // 模拟创建调查 API 返回失败
  global.fetch.mockResolvedValueOnce({
    ok: false,
    json: async () => ({}),
  });

  fireEvent.click(screen.getByText('Submit Survey'));

  await waitFor(() => {
    expect(window.alert).toHaveBeenCalledWith("Submission failed: Failed to create survey");
  });
});

test('创建成功但更新问题时 fetch 返回不 ok，提示错误', async () => {
  localStorage.setItem('sessionToken', 'abc123');
  renderComponent();

  // 填写表单并添加文本题（文本题进入更新流程）
  fireEvent.change(screen.getByLabelText(/Survey Name/i), { target: { value: 'Test Survey' } });
  fireEvent.change(screen.getByLabelText(/Survey Description/i), { target: { value: 'A survey description' } });
  fireEvent.click(screen.getByText('+ Add Text Question'));

  // 第一次 fetch 模拟创建调查成功
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ surveyId: '1' }),
  });
  // 第二次 fetch 模拟更新问题返回不 ok
  global.fetch.mockResolvedValueOnce({
    ok: false,
    json: async () => ({}),
  });

  fireEvent.click(screen.getByText('Submit Survey'));

  await waitFor(() => {
    expect(window.alert).toHaveBeenCalledWith("Submission failed: Failed to update questions");
  });
});

test('更新问题返回 success 为 false 时提示更新失败', async () => {
  localStorage.setItem('sessionToken', 'abc123');
  renderComponent();

  fireEvent.change(screen.getByLabelText(/Survey Name/i), { target: { value: 'Test Survey' } });
  fireEvent.change(screen.getByLabelText(/Survey Description/i), { target: { value: 'A survey description' } });
  fireEvent.click(screen.getByText('+ Add Text Question'));

  // 第一次 fetch 模拟创建调查成功
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ surveyId: '1' }),
  });
  // 第二次 fetch 模拟更新问题成功但返回 success 为 false
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ success: false }),
  });

  fireEvent.click(screen.getByText('Submit Survey'));

  await waitFor(() => {
    expect(window.alert).toHaveBeenCalledWith("Failed to update questions.");
  });
});

test('成功提交调查和更新问题后提示成功并跳转', async () => {
  localStorage.setItem('sessionToken', 'abc123');
  renderComponent();

  fireEvent.change(screen.getByLabelText(/Survey Name/i), { target: { value: 'Test Survey' } });
  fireEvent.change(screen.getByLabelText(/Survey Description/i), { target: { value: 'A survey description' } });
  fireEvent.click(screen.getByText('+ Add Text Question'));

  // 第一次 fetch 模拟创建调查成功
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ surveyId: '1' }),
  });
  // 第二次 fetch 模拟更新问题成功且返回 success 为 true
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ success: true }),
  });

  fireEvent.click(screen.getByText('Submit Survey'));

  await waitFor(() => {
    expect(window.alert).toHaveBeenCalledWith("Survey created and questions updated successfully!");
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});

test('创建返回无 surveyId 时不执行更新步骤', async () => {
  localStorage.setItem('sessionToken', 'abc123');
  renderComponent();

  fireEvent.change(screen.getByLabelText(/Survey Name/i), { target: { value: 'Test Survey' } });
  fireEvent.change(screen.getByLabelText(/Survey Description/i), { target: { value: 'A survey description' } });

  // 模拟创建调查成功，但返回结果中无 surveyId
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({}),
  });

  fireEvent.click(screen.getByText('Submit Survey'));

  await waitFor(() => {
    // 只调用了一次 fetch（创建调查的 API）
    expect(global.fetch).toHaveBeenCalledTimes(1);
    // 没有弹出成功提示或导航
    expect(window.alert).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
