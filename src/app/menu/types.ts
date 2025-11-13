export type VisibleMenuItem = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  imageUrl: string | null;
};

export type MenuCategoryGroup = {
  category: string;
  items: VisibleMenuItem[];
};
