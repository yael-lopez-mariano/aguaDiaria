import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { gradients } from '../constants/colors';
import { getGreeting } from '../utils/date';
import WaterDropsIllustration from './WaterDropsIllustration';

/**
 * Mensajes motivadores agrupados por momento del día.
 * Se elige uno al azar dentro del grupo correspondiente para que
 * la app se sienta un poco distinta cada vez que se abre.
 */
const MESSAGES_BY_MOMENT = {
  morning: [
    'Buenos días, recuerda hidratarte 💧',
    'Empieza el día con un buen vaso de agua 🌅💧',
  ],
  afternoon: [
    'Tu cuerpo necesita agua para rendir mejor 🚰',
    'Una pausa para hidratarte te ayuda a seguir con energía ⚡💧',
  ],
  night: [
    'Cierra el día hidratándote, tu cuerpo te lo agradecerá 🌙💧',
    'Un poco de agua antes de dormir también cuenta 🌌🥤',
  ],
};

function pickMessage(): string {
  const hour = new Date().getHours();
  let group = MESSAGES_BY_MOMENT.night;
  if (hour >= 5 && hour < 12) group = MESSAGES_BY_MOMENT.morning;
  else if (hour >= 12 && hour < 19) group = MESSAGES_BY_MOMENT.afternoon;

  const randomIndex = Math.floor(Math.random() * group.length);
  return group[randomIndex];
}

/**
 * Tarjeta principal de bienvenida: un degradado azul con el saludo, un
 * mensaje motivador que cambia según la hora, y una pequeña ilustración
 * de gotas flotantes. Es lo primero que ve el usuario, así que concentra
 * buena parte de la "personalidad" amigable de la app.
 */
export default function MotivationalMessage() {
  const message = useRef(pickMessage()).current;
  const greeting = useRef(getGreeting()).current;

  // Animación sutil de aparición: la tarjeta se desliza hacia arriba
  // mientras va apareciendo, para que la pantalla principal se sienta viva.
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  return (
    <Animated.View
      style={[
        styles.wrapper,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <LinearGradient
        colors={gradients.hero}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <View style={styles.textBlock}>
          <Text style={styles.appTitle}>AguaDiaria</Text>
          <Text style={styles.greeting}>{greeting} 👋</Text>
          <Text style={styles.message}>{message}</Text>
        </View>

        <WaterDropsIllustration />
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 28,
    paddingVertical: 22,
    paddingHorizontal: 22,
    overflow: 'hidden',
  },
  textBlock: {
    flex: 1,
    paddingRight: 8,
  },
  appTitle: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1,
    color: 'rgba(255, 255, 255, 0.85)',
    textTransform: 'uppercase',
  },
  greeting: {
    marginTop: 6,
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  message: {
    marginTop: 6,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.92)',
  },
});
