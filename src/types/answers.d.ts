import { Answer as BaseAnswer } from ".prisma/client";
import { Pagination as BasePagination } from "./pagination";

export interface Answer extends BaseAnswer {}

export interface AnswerFilter extends BasePagination {
  id: string;
  questionId: string;
  userId: string;
  minVotes: number;
  maxVotes: number;
  body: string;
}

export interface AnswerLike {
  id?: number;
  userId?: string;
  answerId?: string;
  type?: any;
}
