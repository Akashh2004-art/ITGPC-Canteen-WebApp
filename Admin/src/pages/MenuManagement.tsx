import { useState, useEffect } from 'react';
import { Plus, Search, Sparkles, UtensilsCrossed } from 'lucide-react';
import { MenuItem, MenuCategory } from '@/types';
import { MenuCard } from '@/components/menu/MenuCard';
import { MenuItemModal } from '@/components/menu/MenuItemModal';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const categories: { value: string; label: string }[] = [
  { value: 'all', label: 'All Categories' },
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'snacks', label: 'Snacks' },
  { value: 'beverages', label: 'Beverages' },
];

export default function MenuManagement() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/menu`);

      if (!response.ok) {
        throw new Error('Failed to fetch menu items');
      }

      const data = await response.json();
      setMenuItems(data);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      toast.error('Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Separate regular and special items
  const regularItems = menuItems.filter(item => !item.isSpecial);
  const specialItems = menuItems.filter(item => {
    if (!item.isSpecial) return false;
    // Check if still valid
    if (item.validUntil) {
      return new Date(item.validUntil) >= new Date();
    }
    return true;
  });

  // ✅ Apply filters
  const filterItems = (items: MenuItem[]) => {
    return items.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  };

  const filteredRegular = filterItems(regularItems);
  const filteredSpecial = filterItems(specialItems);

  const handleAddItem = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleSaveItem = async (formData: FormData, itemId?: string) => {
    try {
      const url = itemId ? `${API_URL}/api/menu/${itemId}` : `${API_URL}/api/menu`;
      const method = itemId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to save menu item');
      }

      const savedItem = await response.json();

      if (itemId) {
        setMenuItems((prev) => prev.map((item) => (item.id === itemId ? savedItem : item)));
        toast.success('Menu item updated successfully!');
      } else {
        setMenuItems((prev) => [...prev, savedItem]);
        toast.success('Menu item added successfully!');
      }

      setIsModalOpen(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Error saving menu item:', error);
      toast.error('Failed to save menu item');
    }
  };

  const handleDeleteItem = (id: string) => {
    setDeleteItemId(id);
  };

  const confirmDelete = async () => {
    if (!deleteItemId) return;

    try {
      const response = await fetch(`${API_URL}/api/menu/${deleteItemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete menu item');
      }

      setMenuItems((prev) => prev.filter((item) => item.id !== deleteItemId));
      toast.success('Menu item deleted successfully!');
      setDeleteItemId(null);
    } catch (error) {
      console.error('Error deleting menu item:', error);
      toast.error('Failed to delete menu item');
    }
  };

  const handleToggleAvailability = async (id: string, available: boolean) => {
    try {
      const response = await fetch(`${API_URL}/api/menu/${id}/availability`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ available }),
      });

      if (!response.ok) {
        throw new Error('Failed to update availability');
      }

      setMenuItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, available } : item))
      );

      toast.success(available ? 'Item is now available' : 'Item marked as unavailable');
    } catch (error) {
      console.error('Error updating availability:', error);
      toast.error('Failed to update availability');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
            Menu Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your canteen menu items and special offers
          </p>
        </div>
        <Button onClick={handleAddItem} className="bg-primary hover:bg-primary/90">
          <Plus size={18} className="mr-2" />
          Add New Item
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search menu items..."
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48 bg-background">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            {categories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ✅ Special Menu Section */}
      {filteredSpecial.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b-2 border-dashed border-border">
            <div className="size-10 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-foreground">Today's Specials</h2>
              <p className="text-sm text-muted-foreground">
                {filteredSpecial.length} special offer{filteredSpecial.length > 1 ? 's' : ''} available
              </p>
            </div>
            <div className="ml-auto px-4 py-1.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full text-sm font-bold shadow-lg">
              🔥 LIMITED TIME
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredSpecial.map((item, idx) => (
              <div
                key={item.id}
                className="animate-fade-in"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <MenuCard
                  item={item}
                  onEdit={handleEditItem}
                  onDelete={handleDeleteItem}
                  onToggleAvailability={handleToggleAvailability}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ✅ Regular Menu Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 pb-4 border-b-2 border-dashed border-border">
          <div className="size-10 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-lg">
            <UtensilsCrossed className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black text-foreground">Regular Menu</h2>
            <p className="text-sm text-muted-foreground">
              {filteredRegular.length} item{filteredRegular.length > 1 ? 's' : ''} available
            </p>
          </div>
        </div>

        {filteredRegular.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredRegular.map((item, idx) => (
              <div
                key={item.id}
                className="animate-fade-in"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <MenuCard
                  item={item}
                  onEdit={handleEditItem}
                  onDelete={handleDeleteItem}
                  onToggleAvailability={handleToggleAvailability}
                />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No menu items found"
            description={
              searchQuery || selectedCategory !== 'all'
                ? 'Try adjusting your search or filter'
                : 'Add your first menu item to get started'
            }
            action={
              <Button onClick={handleAddItem} className="bg-primary hover:bg-primary/90">
                <Plus size={18} className="mr-2" />
                Add Menu Item
              </Button>
            }
          />
        )}
      </div>

      {/* Menu Item Modal */}
      <MenuItemModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSaveItem}
        item={editingItem}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteItemId}
        onClose={() => setDeleteItemId(null)}
        onConfirm={confirmDelete}
        title="Delete Menu Item"
        message="Are you sure you want to delete this menu item? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}