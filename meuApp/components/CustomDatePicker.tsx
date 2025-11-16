/* eslint-disable @typescript-eslint/no-unused-expressions */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';

interface CustomDatePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  mode?: 'date' | 'time' | 'datetime';
  label: string;
  required?: boolean;
}

export default function CustomDatePicker({
  value,
  onChange,
  mode = 'datetime',
  label,
  required = false,
}: CustomDatePickerProps) {
  const [tempDate, setTempDate] = useState(value);
  const [showIOSPicker, setShowIOSPicker] = useState(false);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: mode !== 'date' ? '2-digit' : undefined,
      minute: mode !== 'date' ? '2-digit' : undefined,
    }).format(date);
  };

  const handleAndroidPress = () => {
    if (Platform.OS !== 'android') return;

    // Abre o picker de data
    DateTimePickerAndroid.open({
      value: value,
      mode: mode === 'datetime' ? 'date' : mode,
      onChange: (event, selectedDate) => {
        if (event.type === 'set' && selectedDate) {
          if (mode === 'datetime') {
            // Se for datetime, após selecionar data, abre picker de hora
            DateTimePickerAndroid.open({
              value: selectedDate,
              mode: 'time',
              onChange: (timeEvent, selectedTime) => {
                if (timeEvent.type === 'set' && selectedTime) {
                  onChange(selectedTime);
                }
              },
            });
          } else {
            onChange(selectedDate);
          }
        }
      },
    });
  };

  const handleIOSDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setTempDate(selectedDate);
    }
  };

  const handleIOSConfirm = () => {
    onChange(tempDate);
    setShowIOSPicker(false);
  };

  const handleIOSCancel = () => {
    setTempDate(value);
    setShowIOSPicker(false);
  };

  const handlePress = () => {
    if (Platform.OS === 'android') {
      handleAndroidPress();
    } else {
      setShowIOSPicker(true);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>
      
      <TouchableOpacity
        style={styles.dateButton}
        onPress={handlePress}
      >
        <Ionicons name="calendar" size={20} color="#2E7D32" />
        <Text style={styles.dateButtonText}>{formatDate(value)}</Text>
        <Ionicons name="chevron-down" size={20} color="#666" />
      </TouchableOpacity>

      {/* Modal para iOS */}
      {Platform.OS === 'ios' && (
        <Modal
          visible={showIOSPicker}
          transparent
          animationType="slide"
          onRequestClose={handleIOSCancel}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={handleIOSCancel}>
                  <Text style={styles.cancelText}>Cancelar</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>{label}</Text>
                <TouchableOpacity onPress={handleIOSConfirm}>
                  <Text style={styles.confirmText}>Confirmar</Text>
                </TouchableOpacity>
              </View>
              
              <DateTimePicker
                value={tempDate}
                mode={mode}
                display="spinner"
                onChange={handleIOSDateChange}
                locale="pt-BR"
                style={styles.picker}
              />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  required: {
    color: '#F44336',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  dateButtonText: {
    flex: 1,
    fontSize: 15,
    color: '#333',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  cancelText: {
    fontSize: 16,
    color: '#666',
  },
  confirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
  },
  picker: {
    height: 200,
  },
});
