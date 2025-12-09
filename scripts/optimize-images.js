/**
 * Image Optimization Script
 * 
 * This script optimizes all large PNG/JPG images in the assets folder by:
 * 1. Converting to WebP format (90% quality)
 * 2. Generating responsive sizes: 480px, 768px, 1280px, and original
 * 3. Organizing optimized images in a structured folder
 * 
 * Usage: node scripts/optimize-images.js
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const mkdir = promisify(fs.mkdir);

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const ASSETS_DIR = path.join(__dirname, '../src/assets');
const OUTPUT_DIR = path.join(__dirname, '../src/assets-optimized');
const SIZES = [480, 768, 1280]; // Responsive breakpoints
const WEBP_QUALITY = 90;
const MIN_SIZE_KB = 50; // Only optimize images larger than 50KB

// Image extensions to process
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg'];

// Folders to skip
const SKIP_FOLDERS = ['assets-optimized', 'node_modules', '.git'];

/**
 * Recursively find all image files in a directory
 */
async function findImages(dir, fileList = []) {
  const files = await readdir(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const fileStat = await stat(filePath);

    if (fileStat.isDirectory()) {
      const folderName = path.basename(filePath);
      if (!SKIP_FOLDERS.includes(folderName)) {
        await findImages(filePath, fileList);
      }
    } else {
      const ext = path.extname(file).toLowerCase();
      if (IMAGE_EXTENSIONS.includes(ext)) {
        const stats = await stat(filePath);
        const sizeKB = stats.size / 1024;
        
        // Only process images larger than MIN_SIZE_KB
        if (sizeKB > MIN_SIZE_KB) {
          fileList.push({
            path: filePath,
            relativePath: path.relative(ASSETS_DIR, filePath),
            size: sizeKB,
          });
        }
      }
    }
  }

  return fileList;
}

/**
 * Optimize a single image to multiple sizes
 */
async function optimizeImage(imagePath, relativePath) {
  const parsed = path.parse(relativePath);
  const outputBase = path.join(OUTPUT_DIR, parsed.dir);

  // Create output directory if it doesn't exist
  await mkdir(outputBase, { recursive: true });

  const results = [];
  
  try {
    const image = sharp(imagePath);
    const metadata = await image.metadata();
    const originalWidth = metadata.width;

    console.log(`\nProcessing: ${relativePath}`);
    console.log(`  Original size: ${originalWidth}x${metadata.height}px`);

    // Generate responsive sizes
    for (const size of SIZES) {
      // Skip if original is smaller than target size
      if (originalWidth <= size) continue;

      const outputFileName = `${parsed.name}-${size}w.webp`;
      const outputPath = path.join(outputBase, outputFileName);

      await image
        .clone()
        .resize(size, null, {
          withoutEnlargement: true,
          fit: 'inside',
        })
        .webp({ quality: WEBP_QUALITY })
        .toFile(outputPath);

      const stats = await stat(outputPath);
      const savedKB = stats.size / 1024;

      results.push({
        width: size,
        path: outputPath,
        size: savedKB,
      });

      console.log(`  ✓ ${size}w → ${savedKB.toFixed(1)}KB`);
    }

    // Generate full-size WebP
    const outputFileNameFull = `${parsed.name}-original.webp`;
    const outputPathFull = path.join(outputBase, outputFileNameFull);

    await image
      .clone()
      .webp({ quality: WEBP_QUALITY })
      .toFile(outputPathFull);

    const statsFull = await stat(outputPathFull);
    const savedKBFull = statsFull.size / 1024;

    results.push({
      width: 'original',
      path: outputPathFull,
      size: savedKBFull,
    });

    console.log(`  ✓ original → ${savedKBFull.toFixed(1)}KB`);

    return results;
  } catch (error) {
    console.error(`  ✗ Error processing ${relativePath}:`, error.message);
    return [];
  }
}

/**
 * Generate srcSet string for responsive images
 */
function generateSrcSet(results, baseDir) {
  return results
    .filter(r => r.width !== 'original')
    .map(r => {
      const relativePath = path.relative(baseDir, r.path).replace(/\\/g, '/');
      return `/${relativePath} ${r.width}w`;
    })
    .join(', ');
}

/**
 * Main execution
 */
async function main() {
  console.log('🖼️  Image Optimization Script\n');
  console.log(`📁 Scanning: ${ASSETS_DIR}`);
  console.log(`📤 Output: ${OUTPUT_DIR}`);
  console.log(`🎯 Target sizes: ${SIZES.join(', ')}px`);
  console.log(`⚙️  WebP quality: ${WEBP_QUALITY}%`);
  console.log(`📏 Min size: ${MIN_SIZE_KB}KB\n`);

  // Find all images
  const images = await findImages(ASSETS_DIR);
  console.log(`Found ${images.length} images to optimize\n`);

  if (images.length === 0) {
    console.log('No images found to optimize. Exiting.');
    return;
  }

  // Create output directory
  await mkdir(OUTPUT_DIR, { recursive: true });

  // Track statistics
  let totalOriginalSize = 0;
  let totalOptimizedSize = 0;
  const optimizationMap = new Map();

  // Process each image
  for (const image of images) {
    totalOriginalSize += image.size;
    const results = await optimizeImage(image.path, image.relativePath);
    
    if (results.length > 0) {
      const optimizedSize = results.reduce((sum, r) => sum + r.size, 0);
      totalOptimizedSize += optimizedSize;
      
      // Store mapping for code generation
      optimizationMap.set(image.relativePath, {
        original: image.path,
        optimized: results,
        srcSet: generateSrcSet(results, OUTPUT_DIR),
      });
    }
  }

  // Generate summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 OPTIMIZATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total images processed: ${images.length}`);
  console.log(`Original total size: ${totalOriginalSize.toFixed(1)}KB`);
  console.log(`Optimized total size: ${totalOptimizedSize.toFixed(1)}KB`);
  const savings = ((1 - totalOptimizedSize / totalOriginalSize) * 100).toFixed(1);
  console.log(`Total savings: ${savings}%`);
  console.log('='.repeat(60));

  // Save optimization map for reference
  const mapPath = path.join(OUTPUT_DIR, 'optimization-map.json');
  fs.writeFileSync(mapPath, JSON.stringify(Object.fromEntries(optimizationMap), null, 2));
  console.log(`\n✅ Optimization map saved to: ${mapPath}`);

  console.log('\n🎉 Optimization complete!');
  console.log('\n📝 Next steps:');
  console.log('1. Review the optimized images in src/assets-optimized/');
  console.log('2. Update your code to use the new WebP images with srcSet');
  console.log('3. Set up CDN and cache headers (see CDN_SETUP.md)');
}

// Run the script
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

