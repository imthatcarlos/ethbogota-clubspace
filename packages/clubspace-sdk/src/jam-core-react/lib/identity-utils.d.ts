export function signedToken(identity: any): Promise<string>;
export function verifyToken(authToken: any): Promise<any>;
export function signData(identity: any, data: any): Promise<{
    Version: number;
    Expiration: any;
    KeyType: string;
    Certified: string;
    Signatures: {
        Identity: string;
        Payload: string;
    }[];
}>;
export function verifyData(record: any, key: any): Promise<any>;
export function decode(base64String: any): Uint8Array;
export function encode(binaryData: any): string;
