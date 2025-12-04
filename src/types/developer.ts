export type DeveloperRole = "junior" | "mid" | "senior" | "lead";

export interface Developer {
  id: string;
  name: string;
  email: string;
  role: DeveloperRole;
  team?: string;
  startDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
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

