import React from 'react'
import { useState } from 'react'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Forgetpassword() {
    const navigate = useNavigate()
    const [form, setForm] = useState({ email: "", newpassword: "", confirmpassword: "" })
    const [error, setError] = useState({});

    const handleSubmit = async (e) => {
        e.preventDefault();
        let obj = {};
        if (!form.email) obj.email = "Email is required";
        if (!form.newpassword) obj.newpassword = "New Password is required";
        if (!form.confirmpassword) obj.confirmpassword = "Confirm Password is required";

        if (Object.keys(obj).length > 0) {
            setError(obj);
            return;
        }

        try {
            const result = await axios.post("http://localhost:6100/taskuser/forget", form);
            console.log(result.data);
            alert("Password changed successfully");
            navigate("/login");
        } catch (error) {
            console.error(error.response?.data || error.message);
            alert(`Error : ${error.response?.data.message}`);
        }
    };

    function handleChange(e) {
        const { name, value } = e.target
        setForm({ ...form, [name]: value })
    }

    return (
        <div className="reset-container">
            <h2>Forgot Password</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Enter your email"
                    name='email'
                    value={form.email}
                    onChange={handleChange}
                    className={error.email ? "input error-input" : "input"}
                />
                {error.email && <p className="error-text">{error.email}</p>}

                <input
                    type="password"
                    placeholder="New Password"
                    name='newpassword'
                    value={form.newpassword}
                    onChange={handleChange}
                    className={error.newpassword ? "input error-input" : "input"}
                />
                {error.newpassword && <p className="error-text">{error.newpassword}</p>}

                <input
                    type="password"
                    placeholder="Confirm Password"
                    value={form.confirmpassword}
                    name='confirmpassword'
                    onChange={handleChange}
                    className={error.confirmpassword ? "input error-input" : "input"}
                />
                {error.confirmpassword && <p className="error-text">{error.confirmpassword}</p>}

                <button type="submit" className="submit-btn">submit</button>
            </form>
        </div>
    );
}

export default Forgetpassword