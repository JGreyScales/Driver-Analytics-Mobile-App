import React, { useState } from "react";
import { View, Text, Button, ScrollView } from "react-native";
import { runSignUpTests } from "../tests/SignUpTestSuite";

export default function TestRunnerScreen() {
  const [results, setResults] = useState([]);

  const runTests = async () => {
    console.log("🔧 Test button pressed — running tests...");
    setResults([{ name: "Running tests...", status: "WAIT" }]);
    await runSignUpTests(setResults);
  };

  return (
    <ScrollView style={{ padding: 20 }}>
      <Button title="RUN SIGNUP TESTS" onPress={runTests} />

      {results.map((r, i) => (
        <Text
          key={i}
          style={{
            marginVertical: 6,
            fontWeight: "bold",
            color:
              r.status === "PASSED"
                ? "green"
                : r.status === "FAILED"
                  ? "red"
                  : "blue",
          }}
        >
          {r.status} — {r.name}
          {r.error ? ` (${r.error})` : ""}
        </Text>
      ))}
    </ScrollView>
  );
}