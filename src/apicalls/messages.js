import { axiosInstance } from ".";
import { API_URL } from "./config";

export const SendMessage = async (message) => {
  try {
    const response = await axiosInstance.post(
      `${API_URL}/api/messages/new-message`,
      message
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const GetMessages = async (chatId) => {
  try {
    const response = await axiosInstance.get(
      `${API_URL}/api/messages/get-all-messages/${chatId}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
