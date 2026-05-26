export type UserFarm = {
  id: string;
  userId: string;
  farmName: string;
  regionCode: string;
  provinceName: string | null;
  districtName: string | null;
  locationLabel: string | null;
  totalHectares: number;
  waterSource: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UserFarmsResponse = {
  farms: UserFarm[];
};

export type CreateFarmInput = {
  farmName: string;
  regionCode: string;
  provinceName?: string | null;
  districtName?: string | null;
  locationLabel?: string | null;
  totalHectares: number;
  waterSource?: string | null;
};

export type CreateFarmResponse = {
  farm: UserFarm;
};
