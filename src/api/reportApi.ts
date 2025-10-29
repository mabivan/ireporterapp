// services/reportsApi.ts

export interface Incident {
  id: number;
  type: "intervention" | "red-flag";
  title: string;
  comment: string;
  location: string;
  createdBy: number;
  status: "draft" | "under investigation" | "resolved" | "rejected";
  images: string[];
  videos: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UpdateIncidentData {
  type?: "intervention" | "red-flag";
  title?: string;
  comment?: string;
  location?: string;
  status?: "draft" | "under investigation" | "resolved" | "rejected";
  images?: string[];
  videos?: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface ReportsResponse {
  reports: Incident[];
  meta: PaginationMeta;
}

class ReportsApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get("content-type");

    if (!response.ok) {
      let errorMessage = "An error occurred";

      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        errorMessage =
          errorData.message ||
          errorData.error ||
          `HTTP error! status: ${response.status}`;
      } else {
        errorMessage =
          (await response.text()) || `HTTP error! status: ${response.status}`;
      }

      throw new Error(errorMessage);
    }

    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    }

    return (await response.text()) as unknown as T;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    const token = localStorage.getItem("token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Get all reports with optional pagination and filtering
   */
  async getAllReports(
    page: number = 1,
    limit: number = 50,
    filters?: {
      status?: string;
      type?: string;
      createdBy?: number;
    }
  ): Promise<ReportsResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(filters?.status && { status: filters.status }),
        ...(filters?.type && { type: filters.type }),
        ...(filters?.createdBy && { createdBy: filters.createdBy.toString() }),
      });

      const response = await fetch(`${this.baseURL}/reports?${params}`, {
        method: "GET",
        headers: this.getHeaders(),
      });

      return await this.handleResponse<ReportsResponse>(response);
    } catch (error) {
      console.error("Get all reports error:", error);
      throw error;
    }
  }

  /**
   * Get a single report by ID
   */
  async getReportById(reportId: number): Promise<Incident> {
    try {
      const response = await fetch(`${this.baseURL}/reports/${reportId}`, {
        method: "GET",
        headers: this.getHeaders(),
      });

      const result = await this.handleResponse<ApiResponse<Incident>>(response);

      if (!result.success || !result.data) {
        throw new Error(result.message || "Report not found");
      }

      return result.data;
    } catch (error) {
      console.error(`Get report ${reportId} error:`, error);
      throw error;
    }
  }

  /**
   * Update a report
   */
  async updateReport(
    reportId: number,
    updateData: UpdateIncidentData
  ): Promise<Incident> {
    try {
      const response = await fetch(`${this.baseURL}/reports/${reportId}`, {
        method: "PATCH",
        headers: this.getHeaders(),
        body: JSON.stringify(updateData),
      });

      const result = await this.handleResponse<ApiResponse<Incident>>(response);

      if (!result.success || !result.data) {
        throw new Error(result.message || "Failed to update report");
      }

      return result.data;
    } catch (error) {
      console.error(`Update report ${reportId} error:`, error);
      throw error;
    }
  }

  /**
   * Update report status only
   */
  async updateReportStatus(
    reportId: number,
    status: Incident["status"]
  ): Promise<Incident> {
    return this.updateReport(reportId, { status });
  }

  /**
   * Delete a report
   */
  async deleteReport(
    reportId: number
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseURL}/reports/${reportId}`, {
        method: "DELETE",
        headers: this.getHeaders(),
      });

      const result = await this.handleResponse<ApiResponse<null>>(response);

      if (!result.success) {
        throw new Error(result.message || "Failed to delete report");
      }

      return { success: true, message: result.message };
    } catch (error) {
      console.error(`Delete report ${reportId} error:`, error);
      throw error;
    }
  }

  /**
   * Get reports statistics for admin dashboard
   */
  async getReportsStatistics(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byType: Record<string, number>;
    recentActivity: number;
  }> {
    try {
      const response = await fetch(`${this.baseURL}/reports/statistics`, {
        method: "GET",
        headers: this.getHeaders(),
      });

      const result = await this.handleResponse<ApiResponse<any>>(response);

      if (!result.success || !result.data) {
        throw new Error(result.message || "Failed to get statistics");
      }

      return result.data;
    } catch (error) {
      console.error("Get statistics error:", error);
      throw error;
    }
  }

  /**
   * Search reports by title, comment, or location
   */
  async searchReports(
    query: string,
    page: number = 1,
    limit: number = 50
  ): Promise<ReportsResponse> {
    try {
      const params = new URLSearchParams({
        q: query,
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await fetch(`${this.baseURL}/reports/search?${params}`, {
        method: "GET",
        headers: this.getHeaders(),
      });

      return await this.handleResponse<ReportsResponse>(response);
    } catch (error) {
      console.error("Search reports error:", error);
      throw error;
    }
  }

  /**
   * Export reports to CSV
   */
  async exportReportsToCSV(filters?: {
    status?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append("status", filters.status);
      if (filters?.type) params.append("type", filters.type);
      if (filters?.startDate) params.append("startDate", filters.startDate);
      if (filters?.endDate) params.append("endDate", filters.endDate);

      const response = await fetch(
        `${this.baseURL}/reports/export/csv?${params}`,
        {
          method: "GET",
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to export reports");
      }

      return await response.blob();
    } catch (error) {
      console.error("Export reports error:", error);
      throw error;
    }
  }
}

// Create and export a singleton instance
export const reportsApi = new ReportsApiService();

// Export for default imports
export default reportsApi;
