import React from "react";
import { View, Text, SafeAreaView } from "react-native";
import ChatList from "../components/ChatList";
import Header from "../components/Header";

const ChatScreen = () => {
  return (
    <SafeAreaView>
      <Header title="Chat" />
      <ChatList />
    </SafeAreaView>
  );
};

export default ChatScreen;
