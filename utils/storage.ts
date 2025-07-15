export const getAdminToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("adminToken");
  }
  return null;
};

export const setAdminToken = (token: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("adminToken", token);
  }
};

export const removeAdminToken = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("adminToken");
  }
};
