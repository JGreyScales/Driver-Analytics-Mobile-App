import React from "react";
import renderer, { act } from "react-test-renderer";
import SignUpScreen from "../../src/screens/SignUpScreen";

test("SignUpScreen renders correctly", async () => {
  let tree;
  await act(async () => {
    tree = renderer.create(<SignUpScreen />);
  });
  expect(tree.toJSON()).toMatchSnapshot();
});
