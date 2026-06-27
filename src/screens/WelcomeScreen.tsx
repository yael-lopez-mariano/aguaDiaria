import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, gradients } from '../constants/colors';
import WaterDropsIllustration from '../components/WaterDropsIllustration';

interface WelcomeScreenProps {
  onSubmit: (name: string) => void;
}

/**
 * Pantalla de bienvenida: se muestra una sola vez, la primera vez que se
 * abre la app (mientras no haya un nombre guardado). Pide el nombre del
 * usuario para poder saludarlo y personalizar sus recordatorios — por
 * ejemplo "Hora de tomar agua, Yael 💧" en lugar de un mensaje genérico.
 */
export default function WelcomeScreen({ onSubmit }: WelcomeScreenProps) {
  const [name, setName] = useState('');
  const trimmedName = name.trim();

  const handleSubmit = () => {
    if (trimmedName.length > 0) {
      onSubmit(trimmedName);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.teal} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <LinearGradient colors={gradients.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
          <WaterDropsIllustration />
          <Text style={styles.appTitle}>AguaDiaria 💧</Text>
          <Text style={styles.heroText}>
            Antes de empezar, cuéntanos cómo te llamas para acompañarte de
            forma más cercana en tu meta de hidratación.
          </Text>
        </LinearGradient>

        <View style={styles.formBlock}>
          <Text style={styles.label}>¿Cómo te llamas?</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Por ejemplo: Yael"
            placeholderTextColor={colors.textSecondary}
            style={styles.input}
            autoCapitalize="words"
            autoCorrect={false}
            maxLength={24}
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
          />
          <Text style={styles.hint}>
            Lo usaremos para saludarte y para que tus recordatorios de agua
            se sientan hechos para ti. Puedes cambiarlo más adelante borrando
            tus datos en Configuración.
          </Text>

          <Pressable
            style={[styles.button, trimmedName.length === 0 && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={trimmedName.length === 0}
          >
            <Text style={styles.buttonText}>Empezar a hidratarme 💧</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  hero: {
    paddingHorizontal: 28,
    paddingTop: 36,
    paddingBottom: 32,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  appTitle: {
    marginTop: 8,
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  heroText: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.92)',
  },
  formBlock: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 28,
  },
  label: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  input: {
    marginTop: 12,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  hint: {
    marginTop: 10,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
  },
  button: {
    marginTop: 24,
    backgroundColor: colors.teal,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
