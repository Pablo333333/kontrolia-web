export interface Category {
  id: string;
  name: string;
  description?: string;
  subcategories?: Array<{ id: string; name: string; description?: string }>;
}

export interface WorkflowState {
  id: string;
  name: string;
  description?: string;
}
