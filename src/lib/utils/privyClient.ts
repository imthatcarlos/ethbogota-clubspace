import { PrivyClient } from "@privy-io/privy-node";
import { getAddress } from "ethers/lib/utils";
import { BigNumber } from "ethers";

const client = new PrivyClient(process.env.PRIVY_API_KEY!, process.env.PRIVY_API_SECRET!);

/**
 * decodes byte data from privy
 * @param data encoded data from privy
 * @returns decoded to plaintext
 */
const getDecoded = (data: any): string | null => {
  return data ? new TextDecoder().decode(data.plaintext) : null;
};

/**
 * replaces whatever data is in the field with new data
 * @param address account address
 * @param fieldId field id to replace
 * @param contents new contents to put there
 */
export const updateField = async (address, fieldId, contents) => {
  const checkSummed = getAddress(address);
  await client.put(checkSummed, fieldId, JSON.stringify(contents));
};

/**
 * Reads the value in a field. If this value is an array
 * the new entry object is appended at the end
 * @param address account address
 * @param fieldId field id to update
 * @param newEntry new entry to array
 * @param convertFieldId if field id is a hex value set this true
 */
export const appendToField = async (
  address: string,
  fieldId: number | string,
  newEntry: any,
  convertFieldId = false
) => {
  if (convertFieldId) {
    fieldId = BigNumber.from(fieldId).toString();
  }
  console.log("field id", fieldId);

  const currentData = await getCurrentContentsData(address, fieldId, convertFieldId);

  // format the current data to include the new impression
  const newData = currentData.concat(newEntry);
  const newDataString = JSON.stringify(newData);

  // write it back
  const checkSummed = getAddress(address);
  await client.put(checkSummed, fieldId as string, newDataString);
};

/**
 * Fetches the current data in a field
 * @param address account address
 * @param fieldId field id to update
 * @param convertFieldId if field id is a hex value set this true
 * @returns contents of field of empty array
 */
export const getCurrentContentsData = async (
  address: string,
  fieldId: string | number,
  convertFieldId = false
): Promise<any[]> => {
  if (convertFieldId) {
    fieldId = BigNumber.from(fieldId).toString();
  }
  const checkSummed = getAddress(address);
  const previousData = await client.get(checkSummed, fieldId as string);
  const decoded = getDecoded(previousData);

  return decoded ? JSON.parse(decoded) : [];
};
