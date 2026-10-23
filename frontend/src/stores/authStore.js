import {create} from "zustand";
import { authService } from "../services/AuthService";
export const useAuthStore = create((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,

    signup: async (details) => {
        set ({ isLoading: true});

        try{
            const data = await authService.signup(details);

            set({user: data.user,
                isAuthenticated: true,
        })
        return data
        }finally{
            set({isLoading: false})
        }
},

login: async (details) => {
    set({isLoading: true});

    try{
        const data = await authService.login(details);

        set({user: data.user,
            isAuthenticated: true,
    })
    return data
    }finally{
        set({isLoading: false})
    }
},

logout: async () => {
    set({isLoading: true});

    try{
        await authService.logout();

        set({user: null,
            isAuthenticated: false,
    })
    }finally{
        set({isLoading: false})
    }  
},

fetchUser: async () => {
    set({isLoading: true});

    try{
        const data = await authService.me();

        set({user: data.user,
            isAuthenticated: true,
    })
    return data
    }catch{
        set({user: null,
            isAuthenticated: false,
        });

        return null;
    }

    finally{
        set({isLoading: false})
    }
}
}));