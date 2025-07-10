export type chain = {
  id: string;
  type: string; // one-way / two-way / multi-way
  lender_id: string;
  taker_id?: string;
  initial_amount: number;
  status: string; // active / completed
}