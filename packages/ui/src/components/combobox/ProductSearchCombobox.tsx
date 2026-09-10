// packages/ui/src/components/combobox/ProductSearchCombobox.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Search, Package, Plus, Check, ChevronDown, Sparkles, Building2, Store } from 'lucide-react';
import { ProductRecord } from '../../stores/masterDataStore';

export interface ProductSearchComboboxProps {
  products: ProductRecord[];
  onSelectProduct: (product: ProductRecord) => void;
  placeholder?: string;
  autoFocus?: boolean;
  priceType?: 'retail' | 'wholesale' | 'cost';
  className?: string;
}

export const ProductSearchCombobox: React.FC<ProductSearchComboboxProps> = ({
  products,
  onSelectProduct,
  placeholder = 'Search product by name, Urdu name, barcode, category...',
  autoFocus = false,
  priceType = 'retail',
  className = ''
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredProducts = products.filter((p) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      (p.urduName && p.urduName.includes(q)) ||
      (p.barcode && p.barcode.includes(q)) ||
      (p.category && p.category.toLowerCase().includes(q))
    );
  }).slice(0, 15); // limit to top 15 results for optimal performance

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (p: ProductRecord) => {
    onSelectProduct(p);
    setQuery('');
    setIsOpen(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'Enter')) {
      setIsOpen(true);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < filteredProducts.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filteredProducts.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredProducts[highlightedIndex]) {
        handleSelect(filteredProducts[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const getDisplayPrice = (p: ProductRecord) => {
    if (priceType === 'wholesale') return p.wholesalePrice || p.retailPrice;
    if (priceType === 'cost') return p.costPrice || p.retailPrice;
    return p.retailPrice;
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Input Field */}
      <div className="relative flex items-center">
        <div className="absolute left-3.5 text-slate-400 pointer-events-none">
          <Search size={16} />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          autoFocus={autoFocus}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(0);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-[#1e1e2d] border border-slate-200 dark:border-[#2b2b40] rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all shadow-xs"
        />
        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs px-1 py-0.5"
          >
            ✕
          </button>
        ) : (
          <div className="absolute right-3 text-slate-400 pointer-events-none">
            <ChevronDown size={15} />
          </div>
        )}
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-[#1e1e2d] border border-slate-200 dark:border-[#2b2b40] rounded-xl shadow-xl z-50 max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-[#2b2b40]/50 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="px-3 py-1.5 bg-slate-50 dark:bg-[#151521] text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center justify-between sticky top-0 z-10 border-b border-slate-100 dark:border-[#2b2b40]">
            <span>Products Catalog ({filteredProducts.length} results)</span>
            <span className="text-[10px] font-mono text-blue-500">Press [Enter] or click to add</span>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-400">
              No products found matching "{query}". Add a new product or check barcode/spelling.
            </div>
          ) : (
            filteredProducts.map((p, idx) => {
              const isSelected = idx === highlightedIndex;
              const godown = p.godownStock ?? p.currentStock;
              const shop = p.shopStock ?? 0;
              const totalStock = godown + shop;
              const price = getDisplayPrice(p);

              return (
                <div
                  key={p.id}
                  onClick={() => handleSelect(p)}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  className={`px-3.5 py-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-blue-50/80 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100'
                      : 'hover:bg-slate-50 dark:hover:bg-[#151521] text-slate-800 dark:text-slate-200'
                  }`}
                >
                  {/* Left: Product Info */}
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <Package size={15} />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm tracking-tight">{p.name}</span>
                        {p.category && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                            {p.category}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-slate-400">
                        <span className="font-urdu text-slate-500 dark:text-slate-300">{p.urduName}</span>
                        {p.barcode && <span className="font-mono text-[11px] text-slate-400">#{p.barcode}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Right: Stock & Price */}
                  <div className="flex items-center space-x-4 text-right">
                    {/* Stock Badges */}
                    <div className="hidden sm:flex flex-col items-end text-[11px]">
                      <div className="flex items-center space-x-1.5">
                        <span className="inline-flex items-center text-slate-500 dark:text-slate-400" title="Godown Stock">
                          <Building2 size={11} className="mr-0.5 text-blue-500" />
                          {godown}
                        </span>
                        <span className="text-slate-300">|</span>
                        <span className="inline-flex items-center text-slate-500 dark:text-slate-400" title="Shop Stock">
                          <Store size={11} className="mr-0.5 text-emerald-500" />
                          {shop}
                        </span>
                      </div>
                      <span
                        className={`font-semibold ${
                          totalStock <= (p.minThreshold || 5)
                            ? 'text-rose-500 font-bold'
                            : 'text-slate-400'
                        }`}
                      >
                        Total: {totalStock} {p.unit || 'Units'}
                      </span>
                    </div>

                    {/* Price & Action */}
                    <div className="flex items-center space-x-2">
                      <div className="text-right">
                        <div className="text-sm font-black text-slate-900 dark:text-white font-mono">
                          Rs. {price.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-400 capitalize">
                          {priceType} Rate
                        </div>
                      </div>
                      <button
                        type="button"
                        className="p-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-transform active:scale-95 shadow-xs"
                        title="Add to Bill"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
