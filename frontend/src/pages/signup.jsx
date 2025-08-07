import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import supabase from '../client';

export default function Signup() {
  const [alert, showAlert] = useState({
    message: '',
    show: false,
  });

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
  });

  const signupUser = async (values) => {
    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      data: {
        username: values.username,
      },
    });

    if (error) {
      showAlert({
        show: true,
        message: error.message,
      });
    } else {
      navigate('/todos');
    }
  };

  function SignupAlert() {
    return (
      <>
        {alert.show && (
          <div className="alert alert-error">
            <div className="inline-flex justify-stretch items-center">
              {alert.message}
              <button
                onClick={() => showAlert({ message: '', show: false })}
                className="btn btn-ghost btn-circle"
                aria-label="Close alert"
              >
                X
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  function SignupForm() {
    return (
      <form className="space-y-4" onSubmit={handleSubmit(signupUser)}>
        <div>
          <label
            htmlFor="username"
            className="block text-sm font-medium text-gray-700"
          >
            Username
          </label>
          <input
            id="username"
            type="text"
            className="input input-bordered w-full"
            {...register('username', { required: 'Username is required' })}
          />
          {errors.username && (
            <p className="text-red-500 text-sm">{errors.username.message}</p>
          )}
        </div>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            className="input input-bordered w-full"
            {...register('email', { required: 'Email is required' })}
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}
        </div>
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            className="input input-bordered w-full"
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters',
              },
            })}
          />
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password.message}</p>
          )}
        </div>
        <button type="submit" className="btn btn-primary w-full">
          {isSubmitting ? 'Signing up...' : 'Signup'}
        </button>
      </form>
    );
  }

  return (
    <div className="bg-gray-100 flex items-center justify-center min-h-screen">
      <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Signup</h2>
        <SignupAlert />
        <SignupForm />
        <p className="mt-4 text-center text-sm">
          Have an account?{' '}
          <Link to="/login" className="text-blue-500 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
