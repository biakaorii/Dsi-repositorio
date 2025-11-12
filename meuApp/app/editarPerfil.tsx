// app/editarPerfil.tsx
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Image, Alert, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import Toast from 'react-native-toast-message';
import * as ImagePicker from 'expo-image-picker';
import { uploadProfilePhoto, deleteProfilePhoto } from '@/utils/uploadProfilePhoto';

export default function EditarPerfilScreen() {
  const router = useRouter();
  const { user, loading: authLoading, updateUser } = useAuth();

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
      setBio(user.bio || "");
      setGenerosFavoritos(user.genres?.join(", ") || "");
      setProfileImage(user.profilePhotoUrl || null);
      
      // Carregar dados do empreendedor se aplicável
      if (user.profileType === 'empreendedor') {
        setBusinessName(user.businessName || "");
        setCnpj(user.cnpj || "");
        setAddress(user.address || "");
        setCity(user.city || "");
        setState(user.state || "");
        setBusinessDescription(user.businessDescription || "");
        setMission(user.mission || "");
        setFoundedYear(user.foundedYear || "");
        setBusinessType(user.businessType || 'fisica');
        setWorkingHours(user.workingHours || "");
        setPhoneWhatsApp(user.phoneWhatsApp || "");
        setWebsite(user.website || "");
        setInstagram(user.instagram || "");
        setServicesText(user.services?.join("\n") || "");
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

    // Converter gêneros de string para array
    const genresArray = generosFavoritos
      .split(",")
      .map(g => g.trim())
      .filter(g => g.length > 0);

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

      await updateUser({
        name: nome,
        age: idade,
        bio: bio,
        genres: genresArray,
        profilePhotoUrl: photoUrl,
        // Incluir dados do empreendedor se for o caso
        ...(user.profileType === 'empreendedor' && {
          businessName: businessName,
          cnpj: cnpj,
          address: address,
          city: city,
          state: state,
          businessDescription: businessDescription || undefined,
          mission: mission || undefined,
          foundedYear: foundedYear || undefined,
          businessType: businessType,
          workingHours: workingHours || undefined,
          phoneWhatsApp: phoneWhatsApp || undefined,
          website: website || undefined,
          instagram: instagram || undefined,
          services: servicesText
            .split('\n')
            .map(s => s.trim())
            .filter(s => s.length > 0),
        }),
      });

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
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Não foi possível salvar as alterações.',
        visibilityTime: 3000,
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#2E7D32" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Perfil</Text>
        <TouchableOpacity onPress={salvarPerfil} disabled={uploading}>
          {uploading ? (
            <ActivityIndicator size="small" color="#2E7D32" />
          ) : (
            <Text style={styles.saveButton}>Salvar</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Foto de Perfil */}
        <View style={styles.photoSection}>
          <Text style={styles.sectionTitle}>Foto de Perfil</Text>
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
                <View style={styles.newPhotoBadge}>
                  <Ionicons name="checkmark-circle" size={24} color="#fff" />
                </View>
              )}
            </View>
            <TouchableOpacity
              style={styles.changePhotoButton}
              onPress={pickImage}
              disabled={uploading}
            >
              <Ionicons name="camera" size={20} color="#fff" />
              <Text style={styles.changePhotoText}>
                {uploading ? "Enviando..." : "Escolher e Ajustar Foto"}
              </Text>
            </TouchableOpacity>
            <Text style={styles.photoHint}>
              Você poderá ajustar a posição e zoom da foto
            </Text>
          </View>
        </View>

        {/* Campo Nome */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nome Completo</Text>
          <TextInput
            style={styles.input}
            value={nome}
            onChangeText={setNome}
            placeholder="Digite seu nome"
            placeholderTextColor="#999"
          />
        </View>

        {/* Campo Idade */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Idade</Text>
          <TextInput
            style={styles.input}
            value={idade}
            onChangeText={setIdade}
            placeholder="Digite sua idade"
            placeholderTextColor="#999"
            keyboardType="numeric"
            maxLength={3}
          />
        </View>

        {/* Campo Email (somente leitura) */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={user.email}
            editable={false}
            placeholderTextColor="#999"
          />
        </View>

        {/* Campo Bio */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Bio / Descrição</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={bio}
            onChangeText={setBio}
            placeholder="Conte um pouco sobre você..."
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            placeholderTextColor="#999"
          />
        </View>

        {/* Campo Gêneros Favoritos */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Gêneros Favoritos</Text>
          <TextInput
            style={styles.input}
            value={generosFavoritos}
            onChangeText={setGenerosFavoritos}
            placeholder="Ex: Fantasia, Romance"
            placeholderTextColor="#999"
          />
          <Text style={styles.hint}>Separe os gêneros por vírgula</Text>
        </View>

        {/* Campos específicos para Empreendedores */}
        {user.profileType === 'empreendedor' && (
          <>
            <View style={styles.divider}>
              <Text style={styles.dividerText}>Informações do Negócio</Text>
            </View>

            {/* Informações Básicas */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                <Ionicons name="business" size={16} color="#2E7D32" /> Nome da Livraria *
              </Text>
              <TextInput
                style={styles.input}
                value={businessName}
                onChangeText={setBusinessName}
                placeholder="Ex: Livraria Central"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                <Ionicons name="document-text" size={16} color="#2E7D32" /> CNPJ
              </Text>
              <TextInput
                style={styles.input}
                value={cnpj}
                onChangeText={setCnpj}
                placeholder="00.000.000/0000-00"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                <Ionicons name="location" size={16} color="#2E7D32" /> Endereço Completo
              </Text>
              <TextInput
                style={styles.input}
                value={address}
                onChangeText={setAddress}
                placeholder="Rua, número, bairro"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 2 }]}>
                <Text style={styles.label}>Cidade</Text>
                <TextInput
                  style={styles.input}
                  value={city}
                  onChangeText={setCity}
                  placeholder="Cidade"
                  placeholderTextColor="#999"
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
                <Text style={styles.label}>UF</Text>
                <TextInput
                  style={styles.input}
                  value={state}
                  onChangeText={setState}
                  placeholder="SP"
                  placeholderTextColor="#999"
                  maxLength={2}
                  autoCapitalize="characters"
                />
              </View>
            </View>

            {/* Sobre o Negócio */}
            <View style={styles.divider}>
              <Text style={styles.dividerText}>Sobre o Negócio</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                <Ionicons name="information-circle" size={16} color="#2E7D32" /> Descrição Curta
              </Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={businessDescription}
                onChangeText={setBusinessDescription}
                placeholder="Ex: Livraria independente especializada em literatura contemporânea"
                placeholderTextColor="#999"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                <Ionicons name="flag" size={16} color="#2E7D32" /> Missão
              </Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={mission}
                onChangeText={setMission}
                placeholder="Ex: Promover o acesso à leitura e incentivar autores nacionais"
                placeholderTextColor="#999"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>
                  <Ionicons name="calendar" size={16} color="#2E7D32" /> Ano de Fundação
                </Text>
                <TextInput
                  style={styles.input}
                  value={foundedYear}
                  onChangeText={setFoundedYear}
                  placeholder="2019"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  maxLength={4}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tipo de Negócio</Text>
              <View style={styles.typeSelector}>
                <TouchableOpacity
                  style={[styles.typeButton, businessType === 'fisica' && styles.typeButtonActive]}
                  onPress={() => setBusinessType('fisica')}
                >
                  <Ionicons 
                    name="storefront" 
                    size={18} 
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
                    size={18} 
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
                    size={18} 
                    color={businessType === 'hibrida' ? '#fff' : '#4CAF50'} 
                  />
                  <Text style={[styles.typeButtonText, businessType === 'hibrida' && styles.typeButtonTextActive]}>
                    Híbrida
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                <Ionicons name="time" size={16} color="#2E7D32" /> Horário de Funcionamento
              </Text>
              <TextInput
                style={styles.input}
                value={workingHours}
                onChangeText={setWorkingHours}
                placeholder="Ex: Seg-Sex 9h-18h, Sáb 9h-13h"
                placeholderTextColor="#999"
              />
            </View>

            {/* História */}
            <View style={styles.divider}>
              <Text style={styles.dividerText}>Sua História</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                <Ionicons name="book" size={16} color="#2E7D32" /> Conte sua história
              </Text>
              <Text style={styles.hint}>
                Compartilhe sua paixão por livros e a história do seu negócio
              </Text>
              <TextInput
                style={[styles.input, styles.textArea, { height: 120 }]}
                value={bio}
                onChangeText={setBio}
                placeholder="Conte a história do seu negócio..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>

            {/* Contatos */}
            <View style={styles.divider}>
              <Text style={styles.dividerText}>Contatos</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                <Ionicons name="logo-whatsapp" size={16} color="#25D366" /> WhatsApp
              </Text>
              <TextInput
                style={styles.input}
                value={phoneWhatsApp}
                onChangeText={setPhoneWhatsApp}
                placeholder="(11) 98765-4321"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                <Ionicons name="globe-outline" size={16} color="#2E7D32" /> Website
              </Text>
              <TextInput
                style={styles.input}
                value={website}
                onChangeText={setWebsite}
                placeholder="www.minhaliv raria.com"
                placeholderTextColor="#999"
                keyboardType="url"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                <Ionicons name="logo-instagram" size={16} color="#E4405F" /> Instagram
              </Text>
              <TextInput
                style={styles.input}
                value={instagram}
                onChangeText={setInstagram}
                placeholder="@minhalivraria"
                placeholderTextColor="#999"
                autoCapitalize="none"
              />
            </View>

            {/* Diferenciais/Serviços */}
            <View style={styles.divider}>
              <Text style={styles.dividerText}>Diferenciais e Serviços</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                <Ionicons name="star" size={16} color="#2E7D32" /> Serviços Oferecidos
              </Text>
              <Text style={styles.hint}>
                Digite um diferencial por linha
              </Text>
              <TextInput
                style={[styles.input, styles.textArea, { height: 120 }]}
                value={servicesText}
                onChangeText={setServicesText}
                placeholder={"Clube do livro mensal\nVenda de livros usados\nEnvio para todo Brasil"}
                placeholderTextColor="#999"
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>
          </>
        )}

        {/* Botão Salvar Principal */}
        <TouchableOpacity 
          style={[styles.saveButtonMain, uploading && styles.saveButtonMainDisabled]} 
          onPress={salvarPerfil}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={styles.saveButtonText}>Salvar Alterações</Text>
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
  backgroundColor: "#fff",
},

  container: { 
    flex: 1, 
    backgroundColor: "#fff" 
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
  },
  headerTitle: { 
    fontSize: 20, 
    fontWeight: "bold", 
    color: "#2E7D32" 
  },
  saveButton: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2E7D32",
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
    borderColor: "#2E7D32",
  },
  newPhotoBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#2E7D32",
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  changePhotoButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2E7D32",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  changePhotoText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  photoHint: {
    fontSize: 12,
    color: "#666",
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
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E9ECEF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#F8F9FA",
    color: "#333",
  },
  textArea: {
    minHeight: 80,
    paddingTop: 12,
  },
  hint: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
    fontStyle: "italic",
  },

  divider: {
    marginVertical: 24,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#E9ECEF",
    backgroundColor: "#F1F8E9",
    alignItems: "center",
  },
  dividerText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2E7D32",
  },

  section: {
    marginTop: 30,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 15,
  },

  configOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    marginBottom: 10,
  },
  configOptionLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  configText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 12,
  },

  saveButtonMain: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2E7D32",
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  saveButtonMainDisabled: {
    backgroundColor: "#A5D6A7",
    opacity: 0.6,
  },
  saveButtonText: {
    color: "#fff",
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
    borderColor: "#4CAF50",
    backgroundColor: "#fff",
  },
  typeButtonActive: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  typeButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4CAF50",
  },
  typeButtonTextActive: {
    color: "#fff",
  },

  bottomSpacing: {
    height: 20,
  },
});
