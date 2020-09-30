export interface LotteryDto {
  name: string;
  message: string;
  startTime: string;
  stopTime: string;
  rate: number;
  maxPerUser: number;
  headAvatar: any;

  prize: {
    id?: number;
    name: string;
    avatar: any;
    description: string;
    count: number;
    trueRate: boolean;
  }[];
}

export interface updateLotteryDto extends LotteryDto {
  id: number;
}
