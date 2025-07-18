export interface Message {
    id: string;
    text: string;
    sender: "user" | "doctor";
    timestamp: Date;
    type: "text" | "image" | "file";
    fileUrl?: string;
    fileName?: string;
}

export interface PaymentData {
    cardNumber:string;
    expiryDate:string;
    cvv:string;
    cardholderName:string;
}