// Service d'upload d'images - Support ImgBB (gratuit et sans limite)
import axios from 'axios';

// ImgBB API Key (gratuit - 5000 requêtes/heure)
// Pour obtenir votre clé: https://api.imgbb.com/
const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY || 'votre_cle_imgbb';
const IMGBB_UPLOAD_URL = 'https://api.imgbb.com/1/upload';

class ImageUploadService {
  /**
   * Upload une image vers ImgBB
   * @param {File} file - Fichier image à uploader
   * @param {Function} onProgress - Callback pour la progression (0-100)
   * @returns {Promise<string>} URL de l'image uploadée
   */
  async uploadImage(file, onProgress = null) {
    try {
      // Validation du fichier
      this.validateImage(file);

      // Conversion en base64
      const base64 = await this.fileToBase64(file);

      // Préparation des données
      const formData = new FormData();
      formData.append('image', base64.split(',')[1]); // Enlever le préfixe data:image...
      formData.append('key', IMGBB_API_KEY);
      formData.append('name', file.name);

      // Upload avec suivi de progression
      const response = await axios.post(IMGBB_UPLOAD_URL, formData, {
        onUploadProgress: (progressEvent) => {
          if (onProgress) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percentCompleted);
          }
        },
      });

      if (response.data.success) {
        return response.data.data.url;
      } else {
        throw new Error('Erreur lors de l\'upload de l\'image');
      }
    } catch (error) {
      console.error('Erreur upload image:', error);
      throw new Error(error.response?.data?.error?.message || 'Échec de l\'upload de l\'image');
    }
  }

  /**
   * Upload multiple images
   * @param {FileList|File[]} files - Liste de fichiers
   * @param {Function} onProgress - Callback pour la progression globale
   * @returns {Promise<string[]>} URLs des images uploadées
   */
  async uploadMultipleImages(files, onProgress = null) {
    const filesArray = Array.from(files);
    const totalFiles = filesArray.length;
    let completedFiles = 0;

    const uploadPromises = filesArray.map(async (file) => {
      const url = await this.uploadImage(file, (fileProgress) => {
        // Calculer la progression globale
        if (onProgress) {
          const globalProgress = Math.round(
            ((completedFiles + fileProgress / 100) * 100) / totalFiles
          );
          onProgress(globalProgress);
        }
      });
      completedFiles++;
      return url;
    });

    return await Promise.all(uploadPromises);
  }

  /**
   * Valide un fichier image
   * @param {File} file - Fichier à valider
   * @throws {Error} Si le fichier est invalide
   */
  validateImage(file) {
    // Taille maximale: 32 MB (limite ImgBB)
    const MAX_SIZE = 32 * 1024 * 1024; // 32MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

    if (!file) {
      throw new Error('Aucun fichier sélectionné');
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new Error('Format d\'image non supporté. Utilisez JPG, PNG, GIF ou WebP');
    }

    if (file.size > MAX_SIZE) {
      throw new Error('L\'image est trop volumineuse (max: 32MB)');
    }
  }

  /**
   * Convertit un fichier en base64
   * @param {File} file - Fichier à convertir
   * @returns {Promise<string>} String base64
   */
  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  }

  /**
   * Compresse une image avant upload (optionnel)
   * @param {File} file - Fichier à compresser
   * @param {number} maxWidth - Largeur maximale
   * @param {number} quality - Qualité (0-1)
   * @returns {Promise<File>} Fichier compressé
   */
  async compressImage(file, maxWidth = 1920, quality = 0.8) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;

        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Redimensionner si nécessaire
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            },
            file.type,
            quality
          );
        };

        img.onerror = reject;
      };

      reader.onerror = reject;
    });
  }

  /**
   * Vérifie si l'URL est une image valide
   * @param {string} url - URL à vérifier
   * @returns {Promise<boolean>}
   */
  async isValidImageUrl(url) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;

      // Timeout après 5 secondes
      setTimeout(() => resolve(false), 5000);
    });
  }
}

export default new ImageUploadService();
