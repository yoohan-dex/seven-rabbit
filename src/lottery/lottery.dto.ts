export class LotteryDto {
  name: string;
  message: string;
  startTime: number;
  stopTime: number;
  rate: number;
  maxPerUser: number;

  prize: {
    id?: number;
    name: string;
    avatar: any;
    description: string;
    count: number;
    trueRate: boolean;
  }[];
}

export class updateLotteryDto extends LotteryDto {
  id: number;
}
