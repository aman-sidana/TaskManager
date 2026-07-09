const userModel = require("../model/userModel")
const transporter = require('../utils/transporter')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const { createFirebaseUser, loginFirebaseUser, verifyFirebaseIdToken, firebaseErrorMessage } = require('../utils/firebase');
const secretKey = "sfsdgfhjklkadfgshljh"
const os = require("os");

const userResponse = (user) => ({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role
});

const makeToken = (user) => jwt.sign(
    { email: user.email },
    secretKey,
    { expiresIn: "5h" }
);




exports.signup = async (req, res) => {
    try {
        console.log(`>>>>>req.body`, req.body)
        // console.log(`>>>>>req.files`, req.files)
        

        const { name, email, password, role } = req.body;

        if (!(name && email && password)) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existUser = await userModel.findOne({ email });
        if (existUser) {
            return res.status(400).json({ message: "User already exist" });
        }

        let firebaseUser = null;

        try {
            firebaseUser = await createFirebaseUser(email, password);
        } catch (error) {
            console.log("Firebase signup skipped:", error.code || error.message);
        }

        const saltRounds = 10;
        const salt = bcrypt.genSaltSync(saltRounds)
        // console.log(`>>>>>salt`, salt)

        const hash = bcrypt.hashSync(password, salt)
        // console.log(`>>>>hash`, hash)

  

        const result = await userModel.create({
            name, email, password: hash, role, firebaseUid: firebaseUser?.localId || ""
        });


        const mail = await transporter.info(
            email,
            "signup",
            `<p>Dear user,</br> you have been scuccessfully signuped to the Task Manager </p>`
        );

        console.log(mail.messageId);

        return res.status(201).json({
            message: "User SingUped successfully",
            result,
            firebaseLinked: Boolean(firebaseUser)
        });
    } catch (error) {
        console.log(`>>>error`, error)
        return res.status(500).json({ message: "Server Side Error" });
    }
}

exports.login = async (req, res) => {
    try {

        // console.log(">>>>>>", req.body);

        const { email, password } = req.body;

        if (!(email && password)) {
            return res.status(400).json({ message: "Email and Password are required" });
        }

        let firebaseUser;
        let firebaseLoginError;

        try {
            firebaseUser = await loginFirebaseUser(email, password);
        } catch (error) {
            firebaseLoginError = error;
        }

        let user = await userModel.findOne({ email });

        console.log(">>>>user", user);

        if (!firebaseUser) {
            if (!user) {
                return res.status(404).json({
                    message: firebaseErrorMessage(firebaseLoginError?.code || "EMAIL_NOT_FOUND")
                });
            }

            const match = await bcrypt.compare(password, user.password)
            // console.log(`....>>>`, match)
            if (!match) {
                return res.status(400).json({
                    message: firebaseErrorMessage(firebaseLoginError?.code || "INVALID_PASSWORD")
                })
            }
        }

        if (firebaseUser && !user) {
            const saltRounds = 10;
            const salt = bcrypt.genSaltSync(saltRounds);
            const hash = bcrypt.hashSync(password, salt);

            user = await userModel.create({
                name: firebaseUser.displayName || email.split("@")[0],
                email,
                password: hash,
                firebaseUid: firebaseUser.localId
            });
        }

        if (firebaseUser && user && !user.firebaseUid) {
            user.firebaseUid = firebaseUser.localId;
            await user.save();
        }

        
        const token = makeToken(user);
        return res.status(200).json({
            message: "Login Successful", token,
            user: userResponse(user),
            firebaseLinked: Boolean(user.firebaseUid)
        });
    } catch (error) {
        // console.log(`>>>>`, error)
        return res.status(500).json({ message: "Server Side Error" });

    }
}

exports.forgetotp = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                message: "Email is required"
            });
        }

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const sentotp = transporter.otp();

        user.otp = sentotp;
        user.expireTime = Date.now() + 5 * 60 * 1000;

        await user.save();

        const mail = await transporter.info(
            email,
            "Forgot Password OTP",
            `
                <h2>Password Reset</h2>

                <p>Your OTP is:</p>

                <h1>${sentotp}</h1>

                <p>This OTP is valid for 5 minutes.</p>
            `
        );

        console.log(mail.messageId);

        return res.status(200).json({
            message: "OTP sent successfully"
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

exports.forgetpassword = async (req, res) => {
    const { email, otp, newpassword, confirmpassword } = req.body;
    if (!(email && otp && newpassword && confirmpassword)) {
        return res.status(400).json({
            message: "All fields are required"
        });
    }

    const user = await userModel.findOne({ email });

    if (!user) {
        return res.status(404).json({
            message: "User not found"
        });
    }

    if (user.otp !== Number(otp)) {
        return res.status(400).json({
            message: "Invalid OTP"
        });
    }

    if (user.expireTime < Date.now()) {
        return res.status(400).json({
            message: "OTP expired"
        });
    }

    if (newpassword !== confirmpassword) {
        return res.status(400).json({ message: "all fields are required " })
    }

    const saltRounds = 10
    const salt = bcrypt.genSaltSync(saltRounds);
    const hash = bcrypt.hashSync(newpassword, salt)

    user.password = hash

    user.otp = null;
    user.expireTime = null;

    await user.save()
    return res.status(200).json({
        message: "password changed successfully"
    });
};


exports.resetpassword = async (req, res) => {
    try {
        const { email, password, newpassword, confirmpassword } = req.body;

        if (!(email && password && newpassword && confirmpassword)) {
            return res.status(400).json({ message: "All fileds are required" });
        }

        const existUser = await userModel.findOne({ email });
        if (!existUser) {
            return res.status(404).json({ message: "User not found" });
        }

        const isMatched = await bcrypt.compare(password, existUser.password);

        if (!isMatched) {
            return res.status(400).json({ message: "Password is incorrect" });
        }

        if (password === newpassword) {
            return res.status(400).json({
                message: "New password must be different from current password",
            });
        }

        if (newpassword !== confirmpassword) {
            return res.status(400).json({
                message: "New Password and Confirm Password do not match",
            });
        }

        const hashedPassword = await bcrypt.hash(newpassword, 10);

        const result = await userModel.updateOne(
            { email },
            { $set: { password: hashedPassword } },
        );

        return res.status(200).json({
            message: "Password changed successfully",
        });
    } catch (error) {
        return res.status(500).json({ message: "Server Side Error" });
    }
};

exports.getalluser = async (req, res) => {
    try {

        const users = await userModel.find({ role: "user" }).select("_id name email")
        if (!users) {
            return res.status(404).json({
                message: "users not  found"
            })
        }
        return res.status(200).json(users)
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ message: "internal server error" })
    }

}

exports.theme = async (req, res) => {
    try {
        const { theme } = req.body;
        if (!theme) {
            return res.status(400).json({
                message: "Theme is required"
            });
        }
        const result = await userModel.findByIdAndUpdate(req.user._id, { theme }, { new: true });
        if (!result) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({
            message: "Theme changed successfully", result
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

exports.getTheme = async (req, res) => {
    try {
        const user = await userModel.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json({
            theme: user.theme || "light"
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
};


exports.googleLogin = async (req, res) => {
    try {
        const { idToken } = req.body;

        if (!idToken) {
            return res.status(400).json({
                message: "Firebase token is required"
            });
        }

        const firebaseUser = await verifyFirebaseIdToken(idToken);

        if (!firebaseUser?.email) {
            return res.status(401).json({
                message: "Invalid Google account"
            });
        }

        let user = await userModel.findOne({ email: firebaseUser.email });

        if (!user) {
            const randomPassword = `${firebaseUser.localId}${Date.now()}`;
            const hash = bcrypt.hashSync(randomPassword, bcrypt.genSaltSync(10));

            user = await userModel.create({
                name: firebaseUser.displayName || firebaseUser.email.split("@")[0],
                email: firebaseUser.email,
                password: hash,
                firebaseUid: firebaseUser.localId
            });
        }

        if (!user.firebaseUid) {
            user.firebaseUid = firebaseUser.localId;
            await user.save();
        }

        const token = makeToken(user);

        return res.status(200).json({
            message: "Google login successful",
            token,
            user: userResponse(user)
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: "Google login failed"
        });
    }
}
