import { Room, RoomEvent, Track, type RemoteTrack } from "livekit-client";

const REMOTE_AUDIO_ATTR = "data-livekit-remote-audio";

function attachRemoteAudio(track: RemoteTrack) {
  if (track.kind !== Track.Kind.Audio) return;
  const element = track.attach();
  element.setAttribute(REMOTE_AUDIO_ATTR, "true");
  document.body.appendChild(element);
}

function attachExistingRemoteAudio(room: Room) {
  for (const participant of room.remoteParticipants.values()) {
    for (const publication of participant.audioTrackPublications.values()) {
      if (publication.track) {
        attachRemoteAudio(publication.track);
      }
    }
  }
}

export function setupRoomAudio(room: Room): () => void {
  const onTrackSubscribed = (track: RemoteTrack) => {
    attachRemoteAudio(track);
  };

  const onTrackUnsubscribed = (track: RemoteTrack) => {
    track.detach();
  };

  room.on(RoomEvent.TrackSubscribed, onTrackSubscribed);
  room.on(RoomEvent.TrackUnsubscribed, onTrackUnsubscribed);
  attachExistingRemoteAudio(room);

  return () => {
    room.off(RoomEvent.TrackSubscribed, onTrackSubscribed);
    room.off(RoomEvent.TrackUnsubscribed, onTrackUnsubscribed);
    document
      .querySelectorAll(`audio[${REMOTE_AUDIO_ATTR}]`)
      .forEach((el) => el.remove());
  };
}

export async function unlockRoomAudio(room: Room): Promise<void> {
  if (!room.canPlaybackAudio) {
    await room.startAudio();
  }
}
