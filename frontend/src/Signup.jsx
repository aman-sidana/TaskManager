import { useCallback, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from './firebaseconfig'
import firebaseAuthError from './firebaseAuthError'

function Signup() {
    const navigate = useNavigate()

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: ""
    })

    const [error, setError] = useState("")

    function handleChange(e) {
        const { name, value } = e.target
        setForm({ ...form, [name]: value })
    }

    const saveLoginData = useCallback((data) => {
        localStorage.setItem('token', data.token)
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate('/tasks')
    }, [navigate])

    async function handleSubmit(e) {
        e.preventDefault()
        if (!form.name || !form.email || !form.password) {
            setError("All fields are required")
            return;
        }
        try {
            const result = await axios.post('http://localhost:6100/taskuser/signUp', form)
            console.log(`>>>>authsignup`, result.data)
            navigate('/login')
            setForm({ name: "", email: "", password: "" })
        } catch (error) {
            setError(error.response?.data?.message)
        }
    }

    async function handleGoogleSignup() {
        try {
            setError("")
            const googleResult = await signInWithPopup(auth, googleProvider)
            const idToken = await googleResult.user.getIdToken()
            const result = await axios.post('http://localhost:6100/taskuser/google-login', { idToken })
            saveLoginData(result.data)
        } catch (error) {
            console.log("Google Signup Error:", error.response?.data || error.message);
            setError(error.response?.data?.message || firebaseAuthError(error, "Google signup failed"))
        }
    }

    return (
        <div>
            <div>
                <button className="btn btn-logout-nav" onClick={() => navigate(-1)}>
                    ⬅ Back
                </button>
            </div>
            <div className="auth-container">

                <h2 className="auth-title">Sign Up</h2>
                <form onSubmit={handleSubmit} className="auth-form">
                    <input
                        type="text"
                        placeholder="Enter Name"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        className="auth-input"
                    />
                    <input
                        type="email"
                        placeholder="Enter Email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        className="auth-input"
                    />
                    <input
                        type="password"
                        placeholder="Enter Password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        className="auth-input"
                    />
                    <button type="submit" className="auth-btn">Sign Up</button>
                    <button type="button" className="google-auth-btn" onClick={handleGoogleSignup}>
                        <span className="google-auth-icon">G</span>
                        Continue with Google
                    </button>
                    {error && <p className="auth-error-msg">{error}</p>}
                </form>

            </div>
        </div>
    )
}

export default Signup
