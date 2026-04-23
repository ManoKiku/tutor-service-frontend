'use client';

import { useState, useEffect, useRef, useCallback, use } from 'react';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { isAuthenticated, getCurrentUser, getAuthData } from '@/lib/auth';
import { getChatMessages, getChats } from '@/services/chats';
import styles from './ChatsPage.module.css';
import { appConfig } from '../../../next.config';
import { initSignalRConnection } from '@/lib/signalr';
import { addRelation, checkRelation } from '@/services/relation';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { getTutorProfileById } from '@/services/tutors';


export default function ChatsPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const selectedChatRef = useRef<Chat | null>(null);
  const connectionStartedRef = useRef(false);
  const {tutorId, user} = useAuth();
  const [relation, setRelation] = useState<Relation | null>(null)

  const router = useRouter();


  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    const loadChats = async () => {
      if (!isAuthenticated()) {
        window.location.href = '/login';
        return;
      }

      try {
        const fetchedChats = await getChats();
        setChats(fetchedChats);
      } catch (error) {
        console.error('Ошибка загрузки чатов:', error);
      } finally {
        setLoading(false);
      }
    };

    loadChats();
  }, []);

  useEffect(() => {
    if (connectionStartedRef.current || !user || connection) {
      return;
    }

    const initSignalR = async () => {
      const { token } = getAuthData(false);
      if (!token) {
        console.error('Нет токена для подключения SignalR');
        return;
      }

      connectionStartedRef.current = true;

      const newConnection = new HubConnectionBuilder()
        .withUrl(appConfig.chatHubUrl, {
          accessTokenFactory: () => token,
        })
        .withAutomaticReconnect()
        .build();

      try {
        await newConnection.start();
        setConnection(newConnection);
        setIsConnected(true);
        console.log('SignalR подключен');

        newConnection.on('ReceiveMessage', (messageDto: MessageReceivedDto) => {

          const message: Message = {
            id: messageDto.MessageId,
            chatId: messageDto.ChatId,
            senderId: messageDto.SenderId,
            senderName: messageDto.SenderName,
            text: messageDto.Text,
            sentAt: new Date(messageDto.SentAt),
            isRead: messageDto.SenderId === user?.id,
            createdAt: new Date(),
          };

          const currentChat = selectedChatRef.current;

          if (currentChat?.id === messageDto.ChatId) {
            setMessages(prev => [...prev, message]);
          }

          setChats(prev => prev.map(chat => {
            if (chat.id === messageDto.ChatId) {
              return {
                ...chat,
                lastMessage: message,
                unreadCount: chat.id === currentChat?.id ? 0 : chat.unreadCount + 1,
              };
            }
            return chat;
          }));
        });

        newConnection.onreconnecting(() => {
          console.log('SignalR переподключение...');
          setIsConnected(false);
        });

        newConnection.onreconnected(() => {
          console.log('SignalR переподключен');
          setIsConnected(true);
        });

        newConnection.onclose(() => {
          console.log('SignalR соединение закрыто');
          setIsConnected(false);
          connectionStartedRef.current = false;
        });

      } catch (error) {
        console.error('Ошибка подключения SignalR:', error);
        setIsConnected(false);
        connectionStartedRef.current = false;
      }
    };

    initSignalR();

    return () => {
      if (connection != null) {
        console.log('Очистка SignalR соединения');
        // connection.off('ReceiveMessage');
        // connection.stop();
        setConnection(null);
        setIsConnected(false);
        connectionStartedRef.current = false;
      }
    };
  }, [user]);

  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedChat) return;

      try {
        const fetchedMessages = await getChatMessages(selectedChat.id);
        setMessages(fetchedMessages);
        
        if (connection) {
          await connection.invoke('MarkMessagesAsRead', selectedChat.id);
        }

        setChats(prev => prev.map(chat => 
          chat.id === selectedChat.id 
            ? { ...chat, unreadCount: 0 }
            : chat
        ));
      } catch (error) {
        console.error('Ошибка загрузки сообщений:', error);
      }
    };

    loadMessages();
  }, [selectedChat, connection]);


  useEffect(() => {
    const getRelation = async () => {
        if(selectedChat == null)
            return;

        const relation = await checkRelation(selectedChat.studentId, selectedChat.tutorId)
            .catch(() => null);
        console.log(relation);
        setRelation(relation);
    } 

    getRelation();
  }, [selectedChat])

  const sendMessage = useCallback(async () => {
    if (!newMessage.trim() || !selectedChat || !connection || !isConnected) return;

    const messageRequest: SendMessageRequest = {
      chatId: selectedChat.id,
      text: newMessage.trim(),
    };

    try {
      await connection.invoke('SendMessage', messageRequest);
      setNewMessage('');
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error);
    }
  }, [newMessage, selectedChat, connection, isConnected]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const addNewRelation = async () => {
    if(selectedChat == null)
        return;

    const relation = await addRelation(selectedChat.studentId);
    setRelation(relation);
  }

  const startVideoCall = async () => {
    if (!selectedChat || !user) return;

    const tutor = await getTutorProfileById(selectedChat.tutorId);
    const tutorUserId = tutor?.userId;

    const targetUserId = tutorUserId === user.id 
      ? selectedChat.studentId 
      : tutorUserId;
    router.push(`/video-call/${selectedChat.id}?targetUserId=${targetUserId}`);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Загрузка чатов...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.chatsSidebar}>
        <div className={styles.sidebarHeader}>
          <h2>Чаты</h2>
          <div className={`${styles.connectionStatus} ${isConnected ? styles.connected : styles.disconnected}`}>
            {isConnected ? 'Онлайн' : 'Офлайн'}
          </div>
        </div>
        
        <div className={styles.chatsList}>
          {chats.length === 0 ? (
            <div className={styles.noChats}>У вас пока нет чатов</div>
          ) : (
            chats.map(chat => {
              const displayName = chat.tutorId === tutorId ? chat.studentName : chat.tutorName;
              const lastMessageText = chat.lastMessage?.text || 'Нет сообщений';
              const initials = displayName.charAt(0).toUpperCase();
              
              return (
                <div
                  key={chat.id}
                  className={`${styles.chatItem} ${selectedChat?.id === chat.id ? styles.active : ''}`}
                  onClick={() => setSelectedChat(chat)}
                >
                  <div className={styles.chatAvatar}>
                    {initials}
                  </div>
                  <div className={styles.chatInfo}>
                    <div className={styles.chatName}>{displayName}</div>
                    <div className={styles.lastMessage}>
                      {lastMessageText.length > 30 
                        ? `${lastMessageText.substring(0, 30)}...` 
                        : lastMessageText}
                    </div>
                  </div>
                  <div className={styles.chatMeta}>
                    {chat.lastMessage && (
                      <div className={styles.lastMessageTime}>
                        {formatDate(chat.lastMessage.sentAt)}
                      </div>
                    )}
                    {chat.unreadCount > 0 && (
                      <div className={styles.unreadBadge}>
                        {chat.unreadCount}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className={styles.chatArea}>
        {selectedChat ? (
          <>
            <div className={styles.chatHeader}>
              <div className={styles.chatHeaderAvatar}>
                {selectedChat.tutorId === tutorId 
                  ? selectedChat.studentName.charAt(0).toUpperCase()
                  : selectedChat.tutorName.charAt(0).toUpperCase()}
              </div>
              <div className={styles.chatHeaderInfo}>
                <h3>
                  {selectedChat.tutorId === tutorId
                    ? selectedChat.studentName
                    : selectedChat.tutorName}
                </h3>
              </div>
              {tutorId != null && relation == null && (
                    
                <button 
                    className="btn btn-primary btn-large"
                    onClick={addNewRelation}
                >Добавить в ученики</button>
                
                )}
                <button 
                  className="btn btn-primary"
                  onClick={startVideoCall}
                >
                  Начать звонок
              </button>
            </div>

            <div className={styles.messagesContainer}>
              {messages.length === 0 ? (
                <div className={styles.noMessages}>
                  Начните общение! Отправьте первое сообщение.
                </div>
              ) : (
                <div className={styles.messagesList}>
                  {messages.map((message) => {
                    const isOwnMessage = message.senderId === user?.id;
                    
                    return (
                      <div
                        key={message.id}
                        className={`${styles.message} ${isOwnMessage ? styles.ownMessage : styles.otherMessage}`}
                      >
                        <div className={styles.messageContent}>
                          {!isOwnMessage && (
                            <div className={styles.senderName}>{message.senderName}</div>
                          )}
                          <div className={styles.messageText}>{message.text}</div>
                          <div className={styles.messageTime}>
                            {formatDate(message.sentAt)}
                            {isOwnMessage && (
                              <span className={styles.messageStatus}>
                                {message.isRead ? '✓✓' : '✓'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            <div className={styles.messageInputContainer}>
              <textarea
                className={styles.messageInput}
                placeholder="Введите сообщение..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                rows={3}
                disabled={!isConnected}
              />

              <button
                className={`${styles.sendButton} ${!isConnected || !newMessage.trim() ? styles.disabled : ''}`}
                onClick={sendMessage}
                disabled={!isConnected || !newMessage.trim()}
              >
                Отправить
              </button>
            </div>
          </>
        ) : (
          <div className={styles.noChatSelected}>
            <div className={styles.noChatIcon}>💬</div>
            <h3>Выберите чат для общения</h3>
            <p>Выберите чат из списка слева, чтобы начать переписку</p>
          </div>
        )}
      </div>
    </div>
  );
}