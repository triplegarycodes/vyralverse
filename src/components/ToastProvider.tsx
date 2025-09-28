// Step 22: Toast provider for user feedback
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { useNeonTheme } from '../theme/ThemeProvider';

const ToastContext = createContext<{ showToast: (message: string) => void } | undefined>(undefined);

export const ToastProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [message, setMessage] = useState<string | null>(null);
  const { theme } = useNeonTheme();

  const showToast = useCallback((text: string) => {
    setMessage(text);
    setTimeout(() => setMessage(null), 2200);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {message && (
        <Animated.View
          entering={FadeInDown}
          exiting={FadeOutUp}
          style={[styles.toast, { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.border }]}
          pointerEvents="none"
        >
          <Text style={{ color: theme.colors.text }}>{message}</Text>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    bottom: 48,
    left: 24,
    right: 24,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center'
  }
});
