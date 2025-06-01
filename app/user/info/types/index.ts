export interface InfoCategory {
  id: string;
  name: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  questions: InfoQuestion[];
}

export interface InfoQuestion {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  categoryId: string;
}

export interface InfoCategoryWithQuestions extends InfoCategory {
  questions: InfoQuestion[];
}

// API用の型定義
export interface CreateCategoryRequest {
  userId: string;
  name: string;
  sortOrder: number;
}

export interface UpdateCategoryRequest {
  userId: string;
  categoryId: string;
  name?: string;
  sortOrder?: number;
}

export interface DeleteCategoryRequest {
  userId: string;
  categoryId: string;
}

export interface CreateQuestionRequest {
  categoryId: string;
  question: string;
  answer: string;
  sortOrder: number;
}

export interface UpdateQuestionRequest {
  questionId: string;
  question?: string;
  answer?: string;
  sortOrder?: number;
}

export interface DeleteQuestionRequest {
  questionId: string;
}

export interface UpdateCategorySortOrderRequest {
  userId: string;
  categories: Array<{
    id: string;
    sortOrder: number;
  }>;
}

export interface UpdateQuestionSortOrderRequest {
  categoryId: string;
  questions: Array<{
    id: string;
    sortOrder: number;
  }>;
}

// APIレスポンス用の型定義
export interface InfoCategoriesResponse {
  categories: InfoCategoryWithQuestions[];
  total: number;
}

export interface CreateCategoryResponse {
  category: InfoCategory;
  message: string;
}

export interface CreateQuestionResponse {
  question: InfoQuestion;
  message: string;
}
