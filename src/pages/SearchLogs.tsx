import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, RefreshCw, Trash2, Circle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface LogEntry {
    id: string;
    created_at: string;
    level: 'info' | 'warn' | 'error' | 'success';
    step: string;
    message: string;
    details: Record<string, any> | null;
    search_id: string | null;
}

const levelColor: Record<string, string> = {
    info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    warn: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    error: 'bg-red-500/10 text-red-400 border-red-500/20',
    success: 'bg-green-500/10 text-green-400 border-green-500/20',
};

const levelDot: Record<string, string> = {
    info: 'text-blue-400',
    warn: 'text-yellow-400',
    error: 'text-red-400',
    success: 'text-green-400',
};

const SearchLogs = () => {
    const navigate = useNavigate();
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [isLive, setIsLive] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    // Check if admin
    useEffect(() => {
        supabase.auth.getUser().then(async ({ data: { user } }) => {
            if (!user) { navigate('/auth'); return; }
            const { data: role } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', user.id)
                .maybeSingle();
            setIsAdmin(role?.role === 'admin');
        });
    }, [navigate]);

    const fetchLogs = async () => {
        const { data } = await (supabase as any)
            .from('search_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(200);
        if (data) setLogs(data as LogEntry[]);
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    // Real-time subscription
    useEffect(() => {
        if (!isLive) return;

        const channel = (supabase as any)
            .channel('search_logs_realtime')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'search_logs' },
                (payload: any) => {
                    setLogs(prev => [payload.new as LogEntry, ...prev].slice(0, 200));
                }
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [isLive]);

    const clearLogs = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        await (supabase as any).from('search_logs').delete().eq('user_id', user.id);
        setLogs([]);
    };

    const formatTime = (iso: string) => {
        const d = new Date(iso);
        return d.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    const formatDetails = (details: Record<string, any> | null) => {
        if (!details) return null;
        return JSON.stringify(details, null, 2);
    };

    return (
        <div className="min-h-screen bg-background font-mono">
            {/* Header */}
            <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
                                <ArrowLeft className="w-4 h-4 mr-1" />
                                Voltar
                            </Button>
                            <h1 className="text-lg font-bold text-foreground">🔍 Logs de Execução</h1>
                            <Badge variant="outline" className={isLive ? 'text-green-400 border-green-500/30' : 'text-muted-foreground'}>
                                <Circle className={`w-2 h-2 mr-1 ${isLive ? 'fill-green-400 text-green-400 animate-pulse' : 'fill-muted-foreground'}`} />
                                {isLive ? 'AO VIVO' : 'PAUSADO'}
                            </Badge>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsLive(v => !v)}
                            >
                                {isLive ? 'Pausar' : 'Retomar'} Live
                            </Button>
                            <Button variant="outline" size="sm" onClick={fetchLogs}>
                                <RefreshCw className="w-4 h-4 mr-1" />
                                Atualizar
                            </Button>
                            <Button variant="outline" size="sm" onClick={clearLogs} className="text-destructive hover:bg-destructive/10">
                                <Trash2 className="w-4 h-4 mr-1" />
                                Limpar
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Log entries */}
            <div className="container mx-auto px-4 py-4 space-y-1">
                {logs.length === 0 && (
                    <Card>
                        <CardContent className="py-16 text-center text-muted-foreground">
                            <p className="text-4xl mb-3">📋</p>
                            <p>Nenhum log ainda.</p>
                            <p className="text-sm mt-1">Faça uma busca para ver os logs em tempo real.</p>
                        </CardContent>
                    </Card>
                )}

                {logs.map((log) => (
                    <div
                        key={log.id}
                        className="flex gap-3 items-start p-2 rounded-md hover:bg-muted/30 transition-colors border border-transparent hover:border-border/40"
                    >
                        {/* Time */}
                        <span className="text-xs text-muted-foreground min-w-[70px] pt-0.5">
                            {formatTime(log.created_at)}
                        </span>

                        {/* Level badge */}
                        <Badge className={`text-[10px] px-1.5 py-0 min-w-[60px] justify-center border ${levelColor[log.level]}`}>
                            {log.level.toUpperCase()}
                        </Badge>

                        {/* Step */}
                        <span className="text-xs text-muted-foreground min-w-[140px] pt-0.5">
                            [{log.step}]
                        </span>

                        {/* Message + details */}
                        <div className="flex-1 min-w-0">
                            <p className={`text-sm ${levelDot[log.level]}`}>{log.message}</p>
                            {log.details && (
                                <pre className="text-[11px] text-muted-foreground mt-1 bg-muted/40 rounded p-2 overflow-x-auto whitespace-pre-wrap break-all">
                                    {formatDetails(log.details)}
                                </pre>
                            )}
                            {log.search_id && (
                                <span className="text-[10px] text-muted-foreground/50">search: {log.search_id}</span>
                            )}
                        </div>
                    </div>
                ))}

                <div ref={bottomRef} />
            </div>
        </div>
    );
};

export default SearchLogs;
