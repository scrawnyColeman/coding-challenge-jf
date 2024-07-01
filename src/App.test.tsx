import { render } from "@testing-library/react";
import App from "./App";
import { describe, expect, it } from "vitest";

describe("App tests", () => {
  it("renders without crashing", () => {
    const { container } = render(<App />);
    expect(container).toMatchSnapshot();
  });
});
