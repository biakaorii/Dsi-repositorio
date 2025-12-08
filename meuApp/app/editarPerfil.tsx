// app/editarPerfil.tsx
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Image, Alert, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import Toast from 'react-native-toast-message';
import * as ImagePicker from 'expo-image-picker';
import { uploadProfilePhoto, deleteProfilePhoto } from '@/utils/uploadProfilePhoto';
import { useTheme } from "../contexts/ThemeContext";
import { GlobalStyles, Colors } from '../styles/theme';

export default function EditarPerfilScreen() {
  const router = useRouter();
  const { user, loading: authLoading, updateUser } = useAuth();
  const { colors } = useTheme();

  const [nome, setNome] = useState("");
  const [idade, setIdade] = useState("");
  const [bio, setBio] = useState("");
  const [generosFavoritos, setGenerosFavoritos] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imageKey, setImageKey] = useState(0); // Para forçar reload da imagem
  
  // Estados para empreendedor
  const [businessName, setBusinessName] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");
  const [businessBio, setBusinessBio] = useState(""); // História do empreendedor (separada)
  const [mission, setMission] = useState("");
  const [foundedYear, setFoundedYear] = useState("");
  const [businessType, setBusinessType] = useState<'fisica' | 'online' | 'hibrida'>('fisica');
  const [workingHours, setWorkingHours] = useState("");
  const [phoneWhatsApp, setPhoneWhatsApp] = useState("");
  const [website, setWebsite] = useState("");
  const [instagram, setInstagram] = useState("");
  const [servicesText, setServicesText] = useState("");

  useEffect(() => {
    if (user) {
      setNome(user.name || "");
      setIdade(user.age || "");
      setProfileImage(user.profilePhotoUrl || null);
      
      // Carregar dados do empreendedor se aplicável
      if (user.profileType === 'empreendedor') {
        setBusinessName(user.businessName || "");
        setCnpj(user.cnpj || "");
        setAddress(user.address || "");
        setCity(user.city || "");
        setState(user.state || "");
        setBusinessDescription(user.businessDescription || "");
        setBusinessBio(user.bio || ""); // História do negócio
        setMission(user.mission || "");
        setFoundedYear(user.foundedYear || "");
        setBusinessType(user.businessType || 'fisica');
        setWorkingHours(user.workingHours || "");
        setPhoneWhatsApp(user.phoneWhatsApp || "");
        setWebsite(user.website || "");
        setInstagram(user.instagram || "");
        setServicesText(user.services?.join("\n") || "");
      } else {
        // Para leitores/críticos
        setBio(user.bio || "");
        setGenerosFavoritos(user.genres?.join(", ") || "");
      }
    }
  }, [user]);

  // Solicitar permissões para a galeria
  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão Negada', 'É necessário permitir o acesso à galeria para alterar a foto de perfil.');
      return false;
    }
    return true;
  };

  // Selecionar imagem da galeria
  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      console.log('🔵 Abrindo galeria com editor...');
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true, // ✅ Ativa editor nativo para ajustar
        aspect: [1, 1], // ✅ Formato quadrado/circular
        quality: 0.8,
        allowsMultipleSelection: false,
        // Configurações extras para garantir editor
        presentationStyle: ImagePicker.UIImagePickerPresentationStyle.FULL_SCREEN,
      });

      console.log('🔵 Resultado:', {
        canceled: result.canceled,
        hasAssets: result.assets && result.assets.length > 0,
      });

      if (!result.canceled && result.assets[0]) {
        console.log('✅ Imagem selecionada e ajustada!');
        setProfileImage(result.assets[0].uri);
        
        // Feedback visual de sucesso
        Toast.show({
          type: 'success',
          text1: 'Foto Selecionada! ✓',
          text2: 'Imagem ajustada. Clique em "Salvar" para confirmar',
          visibilityTime: 2500,
          autoHide: true,
          topOffset: 50,
        });
      } else {
        console.log('⚠️ Usuário cancelou a seleção');
      }
    } catch (error) {
      console.error('❌ Erro ao selecionar imagem:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
    }
  };

  const salvarPerfil = async () => {
    if (!user) return;

    setUploading(true);

    try {
      let photoUrl = user.profilePhotoUrl;

      // Se há uma nova imagem, fazer upload
      if (profileImage && profileImage !== user.profilePhotoUrl) {
        console.log('🔵 Nova foto detectada, processando...');
        
        // 1. Deletar foto antiga do Supabase (se existir)
        if (user.profilePhotoUrl) {
          console.log('🗑️ Deletando foto antiga do Supabase...');
          const deleted = await deleteProfilePhoto(user.uid);
          if (deleted) {
            console.log('✅ Foto antiga deletada com sucesso');
          } else {
            console.log('⚠️ Não foi possível deletar foto antiga (pode não existir)');
          }
        }
        
        // 2. Fazer upload da nova foto
        console.log('📤 Fazendo upload da nova foto...');
        const uploadedUrl = await uploadProfilePhoto(profileImage, user.uid);
        
        if (uploadedUrl) {
          console.log('✅ Nova foto enviada com sucesso!');
          photoUrl = uploadedUrl;
          // Adicionar timestamp para forçar reload no Android
          photoUrl = `${uploadedUrl}?t=${Date.now()}`;
        } else {
          console.log('❌ Erro ao fazer upload da nova foto');
          Toast.show({
            type: 'error',
            text1: 'Erro',
            text2: 'Não foi possível fazer upload da foto.',
            visibilityTime: 3000,
            autoHide: true,
            topOffset: 50,
          });
          setUploading(false);
          return; // Não continua se o upload falhar
        }
      }

      // Preparar dados base (sem undefined)
      const updateData: any = {};
      
      // Adicionar foto apenas se existir
      if (photoUrl) {
        updateData.profilePhotoUrl = photoUrl;
      }

      // Adicionar campos específicos por tipo de usuário
      if (user.profileType === 'empreendedor') {
        // Validação: nome da livraria é obrigatório
        if (!businessName || businessName.trim() === '') {
          throw new Error('O nome da livraria é obrigatório');
        }

        // Empreendedores: apenas dados do negócio (sem valores undefined)
        if (businessBio && businessBio.trim()) {
          updateData.bio = businessBio.trim();
        }
        updateData.businessName = businessName.trim();
        
        if (cnpj && cnpj.trim()) updateData.cnpj = cnpj.trim();
        if (address && address.trim()) updateData.address = address.trim();
        if (city && city.trim()) updateData.city = city.trim();
        if (state && state.trim()) updateData.state = state.trim();
        if (businessDescription && businessDescription.trim()) {
          updateData.businessDescription = businessDescription.trim();
        }
        if (mission && mission.trim()) updateData.mission = mission.trim();
        if (foundedYear && foundedYear.trim()) updateData.foundedYear = foundedYear.trim();
        
        updateData.businessType = businessType;
        
        if (workingHours && workingHours.trim()) updateData.workingHours = workingHours.trim();
        if (phoneWhatsApp && phoneWhatsApp.trim()) updateData.phoneWhatsApp = phoneWhatsApp.trim();
        if (website && website.trim()) updateData.website = website.trim();
        if (instagram && instagram.trim()) updateData.instagram = instagram.trim();
        
        const servicesArray = servicesText
          .split('\n')
          .map(s => s.trim())
          .filter(s => s.length > 0);
        if (servicesArray.length > 0) {
          updateData.services = servicesArray;
        }
      } else {
        // Leitores/Críticos: nome, idade, bio, gêneros
        // Converter gêneros de string para array
        const genresArray = generosFavoritos
          .split(",")
          .map((g: string) => g.trim())
          .filter((g: string) => g.length > 0);
        
        if (nome && nome.trim()) updateData.name = nome.trim();
        if (idade && idade.trim()) updateData.age = idade.trim();
        if (bio && bio.trim()) updateData.bio = bio.trim();
        if (genresArray.length > 0) updateData.genres = genresArray;
      }

      console.log('🔵 Dados a serem atualizados:', updateData);
      console.log('🔵 Número de campos:', Object.keys(updateData).length);
      
      // Verificar se há dados para atualizar
      if (Object.keys(updateData).length === 0) {
        throw new Error('Nenhum dado para atualizar');
      }
      
      const result = await updateUser(updateData);
      
      console.log('🔵 Resultado do updateUser:', result);
      
      if (!result.success) {
        console.error('❌ Erro retornado pelo updateUser:', result.error);
        throw new Error(result.error || 'Erro ao atualizar perfil');
      }
      
      console.log('✅ Perfil atualizado com sucesso!');

      // Forçar atualização da imagem no estado local
      if (photoUrl) {
        setProfileImage(photoUrl);
        setImageKey(prev => prev + 1); // Força re-render da imagem
      }

      Toast.show({
        type: 'success',
        text1: 'Perfil Atualizado',
        text2: 'Suas informações foram salvas com sucesso!',
        visibilityTime: 2500,
        autoHide: true,
        topOffset: 50,
      });
      
      setTimeout(() => {
        router.back();
      }, 1000);
    } catch (error: any) {
      console.error('❌ ERRO AO SALVAR PERFIL:', error);
      console.error('❌ Mensagem do erro:', error.message);
      console.error('❌ Stack:', error.stack);
      
      Toast.show({
        type: 'error',
        text1: 'Erro ao Salvar',
        text2: error.message || 'Não foi possível salvar as alterações.',
        visibilityTime: 4000,
        autoHide: true,
        topOffset: 50,
      });
    } finally {
      setUploading(false);
    }
  };

  // Mostrar loading enquanto carrega o usuário
  if (authLoading || !user) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Editar Perfil</Text>
        <TouchableOpacity onPress={salvarPerfil} disabled={uploading}>
          {uploading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text style={[styles.saveButton, { color: colors.primary }]}>Salvar</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Foto de Perfil */}
        <View style={styles.photoSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Foto de Perfil</Text>
          <View style={styles.photoContainer}>
            <View style={styles.photoWrapper}>
              <Image
                key={`profile-${imageKey}`} // Força re-render quando mudar
                source={{
                  uri: profileImage ? `${profileImage}?t=${imageKey}` : "https://static.vecteezy.com/system/resources/thumbnails/019/879/186/small/user-icon-on-transparent-background-free-png.png",
                }}
                style={styles.profilePhoto}
              />
              {profileImage && profileImage !== user?.profilePhotoUrl && (
                <View style={[styles.newPhotoBadge, { backgroundColor: colors.success }]}>
                  <Ionicons name="checkmark-circle" size={24} color={colors.card} />
                </View>
              )}
            </View>
            <TouchableOpacity
              style={[styles.changePhotoButton, { backgroundColor: colors.success }]}
              onPress={pickImage}
              disabled={uploading}
            >
              <Ionicons name="camera" size={20} color={colors.card} />
              <Text style={[styles.changePhotoText, { color: colors.card }]}>
                {uploading ? "Enviando..." : "Escolher e Ajustar Foto"}
              </Text>
            </TouchableOpacity>
            <Text style={[styles.photoHint, { color: colors.textSecondary }]}>
              Você poderá ajustar a posição e zoom da foto
            </Text>
          </View>
        </View>

        {/* Campo Nome - Apenas para Leitores/Críticos */}
        {user.profileType !== 'empreendedor' && (
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Nome Completo</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
              value={nome}
              onChangeText={setNome}
              placeholder="Digite seu nome"
              placeholderTextColor={colors.placeholder}
            />
          </View>
        )}

        {/* Campo Idade - Apenas para Leitores/Críticos */}
        {user.profileType !== 'empreendedor' && (
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Idade</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
              value={idade}
              onChangeText={setIdade}
              placeholder="Digite sua idade"
              placeholderTextColor={colors.placeholder}
              keyboardType="numeric"
              maxLength={3}
            />
          </View>
        )}

        {/* Campo Email (somente leitura) */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Email</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
            value={user.email}
            editable={false}
            placeholderTextColor={colors.placeholder}
          />
        </View>

        {/* Campos para Leitores e Críticos */}
        {user.profileType !== 'empreendedor' && (
          <>
            {/* Campo Bio */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Bio / Descrição</Text>
              <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
                value={bio}
                onChangeText={setBio}
                placeholder="Conte um pouco sobre você..."
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                placeholderTextColor={colors.placeholder}
              />
            </View>

            {/* Campo Gêneros Favoritos */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Gêneros Favoritos</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
                value={generosFavoritos}
                onChangeText={setGenerosFavoritos}
                placeholder="Ex: Fantasia, Romance"
                placeholderTextColor={colors.placeholder}
              />
              <Text style={[styles.hint, { color: colors.textSecondary }]}>Separe os gêneros por vírgula</Text>
            </View>
          </>
        )}

        {/* Campos específicos para Empreendedores */}
        {user.profileType === 'empreendedor' && (
          <>
            <View style={[styles.divider, { borderBottomColor: colors.border }]}>
              <Text style={[styles.dividerText, { color: colors.primary }]}>Informações do Negócio</Text>
            </View>

            {/* Informações Básicas */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>
                <Ionicons name="business" size={16} color={colors.primary} /> Nome da Livraria *
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
                value={businessName}
                onChangeText={setBusinessName}
                placeholder="Ex: Livraria Central"
                placeholderTextColor={colors.placeholder}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>
                <Ionicons name="document-text" size={16} color={colors.primary} /> CNPJ
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
                value={cnpj}
                onChangeText={setCnpj}
                placeholder="00.000.000/0000-00"
                placeholderTextColor={colors.placeholder}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>
                <Ionicons name="location" size={16} color={colors.primary} /> Endereço Completo
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
                value={address}
                onChangeText={setAddress}
                placeholder="Rua, número, bairro"
                placeholderTextColor={colors.placeholder}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 2 }]}>
                <Text style={[styles.label, { color: colors.text }]}>Cidade</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
                  value={city}
                  onChangeText={setCity}
                  placeholder="Cidade"
                  placeholderTextColor={colors.placeholder}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
                <Text style={[styles.label, { color: colors.text }]}>UF</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
                  value={state}
                  onChangeText={setState}
                  placeholder="SP"
                  placeholderTextColor={colors.placeholder}
                  maxLength={2}
                  autoCapitalize="characters"
                />
              </View>
            </View>

            {/* Sobre o Negócio */}
            <View style={[styles.divider, { borderBottomColor: colors.border }]}>
              <Text style={[styles.dividerText, { color: colors.primary }]}>Sobre o Negócio</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>
                <Ionicons name="information-circle" size={16} color={colors.primary} /> Descrição Curta
              </Text>
              <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
                value={businessDescription}
                onChangeText={setBusinessDescription}
                placeholder="Ex: Livraria independente especializada em literatura contemporânea"
                placeholderTextColor={colors.placeholder}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>
                <Ionicons name="flag" size={16} color={colors.primary} /> Missão
              </Text>
              <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
                value={mission}
                onChangeText={setMission}
                placeholder="Ex: Promover o acesso à leitura e incentivar autores nacionais"
                placeholderTextColor={colors.placeholder}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={[styles.label, { color: colors.text }]}>
                  <Ionicons name="calendar" size={16} color={colors.primary} /> Ano de Fundação
                </Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
                  value={foundedYear}
                  onChangeText={setFoundedYear}
                  placeholder="2019"
                  placeholderTextColor={colors.placeholder}
                  keyboardType="numeric"
                  maxLength={4}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Tipo de Negócio</Text>
              <View style={styles.typeSelector}>
                <TouchableOpacity
                  style={[styles.typeButton, { borderColor: colors.border }, businessType === 'fisica' && { backgroundColor: colors.success }]}
                  onPress={() => setBusinessType('fisica')}
                >
                  <Ionicons 
                    name="storefront" 
                    size={18} 
                    color={businessType === 'fisica' ? colors.card : colors.success} 
                  />
                  <Text style={[styles.typeButtonText, { color: businessType === 'fisica' ? colors.card : colors.text }]}>
                    Física
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.typeButton, { borderColor: colors.border }, businessType === 'online' && { backgroundColor: colors.success }]}
                  onPress={() => setBusinessType('online')}
                >
                  <Ionicons 
                    name="globe" 
                    size={18} 
                    color={businessType === 'online' ? colors.card : colors.success} 
                  />
                  <Text style={[styles.typeButtonText, { color: businessType === 'online' ? colors.card : colors.text }]}>
                    Online
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.typeButton, { borderColor: colors.border }, businessType === 'hibrida' && { backgroundColor: colors.success }]}
                  onPress={() => setBusinessType('hibrida')}
                >
                  <Ionicons 
                    name="layers" 
                    size={18} 
                    color={businessType === 'hibrida' ? colors.card : colors.success} 
                  />
                  <Text style={[styles.typeButtonText, { color: businessType === 'hibrida' ? colors.card : colors.text }]}>
                    Híbrida
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>
                <Ionicons name="time" size={16} color={colors.primary} /> Horário de Funcionamento
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
                value={workingHours}
                onChangeText={setWorkingHours}
                placeholder="Ex: Seg-Sex 9h-18h, Sáb 9h-13h"
                placeholderTextColor={colors.placeholder}
              />
            </View>

            {/* História */}
            <View style={[styles.divider, { borderBottomColor: colors.border }]}>
              <Text style={[styles.dividerText, { color: colors.primary }]}>Sua História</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>
                <Ionicons name="book" size={16} color={colors.primary} /> Conte sua história
              </Text>
              <Text style={[styles.hint, { color: colors.textSecondary }]}>
                Compartilhe sua paixão por livros e a história do seu negócio
              </Text>
              <TextInput
                style={[styles.input, styles.textArea, { height: 120, backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
                value={businessBio}
                onChangeText={setBusinessBio}
                placeholder="Conte a história do seu negócio..."
                placeholderTextColor={colors.placeholder}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>

            {/* Contatos */}
            <View style={[styles.divider, { borderBottomColor: colors.border }]}>
              <Text style={[styles.dividerText, { color: colors.primary }]}>Contatos</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>
                <Ionicons name="logo-whatsapp" size={16} color="#25D366" /> WhatsApp
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
                value={phoneWhatsApp}
                onChangeText={setPhoneWhatsApp}
                placeholder="(11) 98765-4321"
                placeholderTextColor={colors.placeholder}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>
                <Ionicons name="globe-outline" size={16} color={colors.primary} /> Website
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
                value={website}
                onChangeText={setWebsite}
                placeholder="www.minhaliv raria.com"
                placeholderTextColor={colors.placeholder}
                keyboardType="url"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>
                <Ionicons name="logo-instagram" size={16} color="#E4405F" /> Instagram
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
                value={instagram}
                onChangeText={setInstagram}
                placeholder="@minhalivraria"
                placeholderTextColor={colors.placeholder}
                autoCapitalize="none"
              />
            </View>

            {/* Diferenciais/Serviços */}
            <View style={[styles.divider, { borderBottomColor: colors.border }]}>
              <Text style={[styles.dividerText, { color: colors.primary }]}>Diferenciais e Serviços</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>
                <Ionicons name="star" size={16} color={colors.primary} /> Serviços Oferecidos
              </Text>
              <Text style={[styles.hint, { color: colors.textSecondary }]}>
                Digite um diferencial por linha
              </Text>
              <TextInput
                style={[styles.input, styles.textArea, { height: 120, backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
                value={servicesText}
                onChangeText={setServicesText}
                placeholder={"Clube do livro mensal\nVenda de livros usados\nEnvio para todo Brasil"}
                placeholderTextColor={colors.placeholder}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>
          </>
        )}

        {/* Botão Salvar Principal */}
        <TouchableOpacity 
          style={[styles.saveButtonMain, { backgroundColor: uploading ? colors.border : colors.success }]} 
          onPress={salvarPerfil}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator size="small" color={colors.card} />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color={colors.card} />
              <Text style={[styles.saveButtonText, { color: colors.card }]}>Salvar Alterações</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
},

  container: { 
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 50,
    borderBottomWidth: 1,
  },
  headerTitle: { 
    fontSize: 20, 
    fontWeight: "bold",
  },
  saveButton: {
    fontSize: 16,
    fontWeight: "600",
  },

  content: {
    flex: 1,
    padding: 20,
  },

  photoSection: {
    alignItems: "center",
    marginBottom: 30,
    paddingVertical: 20,
  },
  photoContainer: {
    alignItems: "center",
  },
  photoWrapper: {
    position: "relative",
    marginBottom: 15,
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
    borderWidth: 3,
  },
  newPhotoBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
  },
  changePhotoButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  changePhotoText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  photoHint: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 10,
    fontStyle: "italic",
  },

  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    minHeight: 80,
    paddingTop: 12,
  },
  hint: {
    fontSize: 12,
    marginTop: 4,
    fontStyle: "italic",
  },

  divider: {
    marginVertical: 24,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    alignItems: "center",
  },
  dividerText: {
    fontSize: 16,
    fontWeight: "700",
  },

  section: {
    marginTop: 30,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 15,
  },

  configOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  configOptionLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  configText: {
    fontSize: 16,
    marginLeft: 12,
  },

  saveButtonMain: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
  },

  row: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  typeSelector: {
    flexDirection: "row",
    gap: 8,
    marginTop: 5,
  },
  typeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 2,
  },
  typeButtonText: {
    fontSize: 13,
    fontWeight: "600",
  },

  bottomSpacing: {
    height: 20,
  },
});
