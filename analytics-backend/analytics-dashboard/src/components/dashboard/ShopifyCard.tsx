import { ReactNode } from 'react';

interface ShopifyCardProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  actions?: ReactNode;
  noPadding?: boolean;
}

export function ShopifyCard({ title, subtitle, children, actions, noPadding = false }: ShopifyCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {(title || actions) && (
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
            <div className="min-w-0 flex-1">
              {title && <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">{title}</h3>}
              {subtitle && <p className="mt-1 text-xs sm:text-sm text-gray-500">{subtitle}</p>}
            </div>
            {actions && <div className="flex-shrink-0">{actions}</div>}
          </div>
        </div>
      )}
      
      <div className={noPadding ? '' : 'p-4 sm:p-6'}>
        {children}
      </div>
    </div>
  );
}

