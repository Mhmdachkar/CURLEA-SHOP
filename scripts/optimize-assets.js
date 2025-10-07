#!/usr/bin/env node

/**
 * Asset optimization script for Netlify deployment
 * This script performs post-build optimizations
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const distPath = path.join(projectRoot, 'dist');

console.log('🚀 Starting asset optimization for Netlify deployment...');

/**
 * Ensure all required files exist
 */
function ensureRequiredFiles() {
  console.log('📁 Checking required files...');
  
  const requiredFiles = [
    'index.html',
    'robots.txt',
    'favicon.ico'
  ];
  
  requiredFiles.forEach(file => {
    const filePath = path.join(distPath, file);
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Warning: ${file} not found in dist folder`);
      
      // Copy from public if it exists
      const publicPath = path.join(projectRoot, 'public', file);
      if (fs.existsSync(publicPath)) {
        fs.copyFileSync(publicPath, filePath);
        console.log(`✅ Copied ${file} from public folder`);
      }
    } else {
      console.log(`✅ ${file} found`);
    }
  });
}

/**
 * Optimize HTML files
 */
function optimizeHTML() {
  console.log('🔧 Optimizing HTML files...');
  
  const htmlFiles = fs.readdirSync(distPath)
    .filter(file => file.endsWith('.html'));
  
  htmlFiles.forEach(file => {
    const filePath = path.join(distPath, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Add performance optimizations
    content = content.replace(
      '<head>',
      `<head>
    <!-- Performance optimizations -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <meta name="theme-color" content="#000000">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">`
    );
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Optimized ${file}`);
  });
}

/**
 * Create a deployment manifest
 */
function createDeploymentManifest() {
  console.log('📋 Creating deployment manifest...');
  
  const manifest = {
    buildDate: new Date().toISOString(),
    version: '1.0.0',
    environment: 'production',
    features: [
      'mobile-first-responsive-design',
      'spa-routing',
      'security-headers',
      'asset-optimization',
      'video-support',
      'cart-functionality',
      'product-gallery',
      'animated-components'
    ],
    assets: {
      images: fs.readdirSync(distPath, { recursive: true })
        .filter(file => typeof file === 'string' && /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(file))
        .length,
      videos: fs.readdirSync(distPath, { recursive: true })
        .filter(file => typeof file === 'string' && /\.(mp4|webm|ogg)$/i.test(file))
        .length,
      scripts: fs.readdirSync(distPath, { recursive: true })
        .filter(file => typeof file === 'string' && /\.js$/i.test(file))
        .length,
      styles: fs.readdirSync(distPath, { recursive: true })
        .filter(file => typeof file === 'string' && /\.css$/i.test(file))
        .length
    }
  };
  
  fs.writeFileSync(
    path.join(distPath, 'deployment-manifest.json'),
    JSON.stringify(manifest, null, 2)
  );
  
  console.log('✅ Deployment manifest created');
  console.log(`📊 Assets: ${manifest.assets.images} images, ${manifest.assets.videos} videos, ${manifest.assets.scripts} scripts, ${manifest.assets.styles} styles`);
}

/**
 * Validate build output
 */
function validateBuild() {
  console.log('🔍 Validating build output...');
  
  const criticalFiles = [
    'index.html',
    'assets'
  ];
  
  let isValid = true;
  
  criticalFiles.forEach(file => {
    const filePath = path.join(distPath, file);
    if (!fs.existsSync(filePath)) {
      console.log(`❌ Critical file missing: ${file}`);
      isValid = false;
    } else {
      console.log(`✅ Found: ${file}`);
    }
  });
  
  if (isValid) {
    console.log('✅ Build validation passed');
  } else {
    console.log('❌ Build validation failed');
    process.exit(1);
  }
}

/**
 * Main optimization process
 */
async function optimizeAssets() {
  try {
    console.log('🎯 Starting Netlify deployment optimization...');
    
    // Check if dist folder exists
    if (!fs.existsSync(distPath)) {
      console.log('❌ Dist folder not found. Please run "npm run build" first.');
      process.exit(1);
    }
    
    ensureRequiredFiles();
    optimizeHTML();
    createDeploymentManifest();
    validateBuild();
    
    console.log('🎉 Asset optimization completed successfully!');
    console.log('🚀 Your project is ready for Netlify deployment!');
    
  } catch (error) {
    console.error('❌ Optimization failed:', error);
    process.exit(1);
  }
}

// Run optimization
optimizeAssets();
