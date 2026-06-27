const userModel = require("../model/userModel")
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const secretKey = "sfsdgfhjklkadfgshljh"



exports.signup = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!(name && email && password)) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existUser = await userModel.findOne({ email });
        if (existUser) {
            return res.status(400).json({ message: "User already exist" });
        }

        const saltRounds = 10;

        const salt = bcrypt.genSaltSync(saltRounds)
        console.log(`>>>>>salt`, salt)

        const hash = bcrypt.hashSync(password, salt)
        console.log(`>>>>hash`, hash)

        const result = await userModel.create({
            name, email, password: hash, role
        });

        return res.status(201).json({ message: "User SingUped successfully", result });
    } catch (error) {
        console.log(`>>>error`, error)
        return res.status(500).json({ message: "Server Side Error" });
    }
}

exports.login = async (req, res) => {
    try {

        console.log(">>>>>>", req.body);

        const { email, password } = req.body;

        if (!(email && password)) {
            return res.status(400).json({ message: "Email and Password are required" });
        }
        const user = await userModel.findOne({ email });

        console.log(">>>>user", user);

        if (!user) {
            return res.status(404).json({ message: "No Data Found. SignUp First" });
        }

        const match = await bcrypt.compare(password, user.password)
        console.log(`....>>>`, match)
        if (!match) {
            return res.status(400).json({ message: "password in incorrect" })
        }

        const token = jwt.sign(
            { email: user.email },
            secretKey, { expiresIn: "5h" }
        );
        return res.status(200).json({
            message: "Login Successful", token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.log(`>>>>`, error)
        return res.status(500).json({ message: "Server Side Error" });

    }
}



exports.forgetpassword = async (req, res) => {
    try {
        console.log(`>>>>>forogetpass`, req.body)
        const { email, newpassword, confirmpassword } = req.body

        if (!(email && newpassword && confirmpassword)) {
            return res.status(400).json({ message: "all fields are required " })
        }
        const user = await userModel.findOne({ email })
        if (!user) {
            return res.status(404).json({ message: "no user found" })
        }
        if (newpassword !== confirmpassword) {
            return res.status(400).json({ message: "newpassword and confirmpasword are not matching" })
        }
        const saltRounds = 10
        const salt = bcrypt.genSaltSync(saltRounds);
        const hash = bcrypt.hashSync(newpassword, salt)

        user.password = hash
        await user.save()

        return res.status(200).json({
            message: "Password updated successfully"
        });

    }
    catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "internal server error"
        })
    }
}


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