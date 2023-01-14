import { v4 as uuidv4 } from "uuid";

const STAGE_ONLY = false; // stageOnly: users join directly on stage instead of in the audience

export const launchSpace = async (handle: string, { createRoom }) => {
  const uuid = uuidv4();

  // needed for semaphore...
  // const parts = uuid.split("-");
  // parts.pop();
  // parts.pop();
  // const clubSpaceId = parts.join("");
  const clubSpaceId = uuid;

  // create jam room on the server
  const ok = await createRoom(clubSpaceId, { stageOnly: STAGE_ONLY });

  return { res: ok, clubSpaceId, uuid };
}
