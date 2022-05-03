export type ItemWithoutId = {
  name: string;
  checked: boolean;
};

export type Item = ItemWithoutId & {
  id: string;
};

export type Items = Item[];
