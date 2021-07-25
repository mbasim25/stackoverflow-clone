import { Field as BaseField } from ".prisma/client";
import { Pagination as BasePagination } from "./pagination";

export interface Field extends BaseField {}

export interface FieldFilter extends BasePagination {
  id: string;
  name: string;
  deactivaterId: string;
}
