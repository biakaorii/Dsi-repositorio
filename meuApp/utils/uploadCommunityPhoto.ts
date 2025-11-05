// utils/uploadCommunityPhoto.ts
import { supabase } from '../config/supabaseConfig';

/**
 * Faz upload de uma foto de comunidade para o Supabase Storage
 * @param uri - URI da imagem local
 * @param communityId - ID da comunidade
 * @returns URL pública da imagem ou null em caso de erro
 */
export async function uploadCommunityPhoto(uri: string, communityId: string): Promise<string | null> {
  try {
    // Extrair o nome do arquivo e extensão
    const fileName = uri.split('/').pop();
    const fileExt = fileName?.split('.').pop() || 'jpg';
    const filePath = `communities/${communityId}/cover.${fileExt}`;

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
      console.error('Erro ao fazer upload da foto da comunidade:', error);
      return null;
    }

    // Obter URL pública
    const { data: publicUrlData } = supabase.storage
      .from('photos')
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Erro ao processar upload da foto da comunidade:', error);
    return null;
  }
}

/**
 * Deleta a foto da comunidade do Supabase Storage
 * @param communityId - ID da comunidade
 * @returns true se deletado com sucesso, false caso contrário
 */
export async function deleteCommunityPhoto(communityId: string): Promise<boolean> {
  try {
    // Listar todos os arquivos da comunidade
    const { data: files, error: listError } = await supabase.storage
      .from('photos')
      .list(`communities/${communityId}`);

    if (listError || !files || files.length === 0) {
      return true; // Nenhum arquivo para deletar
    }

    // Deletar todos os arquivos de capa da comunidade
    const filesToDelete = files.map(file => `communities/${communityId}/${file.name}`);
    const { error: deleteError } = await supabase.storage
      .from('photos')
      .remove(filesToDelete);

    if (deleteError) {
      console.error('Erro ao deletar foto da comunidade:', deleteError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro ao processar deleção da foto da comunidade:', error);
    return false;
  }
}
