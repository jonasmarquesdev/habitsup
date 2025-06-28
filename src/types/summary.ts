export type Summary = Array<{
  id: string;
  date: string | Date;
  amount?: number;
  completed?: number;
}>;