import { useState, useEffect } from 'react';
import { X, Upload, Tag, Percent } from 'lucide-react';
import { MenuItem, MenuCategory } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface MenuItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: FormData, itemId?: string) => void;
  item?: MenuItem | null;
}

const categories: { value: MenuCategory; label: string }[] = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'snacks', label: 'Snacks' },
  { value: 'beverages', label: 'Beverages' },
];

const specialBadges = [
  { value: 'hot', label: 'HOT DEAL' },
  { value: 'limited', label: 'LIMITED TIME' },
  { value: 'new', label: 'NEW ARRIVAL' },
  { value: 'bestseller', label: 'BESTSELLER' },
  { value: 'combo', label: 'COMBO OFFER' },
];

export function MenuItemModal({ isOpen, onClose, onSave, item }: MenuItemModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'snacks' as MenuCategory,
    price: '',
    available: true,
    isSpecial: false,
    originalPrice: '',
    discountPercentage: '',
    specialBadge: 'hot',
    specialDescription: '',
    validUntil: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        description: item.description,
        category: item.category,
        price: item.price.toString(),
        available: item.available,
        isSpecial: item.isSpecial || false,
        originalPrice: item.originalPrice?.toString() || '',
        discountPercentage: item.discountPercentage?.toString() || '',
        specialBadge: item.specialBadge || 'hot',
        specialDescription: item.specialDescription || '',
        validUntil: item.validUntil || '',
      });
      if (item.image) {
        setImagePreview(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/upload/${item.image}`);
      }
    } else {
      resetForm();
    }
    setErrors({});
  }, [item, isOpen]);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'snacks',
      price: '',
      available: true,
      isSpecial: false,
      originalPrice: '',
      discountPercentage: '',
      specialBadge: 'hot',
      specialDescription: '',
      validUntil: '',
    });
    setSelectedFile(null);
    setImagePreview('');
  };

  // Calculate discounted price
  const calculateDiscountedPrice = (original: number, discount: number) => {
    return Math.round(original - (original * discount) / 100);
  };

  // Auto-update price when discount changes
  useEffect(() => {
    if (formData.isSpecial && formData.originalPrice && formData.discountPercentage) {
      const original = parseFloat(formData.originalPrice);
      const discount = parseFloat(formData.discountPercentage);

      if (original > 0 && discount > 0) {
        const discountedPrice = calculateDiscountedPrice(original, discount);
        setFormData(prev => ({ ...prev, price: discountedPrice.toString() }));
      }
    }
  }, [formData.isSpecial, formData.originalPrice, formData.discountPercentage]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle number input with proper validation
  const handleNumberInput = (field: string, value: string) => {
    // Remove leading zeros and keep only valid numbers
    const cleaned = value.replace(/^0+/, '') || '';

    // Allow empty or valid numbers
    if (cleaned === '' || /^\d*\.?\d*$/.test(cleaned)) {
      setFormData({ ...formData, [field]: cleaned });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';

    // Validate based on special status
    if (formData.isSpecial) {
      const originalPrice = parseFloat(formData.originalPrice);
      const discount = parseFloat(formData.discountPercentage);

      if (!formData.originalPrice || originalPrice <= 0) {
        newErrors.originalPrice = 'Original price is required';
      }
      if (!formData.discountPercentage || discount <= 0 || discount > 100) {
        newErrors.discountPercentage = 'Discount must be between 1-100%';
      }
      if (!formData.validUntil) newErrors.validUntil = 'Valid until date is required';
    } else {
      const price = parseFloat(formData.price);
      if (!formData.price || price <= 0) {
        newErrors.price = 'Price must be greater than 0';
      }
    }

    if (!item && !selectedFile) {
      newErrors.image = 'Please select an image';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('category', formData.category);
    data.append('price', formData.price);
    data.append('available', formData.available.toString());

    // Add special menu data
    data.append('isSpecial', formData.isSpecial.toString());
    if (formData.isSpecial) {
      data.append('originalPrice', formData.originalPrice);
      data.append('discountPercentage', formData.discountPercentage);
      data.append('specialBadge', formData.specialBadge);
      data.append('specialDescription', formData.specialDescription);
      data.append('validUntil', formData.validUntil);
    }

    if (selectedFile) {
      data.append('image', selectedFile);
    }

    onSave(data, item?.id);
    toast.success(item ? 'Menu item updated!' : 'Menu item added!');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-card rounded-xl shadow-xl animate-scale-in">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-border bg-card rounded-t-xl z-10">
          <h2 className="text-xl font-display font-bold text-foreground">
            {item ? 'Edit Menu Item' : 'Add New Menu Item'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <X size={20} className="text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Special Menu Toggle */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-lg bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                  <Tag className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Make this a Special Item</h3>
                  <p className="text-sm text-slate-600">Add discount and show in Today's Specials</p>
                </div>
              </div>
              <Switch
                checked={formData.isSpecial}
                onCheckedChange={(checked) => setFormData({ ...formData, isSpecial: checked })}
                className="data-[state=checked]:bg-orange-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">Item Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter item name"
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">Description *</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter item description"
                rows={3}
                className={errors.description ? 'border-destructive' : ''}
              />
              {errors.description && <p className="text-sm text-destructive mt-1">{errors.description}</p>}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Category *</label>
              <Select
                value={formData.category}
                onValueChange={(value: MenuCategory) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select category" />
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

            {/* Conditional Price Fields */}
            {!formData.isSpecial ? (
              /* Regular Price */
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Price (₹) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                  <Input
                    type="text"
                    inputMode="decimal"
                    value={formData.price}
                    onChange={(e) => handleNumberInput('price', e.target.value)}
                    placeholder="0"
                    className={`pl-8 ${errors.price ? 'border-destructive' : ''}`}
                  />
                </div>
                {errors.price && <p className="text-sm text-destructive mt-1">{errors.price}</p>}
              </div>
            ) : (
              <>
                {/* Original Price */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Original Price (₹) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                    <Input
                      type="text"
                      inputMode="decimal"
                      value={formData.originalPrice}
                      onChange={(e) => handleNumberInput('originalPrice', e.target.value)}
                      placeholder="225"
                      className={`pl-8 ${errors.originalPrice ? 'border-destructive' : ''}`}
                    />
                  </div>
                  {errors.originalPrice && <p className="text-sm text-destructive mt-1">{errors.originalPrice}</p>}
                </div>

                {/* Discount Percentage */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Discount (%) *</label>
                  <div className="relative">
                    <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="text"
                      inputMode="decimal"
                      value={formData.discountPercentage}
                      onChange={(e) => {
                        const value = e.target.value.replace(/^0+/, '') || '';
                        if (value === '' || (/^\d*\.?\d*$/.test(value) && parseFloat(value) <= 100)) {
                          setFormData({ ...formData, discountPercentage: value });
                        }
                      }}
                      placeholder="33"
                      className={`pl-9 ${errors.discountPercentage ? 'border-destructive' : ''}`}
                    />
                  </div>
                  {errors.discountPercentage && <p className="text-sm text-destructive mt-1">{errors.discountPercentage}</p>}
                </div>

                {/* Final Price Display */}
                {formData.originalPrice && formData.discountPercentage && parseFloat(formData.originalPrice) > 0 && parseFloat(formData.discountPercentage) > 0 && (
                  <div className="md:col-span-2 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-700 font-medium">Final Price (Auto-calculated)</p>
                        <p className="text-xs text-green-600 mt-1">
                          Original: ₹{formData.originalPrice} - {formData.discountPercentage}% OFF
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-black text-green-700">₹{formData.price}</p>
                        <p className="text-sm text-green-600">You save ₹{parseFloat(formData.originalPrice) - parseFloat(formData.price)}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Special Badge */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Badge</label>
                  <Select
                    value={formData.specialBadge}
                    onValueChange={(value) => setFormData({ ...formData, specialBadge: value })}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {specialBadges.map((badge) => (
                        <SelectItem key={badge.value} value={badge.value}>
                          {badge.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Valid Until */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Valid Until *</label>
                  <Input
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className={errors.validUntil ? 'border-destructive' : ''}
                  />
                  {errors.validUntil && <p className="text-sm text-destructive mt-1">{errors.validUntil}</p>}
                </div>

                {/* Special Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Special Description (Optional)
                  </label>
                  <Textarea
                    value={formData.specialDescription}
                    onChange={(e) => setFormData({ ...formData, specialDescription: e.target.value })}
                    placeholder="e.g., Limited time offer! Complete meal for lunch"
                    rows={2}
                  />
                </div>
              </>
            )}

            {/* Image Upload */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">
                Item Image {!item && '*'}
              </label>

              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className={`flex items-center justify-center gap-2 w-full px-4 py-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors
                      ${errors.image ? 'border-destructive bg-destructive/5' : 'border-border hover:border-primary hover:bg-primary/5'}
                    `}
                  >
                    <Upload className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {selectedFile ? selectedFile.name : 'Click to upload image'}
                    </span>
                  </label>
                </div>

                {errors.image && <p className="text-sm text-destructive">{errors.image}</p>}

                {imagePreview && (
                  <div className="relative">
                    <label className="block text-sm font-medium text-foreground mb-2">Preview</label>
                    <div className="relative w-full h-48 rounded-lg overflow-hidden bg-muted border border-border">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null);
                          setImagePreview('');
                        }}
                        className="absolute top-2 right-2 p-2 bg-destructive/90 hover:bg-destructive text-destructive-foreground rounded-lg transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                )}

                <p className="text-xs text-muted-foreground">
                  Supported formats: JPG, PNG, GIF. Max size: 5MB
                </p>
              </div>
            </div>

            {/* Available */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="available"
                  checked={formData.available}
                  onCheckedChange={(checked) => setFormData({ ...formData, available: checked as boolean })}
                />
                <label htmlFor="available" className="text-sm font-medium text-foreground cursor-pointer">
                  Available for ordering
                </label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              {item ? 'Save Changes' : 'Add Item'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}