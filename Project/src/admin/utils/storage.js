export const adminStorage = {
  isAdminKey: "isAdmin",
  adminNameKey: "adminName",

  isAdmin() {
    return window.localStorage.getItem(this.isAdminKey) === "true";
  },

  getAdminName() {
    return window.localStorage.getItem(this.adminNameKey) || "Administrator";
  },

  login(adminName = "Administrator") {
    window.localStorage.setItem(this.isAdminKey, "true");
    window.localStorage.setItem(this.adminNameKey, adminName);
  },

  logout() {
    window.localStorage.removeItem(this.isAdminKey);
    window.localStorage.removeItem(this.adminNameKey);
  },
};

