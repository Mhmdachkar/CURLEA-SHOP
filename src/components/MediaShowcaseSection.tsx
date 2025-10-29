import { motion, useInView } from "framer-motion";
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
  
  // Determine left and right images based on product
  let leftImage, rightImage;
  if (isMiniProduct) {
    leftImage = new URL('../assets/Heatless Hair Curling Rod/mini-size/photo1.webp', import.meta.url).href;
    rightImage = new URL('../assets/Heatless Hair Curling Rod/mini-size/photo2.png', import.meta.url).href;
  } else if (isOriginalProduct) {
    leftImage = new URL('../assets/Heatless Hair Curling Rod/PRODUCT7/original1.png', import.meta.url).href;
    rightImage = new URL('../assets/Heatless Hair Curling Rod/PRODUCT7/original.webp', import.meta.url).href;
  } else {
    leftImage = images[0] || product.image;
    rightImage = images[1] || images[0] || product.image;
  }
  
  // Use specific videos per product where needed
  const video = isMiniProduct
    ? new URL('../assets/Heatless Hair Curling Rod/mini-size/mini.mp4', import.meta.url).href
    : product.id === 'dreamcurl-original'
      ? new URL('../assets/Heatless Hair Curling Rod/PRODUCT7/original.mp4', import.meta.url).href
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
      className="relative py-24 md:py-40 px-4 sm:px-6 overflow-hidden"
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
          className="text-center mb-16 md:mb-24"
          initial={{ opacity: 0, y: -30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -30 }}
          transition={{ delay: 0.2, duration: 1, ease: [0.43, 0.13, 0.23, 0.96] }}
        >
          <h2 className="text-5xl md:text-7xl font-bold mb-4 tracking-tight">
            <span className="bg-gradient-to-r from-foreground via-foreground/80 to-foreground bg-clip-text text-transparent inline-block">
              Visual Journey
            </span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto"></div>
          <p className="text-lg md:text-xl text-muted-foreground mt-6 font-light tracking-wide">
            Experience every detail in motion
          </p>
        </motion.div>

        {video ? (
          /* Unique Overlapping Gallery Layout with Video */
          <div className="relative">
            <div className="grid grid-cols-3 gap-3 sm:gap-6 md:gap-8 lg:gap-12 items-center">
            {/* Left Image - Skewed Elegant Design */}
            <motion.div
              className="relative aspect-[4/5]"
              initial={{ opacity: 0, x: -30, scale: 0.9 }}
              animate={isInView ? { opacity: 1, x: 0, scale: 1 } : { opacity: 0, x: -30, scale: 0.9 }}
              transition={{ delay: 0.3, duration: 1.3, ease: [0.43, 0.13, 0.23, 0.96] }}
            >
              <motion.div
                className="relative h-full overflow-visible cursor-pointer group"
                whileHover={{ rotate: 5, y: -15, scale: 1.05 }}
                onClick={() => setSelectedMedia('left')}
              >
                {/* Decorative border frame */}
                <div className="absolute -inset-4 border-2 border-primary/20 rounded-[2rem] group-hover:border-primary/40 transition-all duration-500"></div>
                <div className="absolute -inset-2 border border-white/10 rounded-[1.5rem]"></div>
                
                <div className="relative rounded-xl sm:rounded-2xl overflow-hidden shadow-lg sm:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] backdrop-blur-sm">
                  <OptimizedImage
                    src={leftImage}
                    alt={`${product.name} - View 1`}
                    className="w-full h-full object-cover transform transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
                    priority={true}
                  />
                  
                  {/* Elegant overlay with golden accent */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
              </motion.div>
            </motion.div>

            {/* Center Video - Elegant Hero */}
            <motion.div
              className="relative aspect-[4/5]"
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 30, scale: 0.9 }}
              transition={{ delay: 0.5, duration: 1.5, ease: [0.43, 0.13, 0.23, 0.96] }}
              whileHover={{ scale: 1.02, y: -8 }}
            >
              <motion.div
                className="relative h-full overflow-visible cursor-pointer group"
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
                
                <div className="relative h-full rounded-xl sm:rounded-2xl lg:rounded-[2.5rem] overflow-hidden shadow-xl sm:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.7)] border-2 border-primary/20 group-hover:border-primary/40 transition-all duration-500">
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
                  className="absolute bottom-2 right-2 sm:bottom-6 sm:right-6 flex items-center justify-center w-8 h-8 sm:w-12 sm:h-12 bg-white/90 backdrop-blur-md rounded-full hover:bg-white transition-all duration-300 shadow-lg hover:scale-110 group"
                >
                  <Maximize2 className="w-3 h-3 sm:w-5 sm:h-5 text-foreground group-hover:text-primary transition-colors" />
                </button>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Image - Skewed Elegant Design */}
            <motion.div
              className="relative aspect-[4/5]"
              initial={{ opacity: 0, x: 30, scale: 0.9 }}
              animate={isInView ? { opacity: 1, x: 0, scale: 1 } : { opacity: 0, x: 30, scale: 0.9 }}
              transition={{ delay: 0.7, duration: 1.3, ease: [0.43, 0.13, 0.23, 0.96] }}
            >
              <motion.div
                className="relative h-full overflow-visible cursor-pointer group"
                whileHover={{ rotate: -5, y: -15, scale: 1.05 }}
                onClick={() => setSelectedMedia('right')}
              >
                {/* Decorative border frame */}
                <div className="absolute -inset-4 border-2 border-primary/20 rounded-[2rem] group-hover:border-primary/40 transition-all duration-500"></div>
                <div className="absolute -inset-2 border border-white/10 rounded-[1.5rem]"></div>
                
                <div className="relative rounded-xl sm:rounded-2xl overflow-hidden shadow-lg sm:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] backdrop-blur-sm">
                  <OptimizedImage
                    src={rightImage}
                    alt={`${product.name} - View 2`}
                    className="w-full h-full object-cover transform transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
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
                className="relative h-full overflow-visible cursor-pointer group"
                whileHover={{ rotate: 5, y: -15, scale: 1.05 }}
                onClick={() => setSelectedMedia('left')}
              >
                <div className="absolute -inset-4 border-2 border-primary/20 rounded-[2rem] group-hover:border-primary/40 transition-all duration-500"></div>
                <div className="absolute -inset-2 border border-white/10 rounded-[1.5rem]"></div>
                
                <div className="relative rounded-[2rem] overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]">
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
                className="relative h-full overflow-visible cursor-pointer group"
                whileHover={{ rotate: -5, y: -15, scale: 1.05 }}
                onClick={() => setSelectedMedia('right')}
              >
                <div className="absolute -inset-4 border-2 border-primary/20 rounded-[2rem] group-hover:border-primary/40 transition-all duration-500"></div>
                <div className="absolute -inset-2 border border-white/10 rounded-[1.5rem]"></div>
                
                <div className="relative rounded-[2rem] overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]">
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
      </div>
    </motion.section>
  );
};
