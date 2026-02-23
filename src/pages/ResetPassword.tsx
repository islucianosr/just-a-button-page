import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CheckCircle2, KeyRound } from 'lucide-react';
import logo from '@/assets/logo-white.svg';

const ResetPassword = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const { toast } = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        // Listen for the PASSWORD_RECOVERY event from Supabase
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'PASSWORD_RECOVERY') {
                setIsReady(true);
            }
        });

        // Also check if user already has a session (link was already processed)
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                setIsReady(true);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const handleUpdatePassword = async () => {
        if (!newPassword || newPassword.length < 6) {
            toast({
                title: 'Erro',
                description: 'A senha deve ter pelo menos 6 caracteres',
                variant: 'destructive'
            });
            return;
        }

        if (newPassword !== confirmPassword) {
            toast({
                title: 'Erro',
                description: 'As senhas não coincidem',
                variant: 'destructive'
            });
            return;
        }

        setIsLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) throw error;

            setIsSuccess(true);
            toast({
                title: 'Senha atualizada!',
                description: 'Sua senha foi redefinida com sucesso'
            });

            // Redirect to dashboard after 2 seconds
            setTimeout(() => {
                navigate('/dashboard');
            }, 2000);
        } catch (error: any) {
            toast({
                title: 'Erro',
                description: error.message,
                variant: 'destructive'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/10 via-accent/5 to-background flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <img src={logo} alt="Leadsx1B" className="w-16 h-16" />
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                            Leadsx1B
                        </h1>
                    </div>
                </div>

                <Card>
                    <CardHeader className="text-center">
                        {isSuccess ? (
                            <>
                                <div className="flex justify-center mb-2">
                                    <CheckCircle2 className="w-12 h-12 text-green-500" />
                                </div>
                                <CardTitle>Senha Atualizada!</CardTitle>
                                <CardDescription>
                                    Redirecionando para o painel...
                                </CardDescription>
                            </>
                        ) : (
                            <>
                                <div className="flex justify-center mb-2">
                                    <KeyRound className="w-12 h-12 text-primary" />
                                </div>
                                <CardTitle>Redefinir Senha</CardTitle>
                                <CardDescription>
                                    Crie uma nova senha para a sua conta
                                </CardDescription>
                            </>
                        )}
                    </CardHeader>
                    <CardContent>
                        {isSuccess ? (
                            <div className="text-center py-4">
                                <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                            </div>
                        ) : !isReady ? (
                            <div className="text-center py-8 space-y-4">
                                <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                                <p className="text-sm text-muted-foreground">
                                    A verificar o link de recuperação...
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="new-password">Nova Senha</Label>
                                    <Input
                                        id="new-password"
                                        type="password"
                                        placeholder="Mínimo 6 caracteres"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirm-new-password">Confirmar Nova Senha</Label>
                                    <Input
                                        id="confirm-new-password"
                                        type="password"
                                        placeholder="Repita a nova senha"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                                <Button
                                    onClick={handleUpdatePassword}
                                    disabled={isLoading}
                                    className="w-full"
                                >
                                    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    Atualizar Senha
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={() => navigate('/auth')}
                                    className="w-full"
                                    type="button"
                                >
                                    Voltar ao login
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ResetPassword;
