import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useThemeColor';
import { useChat, ChatMessage, ChatContext } from '../../hooks/useChat';
import { TransactionCard } from '../../components/ui/TransactionCard';
import { PeriodHeader } from '../../components/ui/PeriodHeader';
import { usePeriod } from '../../context/PeriodContext';
import { illustrations, logo } from '../../constants/illustrations';

const SUGGESTIONS: Record<ChatContext, string[]> = {
  query: ['How much did I spend on dining?', 'What was my biggest expense?', 'Am I over budget anywhere?'],
  transaction: ['Spent 120 kr on lunch today', 'Got paid 35 000 kr salary', 'Paid 4 500 kr home loan EMI', 'Moved 5 000 kr to savings'],
};

export default function AssistantScreen() {
  const theme = useTheme();
  const { messages, loading, sendMessage } = useChat();
  const { periodParam } = usePeriod();
  const [input, setInput] = useState('');
  const [context, setContext] = useState<ChatContext>('query');
  const listRef = useRef<FlatList>(null);

  const handleSend = () => {
    if (!input.trim()) return;
    // Query context is scoped to the selected period; transaction logging ignores it.
    sendMessage(input.trim(), context, context === 'query' ? periodParam : undefined);
    setInput('');
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.bubbleWrap, isUser ? styles.userWrap : styles.botWrap]}>
        {!isUser && (
          <Image source={logo} style={styles.avatar} />
        )}
        <View style={{ maxWidth: '78%' }}>
          <View
            style={[
              styles.bubble,
              isUser
                ? [styles.userBubble, { backgroundColor: theme.chatBubbleUser }]
                : [styles.botBubble, { backgroundColor: item.isError ? theme.danger + '18' : theme.chatBubbleBot }],
            ]}
          >
            <Text
              style={[
                styles.msgText,
                { color: isUser ? '#fff' : item.isError ? theme.danger : theme.chatBubbleBotText },
              ]}
            >
              {item.content}
            </Text>
          </View>
          {item.transaction && (
            <TransactionCard
              description={item.transaction.description}
              amount={item.transaction.amount}
              category={item.transaction.category}
              type={item.transaction.type}
              date={item.transaction.date}
            />
          )}
        </View>
      </View>
    );
  };

  // Shown above the greeting until the user sends their first message.
  const welcome = messages.length <= 1 ? (
    <View style={styles.welcome}>
      <Image
        source={illustrations.assistant.source}
        style={styles.welcomeArt}
        resizeMode="contain"
      />
      <Text style={[styles.welcomeTitle, { color: theme.text }]}>
        {context === 'query' ? 'Ask about your money' : 'Log a transaction'}
      </Text>
      <Text style={[styles.welcomeText, { color: theme.textSecondary }]}>Try one of these to get started</Text>
      <View style={styles.suggestions}>
        {SUGGESTIONS[context].map((q) => (
          <TouchableOpacity
            key={q}
            style={[styles.suggestion, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => setInput(q)}
            activeOpacity={0.7}
          >
            <Text style={[styles.suggestionText, { color: theme.accent }]}>{q}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  ) : null;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <PeriodHeader />
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesList}
        ListHeaderComponent={welcome}
        onContentSizeChange={() => listRef.current?.scrollToEnd()}
      />
      <View style={[styles.toggleBar, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
        {(['query', 'transaction'] as ChatContext[]).map((mode) => {
          const active = context === mode;
          const label = mode === 'query' ? 'Ask' : 'Log';
          const icon = mode === 'query' ? 'help-circle-outline' : 'add-circle-outline';
          return (
            <TouchableOpacity
              key={mode}
              style={[
                styles.toggleBtn,
                { backgroundColor: active ? theme.accent : 'transparent', borderColor: theme.border },
              ]}
              onPress={() => setContext(mode)}
            >
              <Ionicons name={icon as any} size={15} color={active ? '#fff' : theme.muted} />
              <Text style={[styles.toggleText, { color: active ? '#fff' : theme.muted }]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={[styles.inputBar, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
        <TextInput
          style={[styles.input, { color: theme.text }]}
          placeholder={context === 'transaction' ? 'e.g. Spent 25 kr on lunch...' : 'Ask about your spending...'}
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
  avatar: { width: 30, height: 30, borderRadius: 15, marginRight: 8 },
  welcome: { alignItems: 'center', paddingVertical: 12, marginBottom: 12 },
  welcomeArt: { width: 200, height: 200 / illustrations.assistant.aspectRatio, marginBottom: 8 },
  welcomeTitle: { fontSize: 18, fontWeight: '700' },
  welcomeText: { fontSize: 13, marginTop: 4, marginBottom: 14 },
  suggestions: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  suggestion: { borderWidth: 1, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 7 },
  suggestionText: { fontSize: 13, fontWeight: '500' },
  bubble: { padding: 12, borderRadius: 18 },
  userBubble: { borderBottomRightRadius: 4 },
  botBubble: { borderBottomLeftRadius: 4 },
  msgText: { fontSize: 15, lineHeight: 21 },
  toggleBar: { flexDirection: 'row', gap: 8, paddingHorizontal: 12, paddingTop: 10, borderTopWidth: 1 },
  toggleBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1 },
  toggleText: { fontSize: 13, fontWeight: '600' },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', padding: 12, paddingBottom: 28, gap: 10 },
  input: { flex: 1, fontSize: 15, paddingVertical: 10, maxHeight: 100 },
  sendBtn: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
});
