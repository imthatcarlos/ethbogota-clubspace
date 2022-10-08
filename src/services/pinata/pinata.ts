import { apiUrls } from "@/constants/apiUrls";
import pinataSDK from "@pinata/sdk";
import axios from "axios";

const pinata = pinataSDK(
  process.env.NEXT_PUBLIC_PINATA_KEY ?? "",
  process.env.NEXT_PUBLIC_PINATA_SECRET_KEY ?? "",
);

const _hash = (uriOrHash: string) => (
  uriOrHash.startsWith('ipfs://')
    ? uriOrHash.split('ipfs://')[1]
    : uriOrHash
);

export const pinFileToIPFS = (file: any) => {
  const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;

  //we gather a local file for this example, but any valid readStream source will work here.
  const data = new FormData();
  data.append("file", file);

  //You'll need to make sure that the metadata is in the form of a JSON object that's been convered to a string
  //metadata is optional
  const metadata = JSON.stringify({
    name: file.name,
  });
  data.append("pinataMetadata", metadata);

  return axios
    .post(url, data, {
      maxBodyLength: Infinity, //this is needed to prevent axios from erroring out with large files
      headers: {
        "Content-Type": `multipart/form-data;`, // boundary=${data._boundary}`,
        pinata_api_key: process.env.NEXT_PUBLIC_PINATA_KEY ?? "",
        pinata_secret_api_key: process.env.NEXT_PUBLIC_PINATA_SECRET_KEY ?? "",
      },
    })
    .then(function (response) {
      //handle response here
      return response.data;
    })
    .catch(function (error) {
      //handle error here
      console.log(error);
    });
};

export const pinJson = (data: any, address?: string) => {
  const options = {
    pinataMetadata: {
      name: `goody_bag_${address || ""}`
    },
    pinataOptions: {
      cidVersion: 0,
    },
  };
  return (
    pinata
      // @ts-ignore
      .pinJSONToIPFS(data, options)
      .then((result) => {
        //handle results here
        return result;
      })
      .catch((err) => {
        //handle error here
        console.log(err);
      })
  );
};

export const getViaPinataGateway = async (uriOrHash: string) => {
  const { data } = await axios.get(`${apiUrls.pinataGateway}/${_hash(uriOrHash)}`);
  return data;
};

export const pinataGatewayURL = (uriOrHash: string) => `${apiUrls.pinataGateway}/${_hash(uriOrHash)}`;
