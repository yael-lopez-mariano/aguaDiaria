import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/colors';
import { InfoTopic } from '../constants/info';

interface InfoButtonProps {
  info: InfoTopic;
}

/**
 * Pequeño botón circular con una "i" que, al tocarlo, abre una ventana
 * con una explicación breve de la sección donde está colocado.
 */
export default function InfoButton({ info }: InfoButtonProps) {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => setVisible(true)}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel={`Información: ${info.title}`}
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
      >
        <Text style={styles.buttonText}>i</Text>
      </Pressable>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <Pressable style={styles.backdrop} onPress={() => setVisible(false)}>
          <Pressable style={styles.card} onPress={() => {}}>
            <View style={styles.headerRow}>
              <View style={styles.headerIcon}>
                <Text style={styles.headerIconText}>i</Text>
              </View>
              <Text style={styles.title}>{info.title}</Text>
            </View>

            {info.points.map((point, index) => (
              <View key={index} style={styles.pointRow}>
                <Text style={styles.bullet}>💧</Text>
                <Text style={styles.pointText}>{point}</Text>
              </View>
            ))}

            <Pressable
              onPress={() => setVisible(false)}
              style={({ pressed }) => [styles.closeButton, pressed && styles.buttonPressed]}
            >
              <Text style={styles.closeText}>Entendido</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: colors.teal,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  buttonPressed: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 13,
    lineHeight: 15,
    fontWeight: '800',
    fontStyle: 'italic',
    color: colors.teal,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(11, 57, 84, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  headerIconText: {
    fontSize: 17,
    fontWeight: '800',
    fontStyle: 'italic',
    color: colors.textOnPrimary,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  pointRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  bullet: {
    fontSize: 12,
    width: 22,
    marginTop: 2,
  },
  pointText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  closeButton: {
    marginTop: 18,
    alignSelf: 'flex-end',
    backgroundColor: colors.teal,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  closeText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textOnPrimary,
  },
});
