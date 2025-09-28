// Step 15: Tree goal map screen with collapsible sections
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import Animated, { Layout, FadeIn } from 'react-native-reanimated';
import { NeonBackground } from '../../components/NeonBackground';
import { NeonCard } from '../../components/NeonCard';
import { NeonButton } from '../../components/NeonButton';
import { useNeonTheme } from '../../theme/ThemeProvider';
import { useTreeStore } from '../../state/treeStore';

export const TreeScreen: React.FC = () => {
  const { theme } = useNeonTheme();
  const { nodes, expanded, hydrate, toggleNode, addNode } = useTreeStore();
  const [title, setTitle] = useState('New Goal Node');
  const [hint, setHint] = useState('Drop a guiding mantra.');

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const rootNodes = nodes.filter(node => node.parent_id === null);

  return (
    <NeonBackground>
      <View style={[styles.container, { padding: theme.spacing.lg }]}
 accessibilityRole="main">
        <Text style={[styles.heading, { color: theme.colors.text }]}>Goal Tree</Text>
        <NeonCard>
          <Text style={[styles.subheading, { color: theme.colors.text }]}>Add Node</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
            placeholder="Title"
            placeholderTextColor={theme.colors.textMuted}
          />
          <TextInput
            value={hint}
            onChangeText={setHint}
            style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
            placeholder="Hint"
            placeholderTextColor={theme.colors.textMuted}
          />
          <NeonButton
            label="Plant Node"
            onPress={() =>
              addNode({ parent_id: null, title, hint, created_at: Date.now() })
            }
          />
        </NeonCard>
        {rootNodes.map(node => {
          const isExpanded = expanded[node.id ?? 0];
          const children = nodes.filter(child => child.parent_id === node.id);
          return (
            <NeonCard key={node.id}>
              <Text
                style={[styles.nodeTitle, { color: theme.colors.accent }]}
                onPress={() => toggleNode(node.id ?? 0)}
                accessibilityRole="button"
              >
                {node.title}
              </Text>
              <Text style={{ color: theme.colors.textMuted }}>{node.hint}</Text>
              {isExpanded && (
                <Animated.View entering={FadeIn} layout={Layout.springify()} style={{ marginTop: 12 }}>
                  {children.map(child => (
                    <Text key={child.id} style={{ color: theme.colors.text, marginTop: 4 }}>
                      ↳ {child.title}
                    </Text>
                  ))}
                </Animated.View>
              )}
            </NeonCard>
          );
        })}
      </View>
    </NeonBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  heading: {
    fontSize: 30,
    fontWeight: '700',
    marginBottom: 24
  },
  subheading: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12
  },
  input: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12
  },
  nodeTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4
  }
});
