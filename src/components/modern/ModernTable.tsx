import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface Column<T> {
    key: string;
    header: string;
    render?: (value: any, row: T, index: number, data: T[]) => ReactNode;
    align?: 'left' | 'center' | 'right';
    width?: string;
}

interface ModernTableProps<T> {
    data: T[];
    columns: Column<T>[];
    loading?: boolean;
    emptyMessage?: string;
    onRowClick?: (row: T) => void;
    className?: string;
}

export function ModernTable<T extends { id?: string | number }>({
    data,
    columns,
    loading = false,
    emptyMessage = "No data available",
    onRowClick,
    className
}: ModernTableProps<T>) {
    if (loading) {
        return (
            <div className="w-full p-8 space-y-4">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-12 bg-zinc-800/20 rounded-lg animate-pulse" />
                ))}
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="w-full p-12 text-center text-zinc-500 flex flex-col items-center justify-center gap-2">
                <div className="w-12 h-12 rounded-full bg-zinc-900/50 flex items-center justify-center mb-2">
                    <span className="text-2xl">∅</span>
                </div>
                <p className="font-medium">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className={cn("w-full overflow-x-auto scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent", className)}>
            <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-zinc-950/80 backdrop-blur-md sticky top-0 z-10 border-b border-zinc-800/50">
                    <tr>
                        {columns.map((col) => (
                            <th
                                key={col.key}
                                className={cn(
                                    "px-6 py-4 font-semibold text-xs text-zinc-400 uppercase tracking-wider whitespace-nowrap select-none",
                                    col.align === 'right' && "text-right",
                                    col.align === 'center' && "text-center"
                                )}
                                style={{ width: col.width }}
                            >
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/30">
                    {data.map((row, rowIndex) => (
                        <tr
                            key={row.id || rowIndex}
                            onClick={() => onRowClick?.(row)}
                            className={cn(
                                "group transition-all duration-200 hover:bg-white/[0.02]",
                                onRowClick && "cursor-pointer active:bg-white/[0.04]"
                            )}
                        >
                            {columns.map((col) => (
                                <td
                                    key={`${String(row.id || rowIndex)}-${col.key}`}
                                    className={cn(
                                        "px-6 py-4 text-zinc-300 whitespace-nowrap transition-colors group-hover:text-zinc-200",
                                        col.align === 'right' && "text-right",
                                        col.align === 'center' && "text-center"
                                    )}
                                >
                                    {col.render
                                        ? col.render((row as any)[col.key], row, rowIndex, data)
                                        : (row as any)[col.key]
                                    }
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
