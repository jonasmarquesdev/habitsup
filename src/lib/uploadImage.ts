import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

export async function uploadUserImage(file: File, userId: string): Promise<string> {
  try {
    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Tipo de arquivo não suportado. Use JPEG, PNG ou WebP.');
    }

    // Validar tamanho (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('Arquivo muito grande. Máximo 5MB.');
    }

    // Criar referência única para o arquivo
    const timestamp = Date.now();
    const fileName = `${userId}_${timestamp}.${file.name.split('.').pop()}`;
    const imageRef = ref(storage, `users/avatars/${fileName}`);

    // Fazer upload
    const snapshot = await uploadBytes(imageRef, file);
    
    // Obter URL de download
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Erro ao fazer upload da imagem:', error);
    throw error;
  }
}

export async function deleteUserImage(imageUrl: string): Promise<void> {
  try {
    // Extrair o path da URL do Firebase
    const url = new URL(imageUrl);
    const pathMatch = url.pathname.match(/\/o\/(.+)\?/);
    
    if (pathMatch) {
      const path = decodeURIComponent(pathMatch[1]);
      const imageRef = ref(storage, path);
      await deleteObject(imageRef);
    }
  } catch (error) {
    console.error('Erro ao deletar imagem:', error);
    // Não propagar o erro de deleção para não bloquear a atualização
  }
}
