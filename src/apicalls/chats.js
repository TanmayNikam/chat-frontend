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

export const CreateNewChat = async (chat) => {
  try {
    const response = await axiosInstance.post(
      `${API_URL}/api/chats/create-new-chat`,
      { ...chat }
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

export const updateGroup = async (chat) => {
  try {
    const response = await axiosInstance.patch(
      `${API_URL}/api/chats/update-group`,
      {
        chat,
      }
    );
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const clearGroupMessages = async (chat) => {
  try {
    const response = await axiosInstance.patch(
      `${API_URL}/api/chats/clear-group-unread-messages`,
      { chat: chat.chat, usr: chat.usr }
    );
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
