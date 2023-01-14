export const fieldNamePrivy = (semGroupIdHex: any) => {
    semGroupIdHex = semGroupIdHex.toString();
    if (!semGroupIdHex.startsWith("0x")) {
      semGroupIdHex = `0x${semGroupIdHex}`;
    }
    return `CLUBSPACE-${parseInt(semGroupIdHex.toString(), 16).toString()}`;
  };