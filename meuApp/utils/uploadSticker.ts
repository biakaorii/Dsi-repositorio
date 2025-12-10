// utils/uploadSticker.ts
import { supabase } from '../config/supabaseConfig';

/**
 * Faz upload de um sticker para o Supabase Storage
 * @param uri - URI da imagem local
 * @param userId - ID do usuário
 * @param stickerId - ID único do sticker
 * @returns URL pública do sticker ou null em caso de erro
 */
export async function uploadSticker(
  uri: string,
  userId: string,
  stickerId: string
): Promise<string | null> {
  try {
    // Extrair o nome do arquivo e extensão
    const fileName = uri.split('/').pop();
    const fileExt = fileName?.split('.').pop() || 'png';
    const filePath = `stickers/${userId}/${stickerId}.${fileExt}`;

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
      console.error('Erro ao fazer upload do sticker:', error);
      return null;
    }

    // Obter URL pública
    const { data: publicUrlData } = supabase.storage
      .from('photos')
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Erro ao processar upload do sticker:', error);
    return null;
  }
}
