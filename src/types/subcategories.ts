interface Subcategory {
  id: number;
  categoryId: number;
  name: string;
}

interface CreateSubcategoryRequest {
  categoryId: number;
  name: string;
}

interface UpdateSubcategoryRequest {
  categoryId: number;
  name: string;
}
