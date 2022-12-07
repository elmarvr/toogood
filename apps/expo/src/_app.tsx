import { useSignin } from "@toogood/auth/src/expo/useSignin";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export function App() {
  const { startAsync } = useSignin({ provider: "google" });
  const [user, setUser] = useState<any>({});

  const handleSignin = async () => {
    const result = await startAsync();

    if (result.type === "success") {
      const response = await fetch("http://localhost:3000/auth/session", {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: result.params.session_token,
        }),
      });

      const data = await response.json();

      setUser(data.user);
    }
  };

  return (
    <View style={styles.container}>
      <Text onPress={() => handleSignin()}>Login</Text>
      <Text>{JSON.stringify(user)}</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
