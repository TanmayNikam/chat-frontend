import { axiosInstance } from ".";
import { API_URL } from "./config";

export const GetAllChats = async () => {
  try {
    const response = await axiosInstance.get(
      `${API_URL}/api/chats/get-all-chats`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const CreateNewChat = async (members) => {
  try {
    const response = await axiosInstance.post(
      `${API_URL}/api/chats/create-new-chat`,
      {
        members,
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const ClearChatMessages = async (chatId) => {
  try {
    const response = await axiosInstance.post(
      `${API_URL}/api/chats/clear-unread-messages`,
      {
        chat: chatId,
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
