export interface Country {
  id: string;
  name: string;
  isoCode: string;
  categories: string[];
}

export interface CreateCountryInput {
  name: string;
  isoCode: string;
  categories?: string[];
}

export interface UpdateCountryInput {
  name?: string;
  isoCode?: string;
  categories?: string[];
}
