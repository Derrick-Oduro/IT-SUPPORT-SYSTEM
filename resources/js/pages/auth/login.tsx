import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
    role: string;
};

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

const ROLES = [
    { value: 'Admin', label: 'Admin' },
    { value: 'IT Agent', label: 'IT Agent' },
    { value: 'Staff', label: 'Staff' },
];

export default function Login({ status, canResetPassword }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<LoginForm>({
        email: '',
        password: '',
        remember: false,
        role: 'Admin', // default selected role
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Log in" />
            <div className="min-h-screen flex">
                {/* Left: Form */}
                <div className="flex flex-col justify-center w-full max-w-md px-8 py-12" style={{ background: '#071A22' }}>
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
                        <p className="text-gray-300">Sign in to your account</p>
                    </div>
                    <form className="space-y-6" onSubmit={submit}>
                        {/* Role selection */}
                        <div>
                            <Label className="text-white mb-2 block">Login as</Label>
                            <div className="flex gap-4">
                                {ROLES.map((roleOption) => (
                                    <label key={roleOption.value} className="flex items-center text-white">
                                        <input
                                            type="radio"
                                            name="role"
                                            value={roleOption.value}
                                            checked={data.role === roleOption.value}
                                            onChange={e => setData('role', e.target.value)}
                                            className="mr-2"
                                            disabled={processing}
                                        />
                                        {roleOption.label}
                                    </label>
                                ))}
                            </div>
                            <InputError message={errors.role} />
                        </div>
                        <div>
                            <Label htmlFor="email" className="text-white">Email address</Label>
                            <Input
                                id="email"
                                type="email"
                                required
                                autoFocus
                                autoComplete="email"
                                value={data.email}
                                onChange={e => setData('email', e.target.value)}
                                placeholder="email@example.com"
                                disabled={processing}
                                className="bg-white"
                            />
                            <InputError message={errors.email} />
                        </div>
                        <div>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" className="text-white">Password</Label>
                                {canResetPassword && (
                                    <TextLink href={route('password.request')} className="text-xs text-blue-200 hover:underline" tabIndex={5}>
                                        Forgot password?
                                    </TextLink>
                                )}
                            </div>
                            <Input
                                id="password"
                                type="password"
                                required
                                autoComplete="current-password"
                                value={data.password}
                                onChange={e => setData('password', e.target.value)}
                                placeholder="Password"
                                disabled={processing}
                                className="bg-white"
                            />
                            <InputError message={errors.password} />
                        </div>
                        <div className="flex items-center">
                            <Checkbox
                                id="remember"
                                name="remember"
                                checked={data.remember}
                                onClick={() => setData('remember', !data.remember)}
                                disabled={processing}
                            />
                            <Label htmlFor="remember" className="ml-2 text-white">Remember me</Label>
                        </div>
                        <Button
                            type="submit"
                            className="w-full bg-white text-[#071A22] font-bold hover:bg-gray-100"
                            disabled={processing}
                        >
                            {processing && <LoaderCircle className="h-4 w-4 animate-spin mr-2 inline" />}
                            Log in
                        </Button>
                    </form>
                    <div className="mt-8 text-center text-sm text-gray-300">
                        Don't have an account?{' '}
                        <TextLink href={route('register')} className="underline text-white">
                            Sign up
                        </TextLink>
                    </div>
                    {status && (
                        <div className="mt-4 text-center text-sm font-medium text-green-400">{status}</div>
                    )}
                </div>
                {/* Right: Photo */}
                <div className="hidden md:block flex-1 bg-white">
                    <img
                        src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80"
                        alt="Login visual"
                        className="object-cover w-full h-full"
                    />
                </div>
            </div>
        </>
    );
}
