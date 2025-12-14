import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useRouter } from "expo-router";
import BottomNavBar from "@/components/BottomNavBar";

export default function PerfilScreen() {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();
  const { colors, toggleTheme, isDark } = useTheme();

  const handleLogout = async () => {
    try {
      await signOut();
      router.replace("/login");
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[{ textAlign: "center", marginTop: 50, color: colors.text }]}>Nenhum usuário logado</Text>
      </View>
    );
  }

  const isEntrepreneur = user.profileType === "empreendedor";
  const displayName = isEntrepreneur ? user.businessName || "Livraria" : user.name || "Usuário";
  const bio = user.readingGoal || user.bio || "Leitor ávido";
  const profileImageUrl = user.profilePhotoUrl ? `${user.profilePhotoUrl}?t=${Date.now()}` :
    "https://static.vecteezy.com/system/resources/thumbnails/019/879/186/small/user-icon-on-transparent-background-free-png.png";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.primary }]}>Perfil</Text>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View style={styles.profileSection}>
          <Image source={{ uri: profileImageUrl }} style={styles.profileImage} />
          <Text style={[styles.profileName, { color: colors.text }]}>{displayName}</Text>
          <Text style={[styles.profileSubtitle, { color: colors.textSecondary }]}>{bio}</Text>

          {!isEntrepreneur && (
            <TouchableOpacity style={[styles.progressButton, { backgroundColor: colors.primary }]} onPress={() => router.push("/progresso") }>
              <Ionicons name="trending-up-outline" size={18} color="#fff" />
              <Text style={styles.progressButtonText}>Acompanhar Progresso</Text>
            </TouchableOpacity>
          )}
        </View>

        {!isEntrepreneur && (
          <View style={[styles.statsContainer, { backgroundColor: colors.primaryLight }]}>
            <View style={styles.statBox}>
              <Text style={[styles.statNumber, { color: colors.text }]}>0</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Lidos</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statNumber, { color: colors.text }]}>0</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Lendo</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statNumber, { color: colors.text }]}>0</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Salvos</Text>
            </View>
          </View>
        )}

        {!isEntrepreneur && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Gêneros Favoritos</Text>
            <View style={styles.tagsContainer}>
              {user.genres && Array.isArray(user.genres) ? (
                user.genres.filter(g => typeof g === 'string' && g.trim() !== '').map(g => (
                  <View key={g} style={[styles.tag, { backgroundColor: colors.primaryLight }]}><Text style={[styles.tagText, { color: colors.primary }]}>{g}</Text></View>
                ))
              ) : (
                <Text style={{ color: colors.textSecondary, fontStyle: "italic" }}>Nenhum gênero selecionado</Text>
              )}
            </View>
          </View>
        )}

        {isEntrepreneur && (
          <>
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>📚 Sobre a Livraria</Text>
              <View style={styles.businessInfoContainer}>
                {user.businessName && (
                  <View style={[styles.infoRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Ionicons name="business" size={22} color={colors.success} />
                    <View style={styles.infoTextContainer}>
                      <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Nome</Text>
                      <Text style={[styles.infoValue, { color: colors.text }]}>{user.businessName}</Text>
                    </View>
                  </View>
                )}

                {user.businessDescription && (
                  <View style={[styles.infoRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Ionicons name="information-circle" size={22} color={colors.success} />
                    <View style={styles.infoTextContainer}>
                      <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Descrição</Text>
                      <Text style={[styles.infoValue, { color: colors.text }]}>{user.businessDescription}</Text>
                    </View>
                  </View>
                )}

                {user.mission && (
                  <View style={[styles.infoRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Ionicons name="flag" size={22} color={colors.success} />
                    <View style={styles.infoTextContainer}>
                      <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Missão</Text>
                      <Text style={[styles.infoValue, { color: colors.text }]}>{user.mission}</Text>
                    </View>
                  </View>
                )}

                {user.foundedYear && (
                  <View style={[styles.infoRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Ionicons name="calendar" size={22} color={colors.success} />
                    <View style={styles.infoTextContainer}>
                      <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Desde</Text>
                      <Text style={[styles.infoValue, { color: colors.text }]}>{user.foundedYear}</Text>
                    </View>
                  </View>
                )}

                {user.businessType && (
                  <View style={[styles.infoRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Ionicons name={user.businessType === 'fisica' ? 'storefront' : user.businessType === 'online' ? 'globe' : 'layers'} size={22} color={colors.success} />
                    <View style={styles.infoTextContainer}>
                      <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Tipo</Text>
                      <Text style={[styles.infoValue, { color: colors.text }]}>{user.businessType === 'fisica' ? 'Física' : user.businessType === 'online' ? 'Online' : 'Híbrida'}</Text>
                    </View>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>📍 Localização e Horário</Text>
              <View style={styles.businessInfoContainer}>
                {user.address && (
                  <View style={[styles.infoRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Ionicons name="location" size={22} color={colors.success} />
                    <View style={styles.infoTextContainer}>
                      <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Endereço</Text>
                      <Text style={[styles.infoValue, { color: colors.text }]}>{user.address}{user.city && user.state ? `, ${user.city}/${user.state}` : ''}</Text>
                    </View>
                  </View>
                )}
                {user.workingHours && (
                  <View style={[styles.infoRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Ionicons name="time" size={22} color={colors.success} />
                    <View style={styles.infoTextContainer}>
                      <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Horário</Text>
                      <Text style={[styles.infoValue, { color: colors.text }]}>{user.workingHours}</Text>
                    </View>
                  </View>
                )}
              </View>
            </View>

            {user.bio && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>📖 Nossa História</Text>
                <View style={[styles.bioContainer, { backgroundColor: colors.card, borderLeftColor: colors.success }]}><Text style={[styles.bioText, { color: colors.text }]}>{user.bio}</Text></View>
              </View>
            )}

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>📞 Contatos</Text>
              <View style={styles.businessInfoContainer}>
                {user.phoneWhatsApp && (
                  <View style={[styles.contactRow, { backgroundColor: colors.card, borderColor: colors.border }]}><Ionicons name="logo-whatsapp" size={22} color="#25D366" /><View style={styles.infoTextContainer}><Text style={[styles.infoLabel, { color: colors.textSecondary }]}>WhatsApp</Text><Text style={[styles.contactValue, { color: colors.success }]}>{user.phoneWhatsApp}</Text></View></View>
                )}
                {user.website && (
                  <View style={[styles.contactRow, { backgroundColor: colors.card, borderColor: colors.border }]}><Ionicons name="globe-outline" size={22} color={colors.success} /><View style={styles.infoTextContainer}><Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Website</Text><Text style={[styles.infoValue, { color: colors.text }]}>{user.website}</Text></View></View>
                )}
                {user.instagram && (
                  <View style={[styles.contactRow, { backgroundColor: colors.card, borderColor: colors.border }]}><Ionicons name="logo-instagram" size={22} color="#E4405F" /><View style={styles.infoTextContainer}><Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Instagram</Text><Text style={[styles.contactValue, { color: colors.success }]}>@{user.instagram.replace('@','')}</Text></View></View>
                )}
                {user.cnpj && (
                  <View style={[styles.infoRow, { backgroundColor: colors.card, borderColor: colors.border }]}><Ionicons name="document-text" size={22} color={colors.success} /><View style={styles.infoTextContainer}><Text style={[styles.infoLabel, { color: colors.textSecondary }]}>CNPJ</Text><Text style={[styles.infoValue, { color: colors.text }]}>{user.cnpj}</Text></View></View>
                )}
              </View>
            </View>

            {user.services && user.services.length > 0 && (
              <View style={styles.section}><Text style={[styles.sectionTitle, { color: colors.text }]}>⭐ Diferenciais e Serviços</Text><View style={styles.servicesContainer}>{user.services.map((s, i) => (<View key={i} style={[styles.serviceItem, { backgroundColor: colors.primaryLight }]}><Ionicons name="checkmark-circle" size={20} color={colors.success} /><Text style={[styles.serviceText, { color: colors.text }]}>{s}</Text></View>))}</View></View>
            )}

            {!user.businessName && (
              <View style={styles.section}><View style={styles.emptyBusinessInfo}><Ionicons name="information-circle-outline" size={40} color={colors.placeholder} /><Text style={[styles.emptyText, { color: colors.placeholder }]}>Complete as informações do seu negócio em "Editar Perfil"</Text></View></View>
            )}
          </>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Opções</Text>
          
          {/* Botão de Tema */}
          <TouchableOpacity 
            style={[styles.optionButton, { backgroundColor: colors.inputBackground }]} 
            onPress={toggleTheme}
          >
            <Ionicons 
              name={isDark ? "sunny" : "moon"} 
              size={20} 
              color={colors.text} 
            />
            <Text style={[styles.optionText, { color: colors.text }]}>
              Modo {isDark ? "Claro" : "Escuro"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.optionButton, { backgroundColor: colors.inputBackground }]} onPress={() => router.push("/editarPerfil") }>
            <Ionicons name="create-outline" size={20} color={colors.text} />
            <Text style={[styles.optionText, { color: colors.text }]}>Editar Perfil</Text>
          </TouchableOpacity>

          {!isEntrepreneur && (
            <TouchableOpacity style={[styles.optionButton, { backgroundColor: colors.inputBackground }]} onPress={() => router.push("/favoritos" as any)}>
              <Ionicons name="heart-outline" size={20} color={colors.text} />
              <Text style={[styles.optionText, { color: colors.text }]}>Meus Favoritos</Text>
            </TouchableOpacity>
          )}

          {!isEntrepreneur && (
            <TouchableOpacity style={[styles.optionButton, { backgroundColor: colors.inputBackground }]} onPress={() => router.push("/meus-reviews")}>
              <Ionicons name="chatbubbles-outline" size={20} color={colors.text} />
              <Text style={[styles.optionText, { color: colors.text }]}>Meus Reviews</Text>
            </TouchableOpacity>
          )}

          {!isEntrepreneur && (
            <TouchableOpacity style={[styles.optionButton, { backgroundColor: colors.inputBackground }]} onPress={() => router.push("/citacoes" as any)}>
              <Ionicons name="chatbox-ellipses" size={20} color={colors.text} />
              <Text style={[styles.optionText, { color: colors.text }]}>Minhas Citações</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={[styles.optionButton, { backgroundColor: colors.inputBackground }]} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color={colors.error} />
            <Text style={[styles.optionText, { color: colors.error }]}>Sair</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <BottomNavBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { flexDirection: "row", justifyContent: "center", padding: 20, paddingTop: 50, alignItems: "center", borderBottomWidth: 1 },
  headerTitle: { fontSize: 20, fontWeight: "bold" },
  profileSection: { alignItems: "center", marginVertical: 20 },
  profileImage: { width: 100, height: 100, borderRadius: 50, marginBottom: 10 },
  profileName: { fontSize: 18, fontWeight: "bold" },
  profileSubtitle: { fontSize: 14, marginBottom: 15 },
  progressButton: { flexDirection: "row", alignItems: "center", paddingVertical: 10, paddingHorizontal: 20, borderRadius: 25, marginTop: 10 },
  progressButtonText: { marginLeft: 8, fontSize: 14, color: "#fff", fontWeight: "600" },
  statsContainer: { flexDirection: "row", justifyContent: "space-around", paddingVertical: 15, marginHorizontal: 20, borderRadius: 12 },
  statBox: { alignItems: "center" },
  statNumber: { fontSize: 16, fontWeight: "bold" },
  statLabel: { fontSize: 13 },
  section: { marginTop: 20, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 10 },
  tagsContainer: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  tag: { paddingVertical: 5, paddingHorizontal: 12, borderRadius: 20 },
  tagText: { fontSize: 13, fontWeight: "500" },
  optionButton: { flexDirection: "row", alignItems: "center", padding: 12, borderRadius: 10, marginBottom: 10 },
  optionText: { marginLeft: 10, fontSize: 15 },

  businessInfoContainer: { gap: 16 },
  infoRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, padding: 12, borderRadius: 10, borderWidth: 1 },
  infoTextContainer: { flex: 1 },
  infoLabel: { fontSize: 12, marginBottom: 4 },
  infoValue: { fontSize: 15, fontWeight: "500" },

  bioContainer: { padding: 16, borderRadius: 12, borderLeftWidth: 4 },
  bioText: { fontSize: 15, lineHeight: 22 },

  contactRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 10, borderWidth: 1, marginBottom: 10 },
  contactValue: { fontSize: 15, fontWeight: "600" },

  servicesContainer: { gap: 10 },
  serviceItem: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 10 },
  serviceText: { fontSize: 14, flex: 1 },

  emptyBusinessInfo: { alignItems: "center", padding: 30, gap: 10 },
  emptyText: { fontSize: 14, textAlign: "center", fontStyle: "italic" },
});
