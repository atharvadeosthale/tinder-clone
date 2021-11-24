import { NavigationContainer } from "@react-navigation/native";
import { StripeProvider } from "@stripe/stripe-react-native";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import tw from "tailwind-rn";
import { AuthProvider } from "./hooks/useAuth";
import StackNavigator from "./StackNavigator";

export default function App() {
  return (
    <NavigationContainer>
      <AuthProvider>
        <StripeProvider publishableKey="pk_test_51JLlrQSCrqIF8lRiuhSYY7MVJSgCX6UwcuCBpj1uXQCqGncGi4KA9Zbsa9cj42TtuaNd8fN8QMu0YPXEjT6veHiY00RqWsKaoE">
          <StackNavigator />
          <StatusBar style="dark" />
        </StripeProvider>
      </AuthProvider>
    </NavigationContainer>
  );
}
