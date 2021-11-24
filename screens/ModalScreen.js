import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { db } from "../firebase";
import tw from "tailwind-rn";
import useAuth from "../hooks/useAuth";
import { setDoc, doc, serverTimestamp, getDoc } from "firebase/firestore";
import axios from "axios";
import { useStripe } from "@stripe/stripe-react-native";

const ModalScreen = () => {
  const { user } = useAuth();
  const [image, setImage] = useState(null);
  const [job, setJob] = useState(null);
  const [age, setAge] = useState(null);
  const [isPremium, setIsPremium] = useState(true);
  const navigation = useNavigation();
  const stripe = useStripe();

  let incompleteForm = !image || !job || !age;

  const updateUserProfile = () => {
    setDoc(doc(db, "users", user.uid), {
      id: user.uid,
      displayName: user.displayName,
      photoURL: image,
      job,
      age,
      type: "free",
      timestamp: serverTimestamp(),
    })
      .then(() => navigation.navigate("Home"))
      .catch((error) => {
        alert(error.message);
      });
  };

  useEffect(() => {
    getDoc(doc(db, "users", user.uid))
      .then((snapshot) => {
        if (!snapshot.exists()) return;
        const data = snapshot.data();
        console.log("data", data);
        if (data?.type === "premium") setIsPremium(true);
        else setIsPremium(false);
        console.log("premium", isPremium);
      })
      .catch((err) => console.error(err));
  }, []);

  const upgradePremium = async () => {
    try {
      const response = await axios.post("http://localhost:8080/upgrade", {
        id: user.uid,
      });
      const initSheet = await stripe.initPaymentSheet({
        paymentIntentClientSecret: response.data.clientSecret,
      });
      if (initSheet.error) {
        console.error(initSheet.error);
        return Alert.alert(initSheet.error.message);
      }
      const presentSheet = await stripe.presentPaymentSheet({
        clientSecret: response.data.clientSecret,
      });
      if (presentSheet.error) {
        console.error(presentSheet.error);
        return Alert.alert(presentSheet.error.message);
      }
      await Alert.alert(
        "Premium purchased successfully! Please reload the app if you don't see the effects."
      );
      navigation.goBack();
    } catch (err) {
      console.error(err);
      Alert.alert(
        "Error",
        "There was an error upgrading to premium, please try again later."
      );
    }
  };

  return (
    <View style={tw("flex-1 items-center pt-1")}>
      <Image
        style={tw("h-20 w-full")}
        resizeMode="contain"
        source={{ uri: "https://links.papareact.com/2pf" }}
      />
      <Text style={tw("text-xl text-gray-500 p-2 font-bold")}>
        Welcome {user.displayName}
      </Text>
      <Text style={tw("text-center p-4 font-bold text-red-400")}>
        Step 1: The Profile Pic
      </Text>
      <TextInput
        value={image}
        onChangeText={(text) => setImage(text)}
        placeholder="Enter a profile pic URL"
        style={tw("text-center text-xl pb-2")}
      />

      <Text style={tw("text-center p-4 font-bold text-red-400")}>
        Step 2: The Job
      </Text>
      <TextInput
        value={job}
        onChangeText={(text) => setJob(text)}
        placeholder="Enter an occupation"
        style={tw("text-center text-xl pb-2")}
      />

      <Text style={tw("text-center p-4 font-bold text-red-400")}>
        Step 3: The Age
      </Text>
      <TextInput
        value={age}
        onChangeText={(text) => setAge(text)}
        placeholder="Enter your age"
        keyboardType="numeric"
        style={tw("text-center text-xl pb-2")}
      />

      <TouchableOpacity
        disabled={isPremium}
        onPress={upgradePremium}
        style={[
          tw("w-64 p-3 rounded-xl absolute bottom-28"),
          isPremium ? tw("bg-gray-400") : tw("bg-red-400"),
        ]}
      >
        <Text style={tw("text-center text-white text-xl")}>
          {isPremium ? "You are premium user" : "Upgrade to Premium"}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        disabled={incompleteForm}
        onPress={updateUserProfile}
        style={[
          tw("w-64 p-3 rounded-xl absolute bottom-10"),
          incompleteForm ? tw("bg-gray-400") : tw("bg-red-400"),
        ]}
      >
        <Text style={tw("text-center text-white text-xl")}>Update Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ModalScreen;
