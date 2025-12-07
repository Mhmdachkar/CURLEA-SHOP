import { motion, useInView, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { OptimizedImage } from "./OptimizedImage";
import { Product } from "@/data/products";
import { Play, Sparkles, Maximize2 } from "lucide-react";

export const MediaShowcaseSection = ({ product }: { product: Product }) => {
  const ref = useRef(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<'left' | 'center' | 'right' | null>(null);

  // Get images and video
  const images = product.images || [product.image];
  
  // Special handling for specific products
  const isMiniProduct = product.id === 'zero-heat-mini';
  const isOriginalProduct = product.id === 'dreamcurl-original';
  const isJumboProduct = product.id === 'dreamcurl-jumbo';
  const isBunBonsProduct = product.id === 'heatless-5';
  const isMidiProduct = product.id === 'dreamcurl-midi';
  const isShortSetProduct = product.id === 'dreamcurl-short-set';
  const isScarfProduct = product.id === 'curly-scarf-1';
  const isCurlyClipProduct = product.id === 'curly-clip-1';
  const isCurleaCombProduct = product.id === 'curlea-comb';
  
  // Determine left and right images based on product
  let leftImage, rightImage;
  if (isMiniProduct) {
    leftImage = new URL('../assets/Heatless Hair Curling Rod/mini-size/photo1.webp', import.meta.url).href;
    rightImage = new URL('../assets/Heatless Hair Curling Rod/mini-size/photo2.png', import.meta.url).href;
  } else if (isOriginalProduct) {
    leftImage = new URL('../assets/Heatless Hair Curling Rod/PRODUCT7/original1.jpg', import.meta.url).href;
    rightImage = new URL('../assets/Heatless Hair Curling Rod/PRODUCT7/original.jpg', import.meta.url).href;
  } else if (isJumboProduct) {
    leftImage = new URL('../assets/Heatless Hair Curling Rod/Jumbo_size/jambo.webp', import.meta.url).href;
    rightImage = new URL('../assets/Heatless Hair Curling Rod/Jumbo_size/jambo1.webp', import.meta.url).href;
  } else if (isBunBonsProduct) {
    leftImage = new URL('../assets/Heatless Hair Curling Rod/product5/buns.png', import.meta.url).href;
    rightImage = new URL('../assets/Heatless Hair Curling Rod/product5/buns1.png', import.meta.url).href;
  } else if (isMidiProduct) {
    leftImage = new URL('../assets/Heatless Hair Curling Rod/midi_size/midi.png', import.meta.url).href;
    rightImage = new URL('../assets/Heatless Hair Curling Rod/midi_size/midi1.png', import.meta.url).href;
  } else if (isShortSetProduct) {
    leftImage = new URL('../assets/Heatless Hair Curling Rod/short.webp', import.meta.url).href;
    rightImage = new URL('../assets/Heatless Hair Curling Rod/short1.webp', import.meta.url).href;
  } else if (isScarfProduct) {
    leftImage = new URL('../assets/curly hair collection/product2/Hair long bow scrunchies.jpg', import.meta.url).href;
    rightImage = new URL('../assets/curly hair collection/product2/Hair long bow scrunchies.jpeg', import.meta.url).href;
  } else if (isCurlyClipProduct) {
    leftImage = new URL('../assets/curly hair collection/product1/fLAT cLAW clIP IMAGE.jpg', import.meta.url).href;
    rightImage = new URL('../assets/curly hair collection/product1/fLAT cLAW clIP IMAGE 2.jpg', import.meta.url).href;
  } else if (isCurleaCombProduct) {
    leftImage = new URL('../assets/curly hair collection/product7/curlea comb.webp', import.meta.url).href;
    rightImage = images[1] || images[0] || product.image;
  } else {
    leftImage = images[0] || product.image;
    rightImage = images[1] || images[0] || product.image;
  }
  
  // Use specific videos per product where needed
  const video = isMiniProduct
    ? new URL('../assets/Heatless Hair Curling Rod/mini-size/mini.mp4', import.meta.url).href
    : product.id === 'dreamcurl-original'
      ? new URL('../assets/Heatless Hair Curling Rod/PRODUCT7/original.mp4', import.meta.url).href
      : product.id === 'dreamcurl-jumbo'
        ? new URL('../assets/Heatless Hair Curling Rod/Jumbo_size/guide(1).mp4', import.meta.url).href
        : product.id === 'dreamcurl-short-set'
          ? new URL('../assets/Heatless Hair Curling Rod/short.mp4', import.meta.url).href
          : product.id === 'heatless-5'
            ? new URL('../assets/Heatless Hair Curling Rod/product5/bun bons.mp4', import.meta.url).href
      : product.id === 'dreamcurl-midi'
        ? new URL('../assets/Heatless Hair Curling Rod/midi_size/midi.mp4', import.meta.url).href
      : product.id === 'curly-clip-1'
        ? new URL('../assets/curly hair collection/product1/FLAT CLAW CLIPPS CONTENT.mp4', import.meta.url).href
        : (product.video || null);

  // Video handlers
  const handleVideoLoad = () => {
    setIsVideoLoading(false);
    setVideoError(false);
  };

  const handleVideoError = () => {
    setIsVideoLoading(false);
    setVideoError(true);
  };

  const handleVideoPlay = async () => {
    if (videoRef.current) {
      try {
        await videoRef.current.play();
        setIsVideoPlaying(true);
      } catch (error) {
        console.warn('Autoplay prevented:', error);
      }
    }
  };

  // Ensure object-fit is contained in fullscreen and restored when exiting
  useEffect(() => {
    const handleFsChange = () => {
      const videoEl = videoRef.current;
      if (!videoEl) return;
      const isFs = !!(document.fullscreenElement && document.fullscreenElement === videoEl);
      if (isFs) {
        videoEl.style.objectFit = 'contain';
      } else {
        // Restore default when not in fullscreen
        videoEl.style.objectFit = '';
      }
    };

    document.addEventListener('fullscreenchange', handleFsChange);
    (document as unknown as any).addEventListener('webkitfullscreenchange', handleFsChange as EventListener);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      (document as unknown as any).removeEventListener('webkitfullscreenchange', handleFsChange as EventListener);
    };
  }, []);

  const toggleFullscreen = async () => {
    const videoEl = videoRef.current;
    if (!videoEl) return;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else if (videoEl.requestFullscreen) {
        await videoEl.requestFullscreen();
      } else if ((videoEl as unknown as any).webkitEnterFullScreen) {
        // Some iOS WebKit builds only support this synchronous call
        (videoEl as unknown as any).webkitEnterFullScreen();
      } else if ((videoEl as unknown as any).webkitRequestFullscreen) {
        await (videoEl as unknown as any).webkitRequestFullscreen();
      }
    } catch (err) {
      console.log('Fullscreen error:', err);
    }
  };

  useEffect(() => {
    if (!video) {
      setIsVideoLoading(false);
      return;
    }

    // Load and play video when in view
    if (isInView && videoRef.current && video) {
      const currentVideo = videoRef.current;
      
      // Reset loading state
      setIsVideoLoading(true);
      setVideoError(false);
      
      // Set video source
      const source = currentVideo.querySelector('source');
      if (source) {
        source.src = video;
        currentVideo.load();
        
        // Try to play when video is ready
        const tryPlay = () => {
          const playPromise = currentVideo.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                setIsVideoPlaying(true);
                setIsVideoLoading(false);
              })
              .catch((error) => {
                console.warn('Autoplay prevented:', error);
                setIsVideoPlaying(false);
                setIsVideoLoading(false);
              });
          }
        };
        
        currentVideo.addEventListener('canplay', tryPlay, { once: true });
        
        return () => {
          currentVideo.removeEventListener('canplay', tryPlay);
          currentVideo.pause();
        };
      }
    }
  }, [video, isInView]);

  return (
    <motion.section
      ref={ref}
      className="relative py-8 sm:py-16 md:py-24 lg:py-40 px-2 sm:px-4 md:px-6 overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--muted)/0.4) 50%, hsl(var(--background)) 100%)'
      }}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 1.2, ease: [0.43, 0.13, 0.23, 0.96] }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Elegant Title Section */}
        <motion.div
          className="text-center mb-8 sm:mb-12 md:mb-16 lg:mb-24"
          initial={{ opacity: 0, y: -30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -30 }}
          transition={{ delay: 0.2, duration: 1, ease: [0.43, 0.13, 0.23, 0.96] }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-2 sm:mb-4 tracking-tight">
            <span className="bg-gradient-to-r from-foreground via-foreground/80 to-foreground bg-clip-text text-transparent inline-block">
              Visual Journey
            </span>
          </h2>
          <div className="w-16 sm:w-24 h-0.5 sm:h-1 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto"></div>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground mt-3 sm:mt-4 md:mt-6 font-light tracking-wide">
            Experience every detail in motion
          </p>
        </motion.div>

        {video ? (
          /* Unique Overlapping Gallery Layout with Video */
          <div className="relative overflow-x-hidden">
            {/* Mobile: Compressed layout with smaller gaps */}
            <div className="grid grid-cols-[0.85fr_0.6fr_0.85fr] sm:grid-cols-[0.8fr_0.55fr_0.8fr] md:grid-cols-[0.74fr_0.52fr_0.74fr] gap-0 items-stretch px-0 mx-auto max-w-full overflow-visible -translate-x-2 sm:-translate-x-4 md:-translate-x-6 lg:-translate-x-10 xl:-translate-x-14">
            {/* Left Image - Skewed Elegant Design */}
            <motion.div
              className="relative aspect-[4/5] min-h-[180px] sm:min-h-[240px] md:min-h-[320px] lg:min-h-0 z-30 justify-self-start -ml-0 sm:-ml-0.5 sm:-ml-1 md:-ml-2 -mr-1 sm:-mr-2 md:-mr-4 lg:-mr-6 xl:-mr-7"
              initial={{ opacity: 0, x: -30, scale: 0.9 }}
              animate={isInView ? { opacity: 1, x: 0, scale: 1 } : { opacity: 0, x: -30, scale: 0.9 }}
              transition={{ delay: 0.3, duration: 1.3, ease: [0.43, 0.13, 0.23, 0.96] }}
            >
              <motion.div
                className="relative h-full overflow-visible cursor-pointer group z-20 transform scale-[0.60] sm:scale-[0.65] md:scale-[0.70] lg:scale-[0.75] xl:scale-[0.80]"
                onClick={() => setSelectedMedia('left')}
              >
                {/* Decorative border frame */}
                <div className="absolute -inset-4 border-2 border-primary/20 rounded-[2rem] group-hover:border-primary/40 transition-all duration-500 pointer-events-none z-0"></div>
                <div className="absolute -inset-2 border border-white/10 rounded-[1.5rem] pointer-events-none z-0"></div>
                
                <div className="relative h-full rounded-xl sm:rounded-2xl overflow-hidden shadow-lg sm:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] backdrop-blur-sm">
                  <OptimizedImage
                    src={leftImage}
                    alt={`${product.name} - View 1`}
                    className="w-full h-full object-contain bg-white transform transition-all duration-500 group-hover:brightness-110"
                    priority={true}
                  />
                  
                  {/* Elegant overlay with golden accent */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
              </motion.div>
            </motion.div>

            {/* Center Video - Elegant Hero */}
            <motion.div
              className="relative aspect-[4/5] min-h-[100px] sm:min-h-[180px] md:min-h-[260px] lg:min-h-0 z-10 flex items-center justify-center justify-self-center -translate-x-1 sm:-translate-x-3 md:-translate-x-5 lg:-translate-x-7 xl:-translate-x-8 -mx-1 sm:-mx-2 md:-mx-4 lg:-mx-5 xl:-mx-6"
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 30, scale: 0.9 }}
              transition={{ delay: 0.5, duration: 1.5, ease: [0.43, 0.13, 0.23, 0.96] }}
              whileHover={{ scale: 1.02, y: -8 }}
            >
              <motion.div
                className="relative h-full overflow-visible cursor-pointer group z-20"
                onMouseEnter={() => setSelectedMedia('center')}
              >
                {/* Connecting Lines - Hidden on mobile */}
                <div className="hidden lg:flex absolute left-0 top-1/2 -translate-x-full items-center gap-2 -translate-y-1/2 z-10">
                  <motion.div
                    className="w-16 h-0.5 bg-gradient-to-r from-transparent via-primary/40 to-primary/20"
                    initial={{ scaleX: 0 }}
                    animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                  />
                  <motion.div
                    className="w-2 h-2 rounded-full bg-primary/50"
                    animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
                
                <div className="hidden lg:flex absolute right-0 top-1/2 translate-x-full items-center gap-2 -translate-y-1/2 z-10">
                  <motion.div
                    className="w-2 h-2 rounded-full bg-primary/50"
                    animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                  />
                  <motion.div
                    className="w-16 h-0.5 bg-gradient-to-l from-transparent via-primary/40 to-primary/20"
                    initial={{ scaleX: 0 }}
                    animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
                    transition={{ delay: 1, duration: 0.8 }}
                  />
                </div>

                {/* Glow effect */}
                <motion.div
                  className="absolute -top-10 -left-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
                  transition={{ duration: 5, repeat: Infinity }}
                />
                
                <div className="relative h-full rounded-xl sm:rounded-2xl overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] sm:shadow-[0_40px_100px_-25px_rgba(0,0,0,0.65)] ring-1 ring-white/25 border border-white/10 transition-all duration-500 z-10 isolate transform scale-[0.65] sm:scale-[0.68] md:scale-[0.72] lg:scale-[0.75] xl:scale-[0.78] bg-black/10">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    preload="auto"
                    playsInline
                    muted
                    loop
                    autoPlay
                    onLoadedData={handleVideoLoad}
                    onError={handleVideoError}
                    onPlay={() => setIsVideoPlaying(true)}
                    onPause={() => setIsVideoPlaying(false)}
                    onClick={handleVideoPlay}
                    style={{ cursor: 'pointer' }}
                  >
                    <source src={video} type="video/mp4" />
                  </video>

                {/* Floating play button */}
                {!isVideoPlaying && !isVideoLoading && !videoError && (
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px]"
                    onClick={handleVideoPlay}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.div
                      className="w-24 h-24 bg-gradient-to-br from-white to-white/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.3)]"
                      animate={{ scale: [1, 1.08, 1] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Play className="w-10 h-10 text-foreground ml-1.5" fill="currentColor" />
                    </motion.div>
                  </motion.div>
                )}

                {isVideoLoading && (
                  <motion.div
                    className="absolute inset-0 bg-black/50 flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-12 h-12 border-3 border-white/30 border-t-white rounded-full"
                    />
                  </motion.div>
                )}

                {videoError && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                    <div className="text-center text-white text-sm">
                      <p>Video unavailable</p>
                    </div>
                  </div>
                )}

                {/* Fullscreen button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFullscreen();
                  }}
                  className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 z-30 pointer-events-auto flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-white/90 backdrop-blur-md rounded-full hover:bg-white transition-all duration-300 shadow-lg hover:scale-110 group"
                >
                  <Maximize2 className="w-3 h-3 sm:w-5 sm:h-5 text-foreground group-hover:text-primary transition-colors" />
                </button>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Image - Skewed Elegant Design */}
            <motion.div
              className="relative aspect-[4/5] min-h-[180px] sm:min-h-[240px] md:min-h-[320px] lg:min-h-0 z-30 justify-self-end -translate-x-1 sm:-translate-x-3 md:-translate-x-6 lg:-translate-x-9 xl:-translate-x-12 -ml-1 sm:-ml-2 md:-ml-4 lg:-ml-6 xl:-ml-8"
              initial={{ opacity: 0, x: 30, scale: 0.9 }}
              animate={isInView ? { opacity: 1, x: 0, scale: 1 } : { opacity: 0, x: 30, scale: 0.9 }}
              transition={{ delay: 0.7, duration: 1.3, ease: [0.43, 0.13, 0.23, 0.96] }}
            >
              <motion.div
                className="relative h-full overflow-visible cursor-pointer group z-20 transform scale-[0.60] sm:scale-[0.65] md:scale-[0.70] lg:scale-[0.75] xl:scale-[0.80]"
                onClick={() => setSelectedMedia('right')}
              >
                {/* Decorative border frame */}
                <div className="absolute -inset-4 border-2 border-primary/20 rounded-[2rem] group-hover:border-primary/40 transition-all duration-500 pointer-events-none z-0"></div>
                <div className="absolute -inset-2 border border-white/10 rounded-[1.5rem] pointer-events-none z-0"></div>
                
                <div className="relative h-full rounded-xl sm:rounded-2xl overflow-hidden shadow-lg sm:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] backdrop-blur-sm">
                  <OptimizedImage
                    src={rightImage}
                    alt={`${product.name} - View 2`}
                    className="w-full h-full object-contain bg-white transform transition-all duration-500 group-hover:brightness-110"
                    priority={true}
                  />
                  
                  {/* Elegant overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
              </motion.div>
            </motion.div>
            </div>
          </div>
        ) : (
          /* 2-column layout for products without video */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            <motion.div
              className="relative aspect-[4/5]"
              initial={{ opacity: 0, x: -150, rotate: -8, scale: 0.75 }}
              animate={isInView ? { opacity: 1, x: 0, rotate: 0, scale: 1 } : { opacity: 0, x: -150, rotate: -8, scale: 0.75 }}
              transition={{ delay: 0.3, duration: 1.3, ease: [0.43, 0.13, 0.23, 0.96] }}
            >
              <motion.div
                className="relative h-full overflow-visible cursor-pointer group z-10"
                whileHover={{ rotate: 5, y: -15, scale: 1.05 }}
                onClick={() => setSelectedMedia('left')}
              >
                <div className="absolute -inset-4 border-2 border-primary/20 rounded-[2rem] group-hover:border-primary/40 transition-all duration-500"></div>
                <div className="absolute -inset-2 border border-white/10 rounded-[1.5rem]"></div>
                
                <div className="relative h-full rounded-[2rem] overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]">
                  <OptimizedImage
                    src={leftImage}
                    alt={`${product.name} - View 1`}
                    className="w-full h-full object-cover transform transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
                    priority={true}
                  />
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              className="relative aspect-[4/5]"
              initial={{ opacity: 0, x: 150, rotate: 8, scale: 0.75 }}
              animate={isInView ? { opacity: 1, x: 0, rotate: 0, scale: 1 } : { opacity: 0, x: 150, rotate: 8, scale: 0.75 }}
              transition={{ delay: 0.5, duration: 1.3, ease: [0.43, 0.13, 0.23, 0.96] }}
            >
              <motion.div
                className="relative h-full overflow-visible cursor-pointer group z-10"
                whileHover={{ rotate: -5, y: -15, scale: 1.05 }}
                onClick={() => setSelectedMedia('right')}
              >
                <div className="absolute -inset-4 border-2 border-primary/20 rounded-[2rem] group-hover:border-primary/40 transition-all duration-500"></div>
                <div className="absolute -inset-2 border border-white/10 rounded-[1.5rem]"></div>
                
                <div className="relative h-full rounded-[2rem] overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]">
                  <OptimizedImage
                    src={rightImage}
                    alt={`${product.name} - View 2`}
                    className="w-full h-full object-cover transform transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
                    priority={true}
                  />
                </div>
              </motion.div>
            </motion.div>
          </div>
        )}
        {/* Elegant fullscreen image modal with animated reveal */}
        <AnimatePresence>
          {selectedMedia && (selectedMedia === 'left' || selectedMedia === 'right') && (
            <motion.div
              className="fixed inset-0 z-[2000] bg-black/70 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div
                className="absolute inset-0 flex items-center justify-center p-3 sm:p-6"
                onClick={() => setSelectedMedia(null)}
              >
                <motion.div
                  className="relative w-full max-w-6xl max-h-[92vh] rounded-[2rem] overflow-hidden shadow-[0_50px_140px_-30px_rgba(0,0,0,0.65)] ring-1 ring-white/25 border border-white/10 bg-gradient-to-b from-white/5 to-white/0"
                  initial={{ scale: 0.92, y: 16, opacity: 0 }}
                  animate={{ scale: 1, y: 0, opacity: 1 }}
                  exit={{ scale: 0.96, y: 8, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 240, damping: 24 }}
                >
                  <img
                    src={selectedMedia === 'left' ? leftImage : rightImage}
                    alt={`${product.name} - Full View`}
                    className="w-full h-[92vh] object-contain"
                  />

                  {/* Close button */}
                  <button
                    aria-label="Close"
                    onClick={(e) => { e.stopPropagation(); setSelectedMedia(null); }}
                    className="absolute top-3 right-3 sm:top-5 sm:right-5 h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-white/95 text-black shadow-lg hover:shadow-2xl hover:bg-white transition-all"
                  >
                    ✕
                  </button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
};
