import { Question as BaseQuestion } from ".prisma/client";
import { Pagination as BasePagination } from "./pagination";

export interface Question extends BaseQuestion {}

export interface QuestionFilter extends BasePagination {
  id: string;
  userId: string;
  minVotes: number;
  maxVotes: number;
  body: string;
}

export interface QuestionLike {
  id?: number;
  userId?: string;
  questionId?: string;
  type?: any;
}
