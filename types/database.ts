export type DashboardType = "logistics" | "retail" | "custom";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; full_name: string | null; role: string; created_at: string };
        Insert: { id: string; full_name?: string | null; role?: string; created_at?: string };
        Update: { full_name?: string | null; role?: string };
      };
      businesses: {
        Row: { id: string; user_id: string; name: string; dashboard_type: DashboardType; created_at: string };
        Insert: { id?: string; user_id: string; name: string; dashboard_type: DashboardType; created_at?: string };
        Update: { name?: string; dashboard_type?: DashboardType };
      };
      dashboard_templates: {
        Row: { id: string; name: string; type: DashboardType; description: string; created_at: string };
        Insert: { id?: string; name: string; type: DashboardType; description: string; created_at?: string };
        Update: { name?: string; type?: DashboardType; description?: string };
      };
      user_dashboards: {
        Row: { id: string; user_id: string; business_id: string; template_id: string | null; title: string; type: DashboardType; created_at: string };
        Insert: { id?: string; user_id: string; business_id: string; template_id?: string | null; title: string; type: DashboardType; created_at?: string };
        Update: { title?: string; type?: DashboardType; template_id?: string | null };
      };
      metrics: {
        Row: { id: string; business_id: string; name: string; unit: string; dashboard_type: DashboardType; created_at: string };
        Insert: { id?: string; business_id: string; name: string; unit: string; dashboard_type: DashboardType; created_at?: string };
        Update: { name?: string; unit?: string; dashboard_type?: DashboardType };
      };
      metric_entries: {
        Row: { id: string; metric_id: string; value: number; entry_date: string; note: string | null; created_at: string };
        Insert: { id?: string; metric_id: string; value: number; entry_date: string; note?: string | null; created_at?: string };
        Update: { value?: number; entry_date?: string; note?: string | null };
      };
      custom_charts: {
        Row: { id: string; user_id: string; business_id: string; title: string; chart_type: string; metric_id: string | null; created_at: string };
        Insert: { id?: string; user_id: string; business_id: string; title: string; chart_type: string; metric_id?: string | null; created_at?: string };
        Update: { title?: string; chart_type?: string; metric_id?: string | null };
      };
    };
  };
};

export type Business = Database["public"]["Tables"]["businesses"]["Row"];
export type DashboardTemplate = Database["public"]["Tables"]["dashboard_templates"]["Row"];
export type UserDashboard = Database["public"]["Tables"]["user_dashboards"]["Row"];
export type Metric = Database["public"]["Tables"]["metrics"]["Row"];
export type MetricEntry = Database["public"]["Tables"]["metric_entries"]["Row"];
export type CustomChart = Database["public"]["Tables"]["custom_charts"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
