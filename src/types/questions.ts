export interface Question {
  id?: string;
  body: string;
  votes?: number;
  userId?: string;
}

export interface QuestionLikes {
  id?: number;
  userId?: string;
  questionId?: string;
  type?: string;
}
