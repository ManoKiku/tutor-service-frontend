import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { getAuthData } from './auth';
import { appConfig } from '../../next.config';

let connection: HubConnection | null = null;

export const initSignalRConnection = async (): Promise<HubConnection | null> => {
  if (connection && connection.state === 'Connected') {
    return connection;
  }

  const { token } = getAuthData(false);
  if (!token) {
    console.error('No token available for SignalR connection');
    return null;
  }

  try {
    connection = new HubConnectionBuilder()
    .withUrl(appConfig.chatHubUrl, {
        skipNegotiation: false,
        accessTokenFactory: () => token
    })
    .withAutomaticReconnect()
    .build();

    await connection.start();
    console.log('SignalR connection established');
    return connection;
  } catch (error) {
    console.error('SignalR connection failed:', error);
    connection = null;
    return null;
  }
};

export const stopSignalRConnection = async () => {
  if (connection) {
    try {
      await connection.stop();
      console.log('SignalR connection stopped');
    } catch (error) {
      console.error('Error stopping SignalR connection:', error);
    }
    connection = null;
  }
};

export const sendMessage = async (chatId: string, text: string): Promise<boolean> => {
  if (!connection || connection.state !== 'Connected') {
    console.error('SignalR connection is not established');
    return false;
  }

  try {
    await connection.invoke('SendMessage', { chatId, text });
    return true;
  } catch (error) {
    console.error('Error sending message:', error);
    return false;
  }
};

export const markMessagesAsRead = async (chatId: string): Promise<boolean> => {
  if (!connection || connection.state !== 'Connected') {
    return false;
  }

  try {
    await connection.invoke('MarkMessagesAsRead', chatId);
    return true;
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return false;
  }
};

export const getConnection = (): HubConnection | null => {
  return connection;
};