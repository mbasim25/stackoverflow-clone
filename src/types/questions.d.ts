import { Question as BaseQuestion } from ".prisma/client";
import { QuestionVote as BaseVotes } from ".prisma/client";
import { Pagination as BasePagination } from "./pagination";

export interface Question extends BaseQuestion {}

export interface QuestionFilter extends BasePagination {
  id: string;
  userId: string;
  field: string;
  title: string;
  tags: string;
  minVotes: number;
  maxVotes: number;
  body: string;
}

export interface QuestionVote extends BaseVotes {}
