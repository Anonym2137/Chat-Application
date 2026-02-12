import React from 'react';
import { Card, CardContent } from './card';
import { Button } from './button';

export const Spinner = ({ className = 'h-5 w-5' }) => (
    <div className={`spinner rounded-full ${className}`} />
);

export const LoadingScreen = ({ message = 'Loading...' }) => (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
            <Spinner className="h-8 w-8 mx-auto mb-4" />
            <p className="text-muted-foreground">{message}</p>
        </div>
    </div>
);

export const LoadingCard = ({ message = 'Loading...' }) => (
    <Card className="w-full max-w-md mx-4 bg-card/95 backdrop-blur-sm border-border/50 shadow-2xl">
        <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
                <Spinner className="h-8 w-8 mx-auto mb-4" />
                <p className="text-muted-foreground">{message}</p>
            </div>
        </CardContent>
    </Card>
);

export const ErrorCard = ({ message = 'Something went wrong', onClose }) => (
    <Card className="w-full max-w-md mx-4 bg-card/95 backdrop-blur-sm border-border/50 shadow-2xl">
        <CardContent className="py-8 text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-red-500/20 flex items-center justify-center">
                <svg className="h-8 w-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <p className="text-muted-foreground mb-4">{message}</p>
            {onClose && <Button variant="outline" onClick={onClose}>Close</Button>}
        </CardContent>
    </Card>
);

export const EmptyState = ({ Icon, title, description, action, actionLabel }) => (
    <div className="text-center py-12 animate-fade-in">
        {Icon && (
            <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-600/20 to-indigo-600/20 flex items-center justify-center">
                <Icon className="h-8 w-8 text-purple-400" />
            </div>
        )}
        <p className="text-muted-foreground text-sm">{title}</p>
        {description && <p className="text-muted-foreground/60 text-xs mt-1">{description}</p>}
        {action && actionLabel && (
            <Button variant="outline" className="mt-4" onClick={action}>{actionLabel}</Button>
        )}
    </div>
);

export const AmbientBackground = () => (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] animate-float" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-[150px] animate-float" style={{ animationDelay: '-2s' }} />
        <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] bg-pink-600/10 rounded-full blur-[100px] animate-float" style={{ animationDelay: '-4s' }} />
    </div>
);

export const ChatAmbientBackground = () => (
    <div className="fixed inset-0 overflow-hidden pointer-events-none ambient-effect">
        <div className="absolute top-[-15%] left-[-5%] w-[400px] h-[400px] bg-purple-600/15 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px]" />
    </div>
);

export const ModalOverlay = ({ children, onClose }) => (
    <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4"
        onClick={e => { if (e.target === e.currentTarget && onClose) onClose(); }}
    >
        {children}
    </div>
);

export const OnlineIndicator = ({ size = 'sm', className = '' }) => {
    const sizes = { sm: 'w-3 h-3', md: 'w-3.5 h-3.5', lg: 'w-4 h-4' };
    return <span className={`${sizes[size]} bg-emerald-500 border-2 border-card rounded-full ${className}`} />;
};
