import React from "react";
import renderer from "react-test-renderer";
import SignUpScreen from "../__TESTS__/Utils/SignUpScreen.test.js";

test("SignUpScreen renders correctly", () => {
  const tree = renderer.create(<SignUpScreen />).toJSON();
  expect(tree).toMatchSnapshot();
});
