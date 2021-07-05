import { Answer as BaseAnswer } from ".prisma/client";
import { AnswerVote as BaseVote } from ".prisma/client";
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

export interface AnswerVote extends BaseVote {}
