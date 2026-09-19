export type UserType = "Admin" | "User";

export const USER_TYPES: UserType[] = ["Admin", "User"];

export interface User {
  user_id: number;
  name: string;
  email: string;
  user_type: UserType;
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  user_type: UserType;
}

export interface Client {
  client_id: number;
  cpf: string;
  name: string;
  email: string;
  mobile: string;
}

export interface CreateClientInput {
  cpf: string;
  name: string;
  email: string;
  mobile: string;
}

export type DogSize = "Small" | "Medium" | "Large";

export const DOG_SIZES: DogSize[] = ["Small", "Medium", "Large"];

export const DOG_SIZE_LABELS: Record<DogSize, string> = {
  Small: "Pequeno",
  Medium: "Médio",
  Large: "Grande",
};

export interface Dog {
  dog_id: number;
  client_id: number;
  name: string;
  breed: string;
  size: DogSize;
  registration_date: string;
}

export interface CreateDogInput {
  client_id: number;
  name: string;
  breed: string;
  size: DogSize;
  registration_date: string;
}

export interface ClientListRow extends Client {
  dogCount: number;
}

export interface SanitaryItem {
  sanitary_item_id: number;
  dog_id: number;
  item: string;
  valid_from: string;
  valid_to: string;
  updated: string;
  observations: string;
}

export interface CreateSanitaryItemInput {
  dog_id: number;
  item: string;
  valid_from: string;
  valid_to: string;
  updated: string;
  observations: string;
}
