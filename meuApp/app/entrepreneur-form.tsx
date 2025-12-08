// app/entrepreneur-form.tsx
import React, { useState } from 'react';
import { router, useRouter } from "expo-router";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useAuth } from '../contexts/AuthContext';
import { GlobalStyles, Colors } from '../styles/theme';


const EntrepreneurFormScreen = () => {
  const router = useRouter();
  const { updateUser } = useAuth();
  
  // Informações básicas
  const [businessName, setBusinessName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  
  // Sobre o negócio
  const [businessDescription, setBusinessDescription] = useState('');
  const [bio, setBio] = useState('');
  const [mission, setMission] = useState('');
  const [foundedYear, setFoundedYear] = useState('');
  const [businessType, setBusinessType] = useState<'fisica' | 'online' | 'hibrida'>('fisica');
  const [workingHours, setWorkingHours] = useState('');
  
  // Contatos
  const [phoneWhatsApp, setPhoneWhatsApp] = useState('');
  const [website, setWebsite] = useState('');
  const [instagram, setInstagram] = useState('');
  
  // Diferenciais/Serviços
  const [servicesText, setServicesText] = useState('');
  
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!businessName || !cnpj || !address || !city || !state) {
      Toast.show({
        type: 'error',
        text1: 'Atenção',
        text2: 'Preencha os campos obrigatórios!',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 50,
      });
      return;
    }

    setLoading(true);

    // Converter serviços de texto para array
    const servicesArray = servicesText
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    // Salvar as informações do negócio no perfil do usuário
    const result = await updateUser({
      businessName,
      cnpj,
      address,
      city,
      state,
      businessDescription: businessDescription || undefined,
      bio: bio || undefined,
      mission: mission || undefined,
      foundedYear: foundedYear || undefined,
      businessType,
      workingHours: workingHours || undefined,
      phoneWhatsApp: phoneWhatsApp || undefined,
      website: website || undefined,
      instagram: instagram || undefined,
      services: servicesArray.length > 0 ? servicesArray : undefined,
      profileType: 'empreendedor',
    });

    setLoading(false);

    if (result.success) {
      Toast.show({
        type: 'success',
        text1: 'Sucesso!',
        text2: 'Informações do negócio salvas!',
        visibilityTime: 2500,
        autoHide: true,
        topOffset: 50,
      });
      
      setTimeout(() => {
        router.replace('/home');
      }, 1000);
    } else {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: result.error || 'Não foi possível salvar',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 50,
      });
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={[GlobalStyles.heading, styles.title]}>Configure seu Negócio</Text>
        <Text style={[GlobalStyles.subtitle, styles.subtitle]}>Complete as informações da sua livraria</Text>
      </View>

      {/* Informações Básicas */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="business" size={20} color="#4CAF50" />
          <Text style={styles.sectionTitle}>Informações Básicas *</Text>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Nome da Livraria *"
          value={businessName}
          onChangeText={setBusinessName}
          placeholderTextColor="#999"
        />
        <TextInput
          style={styles.input}
          placeholder="CNPJ *"
          value={cnpj}
          onChangeText={setCnpj}
          keyboardType="numeric"
          placeholderTextColor="#999"
        />
        <TextInput
          style={styles.input}
          placeholder="Endereço completo *"
          value={address}
          onChangeText={setAddress}
          placeholderTextColor="#999"
        />
        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.inputHalf]}
            placeholder="Cidade *"
            value={city}
            onChangeText={setCity}
            placeholderTextColor="#999"
          />
          <TextInput
            style={[styles.input, styles.inputHalf]}
            placeholder="Estado *"
            value={state}
            onChangeText={setState}
            maxLength={2}
            autoCapitalize="characters"
            placeholderTextColor="#999"
          />
        </View>
      </View>

      {/* Sobre o Negócio */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="information-circle" size={20} color="#4CAF50" />
          <Text style={styles.sectionTitle}>Sobre o Negócio</Text>
        </View>

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Descrição curta (ex: Livraria independente especializada em literatura contemporânea)"
          value={businessDescription}
          onChangeText={setBusinessDescription}
          multiline
          numberOfLines={3}
          placeholderTextColor="#999"
        />

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Missão da livraria (ex: Promover o acesso à leitura e incentivar autores nacionais)"
          value={mission}
          onChangeText={setMission}
          multiline
          numberOfLines={3}
          placeholderTextColor="#999"
        />

        <TextInput
          style={styles.input}
          placeholder="Ano de fundação (ex: 2019)"
          value={foundedYear}
          onChangeText={setFoundedYear}
          keyboardType="numeric"
          maxLength={4}
          placeholderTextColor="#999"
        />

        {/* Tipo de Negócio */}
        <Text style={styles.label}>Tipo de Negócio</Text>
        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[styles.typeButton, businessType === 'fisica' && styles.typeButtonActive]}
            onPress={() => setBusinessType('fisica')}
          >
            <Ionicons 
              name="storefront" 
              size={20} 
              color={businessType === 'fisica' ? '#fff' : '#4CAF50'} 
            />
            <Text style={[styles.typeButtonText, businessType === 'fisica' && styles.typeButtonTextActive]}>
              Física
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.typeButton, businessType === 'online' && styles.typeButtonActive]}
            onPress={() => setBusinessType('online')}
          >
            <Ionicons 
              name="globe" 
              size={20} 
              color={businessType === 'online' ? '#fff' : '#4CAF50'} 
            />
            <Text style={[styles.typeButtonText, businessType === 'online' && styles.typeButtonTextActive]}>
              Online
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.typeButton, businessType === 'hibrida' && styles.typeButtonActive]}
            onPress={() => setBusinessType('hibrida')}
          >
            <Ionicons 
              name="layers" 
              size={20} 
              color={businessType === 'hibrida' ? '#fff' : '#4CAF50'} 
            />
            <Text style={[styles.typeButtonText, businessType === 'hibrida' && styles.typeButtonTextActive]}>
              Híbrida
            </Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Horário de funcionamento (ex: Seg-Sex 9h-18h)"
          value={workingHours}
          onChangeText={setWorkingHours}
          placeholderTextColor="#999"
        />
      </View>

      {/* História */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="book" size={20} color="#4CAF50" />
          <Text style={styles.sectionTitle}>Sua História</Text>
        </View>

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Conte a história do seu negócio e sua paixão por livros..."
          value={bio}
          onChangeText={setBio}
          multiline
          numberOfLines={5}
          placeholderTextColor="#999"
        />
      </View>

      {/* Contatos */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="call" size={20} color="#4CAF50" />
          <Text style={styles.sectionTitle}>Contatos</Text>
        </View>

        <View style={styles.inputWithIcon}>
          <Ionicons name="logo-whatsapp" size={20} color="#25D366" style={styles.inputIcon} />
          <TextInput
            style={[styles.input, styles.inputWithIconPadding]}
            placeholder="WhatsApp (com DDD)"
            value={phoneWhatsApp}
            onChangeText={setPhoneWhatsApp}
            keyboardType="phone-pad"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputWithIcon}>
          <Ionicons name="globe-outline" size={20} color="#4CAF50" style={styles.inputIcon} />
          <TextInput
            style={[styles.input, styles.inputWithIconPadding]}
            placeholder="Website (ex: www.livraria.com)"
            value={website}
            onChangeText={setWebsite}
            keyboardType="url"
            autoCapitalize="none"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputWithIcon}>
          <Ionicons name="logo-instagram" size={20} color="#E4405F" style={styles.inputIcon} />
          <TextInput
            style={[styles.input, styles.inputWithIconPadding]}
            placeholder="Instagram (@usuário)"
            value={instagram}
            onChangeText={setInstagram}
            autoCapitalize="none"
            placeholderTextColor="#999"
          />
        </View>
      </View>

      {/* Diferenciais/Serviços */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="star" size={20} color="#4CAF50" />
          <Text style={styles.sectionTitle}>Diferenciais e Serviços</Text>
        </View>

        <Text style={styles.helperText}>
          Digite um diferencial por linha (ex: Clube do livro mensal, Café literário, etc.)
        </Text>

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder={"Clube do livro mensal\nVenda de livros usados\nEnvio para todo Brasil\nEventos culturais"}
          value={servicesText}
          onChangeText={setServicesText}
          multiline
          numberOfLines={6}
          placeholderTextColor="#999"
        />
      </View>

      {/* Botão de Enviar */}
      <TouchableOpacity 
        style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <>
            <Text style={styles.submitButtonText}>Salvar e Continuar</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </>
        )}
      </TouchableOpacity>

      <Text style={styles.footnote}>* Campos obrigatórios</Text>

      <Toast />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 28,
    color: '#2E7D32',
    marginBottom: 5,
  },
  subtitle: {
    color: Colors.onSurface,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 10,
    marginTop: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E9ECEF',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 15,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  inputHalf: {
    flex: 1,
  },
  inputWithIcon: {
    position: 'relative',
    marginBottom: 15,
  },
  inputIcon: {
    position: 'absolute',
    left: 16,
    top: 14,
    zIndex: 1,
  },
  inputWithIconPadding: {
    paddingLeft: 45,
    marginBottom: 0,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4CAF50',
    backgroundColor: '#fff',
  },
  typeButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  helperText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    margin: 20,
    marginTop: 10,
  },
  submitButtonDisabled: {
    backgroundColor: '#A5D6A7',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  footnote: {
    textAlign: 'center',
    color: '#999',
    fontSize: 13,
    marginBottom: 30,
  },
});

export default EntrepreneurFormScreen;