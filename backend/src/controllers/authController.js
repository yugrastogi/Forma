const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require("../config/prisma")
const { signupSchema, loginSchema } = require("../validators/authSchemas");

const signup = async (req, res) => {
    try {
        const result = signupSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                message: "Invalid signup details",
                errors: result.error.issues.map((issue) => ({
                    field: issue.path.join("."),
                    message: issue.message
                }))
            })
        }


        const { name, email, password } = result.data;

        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return res.status(400).json({
                message: "User with this email already exists"
            })
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword
            },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
            }
        })

        const token = jwt.sign({
            userId: user.id,
        }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000 * 7,
            path: "/",
        })

        return res.status(201).json({
            message: "Account created successfully",
            user
        })
    }
    catch(error){
        if (error.code === 'P2002') {
            return res.status(400).json({
                message: "User with this email already exists"
            })
        }

        console.error("Signup error:", error);

        return res.status(500).json({
            message: "Something went wrong while creating the account",
        })
    }
}

const me = async (req, res) => {
    try{
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
            }
        });

        if(!user){
            return res.status(404).json({
                message: "User not found"
            })
        }

        return res.status(200).json({
            user
        })

    }
    catch(error){
        console.error("Fetch user error:", error);

        return res.status(500).json({
            message: "Something went wrong while fetching the user",
        })
    }
}


const login = async (req, res) => {
    try{
        const result = loginSchema.safeParse(req.body);

        if(!result.success){
            return res.status(400).json({
                message: "Invalid login details",
                errors: result.error.issues.map((issue) => ({
                    field: issue.path.join("."),
                    message: issue.message
                }))
            })
        }

        const { email, password } = result.data;

        const user = await prisma.user.findUnique({
            where: { email }
        });

        if(!user || !(await bcrypt.compare(password, user.password))){
            return res.status(400).json({
                message: "Invalid login details"
            })
        }
        
        const token = jwt.sign({
            userId: user.id,
        }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000 * 7,
            path: "/",  
        })

        return res.status(200).json({
            message: "Logged in successfully",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            }
        })
    }
    catch(error){
        console.error("Login error:", error);

        return res.status(500).json({
            message: "Something went wrong while logging in",
        })
    }
}


const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  return res.status(200).json({
    message: "Logged out successfully",
  });
};


module.exports = {
    signup,
    login,
    me,
    logout
};


