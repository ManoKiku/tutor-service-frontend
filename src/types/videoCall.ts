export interface VideoCallJoinRequest {
  chatId: string;
}

export interface VideoCallOfferRequest {
  chatId: string;  
  targetUserId: string;
  offer: string;
}

export interface VideoCallAnswerRequest {
  chatId: string;  
  targetUserId: string;
  answer: string;
}

export interface VideoCallIceCandidateRequest {
  chatId: string;  
  targetUserId: string;
  candidate: string;
}

export interface ParticipantJoinedDto {
  userId: string;
}

export interface ParticipantLeftDto {
  userId: string;
  reason: string;
}

export interface VideoCallJoinedDto {
  chatId: string;
  participants: string[];
}

export interface OfferReceivedDto {
  chatId: string;
  fromUserId: string;
  offer: string;
}

export interface AnswerReceivedDto {
  fromUserId: string;
  answer: string;
}

export interface IceCandidateReceivedDto {
  fromUserId: string;
  candidate: string;
}

export interface CallStateDto {
  isActive: boolean;
  chatId?: string;
}