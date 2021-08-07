import { Question as BaseQuestion } from ".prisma/client";
import { QuestionVote as BaseVotes } from ".prisma/client";
import { Pagination as BasePagination } from "./pagination";

export interface Question extends BaseQuestion {}

export interface QuestionFilter extends BasePagination {
  id: string;
  userId: string;
  fieldId: string;
  tags: string[];
  minVotes: number;
  maxVotes: number;
  minViews: number;
  maxViews: number;
  title: string;
  body: string;
  createdAt: "OLDEST";
}

export interface QuestionVote extends BaseVotes {}
