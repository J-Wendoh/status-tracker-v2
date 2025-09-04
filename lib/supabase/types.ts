export interface User {
  id: string
  email: string
  full_name: string
  county: string
  category: "Officer" | "HOD" | "CEO" | "AG"
  department_saga_id: number | null
  created_at: string
  updated_at: string
}

export interface DepartmentSaga {
  id: number
  name: string
  type: "Department" | "SAGA"
  created_at: string
}

export interface Service {
  id: number
  name: string
  department_saga_id: number | null
  created_at: string
}

export interface Activity {
  id: number
  user_id: string
  service_id: number | null
  description: string
  count: number
  file_url?: string | null
  created_at: string
  updated_at: string
  // Joined data
  service?: Service
}

export interface ActivityStatus {
  id: number
  activity_id: number | null
  updated_by: string | null
  pending_count: number | null
  completed_count: number | null
  status: string | null
  notes: string | null
  created_at: string
}

export interface UserWithDepartmentSaga extends User {
  departments_sagas: {
    id: number
    name: string
    type: string
  }
}
