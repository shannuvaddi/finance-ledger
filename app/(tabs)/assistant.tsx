import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useThemeColor';
import { useChat, ChatMessage } from '../../hooks/useChat';
import { TransactionCard } from '../../components/ui/TransactionCard';

export default function AssistantScreen() {
  const theme = useTheme();
  const { messages, loading, sendMessage } = useChat();
  const [input, setInput] = useState('');
  const listRef = useRef<FlatList>(null);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input.trim());
    setInput('');
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.bubbleWrap, isUser ? styles.userWrap : styles.botWrap]}>
        {!isUser && (
          <View style={[styles.avatar, { backgroundColor: theme.accent }]}>
            <Text style={styles.avatarText}>C</Text>
          </View>
        )}
        <View style={{ maxWidth: '78%' }}>
          <View
            style={[
              styles.bubble,
              isUser
                ? [styles.userBubble, { backgroundColor: theme.chatBubbleUser }]
                : [styles.botBubble, { backgroundColor: theme.chatBubbleBot }],
            ]}
          >
            <Text style={[styles.msgText, { color: isUser ? '#fff' : theme.chatBubbleBotText }]}>
              {item.content}
            </Text>
          </View>
          {item.transaction && (
            <TransactionCard
              description={item.transaction.description}
              amount={item.transaction.amount}
              category={item.transaction.category}
              date={item.transaction.date}
            />
          )}
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => listRef.current?.scrollToEnd()}
      />
      <View style={[styles.inputBar, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
        <TextInput
          style={[styles.input, { color: theme.text }]}
          placeholder="e.g. Spent $25 on lunch..."
          placeholderTextColor={theme.muted}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={handleSend}
          returnKeyType="send"
          multiline
        />
        <TouchableOpacity
          style={[styles.sendBtn, { backgroundColor: input.trim() ? theme.accent : theme.border }]}
          onPress={handleSend}
          disabled={loading || !input.trim()}
        >
          <Ionicons name="arrow-up" size={20} color={input.trim() ? '#fff' : theme.muted} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  messagesList: { padding: 16, paddingBottom: 8 },
  bubbleWrap: { flexDirection: 'row', marginBottom: 14, alignItems: 'flex-end' },
  userWrap: { justifyContent: 'flex-end' },
  botWrap: { justifyContent: 'flex-start' },
  avatar: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  avatarText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  bubble: { padding: 12, borderRadius: 18 },
  userBubble: { borderBottomRightRadius: 4 },
  botBubble: { borderBottomLeftRadius: 4 },
  msgText: { fontSize: 15, lineHeight: 21 },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', padding: 12, paddingBottom: 28, borderTopWidth: 1, gap: 10 },
  input: { flex: 1, fontSize: 15, paddingVertical: 10, maxHeight: 100 },
  sendBtn: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
});
