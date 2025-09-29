import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NeonButton } from '../components/NeonButton';
import { NeoMascot } from '../components/NeoMascot';
import { VerseTextField } from '../components/VerseTextField';
import { useVerseTheme } from '../theme';
import { useVerseStore } from '../hooks/useVerseStore';
import { addZoneMessage } from '../services/dataStore';
import { RootStackParamList } from '../navigation/types';

export type ZoneScreenProps = NativeStackScreenProps<RootStackParamList, 'Zone'>;

export const ZoneScreen: React.FC<ZoneScreenProps> = ({ navigation }) => {
  const store = useVerseStore();
  const { palette } = useVerseTheme(store.user?.settings?.themeSeed ?? store.user?.name ?? 'verse');
  const [message, setMessage] = useState('');
  const [lyfe, setLyfe] = useState('');

  const messages = useMemo(() => store.zoneMessages, [store.zoneMessages]);

  const handleSend = async () => {
    if (!message.trim()) {
      return;
    }
    await addZoneMessage(message.trim(), lyfe.trim());
    setMessage('');
    setLyfe('');
  };

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}
      accessibilityLabel="Zone Screen - Social Storm">
      <NeoMascot mood="hype" palette={palette} />
      <Text style={[styles.header, { color: palette.primary }]}>Storm the Zone</Text>
      <FlatList
        data={messages}
        inverted
        style={styles.list}
        contentContainerStyle={styles.listContent}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.messageCard, { backgroundColor: palette.card, borderColor: palette.outline }]}>
            <Text style={[styles.messageText, { color: palette.text }]}>{item.content}</Text>
            {item.lyfe ? (
              <Text style={[styles.messageMeta, { color: palette.accent }]}>$Lyfe: {item.lyfe}</Text>
            ) : null}
            <Text style={[styles.messageMeta, { color: palette.text }]}>Drop: {new Date(item.createdAt).toLocaleTimeString()}</Text>
          </View>
        )}
      />
      <View style={styles.form}>
        <VerseTextField palette={palette} label="Message" value={message} onChangeText={setMessage} />
        <VerseTextField palette={palette} label="$Lyfe" value={lyfe} onChangeText={setLyfe} />
        <NeonButton title="Storm In" onPress={handleSend} palette={palette} intensity="medium" />
      </View>
      <NeonButton title="Seal the Verse" onPress={() => navigation.navigate('Oath')} palette={palette} intensity="medium" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 120,
    paddingHorizontal: 20,
    gap: 16,
  },
  header: {
    fontFamily: 'OpenSans_400Regular',
    fontSize: 20,
    letterSpacing: 1.2,
  },
  list: {
    flex: 1,
  },
  listContent: {
    gap: 16,
    paddingBottom: 20,
  },
  messageCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
  },
  messageText: {
    fontFamily: 'OpenSans_400Regular',
    fontSize: 14,
    marginBottom: 8,
  },
  messageMeta: {
    fontFamily: 'OpenSans_400Regular',
    fontSize: 12,
  },
  form: {
    gap: 12,
  },
});
