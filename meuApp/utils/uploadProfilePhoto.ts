// utils/uploadProfilePhoto.ts
import { supabase } from '../config/supabaseConfig';
import { decode } from 'base64-arraybuffer';

/**
 * Faz upload de uma foto de perfil para o Supabase Storage
 * @param uri - URI da imagem local
 * @param userId - ID do usuário
 * @returns URL pública da imagem ou null em caso de erro
 */
export async function uploadProfilePhoto(uri: string, userId: string): Promise<string | null> {
  try {
    // Extrair o nome do arquivo e extensão
    const fileName = uri.split('/').pop();
    const fileExt = fileName?.split('.').pop() || 'jpg';
    const filePath = `${userId}/profile.${fileExt}`;

    // Ler a imagem como base64
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
        upsert: true, // Sobrescrever se já existir
      });

    if (error) {
      console.error('Erro ao fazer upload:', error);
      return null;
    }

    // Obter URL pública
    const { data: publicUrlData } = supabase.storage
      .from('photos')
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Erro ao processar upload:', error);
    return null;
  }
}

/**
 * Deleta a foto de perfil do usuário do Supabase Storage
 * @param userId - ID do usuário
 * @returns true se deletado com sucesso, false caso contrário
 */
export async function deleteProfilePhoto(userId: string): Promise<boolean> {
  try {
    // Listar todos os arquivos do usuário
    const { data: files, error: listError } = await supabase.storage
      .from('photos')
      .list(`${userId}`);

    if (listError || !files || files.length === 0) {
      return true; // Nenhum arquivo para deletar
    }

    // Deletar todos os arquivos de perfil do usuário
    const filesToDelete = files.map(file => `${userId}/${file.name}`);
    const { error: deleteError } = await supabase.storage
      .from('photos')
      .remove(filesToDelete);

    if (deleteError) {
      console.error('Erro ao deletar foto:', deleteError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro ao processar deleção:', error);
    return false;
  }
}
