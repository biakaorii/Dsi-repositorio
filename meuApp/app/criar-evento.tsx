import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useEventos } from "../contexts/EventosContext";
import CustomDatePicker from "../components/CustomDatePicker";
import Toast from "react-native-toast-message";

export default function CriarEventoScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { addEvento } = useEventos();

  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [local, setLocal] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [pais, setPais] = useState("Brasil");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [categoria, setCategoria] = useState<"show" | "lancamento" | "encontro" | "feira" | "outro">("show");
  const [linkIngressos, setLinkIngressos] = useState("");
  const [dataInicio, setDataInicio] = useState(new Date());
  const [dataFim, setDataFim] = useState<Date | undefined>();
  const [loading, setLoading] = useState(false);

  // Restaurar dados do formulário se vierem dos params (ao voltar de selecionar localização)
  useEffect(() => {
    if (params.titulo) setTitulo(params.titulo as string);
    if (params.descricao) setDescricao(params.descricao as string);
    if (params.local) setLocal(params.local as string);
    if (params.cidade) setCidade(params.cidade as string);
    if (params.estado) setEstado(params.estado as string);
    if (params.pais) setPais(params.pais as string);
    if (params.categoria) setCategoria(params.categoria as any);
    if (params.linkIngressos) setLinkIngressos(params.linkIngressos as string);
    if (params.dataInicio) setDataInicio(new Date(params.dataInicio as string));
    if (params.dataFim) setDataFim(new Date(params.dataFim as string));
  }, []);

  // Atualizar coordenadas quando retornar da seleção e limpar params
  useEffect(() => {
    if (params.selectedLat && params.selectedLng) {
      setLatitude(params.selectedLat as string);
      setLongitude(params.selectedLng as string);
      
      // Limpar os params para não ficar reaplicando
      router.setParams({
        selectedLat: undefined,
        selectedLng: undefined,
      });
    }
  }, [params.selectedLat, params.selectedLng]);

  const categorias = [
    { id: "show", label: "Show", icon: "musical-notes" },
    { id: "lancamento", label: "Lançamento", icon: "book" },
    { id: "encontro", label: "Encontro", icon: "people" },
    { id: "feira", label: "Feira", icon: "storefront" },
    { id: "outro", label: "Outro", icon: "ellipsis-horizontal" },
  ];

  const handleSelectLocation = () => {
    router.push({
      pathname: "/selecionar-localizacao" as any,
      params: {
        currentLat: latitude || "-23.5505",
        currentLng: longitude || "-46.6333",
        // Passar dados do formulário para não perder ao voltar
        titulo,
        descricao,
        local,
        cidade,
        estado,
        pais,
        categoria,
        linkIngressos,
        dataInicio: dataInicio.toISOString(),
        dataFim: dataFim?.toISOString(),
      },
    });
  };

  const handleSubmit = async () => {
    // Validações
    if (!titulo.trim()) {
      Alert.alert("Erro", "Por favor, informe o título do evento");
      return;
    }

    if (!local.trim()) {
      Alert.alert("Erro", "Por favor, informe o local do evento");
      return;
    }

    if (!cidade.trim()) {
      Alert.alert("Erro", "Por favor, informe a cidade");
      return;
    }

    if (!estado.trim()) {
      Alert.alert("Erro", "Por favor, informe o estado (UF)");
      return;
    }

    if (!latitude.trim() || !longitude.trim()) {
      Alert.alert("Erro", "Por favor, selecione a localização no mapa");
      return;
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      Alert.alert("Erro", "Coordenadas inválidas");
      return;
    }

    setLoading(true);
    const result = await addEvento({
      titulo: titulo.trim(),
      descricao: descricao.trim() || undefined,
      local: local.trim(),
      cidade: cidade.trim(),
      estado: estado.trim().toUpperCase(),
      pais: pais.trim(),
      latitude: lat,
      longitude: lng,
      dataInicio,
      ...(dataFim && { dataFim }), // Só inclui dataFim se estiver definida
      categoria,
      linkIngressos: linkIngressos.trim() || undefined,
    });
    setLoading(false);

    if (result.success) {
      Toast.show({
        type: "success",
        text1: "Evento criado!",
        text2: "Seu evento foi adicionado ao mapa",
        visibilityTime: 2000,
      });
      router.back();
    } else {
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: result.error || "Não foi possível criar o evento",
        visibilityTime: 3000,
      });
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="#2E7D32" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Criar novo evento</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.hint}>
          Campos marcados com <Text style={styles.required}>*</Text> são obrigatórios.
        </Text>

        {/* Título */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Título <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Show da Peppa Pig"
            placeholderTextColor="#999"
            value={titulo}
            onChangeText={setTitulo}
          />
        </View>

        {/* Categoria */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Categoria <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.categoriesGrid}>
            {categorias.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryCard,
                  categoria === cat.id && styles.categoryCardActive,
                ]}
                onPress={() => setCategoria(cat.id as any)}
              >
                <Ionicons
                  name={cat.icon as any}
                  size={24}
                  color={categoria === cat.id ? "#fff" : "#2E7D32"}
                />
                <Text
                  style={[
                    styles.categoryCardText,
                    categoria === cat.id && styles.categoryCardTextActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Local */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Local <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Prédio Lafayette"
            placeholderTextColor="#999"
            value={local}
            onChangeText={setLocal}
          />
        </View>

        {/* Cidade e Estado */}
        <View style={styles.row}>
          <View style={[styles.section, { flex: 2 }]}>
            <Text style={styles.label}>
              Cidade <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Recife"
              placeholderTextColor="#999"
              value={cidade}
              onChangeText={setCidade}
            />
          </View>

          <View style={[styles.section, { flex: 1 }]}>
            <Text style={styles.label}>
              UF <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="PE"
              placeholderTextColor="#999"
              maxLength={2}
              autoCapitalize="characters"
              value={estado}
              onChangeText={setEstado}
            />
          </View>
        </View>

        {/* País */}
        <View style={styles.section}>
          <Text style={styles.label}>País</Text>
          <TextInput
            style={styles.input}
            placeholder="Brasil"
            placeholderTextColor="#999"
            value={pais}
            onChangeText={setPais}
          />
        </View>

        {/* Localização no Mapa */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Localização no Mapa <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity
            style={styles.locationButton}
            onPress={handleSelectLocation}
          >
            <Ionicons name="location" size={20} color="#2E7D32" />
            <Text style={styles.locationButtonText}>
              {latitude && longitude
                ? `${parseFloat(latitude).toFixed(5)}, ${parseFloat(longitude).toFixed(5)}`
                : "Toque para selecionar no mapa"}
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>

          {latitude && longitude && (
            <View style={styles.coordsInputs}>
              <View style={{ flex: 1 }}>
                <Text style={styles.coordLabel}>Latitude (auto)</Text>
                <TextInput
                  style={styles.coordInput}
                  placeholder="-23.5505"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  value={latitude}
                  onChangeText={setLatitude}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.coordLabel}>Longitude (auto)</Text>
                <TextInput
                  style={styles.coordInput}
                  placeholder="-46.6333"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  value={longitude}
                  onChangeText={setLongitude}
                />
              </View>
            </View>
          )}
        </View>

        {/* Data e Horário de Início */}
        <CustomDatePicker
          label="Data e Horário de Início"
          value={dataInicio}
          onChange={setDataInicio}
          mode="datetime"
          required
        />

        {/* Data e Horário de Término (Opcional) */}
        <CustomDatePicker
          label="Data e Horário de Término"
          value={dataFim || new Date()}
          onChange={setDataFim}
          mode="datetime"
        />

        {/* Descrição (Opcional) */}
        <View style={styles.section}>
          <Text style={styles.label}>Descrição</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Descreva o evento..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            value={descricao}
            onChangeText={setDescricao}
            textAlignVertical="top"
          />
        </View>

        {/* Link de Ingressos (Opcional) */}
        <View style={styles.section}>
          <Text style={styles.label}>Link de ingressos</Text>
          <TextInput
            style={styles.input}
            placeholder="https://..."
            placeholderTextColor="#999"
            keyboardType="url"
            autoCapitalize="none"
            value={linkIngressos}
            onChangeText={setLinkIngressos}
          />
        </View>

        {/* Botão Criar */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={24} color="#fff" />
              <Text style={styles.submitButtonText}>Criar evento</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
      </ScrollView>

      <Toast />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
    color: "#2E7D32",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  hint: {
    fontSize: 13,
    color: "#666",
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  required: {
    color: "#F44336",
  },
  input: {
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#E9ECEF",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#333",
  },
  textArea: {
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#E9ECEF",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#333",
    minHeight: 100,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  categoryCard: {
    width: "30%",
    aspectRatio: 1,
    backgroundColor: "#F8F9FA",
    borderWidth: 2,
    borderColor: "#E9ECEF",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  categoryCardActive: {
    backgroundColor: "#2E7D32",
    borderColor: "#2E7D32",
  },
  categoryCardText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2E7D32",
  },
  categoryCardTextActive: {
    color: "#fff",
  },
  locationButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#E9ECEF",
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  locationButtonText: {
    flex: 1,
    fontSize: 15,
    color: "#333",
  },
  coordsInputs: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  coordLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 6,
  },
  coordInput: {
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#E9ECEF",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#333",
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#E9ECEF",
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  dateButtonText: {
    fontSize: 15,
    color: "#333",
  },
  submitButton: {
    flexDirection: "row",
    backgroundColor: "#2E7D32",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButton: {
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 12,
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 15,
    fontWeight: "600",
  },
});
