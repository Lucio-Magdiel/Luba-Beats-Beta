'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  Search,
  Send,
  User,
  CheckCircle2,
  Check,
  Disc3,
  Mic,
  ArrowLeft,
  Loader2,
  ExternalLink,
  Plus,
  X,
  Sparkles,
} from 'lucide-react';

interface ChatUser {
  id: number;
  nombre_usuario: string;
  tipo: string;
  foto_perfil: string | null;
  verificado_google: boolean;
}

interface MessageItem {
  id: number;
  id_emisor: number;
  id_receptor: number;
  contenido: string;
  leido: boolean;
  fecha_envio: string;
}

interface ConversationItem {
  user: ChatUser;
  lastMessage: {
    id: number;
    contenido: string;
    fecha_envio: string;
    isSender: boolean;
    leido: boolean;
  };
  unreadCount: number;
}

interface Props {
  currentUser: {
    id: number;
    name: string;
    email: string;
    image?: string | null;
  };
  availableUsers: ChatUser[];
  initialPreselectedUsername?: string;
}

export function MessagesClient({
  currentUser,
  availableUsers,
  initialPreselectedUsername,
}: Props) {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeUser, setActiveUser] = useState<ChatUser | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputText, setInputText] = useState('');
  const [search, setSearch] = useState('');
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const prevMessagesCountRef = useRef<number>(0);

  const scrollToBottom = (smooth = true) => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto',
      });
    }
  };

  // Cargar lista de conversaciones
  const loadConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/messages');
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
      }
    } catch (err) {
      console.error('Error al cargar conversaciones:', err);
    } finally {
      setLoadingConversations(false);
    }
  }, []);

  // Cargar mensajes con el usuario activo
  const loadActiveMessages = useCallback(async (userId: number, isInitial = false) => {
    if (isInitial) setLoadingMessages(true);
    try {
      const res = await fetch(`/api/messages?withUserId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        const incomingMessages: MessageItem[] = data.messages || [];

        setMessages((prev) => {
          // Si los mensajes son idénticos, no reemplazar el estado para evitar re-renders y scrolls parásitos
          if (
            prev.length === incomingMessages.length &&
            prev[prev.length - 1]?.id === incomingMessages[incomingMessages.length - 1]?.id
          ) {
            return prev;
          }
          return incomingMessages;
        });

        if (data.otherUser && !activeUser) {
          setActiveUser(data.otherUser);
        }

        if (isInitial) {
          // Scroll instantáneo al fondo sin animar el window
          setTimeout(() => {
            scrollToBottom(false);
          }, 30);
        }
      }
    } catch (err) {
      console.error('Error al cargar mensajes:', err);
    } finally {
      if (isInitial) setLoadingMessages(false);
    }
  }, [activeUser]);

  // Montaje inicial y preselección de usuario
  useEffect(() => {
    loadConversations();

    if (initialPreselectedUsername) {
      const target = availableUsers.find(
        (u) => u.nombre_usuario.toLowerCase() === initialPreselectedUsername.toLowerCase()
      );
      if (target) {
        setActiveUser(target);
        loadActiveMessages(target.id, true);
      }
    }
  }, [initialPreselectedUsername, availableUsers, loadConversations, loadActiveMessages]);

  // Polling automático cada 4 segundos para nuevos mensajes
  useEffect(() => {
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return;
      loadConversations();
      if (activeUser) {
        loadActiveMessages(activeUser.id, false);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [activeUser, loadConversations, loadActiveMessages]);

  // Scroll automático SOLO dentro del contenedor interno cuando se añaden nuevos mensajes
  useEffect(() => {
    if (messages.length > prevMessagesCountRef.current) {
      if (messagesContainerRef.current) {
        const container = messagesContainerRef.current;
        const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 250;
        if (isNearBottom || prevMessagesCountRef.current === 0) {
          container.scrollTo({
            top: container.scrollHeight,
            behavior: prevMessagesCountRef.current === 0 ? 'auto' : 'smooth',
          });
        }
      }
      prevMessagesCountRef.current = messages.length;
    } else if (messages.length === 0) {
      prevMessagesCountRef.current = 0;
    }
  }, [messages]);

  // Seleccionar usuario para chatear
  const handleSelectUser = (user: ChatUser) => {
    prevMessagesCountRef.current = 0;
    setActiveUser(user);
    loadActiveMessages(user.id, true);
    setIsNewChatModalOpen(false);
  };

  // Enviar mensaje
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUser || !inputText.trim() || sending) return;

    const messageContent = inputText.trim();
    setInputText('');
    setSending(true);

    // Optimistic update
    const tempId = Date.now();
    const optimisticMessage: MessageItem = {
      id: tempId,
      id_emisor: currentUser.id,
      id_receptor: activeUser.id,
      contenido: messageContent,
      leido: false,
      fecha_envio: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMessage]);
    setTimeout(() => {
      scrollToBottom(true);
    }, 30);

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_receptor: activeUser.id,
          contenido: messageContent,
        }),
      });

      if (res.ok) {
        loadActiveMessages(activeUser.id, false);
        loadConversations();
      }
    } catch (err) {
      console.error('Error al enviar mensaje:', err);
    } finally {
      setSending(false);
    }
  };

  const filteredConversations = conversations.filter((c) =>
    c.user.nombre_usuario.toLowerCase().includes(search.toLowerCase())
  );

  const defaultAvatar =
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80';

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] pb-24 pt-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Top Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="rounded-xl border border-white/10 bg-zinc-900/80 p-2 text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-cyan-500/20 border border-cyan-500/30 px-2.5 py-0.5 text-[10px] font-extrabold font-mono uppercase tracking-widest text-cyan-300">
                  Luba Chat
                </span>
                <span className="text-xs text-zinc-500">•</span>
                <span className="text-xs text-zinc-400 font-mono">@{currentUser.name}</span>
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight">
                Bandeja de Mensajes Directos
              </h1>
            </div>
          </div>

          <button
            onClick={() => setIsNewChatModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-purple-600/30 hover:from-purple-500 hover:to-indigo-500 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Nuevo Chat</span>
          </button>
        </div>

        {/* Chat Main Window (2 Columns on Desktop, Single View with Switch on Mobile) */}
        <div className="grid grid-cols-1 md:grid-cols-12 rounded-3xl border border-white/10 bg-zinc-900/80 backdrop-blur-2xl shadow-2xl shadow-purple-950/20 overflow-hidden min-h-[580px] md:min-h-[620px]">
          
          {/* Left Column: Conversations List */}
          <div className={`${activeUser ? 'hidden md:flex' : 'flex'} md:col-span-4 border-r border-white/10 flex-col bg-zinc-950/60 h-[580px] md:h-[620px]`}>
            {/* Search Input */}
            <div className="p-4 border-b border-white/5">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar en tus chats..."
                  className="w-full rounded-xl border border-white/10 bg-zinc-900/90 pl-9 pr-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-all"
                />
              </div>
            </div>

            {/* Conversations Scrollable List */}
            <div className="flex-1 overflow-y-auto divide-y divide-white/5">
              {loadingConversations ? (
                <div className="p-8 text-center text-zinc-500 text-xs flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
                  Cargando chats...
                </div>
              ) : filteredConversations.length > 0 ? (
                filteredConversations.map((c) => {
                  const isSelected = activeUser?.id === c.user.id;
                  const isProd = c.user.tipo === 'productor';
                  const isArt = c.user.tipo === 'artista';

                  return (
                    <div
                      key={c.user.id}
                      onClick={() => handleSelectUser(c.user)}
                      className={`p-3.5 flex items-center gap-3 cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-purple-600/15 border-l-4 border-purple-500'
                          : 'hover:bg-white/[0.03]'
                      }`}
                    >
                      <div className="relative">
                        <img
                          src={c.user.foto_perfil || defaultAvatar}
                          alt={c.user.nombre_usuario}
                          className="h-11 w-11 rounded-2xl object-cover ring-1 ring-white/10"
                        />
                        {/* Status neon dot */}
                        <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-zinc-950" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white text-xs truncate">
                            {c.user.nombre_usuario}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-mono">
                            {new Date(c.lastMessage.fecha_envio).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        <div className="flex items-center justify-between mt-1">
                          <p className="text-[11px] text-zinc-400 truncate max-w-[170px]">
                            {c.lastMessage.isSender ? 'Tú: ' : ''}
                            {c.lastMessage.contenido}
                          </p>

                          {c.unreadCount > 0 && (
                            <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-purple-500 px-1 text-[9px] font-black text-white">
                              {c.unreadCount}
                            </span>
                          )}
                        </div>

                        <div className="mt-1 flex items-center gap-1">
                          <span
                            className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                              isProd
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : isArt
                                ? 'bg-purple-500/20 text-purple-300'
                                : 'bg-zinc-800 text-zinc-400'
                            }`}
                          >
                            {c.user.tipo}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-zinc-500 text-xs space-y-3">
                  <MessageSquare className="h-8 w-8 mx-auto text-zinc-600" />
                  <p>No tienes conversaciones activas aún.</p>
                  <button
                    onClick={() => setIsNewChatModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-300 text-xs font-bold hover:bg-purple-600/30 transition-all"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Iniciar nuevo chat
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Active Chat Area */}
          <div className={`${activeUser ? 'flex' : 'hidden md:flex'} md:col-span-8 flex-col justify-between h-[580px] md:h-[620px] bg-zinc-950/40`}>
            {activeUser ? (
              <>
                {/* Active Chat Header */}
                <div className="p-4 border-b border-white/10 flex items-center justify-between bg-zinc-900/70">
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    {/* Mobile Back Button to conversation list */}
                    <button
                      type="button"
                      onClick={() => setActiveUser(null)}
                      className="md:hidden p-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white shrink-0"
                      aria-label="Volver a chats"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>

                    <img
                      src={activeUser.foto_perfil || defaultAvatar}
                      alt={activeUser.nombre_usuario}
                      className="h-10 w-10 rounded-xl object-cover ring-1 ring-purple-500/40 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white text-sm truncate">
                          {activeUser.nombre_usuario}
                        </span>
                        {activeUser.verificado_google && (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                        )}
                      </div>
                      <span className="text-[10px] text-zinc-400 font-mono capitalize truncate block">
                        {activeUser.tipo === 'productor' ? (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <Disc3 className="h-3 w-3" /> Productor Oficial
                          </span>
                        ) : activeUser.tipo === 'artista' ? (
                          <span className="text-purple-400 flex items-center gap-1">
                            <Mic className="h-3 w-3" /> Artista Verificado
                          </span>
                        ) : (
                          'Comprador / Oyente'
                        )}
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/perfil/${activeUser.nombre_usuario}`}
                    className="flex items-center gap-1 rounded-xl border border-white/10 bg-black/40 px-3 py-1.5 text-xs font-bold text-zinc-300 hover:text-white hover:bg-white/10 transition-all shadow-sm"
                  >
                    <span>Ver Perfil</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>

                {/* Messages Timeline */}
                <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5">
                  {loadingMessages ? (
                    <div className="h-full flex items-center justify-center text-xs text-zinc-500 gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
                      Cargando conversación...
                    </div>
                  ) : messages.length > 0 ? (
                    messages.map((m) => {
                      const isMe = m.id_emisor === currentUser.id;
                      const timeStr = new Date(m.fecha_envio).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      });

                      return (
                        <div
                          key={m.id}
                          className={`flex items-end gap-2 ${
                            isMe ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          {!isMe && (
                            <img
                              src={activeUser.foto_perfil || defaultAvatar}
                              alt={activeUser.nombre_usuario}
                              className="h-7 w-7 rounded-lg object-cover ring-1 ring-white/10 shrink-0 mb-1"
                            />
                          )}

                          <div
                            className={`max-w-[75%] sm:max-w-[65%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-lg ${
                              isMe
                                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-br-sm'
                                : 'bg-zinc-800/90 border border-white/10 text-zinc-200 rounded-bl-sm'
                            }`}
                          >
                            <p className="whitespace-pre-wrap break-words">{m.contenido}</p>
                            
                            <div
                              className={`flex items-center gap-1 justify-end text-[9px] mt-1 ${
                                isMe ? 'text-purple-200' : 'text-zinc-500'
                              }`}
                            >
                              <span>{timeStr}</span>
                              {isMe && (
                                <span>
                                  {m.leido ? (
                                    <span className="text-cyan-300 font-bold">✓✓</span>
                                  ) : (
                                    <Check className="h-2.5 w-2.5 inline" />
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center text-zinc-500 space-y-2">
                      <Sparkles className="h-8 w-8 text-purple-400/40" />
                      <p className="text-xs">
                        Este es el inicio de tu conversación con @{activeUser.nombre_usuario}.
                      </p>
                      <p className="text-[11px] text-zinc-600">
                        Pregunta por instrumentales personalizadas, licencias o colaboraciones.
                      </p>
                    </div>
                  )}
                </div>

                {/* Message Input Toolbar */}
                <form
                  onSubmit={handleSend}
                  className="p-3 sm:p-4 border-t border-white/10 bg-zinc-900/90 flex items-center gap-2.5"
                >
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={`Escribe un mensaje para @${activeUser.nombre_usuario}...`}
                    className="flex-1 rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={sending || !inputText.trim()}
                    className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-purple-600/30 transition-all active:scale-95 disabled:opacity-40 shrink-0"
                  >
                    {sending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 ml-0.5" />
                    )}
                  </button>
                </form>
              </>
            ) : (
              /* No Active Chat Selected */
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                <div className="h-16 w-16 rounded-3xl bg-zinc-900 border border-white/10 flex items-center justify-center text-purple-400 shadow-xl">
                  <MessageSquare className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Tus Conversaciones</h3>
                  <p className="text-xs text-zinc-400 mt-1 max-w-sm">
                    Selecciona una conversación de la izquierda o inicia un nuevo chat con cualquier productor o artista de la plataforma.
                  </p>
                </div>
                <button
                  onClick={() => setIsNewChatModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all"
                >
                  Iniciar Nuevo Chat
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* New Chat Modal: Pick any registered user */}
      {isNewChatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-zinc-950 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <User className="h-4 w-4 text-purple-400" />
                Iniciar Nueva Conversación
              </h3>
              <button
                onClick={() => setIsNewChatModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-zinc-400">
              Elige a un creador o usuario para enviarle un mensaje directo:
            </p>

            <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
              {availableUsers.map((u) => {
                const isProd = u.tipo === 'productor';
                const isArt = u.tipo === 'artista';

                return (
                  <div
                    key={u.id}
                    onClick={() => handleSelectUser(u)}
                    className="p-3 rounded-2xl border border-white/5 bg-zinc-900/60 hover:bg-purple-600/15 hover:border-purple-500/40 cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={u.foto_perfil || defaultAvatar}
                        alt={u.nombre_usuario}
                        className="h-10 w-10 rounded-xl object-cover ring-1 ring-white/10"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white text-xs group-hover:text-purple-300 transition-colors">
                            {u.nombre_usuario}
                          </span>
                          {u.verificado_google && (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                          )}
                        </div>
                        <span className="text-[10px] text-zinc-500 font-mono capitalize">
                          {u.tipo}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        isProd
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : isArt
                          ? 'bg-purple-500/20 text-purple-300'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {u.tipo}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
