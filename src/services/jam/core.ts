import { v4 as uuidv4 } from "uuid";

const STAGE_ONLY = true;

export const launchSpace = async (handle: string, { createRoom, updateIdentity }) => {
  let clubSpaceId = uuidv4();
  const parts = clubSpaceId.split("-");
  parts.pop();
  parts.pop();
  clubSpaceId = parts.join("");

  // create jam room on the server
  const ok = await createRoom(clubSpaceId, { stageOnly: STAGE_ONLY });

  if (ok) {
    await updateIdentity({ name: handle });
  }

  return { res: ok, clubSpaceId };
}
