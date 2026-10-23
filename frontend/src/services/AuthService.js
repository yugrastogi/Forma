import api from "./api";

export const authService = {
    signup: async (details)=>{
        const response = await api.post("/api/auth/signup", details);
        return response.data;
    },

    login: async (details)=>{
        const response = await api.post("/api/auth/login", details);
        return response.data;
    },
    logout: async ()=>{
        const response = await api.post("/api/auth/logout");
        return response.data;
    },
    me: async ()=>{
        const response = await api.get("/api/auth/me");
        return response.data;
    }
}