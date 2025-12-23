import { MenuCategory } from '../types';

interface CategoryTabsProps {
    selectedCategory: MenuCategory | 'all';
    onSelectCategory: (category: MenuCategory | 'all') => void;
}

const categories: { value: MenuCategory | 'all'; label: string; icon: string }[] = [
    { value: 'all', label: 'All', icon: 'restaurant' },
    { value: 'breakfast', label: 'Breakfast', icon: 'breakfast_dining' },
    { value: 'lunch', label: 'Lunch', icon: 'lunch_dining' },
    { value: 'dinner', label: 'Dinner', icon: 'dinner_dining' },
    { value: 'snacks', label: 'Snacks', icon: 'cookie' },
    { value: 'beverages', label: 'Beverages', icon: 'local_cafe' },
];

export default function CategoryTabs({ selectedCategory, onSelectCategory }: CategoryTabsProps) {
    return (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => (
                <button
                    key={category.value}
                    onClick={() => onSelectCategory(category.value)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition-all ${selectedCategory === category.value
                            ? 'bg-secondary text-white shadow-lg shadow-secondary/30'
                            : 'bg-white/80 backdrop-blur text-slate-700 hover:bg-white hover:shadow-md'
                        }`}
                >
                    <span className="material-symbols-outlined text-lg">
                        {category.icon}
                    </span>
                    {category.label}
                </button>
            ))}
        </div>
    );
}