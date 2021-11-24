import { useRoute } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TextInput,
  Button,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  FlatList,
} from "react-native";
import Header from "../components/Header";
import useAuth from "../hooks/useAuth";
import getMatchedUserInfo from "../lib/getMatchedUserInfo";
import tw from "tailwind-rn";
import SenderMessage from "../components/SenderMessage";
import RecieverMessage from "../components/ReceiverMessage";
import {
  addDoc,
  collection,
  serverTimestamp,
  onSnapshot,
  query,
  where,
  orderBy,
  getDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";
import ReceiverMessage from "../components/ReceiverMessage";

const MessagesScreen = () => {
  const { user } = useAuth();
  const { params } = useRoute();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isPremium, setIsPremium] = useState(false);

  const sendMessage = () => {
    addDoc(collection(db, "matches", matchDetails.id, "messages"), {
      timestamp: serverTimestamp(),
      userId: user.uid,
      displayName: user.displayName,
      photoURL: matchDetails.users[user.uid].photoURL,
      message: input,
    });

    setInput("");
  };

  useEffect(
    () =>
      onSnapshot(
        query(
          collection(db, "matches", matchDetails.id, "messages"),
          orderBy("timestamp", "desc")
        ),
        (snapshot) =>
          setMessages(
            snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))
          )
      ),
    [matchDetails, db]
  );

  useEffect(() => {
    getDoc(doc(db, "users", user.uid))
      .then((snapshot) => {
        if (!snapshot.exists()) return setIsPremium(false);
        const data = snapshot.data();
        if (data.type === "premium") setIsPremium(true);
        else setIsPremium(false);
      })
      .catch((err) => console.error(err));
  }, []);

  const { matchDetails } = params;

  return (
    <SafeAreaView style={tw("flex-1")}>
      <Header
        title={getMatchedUserInfo(matchDetails.users, user.uid).displayName}
        callEnabled
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={tw("flex-1")}
        keyboardVerticalOffset={10}
      >
        <TouchableWithoutFeedback>
          <FlatList
            data={messages}
            inverted={-1}
            style={tw("pl-4")}
            keyExtractor={(item) => item.id}
            renderItem={({ item: message }) =>
              message.userId === user.uid ? (
                <SenderMessage key={message.id} message={message} />
              ) : (
                <ReceiverMessage key={message.id} message={message} />
              )
            }
          />
        </TouchableWithoutFeedback>

        <View
          style={tw(
            "flex-row justify-between items-center border-t border-gray-200 px-5 py-2"
          )}
        >
          {isPremium ? (
            <>
              <TextInput
                style={tw("h-10 text-lg")}
                placeholder="Send Message..."
                value={input}
                onChangeText={(text) => setInput(text)}
                onSubmitEditing={sendMessage}
              />
              <Button onPress={sendMessage} title="Send" color="#ff5864" />
            </>
          ) : (
            <Text>You must be a premium user to chat</Text>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default MessagesScreen;
