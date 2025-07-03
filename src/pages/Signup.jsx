import React, { useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function Signup() {
    const emailRef = useRef();
    const passwordRef = useRef();
    const passwordConfirmRef = useRef();
    const { signup } = useAuth();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();

        if (passwordRef.current.value !== passwordConfirmRef.current.value) {
            return setError('Las contraseñas no coinciden');
        }

        try {
            setError('');
            setLoading(true);
            await signup(emailRef.current.value, passwordRef.current.value);
            navigate('/');
        } catch {
            setError('Error al crear la cuenta');
        }
        setLoading(false);
    }

    return (
        <div className="container d-flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}>
            <div className="w-100" style={{ maxWidth: "400px" }}>
                <div className="card">
                    <div className="card-body">
                        <h2 className="text-center mb-4">Crear Cuenta</h2>
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
                            <div className="form-group mb-3">
                                <label>Confirmar Contraseña</label>
                                <input type="password" ref={passwordConfirmRef} className="form-control" required />
                            </div>
                            <button disabled={loading} className="w-100 btn btn-primary" type="submit">
                                Registrarse
                            </button>
                        </form>
                    </div>
                </div>
                <div className="w-100 text-center mt-2">
                    ¿Ya tienes una cuenta? <Link to="/login">Inicia Sesión</Link>
                </div>
            </div>
        </div>
    );
}
