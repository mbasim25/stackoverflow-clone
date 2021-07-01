export interface Question {
  id?: string;
  body: string;
  votes?: number;
  userId?: string;
}

export interface QuestionLike {
  id?: number;
  userId?: string;
  questionId?: string;
  type?: any;
}
