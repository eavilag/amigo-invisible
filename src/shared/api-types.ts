/** Tipos de las respuestas de la API (contrato: docs/03-arquitectura/api/openapi.yaml). */

export interface GroupInfo {
  id: string;
  name: string;
  deliveryDate: string | null;
  budget: string | null;
  drawn: boolean;
}

export interface CreateGroupResponse {
  groupId: string;
  adminKey: string;
}

export interface PublicGroup extends GroupInfo {
  participants: { id: string; name: string; claimed: boolean }[];
}

export interface ClaimResponse {
  participantToken: string;
  participantId: string;
}

export interface MeResponse {
  group: GroupInfo;
  participant: { id: string; name: string; wishlist: string; viewed: boolean };
}

export interface RevealResponse {
  receiver: { name: string; wishlist: string };
}

export type ParticipantStatus = 'out' | 'in' | 'seen';

export interface AdminGroup extends GroupInfo {
  participants: { id: string; name: string; status: ParticipantStatus }[];
}
