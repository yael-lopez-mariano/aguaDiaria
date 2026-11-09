/** Texto de ayuda que muestran los botones de información (ⓘ). */
export interface InfoTopic {
  title: string;
  points: string[];
}

export const INFO = {
  progress: {
    title: 'Tu progreso del día',
    points: [
      'El tanque se llena conforme registras agua durante el día.',
      'El porcentaje se calcula con tu meta diaria, que puedes cambiar en Configuración.',
      'Cada día a medianoche el tanque vuelve a empezar desde cero.',
    ],
  },
  quickAdd: {
    title: 'Registrar agua',
    points: [
      'Toca un botón para guardar al instante esa cantidad de agua.',
      'Cada toque crea un registro con la fecha y hora actuales.',
      'Si te equivocaste, puedes borrar el registro desde la pestaña Historial.',
    ],
  },
  dailySummary: {
    title: 'Resumen de hoy',
    points: [
      'Muestra el total tomado y cuántas veces registraste agua.',
      'La mañana va de las 00:00 a las 11:59; la tarde/noche desde las 12:00.',
      'Repartir el agua a lo largo del día es mejor que tomarla toda de golpe.',
    ],
  },
  todayHistory: {
    title: 'Historial de hoy',
    points: [
      'Lista todos los registros de hoy, del más reciente al más antiguo.',
      'Para ver o corregir días anteriores, usa la pestaña Historial.',
    ],
  },
  history: {
    title: 'Historial',
    points: [
      'Elige un día en la parte superior para ver sus registros.',
      'Puedes eliminar un registro si lo agregaste por error.',
      'Tus datos se guardan solo en este dispositivo.',
    ],
  },
  dailyStats: {
    title: 'Tu día hasta ahora',
    points: [
      'Resume cuánto llevas hoy comparado con tu meta.',
      'El mensaje de estado cambia según el porcentaje alcanzado.',
    ],
  },
  weeklyStats: {
    title: 'Tu semana',
    points: [
      'Incluye los últimos 7 días, contando hoy.',
      'Las barras verdes son días en los que cumpliste tu meta.',
      'Un "día con poca agua" es uno en el que tomaste menos de la mitad de tu meta.',
    ],
  },
  goal: {
    title: 'Meta diaria',
    points: [
      'Es la cantidad de agua que quieres tomar cada día.',
      'Una referencia común para adultos es entre 2 y 2.5 litros al día, pero depende de tu peso, clima y actividad.',
      'Si tienes dudas sobre tu caso, consulta a un profesional de la salud.',
    ],
  },
  reminders: {
    title: 'Recordatorios',
    points: [
      'Recibirás avisos a las horas que elijas para recordarte tomar agua.',
      'En el celular necesitas dar permiso de notificaciones a la app.',
      'En la versión web los avisos solo llegan mientras la página está abierta.',
    ],
  },
} satisfies Record<string, InfoTopic>;
