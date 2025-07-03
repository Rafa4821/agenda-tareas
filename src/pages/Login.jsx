import React, { useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
    const emailRef = useRef();
    const passwordRef = useRef();
    const { login } = useAuth();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();

        try {
            setError('');
            setLoading(true);
            await login(emailRef.current.value, passwordRef.current.value);
            navigate('/');
        } catch {
            setError('Error al iniciar sesión');
        }
        setLoading(false);
    }

    return (
        <div className="container d-flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}>
            <div className="w-100" style={{ maxWidth: "400px" }}>
                <div className="card">
                    <div className="card-body">
                        <h2 className="text-center mb-4">Iniciar Sesión</h2>
                        {error && <div className="alert alert-danger">{error}</div>}
                        <form onSubmit={handleSubmit}>
                            <div className="form-group mb-3">
                                <label>Email</label>
                                <input type="email" ref={emailRef} className="form-control" required />
                            </div>
                            <div className="form-group mb-3">
                                <label>Contraseña</label>
                                <input type="password" ref={passwordRef} className="form-control" required />
                            </div>
                            <button disabled={loading} className="w-100 btn btn-primary" type="submit">
                                Iniciar Sesión
                            </button>
                        </form>
                    </div>
                </div>
                <div className="w-100 text-center mt-2">
                    ¿Necesitas una cuenta? <Link to="/signup">Crea una</Link>
                </div>
            </div>
        </div>
    );
}
