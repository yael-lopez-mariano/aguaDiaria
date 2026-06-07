import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { gradients } from '../constants/colors';
import { getGreeting } from '../utils/date';
import WaterDropsIllustration from './WaterDropsIllustration';

interface MotivationalMessageProps {
  /** Nombre guardado en la bienvenida; si no hay (o se borró), se usan mensajes genéricos. */
  userName?: string | null;
}

/**
 * Mensajes genéricos agrupados por momento del día: se usan cuando todavía
 * no tenemos un nombre guardado, y también se mezclan con los personalizados
 * para que el mensaje no siempre lleve el nombre y se sienta más variado.
 */
const GENERIC_MESSAGES_BY_MOMENT = {
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

/**
 * Plantillas personalizadas con `{name}`: mezclan tono motivador y un poco
 * de humor, para que cuando la app conoce tu nombre se sienta hecha para ti
 * y no repita siempre el mismo mensaje.
 */
const PERSONALIZED_TEMPLATES_BY_MOMENT = {
  morning: [
    '{name}, buenos días ☀️ Arranca el día con un buen vaso de agua 💧',
    'Oye {name}, tu primer vaso de agua del día te está esperando 👋💧',
    '{name}, el café no cuenta como hidratación... ¡vamos por agua! ☕😅💧',
  ],
  afternoon: [
    '{name}, una pausa para hidratarte te ayuda a seguir con energía ⚡💧',
    'Psst, {name}... ¿ya tomaste agua hoy o solo café? 👀☕',
    '{name}, tu cuerpo es agua en su mayoría: ¡rellénalo! 🚰😄',
    'No te lo decimos para molestar, {name}: ¡es hora de tomar agua! 💧😉',
  ],
  night: [
    '{name}, cierra el día hidratándote: tu cuerpo te lo va a agradecer 🌙💧',
    'No olvides tomar agua antes de dormir, {name} 🌌🥤',
    '{name}, un último vaso de agua y a descansar tranquilo 😴💧',
  ],
};

type ReminderMomentGroup = keyof typeof GENERIC_MESSAGES_BY_MOMENT;

function getMomentGroup(): ReminderMomentGroup {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 19) return 'afternoon';
  return 'night';
}

/**
 * Arma la lista de mensajes posibles para el momento del día actual:
 * si hay un nombre guardado, mezcla las plantillas personalizadas (ya con
 * el nombre puesto) con las genéricas; si no, usa solo las genéricas.
 * Elegir entre ambas evita que el mensaje repita el nombre cada vez y hace
 * que la app se sienta más variada de una abierta a otra.
 */
function buildMessagePool(userName: string | null | undefined, group: ReminderMomentGroup): string[] {
  const generic = GENERIC_MESSAGES_BY_MOMENT[group];
  if (!userName) return generic;

  const personalized = PERSONALIZED_TEMPLATES_BY_MOMENT[group].map((template) =>
    template.replace('{name}', userName),
  );
  return [...personalized, ...generic];
}

function pickMessage(userName: string | null | undefined): string {
  const pool = buildMessagePool(userName, getMomentGroup());
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}

/**
 * Tarjeta principal de bienvenida: un degradado azul con el saludo, un
 * mensaje motivador que cambia según la hora (y, si conocemos el nombre
 * del usuario, también según quién es), y una pequeña ilustración de
 * gotas flotantes. Es lo primero que ve el usuario, así que concentra
 * buena parte de la "personalidad" amigable de la app.
 */
export default function MotivationalMessage({ userName }: MotivationalMessageProps) {
  const message = useRef(pickMessage(userName)).current;
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
          <Text style={styles.greeting}>
            {userName ? `${greeting}, ${userName}` : greeting} 👋
          </Text>
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
