import { useCallback, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from './firebaseconfig'
import firebaseAuthError from './firebaseAuthError'

function Login() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: "", password: "" })
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
        setError("")
        if (!form.email || !form.password) {
            setError("Email and Password are required")
            return;
        }
        try {
            const result = await axios.post('http://localhost:6100/taskuser/login', form)
            console.log(`>>>>authlogin`, result.data)
            const token = result?.data?.token
            if (token) {
                saveLoginData(result.data)
                setForm({ email: "", password: "" })
            } else {
                setError("password is incorrect")
            }
        } catch (error) {
            console.log("Backend Error:", error.response?.data);
            if (error.response) {
                setError(error.response.data.message);
            } else {
                setError("Something went wrong");
            }
        }
    }

    async function handleGoogleLogin() {
        try {
            setError("")
            const googleResult = await signInWithPopup(auth, googleProvider)
            const idToken = await googleResult.user.getIdToken()
            const result = await axios.post('http://localhost:6100/taskuser/google-login', { idToken })
            saveLoginData(result.data)
        } catch (error) {
            console.log("Google Login Error:", error.response?.data || error.message);
            setError(error.response?.data?.message || firebaseAuthError(error, "Google login failed"))
        }
    }

    return (
        <div className="auth-container">
            <h2 className="auth-title">Login</h2>
            <form onSubmit={handleSubmit} className="auth-form">
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
                {error && <p className="auth-error-msg">{error}</p>}
                <button type="submit" className="auth-btn">Login</button>
                <button type="button" className="google-auth-btn" onClick={handleGoogleLogin}>
                    <span className="google-auth-icon">G</span>
                    Continue with Google
                </button>
                <p onClick={() => navigate('/forget')} className="auth-link-text">Forget Password ?</p>

                <p onClick={() => navigate('/signup')} className="auth-link-text">Don't have a account ? <br />create account ?</p>
                
            </form>
        </div>
    )
}

export default Login
