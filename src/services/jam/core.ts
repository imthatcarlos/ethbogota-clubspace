import { v4 as uuidv4 } from "uuid";

const STAGE_ONLY = true;

export const launchSpace = async (handle: string, { createRoom }) => {
  const uuid = uuidv4();
  const parts = uuid.split("-");
  parts.pop();
  parts.pop();
  const clubSpaceId = parts.join("");

  // create jam room on the server
  const ok = await createRoom(clubSpaceId, { stageOnly: STAGE_ONLY });

  return { res: ok, clubSpaceId, uuid };
}
