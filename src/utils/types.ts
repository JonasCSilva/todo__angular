export type ItemWithoutId = {
  name: string;
  index: number;
  status: string;
};

export type Item = ItemWithoutId & {
  id: string;
};

export type Items = Item[];
