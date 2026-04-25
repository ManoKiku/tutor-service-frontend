'use client';

import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useCallback } from 'react';
import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import { getAuthData } from '@/lib/auth';
import './video-call.css';
import { appConfig } from '../../../../next.config';
import { useAuth } from '@/hooks/useAuth';
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaPhoneSlash } from 'react-icons/fa';

const configuration: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    {
      urls: 'turn:openrelay.metered.ca:80',
      username: 'openrelayproject',
      credential: 'openrelayproject'
    }
  ]
};

export default function VideoCallPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const chatId = params.chatId as string;
  const targetUserId = searchParams.get('targetUserId');

  const connectionRef = useRef<HubConnection | null>(null);
  const [remoteUserName, setRemoteUserName] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [remoteMicrophoneEnabled, setRemoteMicrophoneEnabled] = useState(true);
  const [mediaReady, setMediaReady] = useState(false);
  const {user} = useAuth();
  

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
  }, []);

  useEffect(() => {
    resetControlsTimer();
    window.addEventListener('mousemove', resetControlsTimer);
    window.addEventListener('touchstart', resetControlsTimer);
    return () => {
      window.removeEventListener('mousemove', resetControlsTimer);
      window.removeEventListener('touchstart', resetControlsTimer);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [resetControlsTimer]);
  
  useEffect(() => {
    const fetchChat = async () => {
      try {
        const response = await fetch(`${appConfig.apiUrl}/chats/${chatId}`, { 
          headers: { 
            Authorization: `Bearer ${getAuthData(false).token}` 
          } 
        });

        if (!response.ok) {
          throw new Error(`Ошибка при загрузке чата: ${response.statusText}`);
        }

        const chat: Chat = await response.json();
        const currentUserId = getAuthData(false).user?.id;
        const remoteName = chat.studentId === currentUserId ? chat.tutorName : chat.studentName;
        setRemoteUserName(remoteName);
      } catch (error) {
        console.error('Ошибка загрузки чата', error);
      }
    };
    if (chatId) fetchChat();
  }, [chatId]);
  
  useEffect(() => {
    const getMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStreamRef.current = stream;
        setMediaReady(true);
      } catch (error) {
        console.error('Ошибка доступа к камере/микрофону', error);
        alert('Не удалось получить доступ к камере и микрофону. Звонок невозможен.');
        router.push('/chats');
      }
    };
    getMedia();
  }, [router]);

  useEffect(() => {
    if (mediaReady && localStreamRef.current && localVideoRef.current) {
      const video = localVideoRef.current;
      video.srcObject = localStreamRef.current;
      video.play().catch(e => console.warn('play() blocked', e));
    }
  }, [mediaReady]);

  const endCall = useCallback(async (reason?: string) => {
    if (reconnectIntervalRef.current) clearInterval(reconnectIntervalRef.current);
    const connection = connectionRef.current;
    if (connection && connection.state === 'Connected') {
      try {
        await connection.invoke('LeaveVideoCall', { chatId });
      } catch (e) {}
      await connection.stop();
    }
    if (peerConnectionRef.current) peerConnectionRef.current.close();
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (reason) alert(reason);
    router.push('/chats');
  }, [chatId, router]);
  
  const createPeerConnection = useCallback(() => {
    if (!mediaReady) return null;
    const pc = new RTCPeerConnection(configuration);
    peerConnectionRef.current = pc;
    
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }
    
    pc.ontrack = (event) => {
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };
    
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('Local ICE candidate:', event.candidate);
        const connection = connectionRef.current;
        if (connection && connection.state === 'Connected') {
          connection.invoke('SendIceCandidate', {
            chatId,
            targetUserId,
            candidate: JSON.stringify(event.candidate)
          }).catch(e => console.error('SendIceCandidate error', e));
        } else {
          console.warn('Connection not ready, cannot send ICE candidate');
        }
      } else {
        console.log('ICE gathering completed');
      }
    };
    
    pc.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', pc.iceConnectionState);
      if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed') {
        setIsReconnecting(true);
        if (reconnectIntervalRef.current) clearInterval(reconnectIntervalRef.current);
        let attempts = 0;
        reconnectIntervalRef.current = setInterval(() => {
          attempts++;
          if (pc.iceConnectionState === 'connected') {
            clearInterval(reconnectIntervalRef.current!);
            setIsReconnecting(false);
          } else if (attempts >= 6) {
            clearInterval(reconnectIntervalRef.current!);
            endCall('Соединение потеряно');
          }
        }, 5000);
      }
    };
    
    return pc;
  }, [mediaReady, chatId, targetUserId, endCall]);

  useEffect(() => {
    if (!mediaReady || !targetUserId) return;

    let isMounted = true;
    let currentConnection: HubConnection | null = null;

    const initSignalR = async () => {
      const { token } = getAuthData(false);
      if (!token) return;

      if (connectionRef.current && connectionRef.current?.state === HubConnectionState.Connected) {
        return;
      }

      const newConnection = new HubConnectionBuilder()
        .withUrl(appConfig.videoCallUrl, { accessTokenFactory: () => token })
        .withAutomaticReconnect()
        .build();

      currentConnection = newConnection;

      try {
        await newConnection.start();
        if (!isMounted) return;
        connectionRef.current = newConnection;
        setIsConnected(true);

        await newConnection.invoke('JoinVideoCall', { chatId });

        newConnection.on('VideoCallJoined', async (data: any) => {
          console.log('VideoCallJoined', data);
          const currentUserId = getAuthData(false).user?.id;
          const otherId = data.participants.find((id: string) => id !== currentUserId);
          if (otherId && data.participants.length > 1) {
            if (!peerConnectionRef.current) createPeerConnection();
            const offer = await peerConnectionRef.current!.createOffer();
            await peerConnectionRef.current!.setLocalDescription(offer);
            await newConnection.invoke('SendOffer', { chatId, targetUserId: otherId, offer: JSON.stringify(offer) });
          } else {
            console.log('Waiting for other participant');
          }
        });

        newConnection.on('OfferReceived', async (data: any) => {
          console.log("OfferReceived", data);

          if (data.FromUserId !== targetUserId) return;

          if (!peerConnectionRef.current) createPeerConnection();
          const pc = peerConnectionRef.current!;
          const offer = JSON.parse(data.Offer);
          await pc.setRemoteDescription(offer);
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          await newConnection.invoke('SendAnswer', {
            chatId,
            targetUserId,
            answer: JSON.stringify(answer)
          });

          pc.oniceconnectionstatechange = () => {
            console.log('ICE connection state:', pc.iceConnectionState);
          };
          pc.onicegatheringstatechange = () => {
            console.log('ICE gathering state:', pc.iceGatheringState);
          };
        });

        newConnection.on('ParticipantJoined', async (data: { UserId: string }) => {
          console.log('ParticipantJoined', data);
          if (data.UserId === targetUserId) {
            if (!peerConnectionRef.current) 
            {
              console.log("Creating peer connection");
              createPeerConnection();
            }
            const offer = await peerConnectionRef.current!.createOffer();
            await peerConnectionRef.current!.setLocalDescription(offer);
            await newConnection.invoke('SendOffer', { chatId, targetUserId: data.UserId, offer: JSON.stringify(offer) });
          }
        });

        newConnection.on('AnswerReceived', async (data: any) => {
          console.log("AnswerReceived", data);

          if (data.FromUserId !== targetUserId) return;
          const answer = JSON.parse(data.Answer);
          await peerConnectionRef.current?.setRemoteDescription(answer);
        });

        newConnection.on('IceCandidateReceived', async (data: any) => {
          console.log('IceCandidateReceived raw:', data);
          if (data.FromUserId !== targetUserId) {
            console.log('Ignoring candidate from', data.FromUserId);
            return;
          }
          const candidate = JSON.parse(data.Candidate);
          console.log('Adding ICE candidate:', candidate);
          await peerConnectionRef.current?.addIceCandidate(candidate);
        });

        newConnection.on('ParticipantLeft', (data: any) => {
          if (data.UserId === targetUserId) {
            endCall('Собеседник завершил звонок');
          }
        });

        newConnection.on('ParticipantMicrophoneStateChanged', (data: any) => {
          if (data.UserId === targetUserId && data.ChatId === chatId) {
            setRemoteMicrophoneEnabled(data.isEnabled);
          }
        });

        newConnection.on('VideoCallError', (error: string) => {
          console.error(error);
          endCall(error);
        });

        newConnection.onreconnecting(() => setIsReconnecting(true));
        newConnection.onreconnected(() => setIsReconnecting(false));

      } catch (error) {
        console.error('SignalR connection error', error);
        if (isMounted) endCall('Не удалось подключиться к серверу звонков');
      }
    };

    initSignalR();

    return () => {
      isMounted = false;
      if (currentConnection) {
        currentConnection.stop().catch(console.error);
      }
    };
  }, [mediaReady, targetUserId, chatId]);

  const toggleMic = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        const newState = !audioTrack.enabled;
        audioTrack.enabled = newState;
        setIsMicMuted(!newState);
        connectionRef.current?.invoke('SetMicrophoneState', chatId, newState);
      }
    }
  };
  
  const toggleCamera = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        const newState = !videoTrack.enabled;
        videoTrack.enabled = newState;
        setIsCameraOff(!newState);
      }
    }
  };
  
  if (!mediaReady) {
    return <div className={"loading"}>Запрашиваем доступ к камере и микрофону...</div>;
  }
  
  return (
    <div className={"video-container"}>
      <div className={"remote-video-wrapper"}>
        <video ref={remoteVideoRef} autoPlay playsInline className={"remote-video"} />
        {!remoteMicrophoneEnabled && (
          <div className={"mic-off-icon"}>
            <FaMicrophoneSlash />
          </div>
        )}
        {isReconnecting && <div className={"reconnecting-overlay"}>Попытка восстановления соединения...</div>}
      </div>
      
      <div className={"local-video-wrapper"}>
        <video ref={localVideoRef} autoPlay playsInline muted className={"local-video"} />
      </div>
      
      <div className={"video-header"}>
        <h2>{remoteUserName}</h2>
      </div>
      
      <div className={`${"controls"} ${showControls ? "visible" : "hidden"}`}>
        <button onClick={toggleMic} className={"control-btn"}>
          {isMicMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
        </button>
        <button onClick={toggleCamera} className={"control-btn"}>
          {isCameraOff ? <FaVideoSlash /> : <FaVideo />}
        </button>
        <button onClick={() => endCall()} className={`${"control-btn"} ${"end-call-btn"}`}>
          <FaPhoneSlash />
        </button>
      </div>
    </div>
  );
}