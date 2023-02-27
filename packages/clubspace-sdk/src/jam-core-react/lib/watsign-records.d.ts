export function signData({ record, keypair, validSeconds, validUntil }: {
    record: any;
    keypair: any;
    validSeconds: any;
    validUntil: any;
}): Promise<{
    Version: number;
    Expiration: any;
    KeyType: string;
    Certified: string;
    Signatures: {
        Identity: string;
        Payload: string;
    }[];
}>;
export function verifyData(signedRecord: any): Promise<any>;
export function getVerifiedData(signedRecord: any): Promise<{
    data: any;
    identities: any;
}>;
