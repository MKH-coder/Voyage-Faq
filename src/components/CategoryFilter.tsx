import React from 'react';
import { 
  Coins, 
  Car, 
  HeartHandshake, 
  Smartphone, 
  ShieldAlert, 
  FileText, 
  LayoutGrid
} from 'lucide-react';

interface CategoryFilterProps {
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  categoryCounts: Record<string, number>;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
  categoryCounts,
}) => {
  const categories: { id: string; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'All FAQs', icon: <LayoutGrid className="w-4 h-4" /> },
    { id: 'currency-budget', label: 'Currency & Costs', icon: <Coins className="w-4 h-4" /> },
    { id: 'transit-transport', label: 'Transport & Drivers', icon: <Car className="w-4 h-4" /> },
    { id: 'customs-etiquette', label: 'Customs & Places of Worship', icon: <HeartHandshake className="w-4 h-4" /> },
    { id: 'connectivity-tech', label: 'SIM, Wi-Fi & Plugs', icon: <Smartphone className="w-4 h-4" /> },
    { id: 'safety-emergency', label: 'Emergency & Hotlines', icon: <ShieldAlert className="w-4 h-4" /> },
    { id: 'visa-passports', label: 'Visas & Entry', icon: <FileText className="w-4 h-4" /> },
  ];

  return (
    <div className="w-full overflow-x-auto pb-2 scrollbar-thin">
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-100/90 rounded-xl border border-slate-200/80 min-w-max">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          const count = categoryCounts[cat.id] ?? 0;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <span className={isActive ? 'text-amber-600' : 'text-slate-500'}>
                {cat.icon}
              </span>
              <span>{cat.label}</span>
              {count > 0 && (
                <span className={`text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded ${
                  isActive ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-600'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
