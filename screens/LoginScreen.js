import { useNavigation } from "@react-navigation/native";
import React, { useLayoutEffect } from "react";
import {
  View,
  Text,
  Button,
  ImageBackground,
  TouchableOpacityBase,
  TouchableOpacity,
} from "react-native";
import useAuth from "../hooks/useAuth";
import tw from "tailwind-rn";

const LoginScreen = () => {
  const { user, signInWithGoogle } = useAuth();
  const navigation = useNavigation();
  console.log(user);

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, []);
  return (
    <View style={tw("flex-1")}>
      <ImageBackground
        style={tw("flex-1")}
        source={{ uri: "https://tinder.com/static/tinder.png" }}
      >
        <TouchableOpacity
          style={[
            tw("absolute bottom-40 w-52 bg-white p-4 rounded-2xl"),
            { marginHorizontal: "25%" },
          ]}
          onPress={signInWithGoogle}
        >
          <Text style={tw("font-semibold text-center")}>
            Sign in and get swiping!
          </Text>
        </TouchableOpacity>
      </ImageBackground>
    </View>
  );
};

export default LoginScreen;
