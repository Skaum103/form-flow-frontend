import React from "react";
import { render, screen } from "@testing-library/react";
import Survey from "../Survey/Survey";

jest.unmock("../Survey/Survey"); // 确保 Jest 运行真正的 Survey 组件

test("renders Survey component", () => {
  render(
    <Survey
      survey={{
        surveyId: 1,
        surveyName: "Test Survey",
        description: "A test survey description",
      }}
    />
  );

  // 使用 getByRole 查询 h3 标题，确保只匹配标题内容
  expect(screen.getByRole("heading", { name: /Test Survey/i })).toBeInTheDocument();
});
