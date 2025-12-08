// utils/uploadChatImage.ts
import { supabase } from '../config/supabaseConfig';

/**
 * Faz upload de uma imagem de chat para o Supabase Storage
 * @param uri - URI da imagem local
 * @param communityId - ID da comunidade
 * @param messageId - ID único da mensagem
 * @returns URL pública da imagem ou null em caso de erro
 */
export async function uploadChatImage(
  uri: string,
  communityId: string,
  messageId: string
): Promise<string | null> {
  try {
    // Extrair o nome do arquivo e extensão
    const fileName = uri.split('/').pop();
    const fileExt = fileName?.split('.').pop() || 'jpg';
    const filePath = `communities/${communityId}/chat/${messageId}.${fileExt}`;

    // Ler a imagem como blob
    const response = await fetch(uri);
    const blob = await response.blob();
    const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = reject;
      reader.readAsArrayBuffer(blob);
    });

    // Upload para o Supabase Storage
    const { data, error } = await supabase.storage
      .from('photos')
      .upload(filePath, arrayBuffer, {
        contentType: `image/${fileExt}`,
        upsert: false,
      });

    if (error) {
      console.error('Erro ao fazer upload da imagem do chat:', error);
      return null;
    }

    // Obter URL pública
    const { data: publicUrlData } = supabase.storage
      .from('photos')
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Erro ao processar upload da imagem do chat:', error);
    return null;
  }
}
