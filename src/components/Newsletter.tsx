import { motion } from "framer-motion";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";

export const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [isHovered, setIsHovered] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast.success("Thank you for subscribing! Welcome to the Curlea family.");
      setEmail("");
    }
  };

  return (
    <section className="py-24 bg-foreground text-background relative overflow-hidden">
      {/* Animated Background Elements */}
      <motion.div
        className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.5, 0.3, 0.5],
        }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Join the Curlea Community
          </h2>
          <p className="text-lg md:text-xl text-background/80 mb-10 max-w-2xl mx-auto leading-relaxed">
            Be the first to discover new launches, exclusive offers, and expert haircare tips delivered to your inbox
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
            <motion.input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 px-6 py-4 bg-background/10 backdrop-blur-sm border border-background/20 rounded-full text-background placeholder:text-background/50 focus:outline-none focus:ring-2 focus:ring-accent transition-all"
              required
              whileFocus={{ scale: 1.02 }}
            />
            <motion.button
              type="submit"
              className="px-8 py-4 bg-accent text-white font-semibold rounded-full flex items-center justify-center gap-2 hover:bg-accent/90 transition-colors shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onHoverStart={() => setIsHovered(true)}
              onHoverEnd={() => setIsHovered(false)}
            >
              Subscribe
              <motion.span
                animate={{ x: isHovered ? 5 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ArrowRight className="w-5 h-5" />
              </motion.span>
            </motion.button>
          </form>

          <p className="text-sm text-background/60 mt-6 tracking-wide">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </motion.div>
      </div>
    </section>
  );
};
