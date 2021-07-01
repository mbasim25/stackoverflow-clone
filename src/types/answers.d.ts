export interface Answer {
  id?: string;
  body: string;
  votes?: number;
  userId?: string;
  questionId?: string;
}

export interface AnswerLike {
  id?: number;
  userId?: string;
  answerId?: string;
  type?: any;
}
