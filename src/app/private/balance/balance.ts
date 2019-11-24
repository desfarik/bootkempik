export class Balance {
  constructor(public negative: any, public positive: any) {

  }
}

export interface AllBalance {
  // @ts-ignore
  lastUpdateDate: number;
  [userId: string]: Balance;
}
