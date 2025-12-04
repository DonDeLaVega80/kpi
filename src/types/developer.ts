export type DeveloperRole = "junior" | "mid" | "senior" | "lead";

export interface Developer {
  id: string;
  name: string;
  email: string;
  role: DeveloperRole;
  team?: string;
  startDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDeveloperInput {
  name: string;
  email: string;
  role: DeveloperRole;
  team?: string;
  startDate: string;
}

export interface UpdateDeveloperInput {
  id: string;
  name?: string;
  email?: string;
  role?: DeveloperRole;
  team?: string;
  isActive?: boolean;
}
