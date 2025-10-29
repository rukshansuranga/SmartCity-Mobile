import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatResponse {
  answer?: string;
  response?: string;
  error?: string;
}

export default function AdviserScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      text: "Hello! I'm your Smart City AI Assistant. Ask me anything about taxes, properties, or city data.",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  // Listen to keyboard events
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    // Remove welcome message if it exists (first query)
    setMessages((prev) => {
      const filteredMessages = prev.filter((msg) => msg.id !== "welcome");
      return [...filteredMessages, userMessage];
    });
    setInputText("");
    setIsLoading(true);

    try {
      const response = await fetch(
        "http://smartcity-adviser.azurewebsites.net/query",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question: inputText.trim(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ChatResponse = await response.json();
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text:
          data.answer ||
          data.response ||
          "I couldn't process that question. Please try again.",
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I couldn't connect to the server. Please make sure the backend is running at http://127.0.0.1:8000",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    Alert.alert("Clear Chat", "Are you sure you want to clear all messages?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: () => {
          setMessages([
            {
              id: "welcome",
              text: "Hello! I'm your Smart City AI Assistant. Ask me anything about taxes, properties, or city data.",
              isUser: false,
              timestamp: new Date(),
            },
          ]);
        },
      },
    ]);
  };

  const suggestedQuestions = [
    "What is the total annual tax for Residential Houses in 2023-2024?",
    "Show me tax collection statistics",
    "What are the property types available?",
  ];

  const handleSuggestedQuestion = (question: string) => {
    setInputText(question);
  };

  return (
    <>
      <SafeAreaView className="flex-1 bg-[#80ed99]" edges={[]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1"
          keyboardVerticalOffset={0}
        >
          {/* Clear Chat Icon Button - Top Right */}
          <View className="absolute top-2 right-2 z-10">
            <TouchableOpacity
              onPress={clearChat}
              className="bg-[#38a3a5] w-10 h-10 rounded-full items-center justify-center shadow-lg"
              activeOpacity={0.8}
            >
              <Ionicons name="trash-outline" size={20} color="white" />
            </TouchableOpacity>
          </View>
          {/* Messages Area */}
          <ScrollView
            ref={scrollViewRef}
            className="flex-1 px-4 py-5"
            contentContainerStyle={{ paddingTop: 40, paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((message) => (
              <View
                key={message.id}
                className={`mb-4 ${message.isUser ? "items-end" : "items-start"}`}
              >
                <View
                  className={`max-w-[85%] rounded-3xl px-5 py-4 shadow-md ${
                    message.isUser
                      ? "bg-[#38a3a5] rounded-tr-sm"
                      : "bg-white rounded-tl-sm border border-[#c7f9cc]"
                  }`}
                >
                  <Text
                    className={`${
                      message.isUser ? "text-white" : "text-[#22577a]"
                    } text-base leading-6 font-medium`}
                  >
                    {message.text}
                  </Text>
                  <Text
                    className={`${
                      message.isUser ? "text-[#c7f9cc]" : "text-[#57cc99]"
                    } text-xs mt-2 font-semibold`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>
              </View>
            ))}

            {isLoading && (
              <View className="items-start mb-4">
                <View className="bg-white rounded-3xl rounded-tl-sm px-5 py-4 shadow-md border border-[#c7f9cc]">
                  <ActivityIndicator color="#38a3a5" size="small" />
                </View>
              </View>
            )}

            {/* Suggested Questions */}
            {messages.length === 1 && !isLoading && (
              <View className="mt-6">
                <Text className="text-[#22577a] text-base font-bold mb-3 px-2">
                  💡 Try asking:
                </Text>
                {suggestedQuestions.map((question, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleSuggestedQuestion(question)}
                    className="bg-white rounded-2xl px-5 py-4 mb-3 shadow-md border-l-4 border-[#57cc99]"
                    activeOpacity={0.7}
                  >
                    <Text className="text-[#22577a] text-sm font-medium leading-5">
                      {question}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>

          {/* Input Area */}
          <View
            className="bg-[#c7f9cc] px-4 py-2 border-t-2 border-[#57cc99] shadow-2xl"
            style={{ marginBottom: keyboardHeight }}
          >
            <View className="flex-row items-center gap-3">
              <View className="flex-1 bg-white rounded-3xl px-5 py-2 flex-row items-center shadow-md border border-[#80ed99]">
                <TextInput
                  className="flex-1 text-base text-[#22577a] font-medium"
                  placeholder="Ask me anything..."
                  placeholderTextColor="#38a3a5"
                  value={inputText}
                  onChangeText={setInputText}
                  multiline
                  maxLength={500}
                  editable={!isLoading}
                  onSubmitEditing={sendMessage}
                />
              </View>
              <TouchableOpacity
                onPress={sendMessage}
                disabled={!inputText.trim() || isLoading}
                className={`${
                  !inputText.trim() || isLoading
                    ? "bg-[#57cc99]"
                    : "bg-[#38a3a5]"
                } rounded-full w-14 h-14 items-center justify-center shadow-lg`}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Ionicons
                    name={inputText.trim() ? "send" : "send-outline"}
                    size={24}
                    color="white"
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}
