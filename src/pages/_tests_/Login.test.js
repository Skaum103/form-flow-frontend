import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Login from "../Login";

// 模拟react-router-dom 里的 useNavigate，以便在 Jest 测试中跟踪 页面跳转 是否正确发生。
const mockedUsedNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedUsedNavigate,
}));

describe("Login Component", () => {
  //每个测试前都会执行这个代码，确保 localStorage 是 mock 版本。
  beforeEach(() => {
    Object.defineProperty(window, "localStorage", {
      value: {
        //让 localStorage.setItem 变成 Jest mock 函数，以便测试是否正确存储 token。
        setItem: jest.fn(),
        getItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    });
  });

  // 测试 1：检查 Login 页面的各个组件是否正确渲染
  test("renders login form correctly", () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    // 检查是否渲染了必要的表单元素
    // 确保标题正确渲染
    expect(
      screen.getByRole("heading", { level: 2, name: "Log in" })
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("Please enter your username")
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Please enter your password")
    ).toBeInTheDocument();

    // 确保按钮存在
    expect(
      screen.getByRole("button", { name: "Log in Now !" })
    ).toBeInTheDocument();

    expect(screen.getByText("Does not have an account?")).toBeInTheDocument();
  });

  // 测试 2：检查输入框是否能正确更新
  test("updates username and password input values", () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const usernameInput = screen.getByPlaceholderText(
      "Please enter your username"
    );
    const passwordInput = screen.getByPlaceholderText(
      "Please enter your password"
    );
    //模拟用户在用户名输入框输入 "testuser"，在密码输入框输入 "password123"
    fireEvent.change(usernameInput, { target: { value: "testuser" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    //断言输入框的值是否正确更新
    expect(usernameInput.value).toBe("testuser");
    expect(passwordInput.value).toBe("password123");
  });

  // 测试 3：检查登录失败时是否显示错误消息
  test("shows error message when login fails", async () => {
    //Mock fetch 返回一个失败的响应 { success: false, message: "Invalid credentials" }。
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () =>
          Promise.resolve({ success: false, message: "Invalid credentials" }),
      })
    );

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    //模拟点击登录按钮
    fireEvent.click(screen.getByRole("button", { name: "Log in Now !" }));

    // 等待错误消息渲染，然后检查它的文本是否是 "Invalid credentials"
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Invalid credentials"
    );
  });

  // 测试 4：检查点击 "Register Now" 是否跳转到注册页面
  test("navigates to register page when clicking 'Register Now'", () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const registerButton = screen.getByText("Register Now");
    // 模拟点击注册按钮。
    fireEvent.click(registerButton);
    //断言 useNavigate 是否被调用，并且路径是 "/register"
    expect(mockedUsedNavigate).toHaveBeenCalledWith("/register");
  });

  //测试 5：检查成功登录是否存储 token 并跳转
  test("successful login stores session ID and navigates", async () => {
    // Mock fetch 返回成功的响应
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            JSESSIONID: "mocked_session_id", // 后端返回 JSESSIONID，而不是 token
          }),
      })
    );
  
    // Mock localStorage
    jest.spyOn(global.localStorage, "setItem");
  
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
  
    // 触发登录按钮点击
    fireEvent.click(screen.getByRole("button", { name: "Log in Now !" }));
  
    // 等待异步操作完成
    await screen.findByRole("button", { name: "Log in Now !" });
  
    // 确保 localStorage.setItem 被调用，并存储正确的 session ID
    expect(localStorage.setItem).toHaveBeenCalledWith("JSESSIONID", "mocked_session_id");
  
    // 确保导航到 "/"
    expect(mockedUsedNavigate).toHaveBeenCalledWith("/");
  });
  
});
