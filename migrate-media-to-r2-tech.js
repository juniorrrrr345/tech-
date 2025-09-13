const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuration TECH+
const CLOUDFLARE_CONFIG = {
  accountId: '7979421604bd07b3bd34d3ed96222512',
  databaseId: '2ca2d221-5f5b-42fc-8048-8c950561849d',
  apiToken: 'ijkVhaXCw6LSddIMIMxwPL5CDAWznxip5x9I1bNW',
  r2: {
    bucketName: 'boutique-images',
    publicUrl: 'https://pub-b38679a01a274648827751df94818418.r2.dev'
  }
};

// Fonction téléchargement
function downloadFile(url, filename) {
  return new Promise((resolve, reject) => {
    if (!url || url === '') {
      reject(new Error('URL vide'));
      return;
    }
    
    console.log(`📥 Téléchargement: ${url}`);
    const file = fs.createWriteStream(filename);
    
    const request = https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        file.close();
        fs.unlinkSync(filename);
        return downloadFile(response.headers.location, filename).then(resolve).catch(reject);
      }
      
      if (response.statusCode !== 200) {
        file.close();
        fs.unlinkSync(filename);
        reject(new Error(`HTTP ${response.statusCode} pour ${url}`));
        return;
      }
      
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`✅ Téléchargé: ${filename}`);
        resolve(filename);
      });
    });
    
    request.on('error', (err) => {
      file.close();
      if (fs.existsSync(filename)) {
        fs.unlinkSync(filename);
      }
      reject(err);
    });
    
    request.setTimeout(30000, () => {
      request.destroy();
      file.close();
      if (fs.existsSync(filename)) {
        fs.unlinkSync(filename);
      }
      reject(new Error('Timeout de téléchargement'));
    });
  });
}

// Fonction upload R2
async function uploadToR2(filePath, key) {
  const { exec } = require('child_process');
  const { promisify } = require('util');
  const execAsync = promisify(exec);
  
  console.log(`📤 Upload vers R2: ${key}`);
  
  const curlCmd = `curl -X PUT "https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_CONFIG.accountId}/r2/buckets/${CLOUDFLARE_CONFIG.r2.bucketName}/objects/${key}" \\
    -H "Authorization: Bearer ${CLOUDFLARE_CONFIG.apiToken}" \\
    -T "${filePath}"`;
  
  try {
    await execAsync(curlCmd);
    const publicUrl = `${CLOUDFLARE_CONFIG.r2.publicUrl}/${key}`;
    console.log(`✅ Uploadé: ${publicUrl}`);
    return publicUrl;
  } catch (error) {
    console.error(`❌ Erreur upload ${key}:`, error.message);
    throw error;
  }
}

// Fonction update D1
async function updateProductUrl(productId, imageUrl, videoUrl) {
  const { exec } = require('child_process');
  const { promisify } = require('util');
  const execAsync = promisify(exec);
  
  const curlCmd = `curl -s -X POST "https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_CONFIG.accountId}/d1/database/${CLOUDFLARE_CONFIG.databaseId}/query" \\
    -H "Authorization: Bearer ${CLOUDFLARE_CONFIG.apiToken}" \\
    -H "Content-Type: application/json" \\
    --data '{"sql": "UPDATE products SET image_url = ?, video_url = ? WHERE id = ?", "params": ["${imageUrl}", "${videoUrl}", ${productId}]}'`;
  
  try {
    const { stdout } = await execAsync(curlCmd);
    const result = JSON.parse(stdout);
    console.log(`✅ Produit ${productId} mis à jour`);
    return result.success;
  } catch (error) {
    console.error(`❌ Erreur update produit ${productId}:`, error.message);
    return false;
  }
}

// Récupérer les produits D1
async function getProductsFromD1() {
  const { exec } = require('child_process');
  const { promisify } = require('util');
  const execAsync = promisify(exec);
  
  const curlCmd = `curl -s -X POST "https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_CONFIG.accountId}/d1/database/${CLOUDFLARE_CONFIG.databaseId}/query" \\
    -H "Authorization: Bearer ${CLOUDFLARE_CONFIG.apiToken}" \\
    -H "Content-Type: application/json" \\
    --data '{"sql": "SELECT id, name, image_url, video_url FROM products WHERE image_url IS NOT NULL OR video_url IS NOT NULL"}'`;
  
  try {
    const { stdout } = await execAsync(curlCmd);
    const result = JSON.parse(stdout);
    return result.result?.[0]?.results || [];
  } catch (error) {
    console.error('❌ Erreur récupération produits:', error.message);
    return [];
  }
}

// Migration automatique de tous les médias
async function migrateAllMedia() {
  console.log('🖼️ Début migration médias Cloudinary → R2...');
  
  // Créer dossier temporaire
  const tempDir = './temp_media';
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }
  
  try {
    const products = await getProductsFromD1();
    console.log(`📦 ${products.length} produits trouvés avec médias`);
    
    let migratedCount = 0;
    
    for (const product of products) {
      console.log(`\n🔄 Migration produit: ${product.name} (ID: ${product.id})`);
      
      let newImageUrl = product.image_url;
      let newVideoUrl = product.video_url;
      
      // Migration image
      if (product.image_url && product.image_url.includes('cloudinary.com')) {
        try {
          const imageExt = product.image_url.includes('.mp4') ? 'mp4' : 'jpg';
          const imageName = `image_${product.id}_${Date.now()}.${imageExt}`;
          const imagePath = path.join(tempDir, imageName);
          
          await downloadFile(product.image_url, imagePath);
          newImageUrl = await uploadToR2(imagePath, `images/${imageName}`);
          
          // Nettoyer fichier temporaire
          fs.unlinkSync(imagePath);
          
        } catch (error) {
          console.error(`❌ Erreur migration image produit ${product.id}:`, error.message);
        }
      }
      
      // Migration vidéo
      if (product.video_url && product.video_url.includes('cloudinary.com')) {
        try {
          const videoExt = 'mp4';
          const videoName = `video_${product.id}_${Date.now()}.${videoExt}`;
          const videoPath = path.join(tempDir, videoName);
          
          await downloadFile(product.video_url, videoPath);
          newVideoUrl = await uploadToR2(videoPath, `videos/${videoName}`);
          
          // Nettoyer fichier temporaire
          fs.unlinkSync(videoPath);
          
        } catch (error) {
          console.error(`❌ Erreur migration vidéo produit ${product.id}:`, error.message);
        }
      }
      
      // Mettre à jour le produit si des URLs ont changé
      if (newImageUrl !== product.image_url || newVideoUrl !== product.video_url) {
        await updateProductUrl(product.id, newImageUrl || '', newVideoUrl || '');
        migratedCount++;
      }
    }
    
    console.log(`\n✅ Migration terminée: ${migratedCount} produits mis à jour`);
    
  } catch (error) {
    console.error('❌ Erreur migration médias:', error);
  } finally {
    // Nettoyer dossier temporaire
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  }
}

migrateAllMedia();