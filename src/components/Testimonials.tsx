import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sophie Laurent",
    role: "Beauty Editor",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
    content: "Curlea transformed my curls from frizzy to fabulous. The hydration is unmatched, and the scent is absolutely divine.",
    rating: 5,
  },
  {
    name: "Maria Chen",
    role: "Professional Stylist",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
    content: "As a stylist, I recommend Curlea to all my clients. The quality speaks for itself, and the results are consistently stunning.",
    rating: 5,
  },
  {
    name: "Emma Williams",
    role: "Content Creator",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop",
    content: "Finally, a luxury haircare brand that delivers on its promises. My hair has never looked or felt better.",
    rating: 5,
  },
];

export const Testimonials = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <section ref={sectionRef} className="py-32 bg-muted/30 relative overflow-hidden">
      <motion.div 
        className="max-w-7xl mx-auto px-6"
        style={{ opacity }}
      >
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-4">
            Loved by Thousands
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover why our community continues to choose Curlea for their haircare journey
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              className="bg-card p-8 rounded-2xl shadow-elegant hover-lift"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -8 }}
            >
              <div className="flex gap-1 mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                ))}
              </div>
              
              <p className="text-muted-foreground mb-8 leading-relaxed italic">
                "{testimonial.content}"
              </p>
              
              <div className="flex items-center gap-4">
                <motion.img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                />
                <div>
                  <div className="font-semibold tracking-wide">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};
