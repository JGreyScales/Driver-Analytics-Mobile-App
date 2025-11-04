import SignUpScreen from "../screens/SignUpScreen";

export async function runSignUpTests(updateResults) {
  console.log("🚀 SignUp Test Suite started");

  const results = [];

  function pass(name) {
    console.log("✅", name);
    results.push({ name, status: "PASSED" });
  }

  function fail(name, error) {
    console.log("❌", name, error);
    results.push({ name, status: "FAILED", error });
  }

  // Render screen instance
  const screen = SignUpScreen();
  console.log("SCREEN DEBUG:", JSON.stringify(screen, null, 2));
  const children = screen.props.children.props.children;

  const setEmail = children[2].props.onChangeText;
  const setUsername = children[5].props.onChangeText;
  const setPassword = children[8].props.onChangeText;
  const submit    = children[11].props.onPress;

  // RUN TEST CASES

  // 1. Missing email
  try {
    setEmail("");
    setUsername("testuser");
    setPassword("password123");
    await submit();
    fail("Email required", "Did not detect missing email");
  } catch {
    pass("Email required");
  }

  // 2. Invalid email
  try {
    setEmail("bademail");
    setUsername("testuser");
    setPassword("password123");
    await submit();
    fail("Invalid email format", "Did not detect invalid email");
  } catch {
    pass("Invalid email format");
  }

  // 3. Short password
  try {
    setEmail("valid@gmail.com");
    setUsername("testuser");
    setPassword("123");
    await submit();
    fail("Password too short", "Did not detect short password");
  } catch {
    pass("Password too short");
  }

  // 4. Valid signup input (not checking server response yet)
  try {
    setEmail("real@gmail.com");
    setUsername("realuser");
    setPassword("password123");
    await submit();
    pass("Valid signup data accepted");
  } catch (e) {
    fail("Valid signup data accepted", e.message);
  }

  // Return results to test UI
  updateResults(results);
}