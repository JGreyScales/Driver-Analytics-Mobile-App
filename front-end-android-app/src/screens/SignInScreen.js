import React from 'react';
import { View, Text, Button } from 'react-native';

export default function SignInScreen({ navigation }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Sign In Screen (placeholder)</Text>
      <Button title="Back to Sign Up" onPress={() => navigation.navigate('SignUp')} />
    </View>
  );
}