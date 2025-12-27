/**
 * Dashboard Preview Card
 * Quick access card to the Shopify Analytics Dashboard
 */

import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DashboardPreviewCard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="bg-gradient-to-br from-[#008060] to-[#004c3f] rounded-xl shadow-lg overflow-hidden cursor-pointer group"
      onClick={() => navigate('/shopify-analytics')}
    >
      <div className="p-6 relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Content */}
        <div className="relative z-10">
          {/* Icon */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-400/30 rounded-full">
              <TrendingUp className="w-3 h-3 text-emerald-100" />
              <span className="text-xs font-semibold text-emerald-100">Live</span>
            </div>
          </div>

          {/* Title & Description */}
          <h3 className="text-xl font-bold text-white mb-2">
            Shopify Analytics Dashboard
          </h3>
          <p className="text-emerald-100 text-sm mb-6">
            Pixel-perfect replica of Shopify's analytics interface with real-time metrics, charts, and insights.
          </p>

          {/* Stats Preview */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <p className="text-emerald-100 text-xs mb-1">Sales</p>
              <p className="text-white text-lg font-bold">$12.4K</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <p className="text-emerald-100 text-xs mb-1">Orders</p>
              <p className="text-white text-lg font-bold">84</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <p className="text-emerald-100 text-xs mb-1">Conv.</p>
              <p className="text-white text-lg font-bold">1.2%</p>
            </div>
          </div>

          {/* CTA Button */}
          <button className="w-full bg-white text-[#008060] font-semibold py-3 rounded-lg flex items-center justify-center gap-2 group-hover:bg-emerald-50 transition-colors">
            View Full Dashboard
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};


