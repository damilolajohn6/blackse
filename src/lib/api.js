import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_SERVER
  ? `${process.env.NEXT_PUBLIC_SERVER}`
  : "http://localhost:8000/api/v2";

export const api = axios.create({
  baseURL: `${API_BASE_URL}/instructor`,
  withCredentials: true,
});

class ApiClient {
  constructor() {
    this.baseURL =
      process.env.NEXT_PUBLIC_SERVER || "http://localhost:8000/api/v2";
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      credentials: "include",
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `HTTP error! status: ${response.status}`
        );
      }

      return data;
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  // Authentication endpoints
  async login(credentials) {
    return this.request("/service-provider/login-service-provider", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  async register(data) {
    return this.request("/service-provider/create-service-provider", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async activate(data) {
    return this.request("/service-provider/activation", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async forgotPassword(email) {
    return this.request("/service-provider/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(data) {
    return this.request("/service-provider/reset-password", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async resendOtp(email) {
    return this.request("/service-provider/resend-otp", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  async logout() {
    return this.request("/service-provider/logout");
  }

  async getProfile() {
    return this.request("/service-provider/get-service-provider");
  }

  // Service Provider endpoints
  async updateProfile(data) {
    return this.request("/service-provider/update-service-provider-info", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async updateAvatar(avatar) {
    return this.request("/service-provider/update-service-provider-avatar", {
      method: "PUT",
      body: JSON.stringify({ avatar }),
    });
  }

  async getBookings(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(
      `/service-provider/get-service-provider-bookings/${params.serviceProviderId}?${queryString}`
    );
  }

  async updateBookingStatus(bookingId, status, cancellationReason) {
    return this.request(
      `/service-provider/update-booking-status/${bookingId}`,
      {
        method: "PUT",
        body: JSON.stringify({ status, cancellationReason }),
      }
    );
  }

  async getStats(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/service-provider/stats?${queryString}`);
  }

  // Services endpoints
  async addService(data) {
    return this.request("/service-provider/add-service-offered", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateService(serviceId, data) {
    return this.request(
      `/service-provider/update-service-offered/${serviceId}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
  }

  async deleteService(serviceId) {
    return this.request(
      `/service-provider/delete-service-offered/${serviceId}`,
      {
        method: "DELETE",
      }
    );
  }

  // Reviews endpoints
  async getReviews(serviceProviderId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(
      `/service-provider/get-service-provider-reviews/${serviceProviderId}?${queryString}`
    );
  }

  // Messaging endpoints
  async getConversations(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/service-provider/get-conversations?${queryString}`);
  }

  async getMessages(userId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(
      `/service-provider/get-messages-with-user/${userId}?${queryString}`
    );
  }

  async sendMessage(userId, data) {
    return this.request(`/service-provider/reply-to-user/${userId}`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async markMessageAsRead(messageId) {
    return this.request(`/service-provider/mark-message-read/${messageId}`, {
      method: "PUT",
    });
  }

  async deleteMessage(messageId) {
    return this.request(`/service-provider/delete-message/${messageId}`, {
      method: "DELETE",
    });
  }

  async archiveConversation(userId) {
    return this.request(`/service-provider/archive-conversation/${userId}`, {
      method: "PUT",
    });
  }

  async blockUser(userId) {
    return this.request(`/service-provider/block-user/${userId}`, {
      method: "PUT",
    });
  }

  async unblockUser(userId) {
    return this.request(`/service-provider/unblock-user/${userId}`, {
      method: "PUT",
    });
  }

  // Notification endpoints
  async updateNotificationPreferences(preferences) {
    return this.request("/service-provider/update-notification-preferences", {
      method: "PUT",
      body: JSON.stringify(preferences),
    });
  }
}

const apiClient = new ApiClient();
export default apiClient;

