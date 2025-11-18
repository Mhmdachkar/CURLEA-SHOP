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
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              {title && <h3 className="text-base font-semibold text-gray-900">{title}</h3>}
              {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
            </div>
            {actions && <div>{actions}</div>}
          </div>
        </div>
      )}
      
      <div className={noPadding ? '' : 'p-6'}>
        {children}
      </div>
    </div>
  );
}

