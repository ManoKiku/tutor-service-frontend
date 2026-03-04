interface Chat {
    id: string;
    tutorId: string;
    tutorName: string;
    studentId: string;
    studentName: string;
    createdAt: Date;
    updatedAt: Date;
    lastMessage: Message;
    unreadCount: number;
}

interface Message{
    id: string;
    chatId: string;
    senderId: string;
    senderName: string;
    text: string;
    sentAt: Date;
    isRead: boolean;
    createdAt: Date;
}


interface SendMessageRequest
{
    chatId: string;
    text: string;
}

interface MessageReceivedDto 
{
    MessageId: string;
    ChatId: string;
    SenderId: string;
    SenderName: string;
    Text: string;
    SentAt: Date;
}