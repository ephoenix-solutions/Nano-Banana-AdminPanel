export interface Subcategory {
  id: string;
  name: string;
  order: number;
  searchCount: number;
}

export interface Category {
  id: string;
  name: string;
  iconImage: string;
  order: number;
  searchCount: string | number;
  subcategories?: Subcategory[];
}

export interface CreateCategoryInput {
  name: string;
  iconImage?: string;
  order: number;
  searchCount?: string | number;
}

export interface UpdateCategoryInput {
  name?: string;
  iconImage?: string;
  order?: number;
  searchCount?: string | number;
}

export interface CreateSubcategoryInput {
  name: string;
  order: number;
  searchCount?: number;
}

export interface UpdateSubcategoryInput {
  name?: string;
  order?: number;
  searchCount?: number;
}
