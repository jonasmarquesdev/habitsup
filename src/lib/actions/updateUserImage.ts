"use server";

import { prisma } from "@/lib/prisma";
import { uploadUserImage, deleteUserImage } from "@/lib/uploadImage";

export async function updateUserImage(userId: string, file: File) {
  try {
    // Buscar usuário atual
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { image: true }
    });

    if (!user) {
      return { success: false, message: "Usuário não encontrado" };
    }

    // Fazer upload da nova imagem
    const newImageUrl = await uploadUserImage(file, userId);

    // Atualizar no banco de dados
    await prisma.user.update({
      where: { id: userId },
      data: { image: newImageUrl }
    });

    // Deletar imagem anterior se existir
    if (user.image) {
      try {
        await deleteUserImage(user.image);
      } catch (error) {
        console.warn('Não foi possível deletar a imagem anterior:', error);
      }
    }

    return { 
      success: true, 
      message: "Imagem atualizada com sucesso",
      imageUrl: newImageUrl 
    };
  } catch (error: unknown) {
    console.error("Erro ao atualizar imagem do usuário:", error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Erro interno do servidor" 
    };
  }
}
