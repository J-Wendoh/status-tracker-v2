export interface User {
  id: string
  name: string
  id_number: string
  county: string
  role: "officer" | "hod_ceo" | "ag"
  category: "department" | "saga"
  department_or_saga_id: string
  created_at: string
}

export interface DepartmentSaga {
  id: string
  name: string
  type: "department" | "saga"
}

export interface Service {
  id: string
  department_or_saga_id: string
  name: string
}

export interface Activity {
  id: string
  officer_id: string
  service_id: string
  description: string
  count: number
  file_url?: string
  created_at: string
  // Joined data
  officer?: User
  service?: Service
}

export interface ActivityStatus {
  id: string
  activity_id: string
  pending_count: number
  completed_count: number
  updated_by: string
  updated_at: string
  // Joined data
  activity?: Activity
  updater?: User
}

export interface ActivityWithDetails extends Activity {
  officer: {
    id: string
    name: string
    id_number: string
    county: string
  }
  service: {
    id: string
    name: string
  }
  activity_status: {
    id: string
    pending_count: number
    completed_count: number
    updated_by: string
    updated_at: string
  }[]
}

export interface UserWithDepartmentSaga extends User {
  departments_sagas: {
    id: string
    name: string
    type: string
  }
}

export interface UserWithDepartment extends User {
  departments_sagas: {
    id: string
    name: string
    type: string
  }
}
