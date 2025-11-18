import { ReactNode, ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

interface ShopifyButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'plain' | 'destructive';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  fullWidth?: boolean;
}

const variantStyles = {
  primary: 'bg-green-600 text-white hover:bg-green-700 border-transparent shadow-sm',
  secondary: 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300 shadow-sm',
  plain: 'bg-transparent text-gray-700 hover:bg-gray-50 border-transparent',
  destructive: 'bg-red-600 text-white hover:bg-red-700 border-transparent shadow-sm',
};

const sizeStyles = {
  small: 'px-3 py-1.5 text-xs',
  medium: 'px-4 py-2 text-sm',
  large: 'px-6 py-3 text-base',
};

export function ShopifyButton({
  children,
  variant = 'primary',
  size = 'medium',
  loading = false,
  fullWidth = false,
  disabled,
  className = '',
  ...props
}: ShopifyButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2 font-medium rounded-lg border transition-colors
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
}

