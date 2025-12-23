import axios from 'axios';

const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY;

export interface IPFSUploadResult {
    hash: string;
    url: string;
}

export const uploadToIPFS = async (file: File): Promise<IPFSUploadResult> => {
    if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
        // Fallback: return mock hash for demo purposes
        console.warn('Pinata not configured, using mock IPFS hash');
        return {
            hash: `mock_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9]/g, '_')}`,
            url: `#mock-ipfs-${file.name}`
        };
    }

    const formData = new FormData();
    formData.append('file', file);

    const metadata = JSON.stringify({
        name: file.name,
        keyvalues: {
            uploadedAt: new Date().toISOString(),
            type: 'freelancer-work-submission'
        }
    });
    formData.append('pinataMetadata', metadata);

    const options = JSON.stringify({
        cidVersion: 0,
    });
    formData.append('pinataOptions', options);

    try {
        const response = await axios.post(
            'https://api.pinata.cloud/pinning/pinFileToIPFS',
            formData,
            {
                maxBodyLength: Infinity,
                headers: {
                    'Content-Type': `multipart/form-data`,
                    'pinata_api_key': PINATA_API_KEY,
                    'pinata_secret_api_key': PINATA_SECRET_KEY,
                },
            }
        );

        return {
            hash: response.data.IpfsHash,
            url: `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`
        };
    } catch (error) {
        console.error('Error uploading to IPFS:', error);
        throw new Error('Failed to upload file to IPFS');
    }
};

export const uploadJSONToIPFS = async (data: any): Promise<IPFSUploadResult> => {
    if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
        // Fallback: return mock hash for demo purposes
        console.warn('Pinata not configured, using mock IPFS hash');
        return {
            hash: `mock_json_${Date.now()}`,
            url: `#mock-ipfs-json`
        };
    }

    try {
        const response = await axios.post(
            'https://api.pinata.cloud/pinning/pinJSONToIPFS',
            data,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'pinata_api_key': PINATA_API_KEY,
                    'pinata_secret_api_key': PINATA_SECRET_KEY,
                },
            }
        );

        return {
            hash: response.data.IpfsHash,
            url: `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`
        };
    } catch (error) {
        console.error('Error uploading JSON to IPFS:', error);
        throw new Error('Failed to upload JSON to IPFS');
    }
};

export const getIPFSUrl = (hash: string): string => {
    return `https://gateway.pinata.cloud/ipfs/${hash}`;
};