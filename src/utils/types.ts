export type ItemWithoutId = {
  name: string;
  checked: string;
};

export type Item = ItemWithoutId & {
  id: string;
};

export type Items = Item[];
