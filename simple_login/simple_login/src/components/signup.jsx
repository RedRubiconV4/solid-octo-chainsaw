import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../App.css'

function SignUp() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/signup", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({username, password}),
            });

            if (!res.ok) {
                throw new Error("Sign up failed");
            }

            const data = await res.json()
            // console.log(data)
            localStorage.setItem("token", data.token);
            navigate("/dashboard")
            console.log("login successful");
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <>
        <div className='login__page flex justify-center align-center background-colour text-colour'>
            <div className='login__box flex justify-center align-center flex-column'>
                <h1 className='login__title'>Sign up</h1>
                <form className='login__form flex flex-column background-colour text-colour'
                    onSubmit={(e) =>  {
                        e.preventDefault()
                        handleSubmit()
                    }}>
                    <input 
                        className='login__input f-16 font-inter background-colour text-colour'
                        placeholder='Username'
                        value= {username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <input 
                        className='login__input f-16 font-inter background-colour text-colour'
                        placeholder='Password'
                        value= {password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button className='login__button f-16 font-inter text-colour' type='submit'>Submit</button>
                    <Link className='login_links text-colour font-inter' to="/">Log in</Link>
                </form>
            </div>
        </div>
        </>
    )
}

export default SignUp